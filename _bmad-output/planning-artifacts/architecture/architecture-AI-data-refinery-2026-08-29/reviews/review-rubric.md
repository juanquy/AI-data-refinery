# Rubric Review — ARCHITECTURE-SPINE.md (AI-data-refinery, 2026-08-29)

**Lens:** good-spine checklist, dimension by dimension.
**Inputs:** ARCHITECTURE-SPINE.md, .memlog.md, code-sweep.md, PRD prd-AI-data-refinery-2026-08-29 (feature groups only).

## Verdict

**PASS with findings.** The spine is a genuine build substrate: 14 ADs that each name the divergence they kill, mechanically checkable rules, a complete conventions table, a capability map covering every required PRD group, and safe deferrals. No decision would cause wrong or incompatible builds. Findings are gaps to close, not decisions to reverse.

**Counts:** 0 critical · 2 high · 4 medium · 4 low

---

## Dimension 1 — Fixes the real divergence points; misses none

The AD set maps cleanly onto the divergence points the code sweep proved are real: platform (AD-1), topology (AD-2), the five-divergent-copies refinement problem (AD-3), the missing async substrate (AD-4), the DDL-vs-Zod split brain (AD-5), the absent tenant column (AD-6), the three overlapping auth schemes (AD-7), the nonexistent OpenAPI contract (AD-8), the synthesized-fallback habit (AD-9), per-handler error shapes (AD-10), the unmetered MCP surface (AD-11), the four non-transactional writes (AD-12), the ~15 hardcoded prod URLs (AD-13), and the fetch/SSRF boundary (AD-14). Conventions close naming, IDs, time, money, severity, logging, and testing. This is a strong hit rate against the sweep's "decisions a spine must ratify or overturn" list — all 8 are answered.

Two real divergence points are missed:

- **[HIGH] F1.1 — MCP contract governance does not exist as a rule.** The map row for MCP cites "AD-8-equivalent tool schemas" — an AD that exists nowhere. AD-8 fixes the REST contract (one zod-openapi definition → validation + types + published doc), but nothing fixes how MCP tool input/output schemas are derived, versioned, or kept in lockstep with the same Zod definitions. This matters doubly here: MCP is the product's primary agent surface, and FR-042 requires Studio to render a live preview of the MCP tool definition a custom schema generates — so the Studio builder and the `entry/mcp` builder must independently agree on tool-definition generation with no rule to agree on. The exact drift AD-8 prevents for REST is unprevented for MCP. Fix: promote the phrase into a real rule (e.g., extend AD-8: "MCP tool schemas derive from the same Zod definitions that feed zod-openapi; a tool whose schema is not derived from the shared definition is a defect") and cite that from the map row.
- **[HIGH] F1.2 — No idempotency rule for at-least-once semantics.** Queues deliver at-least-once and Workflow steps retry, but no AD or convention fixes idempotency: a redelivered `refinery-dispatch` message can spawn two Workflow instances for one run; a retried store/notify step can double-write `usage_events` or double-fire a webhook. AD-11's "billable row only for a successfully delivered result" does not protect against the same result being delivered twice. The fix is one sentence in AD-4 (Workflow instance ID = `run_id`, creation of an existing ID is a no-op; queue consumers and metering writes are idempotent on `run_id`/delivery ID), but without it the pipelines, webhooks, and billing builders each invent their own answer — and billing correctness (FR-063/065) rides on it.

Minor: the lexical half of hybrid search (FR-034) has no decided mechanism (see F-L1); pagination has no convention (see F-M3).

## Dimension 2 — Rules enforceable and divergence-preventing

Strong. Nearly every rule is checkable mechanically by a reviewer of downstream code:

- AD-2: import-graph lintable (`core/` imports no Hono/CF types; no SQL in `entry/`).
- AD-5: greppable (any hand-written DDL or hand-maintained row type is a defect).
- AD-6: structurally enforced (every repository method takes an owner-scope parameter — "there is no unscoped read API to call" is the right shape: prevention by construction, not by review vigilance).
- AD-8: route without a zod-openapi definition is visible; clients consume generated types.
- AD-9: `z.record(z.any())` ban is greppable.
- AD-10: single `onError`; envelope shape checkable.
- AD-11: single write path (`core/metering` alone) is import-checkable; append-only is schema-checkable.
- AD-13: literal URLs/price IDs/model IDs greppable.
- AD-14: single fetch port is import-checkable; "no unfenced path exists" checkable at the adapter.

Each AD's "Prevents" line names a real, sweep-evidenced failure, and the rules do prevent them. The only unenforceable "rule" found is the phantom "AD-8-equivalent" citation (already counted as F1.1). AD-3's "pure-ish function" is loose wording, but the enforceable core (exactly one filter-chain implementation, entry modes differ only in orchestration) is clear.

## Dimension 3 — Deferred items are collision-safe

All eleven deferrals were walked; none lets two independent builders collide before decision:

