# Code Sweep — prototype as-built (2026-08-29)

Digest produced by an Explore subagent over the full repo (excluding _bmad, _bmad-output, node_modules, .claude). Feeds the architecture-spine run; file:line citations verified against the working tree at commit 0022620.

## 1. Stack + versions

**Monorepo**: npm workspaces only — no turbo, no pnpm, no nx. `package.json:6-9` declares `["apps/*","packages/*"]`. Scripts are hand-wired fan-out (`build: npm run build --workspaces`, `test` runs only the worker workspace: `package.json:16`). Single root `package-lock.json`. **No CI** — no `.github` directory exists.

**Runtime**: Cloudflare Workers. `apps/worker/wrangler.jsonc` — `main: src/index.ts`, `compatibility_date: 2024-11-01`, `compatibility_flags: ["nodejs_compat"]`, observability on. Config is **jsonc, single environment, no `[env.staging]`/`[env.production]` blocks**.

| Workspace | Declared | Installed (lockfile) | Notes |
|---|---|---|---|
| root | typescript ^5.8.2, concurrently ^9.1.2 | typescript 5.9.3 | |
| apps/worker | hono ^4.7.2, zod ^3.24.2, wrangler ^3.111.0, @cloudflare/workers-types ^4.20250224.0 | hono 4.13.3, zod 3.25.76, wrangler **3.114.17**, workers-types 4.20260702.1, miniflare 3.20250718.3 | wrangler v3, not v4 |
| apps/web | react ^18.3.1, react-dom ^18.3.1, vite ^6.2.0, tailwindcss ^3.4.17, lucide-react ^1.16.0, clsx, tailwind-merge | react 18.3.1, vite 6.4.3, tailwind 3.4.19, lucide-react 1.33.0 | React 18 (not 19); no router, no state lib, no test runner |
| packages/schema | zod ^3.24.2 | — | `main`/`types` both point at `./src/index.ts` (source-as-entrypoint) |
| packages/integrations | `@data-refinery/schema` (declared but **never imported**) | — | same source-as-entrypoint pattern |
| packages/extension | **no package.json** — plain MV3 files (`manifest.json`, `popup.html`, `popup.js`) | — | not a workspace member in practice |

Notable absences: **no MCP SDK** (`@modelcontextprotocol/sdk` not present), **no Stripe SDK**, no ORM (Drizzle/Kysely), no linter, no formatter, no vitest/jest, no `@hono/zod-validator`.

## 2. Unit topology

```
apps/worker  ──imports──> packages/schema   (Zod schemas + MCP_TOOLS array)
apps/web     ──imports──> (nothing; @data-refinery/schema is declared but unused)
packages/integrations ──> nothing (isolated leaf; nothing imports it)
packages/extension ──────> nothing (talks to prod URL over HTTP)
```

