# Verification Review — ARCHITECTURE-SPINE.md

- **Lens:** Every committed decision web-researched or reality-checked, not asserted from training data.
- **Target:** `ARCHITECTURE-SPINE.md` (architecture-AI-data-refinery-2026-08-29)
- **Evidence base:** `.memlog.md` (version-typed entries), `code-sweep.md` ([ADOPTED] versions), live npm registry (`npm view`, 2026-08-29), Cloudflare docs/changelog, GitHub, modelcontextprotocol.io, Linux Foundation (all fetched 2026-08-29).
- **Verdict:** PASS WITH CHANGES — the pin discipline is genuinely good (17 of 18 versioned rows trace to memlog verification or repo adoption and all match today's registry), but one pinned package (`x402-hono 1.2.0`) breaks a cold-start `npm install` against the spine's own zod 4 pin and is the superseded SDK line.
- **Counts:** critical 0 · high 1 · medium 3 · low 3

---

## 1. Stack-table audit (row by row)

| Row | Pin | Source of pin | Registry today (2026-08-29) | Status |
| --- | --- | --- | --- | --- |
| TypeScript | 5.9.3 [ADOPTED] | code-sweep (lockfile) | latest 7.0.2; 5.9.3 exists | OK — TS7 deferral is explicit in Deferred |
| CF Workers | compat_date ≥ 2026-08-04 (nodejs_compat default) | **neither memlog nor code-sweep** (proto: 2024-11-01) | CF changelog 2026-08-04 confirms nodejs_compat(+v2) default at that date | OK but unlogged → **V-5 (low)** |
| wrangler | 4.127.1 | memlog | 4.127.1 = latest | OK |
| hono | 4.13.5 | memlog | 4.13.5 = latest | OK |
| zod | 4.5.4 | memlog | 4.5.4 = latest | OK (but see V-1) |
| @hono/zod-openapi | 1.6.1 | memlog | 1.6.1 = latest; peers `zod ^4.0.0`, `hono >=4.10.0` | OK — peers satisfied |
| drizzle-orm / kit / zod | 0.45.2 / 0.31.10 / 0.8.3 | memlog | all = latest; drizzle-zod peers `zod ^3.25\|\|^4`, `drizzle-orm >=0.36` | OK |
| better-auth | 1.7.2 | memlog | 1.7.2 = latest | OK — compat verified this review (§2) |
| stripe | 22.6.0 | memlog | 22.6.0 = latest; engines node ≥18 | OK — Workers fetch client memlog-verified (official stripe-samples template) |
| x402-hono | 1.2.0 | memlog | 1.2.0 = latest **of the legacy unscoped line** | **FAIL → V-1 (high)** |
| agents | 0.22.0 | memlog | 0.22.0 = latest | OK, but under-declared peers → **V-4 (medium)** |
| @modelcontextprotocol/sdk | 1.30.0 | memlog | 1.30.0 = latest; `agents@0.22.0` peers on exactly `1.30.0` | OK — exact match |
| vitest / @cloudflare/vitest-pool-workers | 4.1.11 / 0.22.0 | memlog | both = latest | OK — pair compat verified this review (§2) |
| react / react-dom | 18.3.1 [ADOPTED] | code-sweep | 18.3.1 exists | OK |
| react-router | 7.18.3 | memlog | dist-tag `version-7` = 7.18.3 (latest v7); latest = 8.3.1 | OK — deliberate v7 pin; v8 note verified (§2) |
| @tanstack/react-query | 5.102.8 | memlog | 5.102.8 = latest | OK |
| vite | 6.4.3 [ADOPTED] | code-sweep | latest 8.2.2; 6.4.3 adopted | OK — upgrade explicitly deferred |
| tailwindcss | 3.4.19 [ADOPTED] | code-sweep | latest 4.3.3; 3.4.19 adopted | OK — upgrade explicitly deferred |
| npm workspaces | [ADOPTED] | code-sweep | n/a | OK |

Every versioned row except the compat_date row traces to a memlog `(version)` entry or a code-sweep [ADOPTED] fact, and every memlog pin matched the registry exactly today. The pinning process worked; the one substantive miss is *which* x402 package was pinned, not its number.

## 2. Compatibility pairs (including the ones flagged as NOT verified)

| Pair | Claimed | Registry evidence (this review) | Verdict |
| --- | --- | --- | --- |
| zod 4.5.4 ↔ @hono/zod-openapi 1.6.1 / drizzle-zod 0.8.3 / hono 4.13.5 | compatible (memlog-verified) | zod-openapi peers `zod ^4.0.0, hono >=4.10.0`; drizzle-zod peers `zod ^3.25 \|\| ^4`; better-auth deps `zod ^4.3.6` | **Confirmed** |
| react-router 7.18.3 ↔ react 18.3.1 (and "v8 requires React ≥19.2.7") | compatible; v8 blocked | 7.18.3 peers `react >=18`; 8.3.1 peers `react >=19.2.7` | **Confirmed, both halves** |
| @cloudflare/vitest-pool-workers 0.22.0 ↔ vitest 4.1.11 | **was NOT verified** | pool-workers 0.22.0 peers `vitest ^4.1.0`, `@vitest/runner ^4.1.0`, `@vitest/snapshot ^4.1.0` — 4.1.11 satisfies | **Verified OK now** (add memlog entry) |
| better-auth 1.7.2 ↔ drizzle-orm 0.45.2 adapter | **was NOT verified** | better-auth 1.7.2 peers `drizzle-orm ^0.45.2 \|\| >=1.0.0-rc.1 <2.0.0`, `drizzle-kit >=0.31.4`; ships `@better-auth/drizzle-adapter@1.7.2` as a dep | **Verified OK now** (add memlog entry) |
| agents 0.22.0 ↔ @modelcontextprotocol/sdk 1.30.0 | **was NOT verified** | agents 0.22.0 peers `@modelcontextprotocol/sdk: 1.30.0` (exact) — pin matches exactly | **Verified OK now**, but see V-4: it *also* requires `@modelcontextprotocol/client@2.0.0` + `@modelcontextprotocol/server@2.0.0` (non-optional peers; both exist on npm) |
| x402-hono 1.2.0 ↔ hono 4.13.5 / zod 4.5.4 | asserted | hono peer `^4.7.1` OK; **zod peer `^3.24.2` — CONFLICT with zod 4.5.4**; no `peerDependenciesMeta` (nothing optional) | **FAILS — V-1** |
| stripe 22.6.0 fetch client on Workers | memlog-verified | `Stripe.createFetchHttpClient()` path memlog-verified against official stripe-samples Workers template; 22.6.0 current | **Accepted** |

## 3. Platform claims

| Claim | Reality (checked 2026-08-29) | Verdict |
| --- | --- | --- |
| compat_date ≥ 2026-08-04 ⇒ nodejs_compat default | CF changelog "Node.js compatibility is now enabled by default" (2026-08-04): compat dates ≥ 2026-08-04 enable nodejs_compat + nodejs_compat_v2 with no flag | **Accurate** (but unlogged — V-5) |
| Workflows / Queues / D1 / R2 / Workers AI exist & fit | memlog `(version)` entry web-verified 2026-08-29 (Workflows GA/V2 limits, Queues limits, D1 10GB) | **Accepted — properly logged** |
| Workers Rate Limiting binding exists, used for all rate limiting ("Never KV counters") | Binding is real, GA since 2025-09-19. BUT: period must be 10 or 60 s; limits are **per-colo** ("a unique limit per Cloudflare location"); docs call it "permissive, eventually consistent, and intentionally designed to not be used as an accurate accounting system" | **Exists; fit is partial → V-2** |
| AI Gateway supports external model providers (AD-1 exception) | 23+ providers (OpenAI, Anthropic, Google, Mistral, Bedrock, Azure…), custom OpenAI-compatible providers, unified REST API since May 2026 | **Accurate** (unlogged — V-6) |
| Vectorize server-side metadata filtering (AD-6) | Supported; filter applies **before** topK. Requires a **metadata index per filtered property** (max 10; string/number/boolean), and **"vectors upserted before a metadata index was created won't have their metadata contained in that index"** | **Feasible; build-order caveat → V-3** |
| Better Auth bug #4203 (cookieCache + secondaryStorage) | Issue real: "`secondaryStorage` ttl forces re-login on users" — opened Aug 2025, **reopened Jan 2026, still open**; community workaround = disable cookieCache | **Accurate — fence in AD-7 justified** |
| MCP spec 2026-07-28 via Agents SDK | Spec 2026-07-28 exists and is the stable/final revision (stateless core, Streamable HTTP, extensions framework); agents 0.22.0 pins MCP SDK 1.30.0 exactly | **Accurate** |
| x402 protocol status ("protocol committed, vendor open") | x402 Foundation operationally live under Linux Foundation **2026-07-14** (40 members incl. Cloudflare, Stripe, Visa) | **Accurate in the spine**; memlog date "standard since 2026-04" is imprecise (V-7) |

---

## Findings

### V-1 · HIGH — `x402-hono 1.2.0` breaks cold-start install against zod 4.5.4 and is the superseded SDK line

**Where:** Stack table row `x402-hono | 1.2.0`; AD-7/AD-11 x402 rails; `adapters/x402`.

**Evidence (npm, 2026-08-29):**
- `x402-hono@1.2.0` peerDependencies: `zod: '^3.24.2'`, `hono: '^4.7.1'`, `x402: '^1.2.0'`, `viem: '^2.21.26'`, `@coinbase/cdp-sdk: '^1.22.0'`, `@solana/kit: '^5.0.0'` — and **no `peerDependenciesMeta`**, so none are optional.
- The spine pins `zod 4.5.4`. `^3.24.2` is not satisfied by 4.5.4 → a cold `npm install` in the same workspace fails ERESOLVE (or forces `--legacy-peer-deps`/overrides, which the spine nowhere sanctions).
- The ecosystem has moved to the scoped v2 line: `@x402/hono@2.24.0` (peers only `hono ^4.0.0` + `@x402/paywall ^2.24.0` — no zod peer), `@x402/core@2.24.0`, `@x402/evm@2.24.0`. The Agents SDK in this very stack (`agents@0.22.0`) declares optional peers `@x402/core ^2.0.0` / `@x402/evm ^2.0.0` — i.e., Cloudflare's own SDK targets the v2 line.
- The memlog itself recorded "x402 … **V2**: session tokens, multi-chain" (entry of 2026-08-29) and then pinned the v1-line unscoped package — the verification and the pin disagree.
- Side effect: the v1 pin drags in required chain-vendor peers (`@coinbase/cdp-sdk`, `@solana/kit`, `viem`) — a vendor commitment the Deferred section explicitly keeps open ("facilitator + chain selection … vendor open").

**Fix:** Re-pin to `@x402/hono 2.24.0` (+ `@x402/paywall`, `@x402/core` as needed) — or remove the x402 package pin from the stack table entirely and let the committed Phase 0 x402 spike pin it, which matches the Deferred stance. Log the outcome as a memlog `(version)` entry.

### V-2 · MEDIUM — Rate Limiting binding: exists (GA) but never verified, and it cannot alone enforce AD-14's per-source crawl limits

**Where:** Conventions row "Rate limiting: Workers Rate Limiting binding. Never KV counters."; AD-14 "per-source rate limits".

**Evidence:** Binding is GA (CF changelog 2025-09-19) — so the named tech exists. But current docs state: `period` "must be either 10 or 60" seconds; "for each unique key … there is a unique limit **per Cloudflare location**"; the API is "permissive, eventually consistent, and intentionally designed to not be used as an accurate accounting system." No memlog `(version)` entry covers this binding at all.

**Fit assessment:** Fine for inbound per-key/per-principal request limiting (its designed use). Insufficient as the sole mechanism for NFR-030 respectful-crawler per-source politeness: per-colo counters mean the *global* rate against one origin can reach ~(number of colos touched) × limit, and a 10/60 s window cannot express slow crawl policies (e.g., one fetch per source per several minutes). The "Never KV counters" convention then bans the obvious fallback. Per-source crawl pacing realistically needs authoritative state — e.g., `next_fetch_at` scheduling in D1 (which AD-4's Workflow dispatch can honor) or a Durable Object — with the binding kept for inbound abuse control.

**Fix:** Split the convention: binding for inbound per-key limits; D1-scheduled pacing (or DO) for per-source outbound politeness. Add a memlog verification entry either way.

### V-3 · MEDIUM — Vectorize filtering is real, but AD-6's isolation silently fails unless the owner metadata index is created before any vector insert

**Where:** AD-6 "Vectorize metadata carries it and queries filter on it server-side"; AD-12 rebuildable projections.

**Evidence (CF Vectorize docs, current):** Server-side metadata filtering exists and applies before topK — the AD-6 mechanism is sound. But: filtering on a property **requires a metadata index** on it (max 10 per index; string/number/boolean only), and **"vectors upserted before a metadata index was created won't have their metadata contained in that index"** — indexing is not retroactive. A build agent that provisions the index, inserts corpus vectors, and adds the `workspace_id` metadata index later gets queries that silently miss those vectors' metadata — on the *tenant-isolation* invariant. Alternative: Vectorize **namespaces** are the built-in single-dimension partition (filterable by default, no metadata index needed) and map exactly to the `platform | ws_<id>` owner scope.

**Fix:** Add one sentence to AD-6 or the conventions: owner scope in Vectorize = namespace (preferred) or a metadata index created at index-provisioning time, before any insert. Log the verification.

### V-4 · MEDIUM — `agents@0.22.0` requires MCP v2 packages the stack table doesn't pin

**Where:** Stack table (`agents 0.22.0`, `@modelcontextprotocol/sdk 1.30.0`); `entry/mcp`.

**Evidence (npm):** `agents@0.22.0` non-optional peers include `@modelcontextprotocol/sdk: 1.30.0` (exact — matches the pin, good), **plus `@modelcontextprotocol/client: 2.0.0` and `@modelcontextprotocol/server: 2.0.0`** — neither appears in its `peerDependenciesMeta` optional list, and both exist on npm at exactly 2.0.0. npm ≥7 auto-installs missing peers, so cold install succeeds; but the spine's pin set under-declares the MCP dependency surface, and the v2 client/server packages sit outside the version discipline the stack table exists to provide.

**Fix:** Add both to the stack table (pinned 2.0.0, "required by agents"), or a one-line note on the agents row. Cosmetically: also note that agents' zod peer is `^4.0.0` — satisfied, one more confirmation the zod-4 adoption was right (V-1's conflict is x402-hono's alone).

### V-5 · LOW — compatibility_date ≥ 2026-08-04 row is accurate but traceable to neither memlog nor code-sweep

The prototype's compat date is 2024-11-01 (code-sweep §1) and no memlog `(version)` entry mentions the 2026-08-04 nodejs_compat-default threshold. It happens to be exactly right (CF changelog post `2026-08-04-nodejs-compat-default`), but under this gate's rule — "pinned from neither source is a finding" — it needs a memlog entry recording the changelog check.

### V-6 · LOW — AD-1's AI Gateway external-provider exception was asserted without a logged verification

Accurate per current CF docs (23+ providers incl. OpenAI/Anthropic/Google, custom OpenAI-compatible providers, unified REST API since May 2026), so the AD stands as written. The memlog records the *decision* (reconcile entry) but no `(version)`-typed verification of the capability. Add one line.

### V-7 · LOW — memlog's x402 date is imprecise (spine unaffected)

Memlog: "x402 = Linux Foundation standard since 2026-04." Reality: LF announced the x402 Foundation and the protocol contribution earlier, and the Foundation became **operationally live 2026-07-14**. The spine's own text ("protocol committed, vendor open") is fine; correct the memlog line so downstream consumers don't repeat the date.

---

## What this review verified clean (record in memlog)

- All 15 registry-pinned versions = npm latest on 2026-08-29 (react-router 7.18.3 = latest of the deliberate v7 line, dist-tag `version-7`).
- `@cloudflare/vitest-pool-workers@0.22.0` ⟷ `vitest@4.1.11`: peer `vitest ^4.1.0` — **compatible** (was flagged unverified).
- `better-auth@1.7.2` ⟷ `drizzle-orm@0.45.2`: peer `^0.45.2 || >=1.0.0-rc.1 <2.0.0` — **compatible**, drizzle adapter ships in-box (was flagged unverified).
- `agents@0.22.0` ⟷ `@modelcontextprotocol/sdk@1.30.0`: exact-version peer match (was flagged unverified; see V-4 for the extra peers).
- nodejs_compat default at 2026-08-04; Rate Limiting binding GA; AI Gateway external providers; Vectorize server-side filtering; Better Auth #4203 still open (reopened Jan 2026); MCP spec 2026-07-28 stable; x402 Foundation operational under LF.

## Sources

- npm registry via `npm view` (versions, peerDependencies, peerDependenciesMeta, dist-tags), 2026-08-29
- [Node.js compatibility is now enabled by default — Cloudflare changelog](https://developers.cloudflare.com/changelog/post/2026-08-04-nodejs-compat-default/)
- [Rate Limiting binding — Workers docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) · [Rate Limiting in Workers is now GA](https://developers.cloudflare.com/changelog/2025-09-19-ratelimit-workers-ga/)
- [Metadata filtering — Vectorize docs](https://developers.cloudflare.com/vectorize/reference/metadata-filtering/)
- [AI Gateway REST API — Cloudflare docs](https://developers.cloudflare.com/ai-gateway/usage/rest-api/) · [Cloudflare AI Gateway product page](https://www.cloudflare.com/products/ai-gateway/)
- [better-auth issue #4203](https://github.com/better-auth/better-auth/issues/4203)
- [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) · [MCP blog: The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [Linux Foundation: operational launch of x402 Foundation (2026-07-14)](https://www.linuxfoundation.org/press/linux-foundation-announces-operational-launch-of-x402-foundation-to-standardize-internet-native-payments-for-ai-agents-and-applications)