- Multi-worker split, D1 >10 GB, corpus refresh policy — each has an explicit trigger and an in-force interim rule (AD-2; fixed-interval per pipeline).
- x402 facilitator/chain — isolated behind `adapters/x402`; the ledger is micro-USD regardless of settlement rail, so metering/marketplace builders are insulated.
- Pricing numbers — units and representation are fixed (the collision surface); numbers are founder config (FR-074).
- Stripe Connect payouts — ledger accrual (AD-11) is the launch mechanism, so no builder needs the payout design.
- Extension/CLI, frontend toolchain upgrades, template guardrail detail, SOC 2, SSO — post-launch, feature-altitude, or single-feature scope.

No finding. This is the checklist dimension the spine handles best.

## Dimension 4 — Named tech verified-current

Spot-checked the Stack table against memlog `(version)` entries dated 2026-08-29:

| Spine entry | Memlog coverage |
| --- | --- |
| hono 4.13.5, zod 4.5.4, @hono/zod-openapi 1.6.1, drizzle 0.45.2/0.31.10/0.8.3, better-auth 1.7.2, stripe 22.6.0, x402-hono 1.2.0, agents 0.22.0, MCP SDK 1.30.0, wrangler 4.127.1, vitest 4.1.11 / pool-workers 0.22.0, react-router 7.18.3, react-query 5.102.8, TS 5.9.3, vite 6.4.3, tailwind 3.4.19, react 18.3.1 | All covered — npm-registry pin sweep 2026-08-29, plus targeted verifications (drizzle-kit↔D1, stripe fetch client on Workers, zod-4 peer chain, zod-openapi vs chanfana, static-assets-vs-Pages, Workflows/Queues/D1/Agents-SDK platform facts) |
| npm workspaces, React 18.3.1, vite, tailwind, TS [ADOPTED] | Ratified from code-sweep reality |

- **[MEDIUM] F4.1 — One stack row lacks a verification entry:** `Cloudflare Workers compatibility_date ≥ 2026-08-04 (nodejs_compat default)`. No memlog entry verifies that date or the nodejs_compat-default claim; every other row traces to a dated verification. Either verify and log it, or restate it as intent ("pin latest compatibility_date at scaffold time").

Everything else in the table is covered. The react-router 7.18.3 pin correctly records why v8 is excluded (React ≥19.2.7), consistent with the deferred toolchain upgrade.

## Dimension 5 — Ratifies the brownfield where deliberately kept

The PRD directed an internals rebuild, so contradiction with prototype internals is intentional and not judged. Checked every [ADOPTED] tag against code-sweep reality:

- AD-1 Cloudflare — prototype is CF Workers; adoption ratified by user per memlog. ✓
- TypeScript 5.9.3 — matches installed (lockfile). ✓
- react/react-dom 18.3.1 — matches installed. ✓
- vite 6.4.3, tailwindcss 3.4.19 — match installed. ✓
- npm workspaces (no turbo) — matches (`package.json` workspaces, no turbo/pnpm/nx). ✓

Deliberate departures are properly recorded rather than silently contradicting: wrangler 3→4 and hono 4.13.3→4.13.5 are pinned upgrades in the memlog; Studio moves from Pages to a static-assets worker on a verified CF recommendation (Pages in maintenance mode); `packages/sdk` explicitly "replaces packages/integrations" (sweep: dead code); `packages/extension` kept dormant. No [ADOPTED] element misstates reality. No finding.

## Dimension 6 — Capability map covers the PRD feature groups

All sixteen required groups have rows: corpus/verticals, on-demand refinement, diffs+severity, MCP, REST/OpenAPI, search, custom schemas, pipelines, webhooks, Stripe rail, agent rail (402/wallets/x402), quotas (Stripe+quotas row and 402 row jointly), marketplace, export, Studio, SDKs, ops console+audit, telemetry/status. No required row is missing.