- **apps/worker** (`src/index.ts:1-242`) — the entire product. One Hono app, 14 sub-routers mounted at `index.ts:125-138`, plus 4 routes defined inline in `index.ts` itself (`/`, `/api/v1/diffs`, `/api/v1/stats`, `/badge/:package.svg`). `export default { fetch, scheduled }` at `index.ts:187-242`.
- **apps/web** (`src/App.tsx`) — **a single 5,025-line default-exported function component** (`App.tsx:157`) with **101 `useState` calls** and 4 `useEffect`s. Tab switching is local state; no router. Only extracted child is `LandingPage.tsx` (745 lines). Deployed as static Pages (`public/_headers` exists; there is no wrangler config for web).
- **packages/schema** (`src/index.ts:1-220`) — the only genuinely shared unit: 5 Zod domain schemas + inferred types + `MCP_TOOLS: MCPToolDefinition[]` (`index.ts:159-220`). Consumed by worker routes and `apps/worker/test/schema.test.mjs`.
- **packages/integrations** — `DataRefineryClient`/`DataRefineryLoader` (LangChain shape) and `DataRefineryReader` (LlamaIndex shape). **Dead code**: nothing imports it; it is not published; its only appearance in the product is as a copy-paste string in the UI docs tab (`apps/web/src/App.tsx:3134,3142,3158,3166`). It also does not depend on LangChain or LlamaIndex — it duck-types their interfaces.
- **packages/extension** — MV3 popup that POSTs to the hardcoded prod worker (`popup.js:3`).
- **scripts/** — 5 standalone `.ts` scripts that fetch **the live production URL** (`scripts/test_full_system_verification.ts:7`, `test_mcp_service.ts:14`, `test_live_real_data.ts:7`, `test_phase3_schemas.ts:7`, `test_phase4_enterprise.ts:11`). These are smoke scripts against prod, not tests; no npm script invokes them.

**Committed build artifacts**: `packages/schema/src/index.js`, `index.d.ts` and `packages/integrations/src/{index,langchain,llamaindex}.{js,d.ts}` are **tracked in git** (verified via `git ls-files`) because tsconfig has `declaration: true` with no `outDir`, and `.gitignore` only ignores `dist/`.

## 3. Data layer

Bindings declared in `wrangler.jsonc`: **AI** (Workers AI, `:7-9`), **D1** `DB` → `refinery-db` (`:13-20`), **KV** `KV_CACHE` (`:21-26`), **Vectorize** `VECTOR_INDEX` → `refinery-vectors` (`:27-32`). Cron trigger `0 */6 * * *` (`:33-35`).
**No R2, no Durable Objects, no Queues, no Workflows** anywhere (grep for `R2Bucket|DurableObject|queues|WorkflowEntrypoint` returns zero hits in `apps/` and `packages/`).

Schema lives in **`apps/worker/migrations/*.sql`, not in `packages/schema`**. `packages/schema` holds only Zod *payload* shapes; there is no type-level link between the SQL columns and the Zod types. Migration mechanism: `wrangler d1 migrations apply refinery-db --local|--remote` (`apps/worker/package.json:10-11`). 10 forward-only migrations, no down-migrations, and **seed data is interleaved into migrations** (0002, 0004, 0005, 0007, 0008, 0009, 0010 all contain INSERTs).

Tables and their owners:

| Table | Defined | Written by | Read by |
|---|---|---|---|
| `refined_entities` | 0001:14 | `lib/db.ts:71` (only writer) | db.ts, search, export, management, index.ts badge |
| `entity_diffs` | 0001:30 | `lib/db.ts:42` (only writer) | db.ts, export, management, index.ts cron |
| `api_keys` | 0003:3 | billing.ts:92,192,299,308; management.ts:373-441; index.ts:69 | index.ts:39 middleware, custom.ts:41, management.ts |
| `billing_logs` | 0003:20 | billing.ts:278 | nobody |
| `scheduled_pipelines` | 0004:4 | management.ts:140-173 | management, index.ts:197 (cron) |
| `webhook_subscriptions` | 0004:18 | management.ts:202,300 | management, index.ts:209 (cron) |
| `admin_users` | 0005:4 | workspaces.ts:96 | management.ts:27,223; workspaces.ts:63,90 |
| `workspaces`/`workspace_members` | 0005:15,24 | workspaces.ts:32,40,105 | workspaces.ts:9,60 |
| `custom_schemas` | 0006:4 | schemas.ts:78,178 | schemas.ts, mcp.ts:63,292 |
| `marketplace_listings` | 0007:4 | marketplace.ts:48,91 | marketplace.ts:9,80 |
| `pricing_plans` | 0010:5 | management.ts:326 | billing.ts:10,29; management.ts:310 |
| **`refinery_sources`** | 0001:3 | — | — **dead** |
| **`refinery_jobs`** | 0001:45 | — | — **dead** |
| **`api_usage_metrics`** | 0004:27 | — | — **dead** |
| **`creator_payouts`** | 0007:22 | — | — **dead** |
| **`workspace_audit_logs`** | 0006:17 | — | — **dead** |
| **`agent_audit_logs`** | 0010:24 | — (seeded only, 0010:41-45) | management.ts:451 → the "Live Agent Telemetry" console renders **migration seed rows** |

KV namespace conventions (only two key families): `refinery:{domain}:{entityKey}:latest`, TTL 86400 (`lib/db.ts:92-94`) and `ratelimit:refine:{ip}`, TTL 3600 (`routes/custom.ts:53-61`). No tenant prefix on either.

Vectorize: single flat index, `metadata: {entityKey, domain, summary, ...}` (`lib/vector.ts:40-51`); domain filtering is done **client-side after the query** (`vector.ts:83-85`), not via a Vectorize filter, so `topK` is applied pre-filter.

## 4. State mutation + async patterns

- **All writes are hand-written `env.DB.prepare(...).bind(...).run()` inline in route handlers.** No ORM, no query builder, no migrations-from-types. The only repository-ish layer is `apps/worker/src/lib/db.ts` (4 functions), and it covers **only** `refined_entities` + `entity_diffs`. Every other table is manipulated with raw SQL inside route files — `management.ts` alone contains ~20 inline statements.
- `saveRefinedEntity` (`lib/db.ts:18-112`) is the one real pipeline write path: fetch previous → `computeEntityDiff` → insert diff → insert entity → KV put → Vectorize upsert. **These are four independent non-transactional operations**; D1 batch/transaction is never used anywhere.
- Async: only `ctx.waitUntil` / `c.executionCtx.waitUntil` (`index.ts:68,193`, `custom.ts:48`, `management.ts:228`). No queue, no workflow, no retry, no idempotency key, no job record (`refinery_jobs` is dead).
- **The cron does not run the refinement pipeline.** `index.ts:196-201` selects up to 10 `ACTIVE` pipelines and then `console.log`s the count — the `pipelines` variable is never used again. It then dispatches webhooks for the single most recent CRITICAL/MAJOR diff (`index.ts:204-234`), unconditionally, on every 6-hour tick, ignoring `webhook_subscriptions.event_types`/`target_entities` and ignoring whether that diff was already sent. **Confirmed: cron never executes pipelines, and `scheduled_pipelines.last_run_at`/`next_run_at` are never updated by any code path.**
- Refinement therefore only happens **synchronously inside an HTTP request**: `POST /api/v1/{dev,pricing,regulatory,custom}/refine`, `POST /api/v1/schemas/:slug/refine`, and MCP `refinery_refine_custom_url`. Each does fetch → sanitize → Workers AI → Zod → save, in-line in the request (`routes/dev.ts:69-117` is the template).

## 5. API surfaces

REST (all under `/api/v1`, mounted `index.ts:125-137`): `dev`, `pricing`, `regulatory` (each: `GET /`, `GET /:key`, `POST /refine`), `custom` (`GET /`, `POST /refine`), `search` (`GET /?q=`), `billing`, `promotions`, `management`, `schemas`, `workspaces`, `export`, `marketplace`, `enterprise`. Plus `/`, `/api/v1/diffs`, `/api/v1/stats`, `/badge/:package.svg`. **No OpenAPI spec exists** despite the UI advertising "REST / OpenAPI Endpoints" (README.md:57).

**MCP** (`routes/mcp.ts`) — hand-rolled, **no SDK**. Transport is a **single `POST /mcp` returning plain JSON-RPC 2.0 over HTTP** (`mcp.ts:27`); there is no SSE endpoint, no Streamable HTTP session handling, no `notifications/*`, no `initialized` handling. Methods implemented: `initialize` (advertises protocolVersion `2024-11-05`, `mcp.ts:41`), `tools/list`, `resources/list`, `prompts/list`, `tools/call`; everything else returns `-32601`. `resources/list` advertises three `refinery://` URIs (`mcp.ts:96-113`) but **`resources/read` is not implemented** — those resources are unreachable. Same for the `check_sdk_upgrade` prompt (`mcp.ts:126`): listed, no `prompts/get`. Tool errors are returned as `result.isError: true` rather than JSON-RPC errors (`mcp.ts:157-171`).

**MCP auth: none.** The quota/402 middleware is scoped to `"/api/v1/dev/*"` only (`index.ts:35`) and `/mcp` is mounted outside it (`index.ts:138`). `handleToolExecution` reads no header. **Confirmed: MCP is fully unauthenticated**, including `refinery_refine_custom_url`, which triggers a Workers AI call and a D1 write per anonymous request — bypassing even the per-IP rate limit that `POST /api/v1/custom/refine` applies (`custom.ts:51-62`).

**Billing / Stripe**: no SDK — raw `fetch` to `api.stripe.com` with URL-encoded bodies (`lib/stripe.ts:42-49`). Checkout create (`billing.ts:18`), post-checkout key provisioning (`billing.ts:62`), webhook at `POST /api/v1/billing/webhook` with hand-rolled HMAC-SHA256 verification via WebCrypto + 300s replay window (`billing.ts:123-165`) — but **verification is skipped entirely when `STRIPE_WEBHOOK_SECRET` is unset**, degrading to a `console.warn` (`billing.ts:255-264`). Signature comparison is a non-constant-time `===` (`billing.ts:164`). A live Stripe price ID is committed in `wrangler.jsonc:11` and a second one is hardcoded as a fallback in `lib/stripe.ts:28` and `billing.ts:24`.

**HTTP 402 / agent rails**: `index.ts:35-73` middleware returns 402 with `X-Refinery-Price-Per-Query` headers. `POST /api/v1/billing/agent-token` (`billing.ts:168`) mints `ref_agent_*` tokens into `api_keys`, **unauthenticated**, capped at 50 credits for anonymous callers (`billing.ts:184`). **No x402 implementation** — the only mentions in the repo are roadmap bullets (`docs/ROADMAP_AND_COMPETITORS.md:61-62`).

**Outbound webhooks**: cron dispatch (`index.ts:224-232`) and `POST /api/v1/management/webhooks/test` (`management.ts:266`). No signing, no retry, no SSRF check on the registered URL (contrast: inbound fetch targets *are* SSRF-checked, `extractor.ts:42-77`).

## 6. Cross-cutting conventions

**Auth model** — three unrelated, ad-hoc schemes:
1. API key in `X-Refinery-Key` or `Bearer` → `api_keys` lookup, **applied only to `/api/v1/dev/*`**, and **only if a key was supplied** — no header means the middleware falls through to `await next()` (`index.ts:36,71-72`). Anonymous access to every read endpoint is free and unmetered.
2. Founder passcode in `X-Founder-Passcode` → gates `/api/v1/management/*` (`management.ts:42-57`). **Three passcodes are hardcoded in source**: `"Refinery#Founder2026!"`, `"founder"`, `"refinery2026"` (`management.ts:18-24` and again `management.ts:240`). The same literal is seeded into `admin_users.passcode_hash` **in plaintext** (`0005_admin_users_and_workspaces.sql:39`) — the column is named `passcode_hash` but stores cleartext and is compared with `=`. New members get the shared cleartext passcode `'refinery-member-2026'` (`workspaces.ts:98`). The frontend hardcodes the founder passcode as its default state value (`apps/web/src/App.tsx:874`) and persists the unlock flag in `localStorage` (`App.tsx:863,904`).
3. Any active non-`AGENT_MICRO` API key is also accepted as an admin credential (`management.ts:33-36`) — **every paying Pro customer is a platform admin** and can read all subscribers, edit global pricing plans, and kill other tenants' agent tokens.

**Tenant model** — nominal only. `workspaces`/`workspace_members` exist (0005) and `custom_schemas.workspace_id` exists (0006:6), but:
- `refined_entities`, `entity_diffs`, `scheduled_pipelines`, `webhook_subscriptions`, `marketplace_listings`, `api_keys` have **no workspace/tenant column at all**.
- `GET /api/v1/workspaces` and `POST /api/v1/workspaces` are **completely unauthenticated** (`routes/workspaces.ts` has no middleware; it is mounted at `index.ts:134` outside every guard) — anyone can list all workspaces and add themselves as a member of any workspace by ID (`workspaces.ts:76-118`).
- `GET /api/v1/schemas?workspaceId=X` takes the tenant from an **unauthenticated query string**, defaulting to `ws_global_refinery` (`schemas.ts:11-16`); `GET /:idOrSlug`, `POST /`, `DELETE /:id`, and `POST /:slug/refine` don't filter by workspace at all (`schemas.ts:35,78,116,178`).
- MCP `tools/list` exposes every tenant's custom schema names and descriptions to every anonymous caller (`mcp.ts:63-77`), and `refinery_custom_*` executes any of them (`mcp.ts:292`).
- The KV cache key has no tenant component (`lib/db.ts:92`).
**Confirmed: tenant isolation is not enforced anywhere.**

**Validation** — Zod is used in exactly **one place**: `extractor.ts:272` `schema.safeParse(parsedJson)` on the LLM output. And even that is advisory: on failure it does not reject, it **synthesizes a fallback object and returns it as if valid** (`extractor.ts:282-296`). Two of the five extraction paths pass `z.record(z.any())`, i.e. no validation at all (`schemas.ts:140`, `mcp.ts:304`). **No request body is ever validated** — every handler does `await c.req.json()` and destructures raw (`dev.ts:71`, `management.ts:124`, `marketplace.ts:31`, …). There is no `@hono/zod-validator` dependency.

**Error handling** — no `app.onError`, no `app.notFound`, no error taxonomy (grep returns zero hits). The convention is per-handler `try/catch` returning `c.json({error: err.message}, 500)`, which **leaks raw D1/internal messages to clients** (`management.ts:107,119,151`, `schemas.ts:26`, …). Coverage is uneven: `search.ts` and `enterprise.ts` have zero try/catch; `management.ts` has 18. Several catches swallow silently (`mcp.ts:78` `catch {}`, `billing.ts:39` `catch {}`, `index.ts:158`).

**Config/env** — `Env` interface at `types.ts:1-11`, with everything except `AI` and `DB` marked optional. No `.dev.vars`, no `.env`, no `.env.example` in the repo. Secrets are assumed to be set via `wrangler secret`. Deployment URLs are **hardcoded in ~15 places** across worker, web, extension, and integrations (`index.ts:45,50-51`, `App.tsx:155`, `popup.js:3`, `langchain.ts:10`, `_headers:8`). Frontend "config" is `import.meta.env.DEV ? "" : "<prod url>"` (`App.tsx:155`) — there is no staging target.

**Testing** — `apps/worker/test/differ.test.mjs` (3 tests) and `schema.test.mjs` (4 tests), run by `node --test` (`apps/worker/package.json:12`). That is **7 tests total, all pure-function**, covering `computeEntityDiff` and Zod schema shape. Zero tests for routes, `saveRefinedEntity`, the MCP handler, auth, or billing. No Miniflare/`workers-pool` test setup despite miniflare being in the lockfile transitively. `differ.test.mjs:3` imports `../src/lib/differ.ts` directly, so the suite depends on Node's type-stripping (works on the installed Node v26, would fail on the "Node.js 20+" the README claims at `README.md:66`).

**TypeScript strictness** — `strict: true` in all four tsconfigs, but effectively defeated: D1 results are cast `any` at every call site (`const record: any = await ... .first()` appears ~40 times), request bodies are `any`, and `env.AI.run(modelName as any, ...)` is cast away (`extractor.ts:227`, `vector.ts:8`, `custom.ts:111`, `promotions.ts:50`). Worker `build` is `tsc --noEmit` only; `apps/web` `build` runs `tsc && vite build`. Root `npm run build` fans out to all workspaces including `packages/*` which emit `.js`/`.d.ts` into `src/`.

## 7. Quality signals

**Confirmed from the PRD's claims:**
- *Cron never executes pipelines* — **confirmed**, `index.ts:196-201`: pipelines are selected, counted, logged, discarded.
- *MCP is unauthenticated* — **confirmed**, `/mcp` mounted at `index.ts:138` outside the only auth middleware (`index.ts:35`, scoped to `/api/v1/dev/*`).
- *Tenant isolation unenforced* — **confirmed**, see §6; `workspaces` router has no guard at all and the entity tables have no tenant column.

**Additional real bugs (not stubs — wrong code):**
- `routes/export.ts:83` reads `diff.changes_json`; the column is `diff_data` (`0001_initial_schema.sql:38`). Every diff row exported for fine-tuning has `changes: undefined`.
- `lib/db.ts:120-124` — on a KV cache hit, `getLatestEntity` returns the bare `structuredData` object, but on a miss it returns a wrapper `{id, domain, entityKey, structuredData, …}` (`db.ts:135-144`). Callers then read `entity.structuredData` (`dev.ts:55`, `pricing.ts:52`, `mcp.ts:194`) → **`undefined` for 24 hours after any write**. Two incompatible return shapes from one function.
- `routes/custom.ts:61` re-`put`s the rate-limit key with a fresh 3600s TTL on every request, making it a sliding window — a steady caller is locked out indefinitely rather than for an hour.
- `routes/search.ts:20` interpolates the user query into three `LIKE '%...%'` binds including against the `structured_data` JSON blob — unbounded table scan, no index, no length cap.
- `index.ts:224-232` re-fires the same "most recent CRITICAL diff" to all webhooks every 6 hours forever; no dedupe, no delivery record.
- `routes/marketplace.ts:76` `POST /:id/query` increments `earnings_usd` on an unauthenticated endpoint — anyone can inflate any creator's revenue counter.

**AI-generated-and-stubbed:**
- `routes/enterprise.ts` (35 lines) — `/sla-health` returns a **fully hardcoded literal**: `"currentUptime": "99.998%"`, `activePointsOfPresence: 330`, `p50: 12/p95: 18/p99: 24` (`enterprise.ts:8-33`). Nothing is measured.
- `routes/management.ts:96-100` — analytics returns hardcoded `avgEdgeLatencyMs: 16`, `edgeCacheHitRate: "99.4%"`, `activeWorkersNodes: 330`; and `dailySeries` fabricates a latency of `16` per point (`management.ts:88`) while folding total lifetime usage into today's bucket (`management.ts:84`).
- `agent_audit_logs` is a read-only display of four seeded rows (`0010:41-45`) presented in the UI as "Live Agent Execution & Audit Telemetry" (`management.ts:448-455`).
- `routes/promotions.ts` — an LLM-driven marketing-copy generator with a hardcoded fallback campaign (`promotions.ts:77-105`) that hardcodes the product's own Reddit/HN posts. Two prior commits (`1ade20f`, `5670ab9`) removed the marketing UI, but the backend router is still mounted (`index.ts:131`) — orphaned surface.
- `resources/list` and `prompts/list` in MCP advertise capabilities with no corresponding `read`/`get` handler (`mcp.ts:90-137`).
- Five dead tables (§3) and a dead workspace (`packages/integrations`).

**Docs-vs-code drift:**
- `README.md:119` says **"License: MIT"**; `package.json:27` and the `LICENSE` file say **BUSL-1.1** (adopted in commit `54fa2d7`).
- `README.md:46` claims ingest happens via "Scheduled Cron / Webhooks" — neither ingests (§4).
- `README.md:66` requires "Node.js 20+"; the test suite requires TS type-stripping (Node 22.6+/23+).
- `README.md:57` advertises "REST / OpenAPI Endpoints" — no OpenAPI document exists.
- `apps/web/src/App.tsx:3562` tells users Cursor/Claude "will automatically discover all 12 native and custom tools" — `MCP_TOOLS` has 5 (`packages/schema/src/index.ts:159`); the rest are DB-seeded custom schemas.
- The UI ships copy-paste SDK snippets for `@data-refinery/integrations` (`App.tsx:3134-3166`) for a package that is unpublished and unbuilt.

## Decisions a spine must ratify or overturn

1. **Auth**: three overlapping schemes, hardcoded passcodes in source and in the DB, "Pro key == platform admin", and an unauthenticated MCP + workspaces + agent-token-minting surface. Nothing here is salvageable as-is.
2. **Tenancy**: the tenant column simply doesn't exist on the data tables. Retrofitting `workspace_id` onto `refined_entities`/`entity_diffs` + the KV key + the Vectorize metadata filter is a schema-and-cache-wide change, not a middleware change.
3. **Pipeline execution model**: there is no async execution substrate at all (no queue/DO/workflow, `refinery_jobs` unused). Refinement is request-synchronous. The cron is a stub. Choosing Queues vs. Workflows vs. DO-alarms is the single biggest open decision.
4. **Data access**: raw SQL scattered across 14 route files with `any` casts, no transactions, no generated types. `lib/db.ts` is a partial repository covering 2 of 17 tables.
5. **Validation boundary**: Zod exists but only guards LLM output, and even then falls back rather than failing. Inbound HTTP is entirely unvalidated.
6. **Frontend shape**: one 5,025-line component with 101 useState hooks is not extendable; also no test harness on either side of the wire.
7. **Config**: prod URLs and price IDs hardcoded across four workspaces; single unnamed wrangler environment; no staging path.
8. **Schema ownership**: SQL DDL lives in worker migrations, Zod lives in `packages/schema`, and the two are unlinked — the `changes_json`/`diff_data` bug is the direct consequence.