- **[MEDIUM] F6.1 — Custom-schemas row is ambiguous about where tenant schemas live.** "`core/corpus` + `packages/schema` runtime defs" conflates the static Drizzle package (source-of-truth code, AD-5) with tenant-defined custom schemas, which are dynamic D1 rows (tenant resources per AD-6). A builder could read this as "custom schema definitions are code in packages/schema." Say what's meant: e.g., "runtime schema *interpreter* utilities in packages/schema; tenant schema definitions are D1 rows under AD-6."
- **[LOW] F6.2 — Two PRD launch features have no explicit home:** FR-023 public badges (mentioned inside AD-6's exception list but no map row) and F12 onboarding/DX (playground, MCP client-config generation, activation instrumentation FR-114). Both are plausibly subsumed under Studio/corpus/telemetry rows, but the map is where a feature builder looks first — one row each removes the guess.

## Dimension 7 — Every initiative-altitude dimension addressed

- Deployment & environments — AD-13 + env-flow diagram. ✓
- Infra/provider strategy — AD-1 (+ AI Gateway escape hatch). ✓
- Operations/observability — AD-11 audit stream, AD-13 CI, logging convention, telemetry map row. ✓
- Data topology — AD-6 + AD-12. ✓
- Security/auth — AD-7 + AD-14 + AD-6. ✓
- API contracts — AD-8 + AD-10 + conventions. ✓
- Frontend — Studio as pure public-API client (AD-8), stack pinned, structure seeded. ✓ (thin but decided)
- Testing/CI — testing convention + AD-13 CI gates. ✓
- Monorepo layout — structural seed + npm workspaces. ✓

No dimension is silent. No finding.

## Dimension 8 — Internal consistency and diagram validity

All four diagrams mentally parsed:

1. Layering flowchart (LR) — valid; subgraph, labeled and dashed edges well-formed.
2. Structural seed flowchart (TB) — valid; cylinder shapes `[("…")]` well-formed, IDs unique.
3. erDiagram — valid; cardinalities (`||--o{`, `}o--||`, `|o--o{`) are legal Mermaid; bare `OPT_OUT_SOURCE` entity declaration is legal.
4. Environments flowchart (LR) — valid; quoted edge labels well-formed.

Cross-checks: AD-2's single-deployable rule vs the two-worker seed diagram — consistent (the static-assets worker is AD-2's own stated exception). Cron→Queue→Workflow flow matches AD-4. Roles match the PRD F6 matrix. Two billable units match F7. Money/severity/error conventions are cited consistently. No AD contradicts another AD, a convention, a diagram, or a map row.

- **[MEDIUM] F8.1 — ID-prefix registry doesn't cover the ERD.** The ERD declares WALLET, QUARANTINED_SNAPSHOT, AUDIT_EVENT, and OPT_OUT_SOURCE, but the ID convention has no `wal_` (wallets move real money — an unprefixed or improvised ID here is the worst place for divergence), no prefix for quarantined snapshots or opt-out rows, and a single `evt_` that is ambiguous between `usage_events` and `audit_events` — two different append-only tables both mandated by AD-11. Complete the registry and split `evt_`.
- **[MEDIUM] F8.2 — No pagination/list-envelope convention.** Every feature ships list endpoints (corpus, diffs, feed, usage, audit, marketplace, deliveries) built by different builders; nothing fixes cursor-vs-offset or the list response shape. AD-8 makes each choice *documented*, not *consistent*. One convention row ends it.
- **[LOW] F-L1 — Lexical search mechanism undecided.** FR-034's keyword half has no decided mechanism (D1 FTS vs LIKE); the prototype's `LIKE '%…%'` scan is a sweep-flagged bug, so worth one sentence to keep it from being re-created. Single-builder scope keeps this low.
- **[LOW] F-L2 — Seed diagram arrow `wf --> apiw` reads backwards.** Workflow instances *are* worker code; the arrow implies the Workflow calls the API worker over the network. Cosmetic.
- **[LOW] F-L3 — Frontmatter `companions: []`** while the memlog names a co-founder walkthrough artifact as a deliverable of this run. Update when it lands.

---

## Findings summary

| # | Severity | Dimension | Finding |
| --- | --- | --- | --- |
| F1.1 | HIGH | 1, 8 | MCP contract governance cited as nonexistent "AD-8-equivalent"; no rule ties MCP tool schemas to the shared Zod definitions (Studio preview and entry/mcp must agree with nothing to agree on) |
| F1.2 | HIGH | 1 | No idempotency rule for at-least-once Queue delivery / Workflow retry — duplicate run spawn, double `usage_events`, double webhook fire are all possible under AD-4/AD-11 as written |
| F4.1 | MEDIUM | 4 | `compatibility_date ≥ 2026-08-04 (nodejs_compat default)` has no memlog verification, unlike every other stack row |
| F6.1 | MEDIUM | 6 | Custom-schemas map row conflates static `packages/schema` with tenant-defined schemas stored in D1 |
| F8.1 | MEDIUM | 8 | ID-prefix registry incomplete vs ERD: no `wal_` (wallets!), no quarantine/opt-out prefixes, `evt_` ambiguous across two event tables |
| F8.2 | MEDIUM | 1, 8 | No pagination / list-response convention across independently built list endpoints |
| F6.2 | LOW | 6 | Badges (FR-023) and onboarding/DX (F12) lack explicit map rows |
| F-L1 | LOW | 1 | Lexical-search mechanism undecided (prototype's LIKE-scan bug risks re-creation) |
| F-L2 | LOW | 8 | `wf --> apiw` arrow direction misleading in seed diagram |
| F-L3 | LOW | 8 | `companions: []` stale vs memlog's walkthrough deliverable |

**Recommendation:** Apply F1.1 and F1.2 (both are one-to-three-sentence AD amendments) before builders are dispatched; mediums batch into the same edit pass. Nothing requires re-opening a decision.
