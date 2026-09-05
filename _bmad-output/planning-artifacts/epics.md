---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/prd.md
  - _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/addendum.md
  - _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/research-landscape.md
  - _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/reconcile-repo.md
  - _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/reconcile-research.md
  - _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/review-edge-cases.md
  - _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/review-adversarial.md
  - _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/review-rubric.md
  - _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/code-sweep.md
  - _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/reviews/reconcile-prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/reviews/review-security.md
  - _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/reviews/review-adversarial.md
  - _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/reviews/review-verification.md
  - _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/reviews/review-rubric.md
  - _bmad-output/planning-artifacts/ux-designs/ux-AI-data-refinery-2026-09-04/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-AI-data-refinery-2026-09-04/EXPERIENCE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-AI-data-refinery-2026-09-04/review-rubric.md
  - _bmad-output/specs/spec-AI-data-refinery/SPEC.md
  - _bmad-output/specs/spec-AI-data-refinery/stories.yaml
---

# AI-data-refinery - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for AI-data-refinery (working name: Universal Data Refinery), decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

Authority order when inputs disagree: PRD (`prd.md`, status final) → Architecture Spine (`ARCHITECTURE-SPINE.md`, AD-1..AD-16, binding) → UX spines (`DESIGN.md` + `EXPERIENCE.md`) → Spec kernel (`SPEC.md` + `stories.yaml`, derived from the first two). The prototype repository is evidence of intent, never the product boundary. Requirement IDs below keep their upstream stable IDs (FR-nnn, NFR-nnn, AD-n) so stories can cite them verbatim.

## Requirements Inventory

### Functional Requirements

Launch scope is F1–F10, F12, F13 (56 FRs). F11 (FR-100/101) is post-launch. Prototype status notes are negative acceptance criteria: the named defect must be absent.

#### F1. Refinery Core — extraction pipeline

- FR-001: The system refines a source (URL or supplied document) into JSON validated against a target schema through a pipeline of content sanitization, SSRF/allowlist enforcement, prompt-injection-hardened AI extraction, automated JSON repair, and schema validation. *(Prototype: implemented — but the "preserve" label is honored only after adversarial verification of the SSRF and injection defenses.)*
- FR-002: Validation is strict by default. An extraction that fails schema validation is flagged as such and never silently served as valid; any permissive-fallback path is explicit in the API response. *(Prototype gap: silent permissive fallback synthesizes a result.)*
- FR-003: Every refined artifact records provenance: source URL, fetch timestamp, source content hash, extraction model and version, schema version.
- FR-004: Extraction supports a primary and a fallback model. On primary failure the fallback is attempted; if both fail the request fails explicitly (never a silent partial result), the failure is recorded, and the query is not billable. Fallback runs inside the extract filter in both entry modes (AD-3) and a fallback-path extraction bills as one query.
- FR-005: Each refinement response can report its token economics (raw source size versus refined output tokens); Studio surfaces aggregate token savings. Numbers are measured, never estimated (NFR-003).
- FR-006: Any confidence or quality indicator shown for an extraction is computed from real validation and extraction signals. *(Prototype gap: per-entity confidence scores are hardcoded 0.96–0.99 literals.)*

#### F2. Corpus & Freshness

- FR-010: The platform maintains a pre-indexed corpus of tracked entities, each with a defined refresh policy. Ingestion supports generic URL fetching and structured source connectors (e.g., GitHub Releases API for the dev vertical) where an API beats scraping; connectors are alternate implementations of the single fetch port (AD-14).
- FR-011: Scheduled pipelines execute on their schedule, refresh their tracked sources, retry on failure, and surface failures to their owners. *(Prototype gap: the cron lists pipelines but never executes them; `last_run_at`/`next_run_at` never update.)*
- FR-012: The six vertical template packs (dev SDK migrations, B2B SaaS pricing, municipal zoning/STR, health-payer prior-auth, FDA/biopharma, SEC 10-K) ship as schema templates (public blueprints, FR-043) with example tracked sources. Each embeds compliance guardrails in the extraction prompt and display copy (HIPAA no-PHI directive, FDA "not medical advice", SEC "not investment advice", Fair Housing nondiscrimination), carried from the prototype and kept current. SEC 10-K is not marketing-forward.
- FR-013: Launch corpus: the dev SDK / breaking-changes vertical is genuinely live at launch (real tracked sources refreshing on schedule, sustained 14 consecutive days unattended per the exit gate). The other five templates ship with clearly labeled sample data, never presented as live coverage; everything else is served by universal on-demand refinement.
- FR-014: Universal on-demand refinement: any URL can be refined against any accessible schema at query time.

#### F3. Change Intelligence

- FR-020: Every refresh of a tracked entity produces a versioned snapshot; version history is queryable. Only validated snapshots enter version history as diff bases; a flagged-invalid extraction is recorded for diagnostics but quarantined, never diffed against, and never fires change events (no phantom CRITICAL alerts).
- FR-021: A semantic diff between consecutive valid versions carries a severity on one canonical entity-level scale — CRITICAL / MAJOR / MINOR — using domain-aware rules (e.g., price-increase asymmetry). Per-item severity within a diff may carry its own finer scale. Both vocabularies are defined once in `packages/schema` and used consistently across API, MCP, badges, and UI. The launch mechanism is field-level semantic diffing; AST-level diffs are Phase 3; public claims must match the shipped mechanism. *(Prototype mixes two incompatible severity vocabularies.)*
- FR-022: Customers subscribe to change events via webhooks. Deliveries honor each subscription's event-type and entity filters, fan out to all matching subscriptions, are signed, and are retried with bounded retries. Destinations: generic HTTPS endpoints and chat-native targets (Slack, Discord, Telegram); scheduled pipelines can carry their own notification target; a send-test-event affordance exists per subscription. A persistently failing endpoint moves the subscription to a visible paused/dead-letter state with missed events replayable once revived; alerts are never silently lost. *(Prototype gap: only the single latest CRITICAL/MAJOR diff re-fires every 6h, filters ignored, no dedupe.)*
- FR-023: Public SVG status badge per tracked entity rendering the latest version label, colored by latest diff severity, designed as a GitHub-README embed and distribution surface. Badges exist for platform-corpus entities; a tenant-owned entity gets a badge only when its workspace explicitly enables that public projection (AD-6). Non-opted and nonexistent entities return indistinguishable responses (security review S-15).
- FR-024: An authenticated global change feed: the cross-corpus stream of recent diffs, filterable by vertical and severity. Scope is one named composite read in `core/corpus`: platform corpus + caller's workspace + active marketplace grants (AD-6). *(Prototype exposes this unauthenticated.)*

#### F4. Agent Access — MCP, REST, Search

- FR-030: A native MCP server exposes the refinery as tools, resources, and prompts, including one tool per published custom schema. Every advertised resource and prompt is actually readable/gettable. *(Prototype: hand-rolled JSON-RPC, protocol 2024-11-05, `resources/read` and `prompts/get` unimplemented.)*
- FR-031: The MCP server complies with the 2026-07-28 authorization spec: OAuth 2.1 resource server with protected-resource metadata (RFC 9728) and resource indicators (RFC 8707). No tool call executes unauthenticated. Free-tier keys satisfy auth at zero cost via the API-key direct path that sits alongside user-delegated OAuth (AD-7).
- FR-032: MCP tool calls are metered and attributed to the calling key/wallet/workspace identically to REST calls, through the same `core/metering` classification (AD-11). Resource reads and prompt retrievals that serve corpus data meter as cached reads. *(Prototype gap: `/mcp` bypasses all metering.)*
- FR-033: A versioned REST API (`/api/v1`) provides per-vertical query endpoints, universal refine, search, version history/diffs, and usage/stats, with published machine-readable discovery documents (OpenAPI spec, MCP manifest) and a public corpus-overview endpoint (entity counts, index health) as a deliberate public surface.
- FR-034: Hybrid search across the corpus — semantic (vector) plus lexical — filterable by vertical, schema, and workspace; owner-scoped via Vectorize namespace (AD-6); no unbounded `LIKE` scans over JSON blobs (Deferred interim rule).

#### F5. Visual Schema Studio

- FR-040: Workspace members with BUILDER+ role create, edit, and delete custom schemas via a no-code builder, with raw JSON editing for experts; the stored document is the single canonical constrained JSON Schema profile (AD-16).
- FR-041: A schema can be tested interactively against a live URL before publishing; the test runs through the policed fetch port (AD-14). *(Billing/quota treatment of a live test is an open decision — see Additional Requirements §H.)*
- FR-042: Publishing a schema provisions its MCP tool and REST access, scoped to its workspace (F6); the builder shows a live preview of the MCP tool definition generated by the AD-16 compiler. Tool names are namespaced deterministically; publish fails closed on a name collision with a rename prompt.
- FR-043: Schemas carry a visibility setting: private to their workspace, or published as a public blueprint that other workspaces can clone and customize. The six vertical templates (FR-012) are delivered as blueprints. Clones are independent snapshots that record their source blueprint and version.
- FR-044: Studio provides version and diff browsing (time-travel) for tracked entities — the visual counterpart of FR-020/021.

#### F6. Workspaces & Tenancy

- FR-050: All customer resources (schemas, pipelines, webhooks, API keys, agent tokens, wallets, exports, marketplace listings) belong to a workspace with membership and roles enforced server-side on every path — REST, MCP, and Studio. Resources are workspace-owned and survive member removal. *(Prototype gap: client-supplied `workspaceId` trusted; MCP lists every tenant's schemas unauthenticated; `workspaces` routes unguarded.)*
- FR-051: Cross-tenant access attempts fail closed (401/404, never data) and are audit-logged.
- FR-052: Workspace roles follow the four-role matrix; role changes are audit-logged:

| Capability | OWNER | BUILDER | MEMBER | VIEWER |
|---|---|---|---|---|
| Billing, plan, workspace settings, invites | ✓ | — | — | — |
| Schema design & publishing, pipelines, webhooks | ✓ | ✓ | — | — |
| Run refinements & queries, use marketplace items | ✓ | ✓ | ✓ | — |
| View data, history, audit log | ✓ | ✓ | ✓ | ✓ |

#### F7. Billing & Metering

**F7 preamble — the billable unit (binding on FR-060..067, FR-081, FR-090, FR-112):** Exactly two billable units exist platform-wide: a **cached corpus read** (serving already-refined data — cheap) and an **on-demand refinement** (fetch + AI extraction — expensive, priced above measured inference cost per NFR-050). Prices, quotas, the metering ledger, and creator attribution count the two separately. A query is billable only when the platform successfully delivers the requested result: failed extractions (provider outage, fetch failure, strict-validation failure with nothing servable) are not billable — relationship-mode wallets are auto-credited, account-less payments are never settled. A retry of a failed query is a new attempt, not a second charge.

- FR-060: Free tier: signup yields an API key + MCP access with a monthly quota (counting both unit types) at zero cost. Quota size and whether agents get trial credits are OQ-3. *(Free-tier signup gating/abuse boundary is an open finding, §H.)*
- FR-061: Paid human plans are Stripe subscriptions; the plan catalog (names, prices, quotas per unit type) is founder-editable configuration, not code. Tier structure is committed: Free, PRO, ENTERPRISE, plus agent pay-per-query. Every dollar and quota number is a placeholder until the Phase 0 pricing exercise (OQ-2). *(Prototype seeds: PRO $49/10k, ENTERPRISE $299/100k, $0.005/agent-query — illustrative only.)*
- FR-062: Agent flow: an over-quota or unfunded request receives HTTP 402 with machine-readable price headers and a machine-navigable purchase path (one 402 body shape for humans and agents). Agents pay in two modes: (a) relationship mode — a dedicated agent token drawing on a guardian-governed prepaid wallet; (b) account-less mode — per-request x402 payment with no signup (Apify precedent). Account-less ships with zero revenue expectation, to measure OQ-6.
- FR-063: Wallet top-ups move real money (rails: Stripe; x402). A top-up without a corresponding successful charge is a defect. *(Prototype gap: top-up grants quota without charging.)*
- FR-064: Guardian controls apply to relationship-mode tokens: funding, spend limit, and an immediate kill-switch that revokes the token's access — effective for new requests at the next request (AD-7); nothing is billed to a revoked token after the kill (holds placed before the kill settle, no new holds after — AD-15). Account-less requests carry no standing access to govern; their control is the payment itself plus technical abuse controls (NFR-026).
- FR-065: A metering ledger records every billable query with its unit type and key/agent/workspace (or x402 payment reference) attribution; customers can query their own usage; the ledger reconciles against charges; refunds, credits, chargebacks, and courtesy grants appear as explicit compensating ledger events (AD-11 row contract).
- FR-066: Stripe lifecycle is webhook-driven and signature-verified: provisioning on successful payment, revocation on subscription end; processing idempotent by Stripe event id. *(Prototype: verification skipped when secret unset; non-constant-time compare; price IDs committed in source.)*
- FR-067: A paid subscriber who exhausts quota gets a hard stop with the same machine-readable 402 mechanism agents get, pointing at plan upgrade or wallet top-up (workspace API keys draw the wallet only through this path — AD-15). No silent overage billing.

#### F8. Operations Console

- FR-070: Operator/admin access uses real authenticated accounts: platform admin is a role on specific user accounts, MFA-gated, Studio sessions only, first admin bootstrapped by runbook (AD-7). No shared passcodes in source, database, or UI. *(Prototype gap: three hardcoded passcodes; any Pro key is a platform admin.)*
- FR-071: Operators govern human customers and agent fleets — view, suspend, revoke, kill-switch — plus deliberate, audit-logged courtesy actions (manual quota grants, wallet credits) that are visibly distinct from paid transactions in the ledger (compensating events with an audit row, AD-11).
- FR-072: Console analytics (latency, cache hit rate, usage, revenue) are computed from real telemetry; fabricated metrics are a defect. *(Prototype gap: hardcoded 16ms latency, 99.4% cache hit, 330 nodes; seeded "live" agent telemetry rows.)*
- FR-073: An audit stream is actually written and queryable: auth events, billing/wallet events, pipeline runs, admin actions, role changes, cross-tenant denials — append-only `audit_events` in D1 (AD-11). *(Prototype gap: audit tables read but never written.)*
- FR-074: Pricing-plan editor for founder-controlled plan changes without deployment; ledger rows keep the price frozen at serve time, so edits never rewrite historical money (AD-11).

#### F9. Marketplace (launch, accrual mode)

- FR-080: Customers browse and install schema templates and feeds published by creators; cross-workspace reads happen only through the grant scope minted by `core/marketplace` after an active-install entitlement check (AD-6).
- FR-081: Usage of marketplace items is attributed to their creator with an 80/20 creator revenue share, computed per query on revenue actually collected, per unit type (cached vs. on-demand); the ledger row carries the `lst_` reference and split basis (AD-11).
- FR-082: Creator earnings accrue from launch in a ledger each creator can inspect; Stripe Connect payouts are the first committed Phase 3 fast-follow, and the accrue-now/pay-soon arrangement is stated publicly to creators. Fraud controls are requirements: a holdback window before funds release, self-dealing exclusion (queries from the creator's own keys/wallets/workspaces earn no share), and chargeback clawback from accrued or future earnings.
- FR-083: Creators set their own per-query price per listing within platform-defined bounds.
- FR-084: Marketplace curation: featured listings and usage-based ranking (query-count leaderboard) computed from revenue-qualified queries; self-originated queries count for neither share nor ranking.

#### F10. Fine-Tuning Export (launch)

- FR-090: Workspace-scoped corpus slices export as OpenAI JSONL, Llama3, Alpaca, and RAG-chunk formats, gated by workspace entitlements, including diff-derived training examples (change histories as migration-training data). Entitlements gate access; the ledger still records usage — an export of N entities is N cached-read acts, attributed and creator-shared like any serve (AD-11). Owner-scoped reads only (AD-6). *(Prototype: implemented, ungated, and reads a nonexistent column.)*

#### F11. Post-Launch Surfaces (not launch scope)

- FR-100: Browser extension (Chrome/Brave) to capture and refine pages into the user's workspace. Post-launch (Phase 3); bound by AD-8 when built.
- FR-101: CLI for developers: refine, query, diff, manage schemas from the terminal. Post-launch (Phase 3); net-new.

#### F12. Onboarding & Developer Experience (launch)

- FR-110: An in-product help center with guided quickstarts per surface (MCP, REST, Studio, marketplace, export).
- FR-111: One-click MCP client configuration generation for the agentic IDEs the launch persona lives in (Cursor, Claude Code/Desktop, Windsurf — extensible).
- FR-112: A signed-in playground: paste a URL and an instruction, watch it distill, displaying measured latency and token savings (FR-005). Free-tier quota applies; playground runs bill as on-demand refinements (AD-11); there is no anonymous usage.
- FR-113: Copy-ready snippets (cURL, SDK code) throughout Studio.
- FR-114: The activation path is instrumented end-to-end, feeding the time-to-first-refined-query, MCP-connection-rate, and bailout metrics (PRD §5).

#### F13. Client SDKs & Integrations (launch)

- FR-120: A TypeScript client SDK for the REST API, consuming generated OpenAPI types (AD-8), published to npm under the commercial brand (publishing blocked on OQ-1; build publish-ready).
- FR-121: Framework-native integrations: a LangChain document loader + agent tools package and a LlamaIndex reader, published and versioned with the SDK, rebuilt from `packages/integrations` into `packages/sdk` with proper builds (no committed artifacts).
- FR-122: Studio promotes the SDKs with copy-paste snippets (ties FR-113); framework package registries are a second discovery channel alongside MCP registries.

### NonFunctional Requirements

#### Performance

- NFR-001: Cached corpus reads (REST and MCP) target low-latency edge serving. No public latency claim until telemetry exists, then measured p50/p95 are published. An internal, non-published cache-tier latency budget is set for engineering. *(Prototype "sub-20ms" and hardcoded 16ms retired.)*
- NFR-002: On-demand refinement is seconds-scale (comparator: Firecrawl-class 5–15s); UI and docs set honest expectations.
- NFR-003: Every published performance or uptime figure anywhere (site, docs, console, Studio) derives from real measurement.

#### Availability & Reliability

- NFR-010: 99.9% internal availability target with a public status page; no contractual SLA at launch. *(Prototype "99.998%" constant retired.)*
- NFR-011: Missed scheduled refreshes are detected and alerted on; staleness of every tracked entity is visible to customers (last-refreshed timestamp on every response).
- NFR-012: When the AI provider is unavailable, cached corpus data continues to serve flagged with staleness; extraction requests fail explicitly rather than degrade silently.
- NFR-013: A machine-readable health/status document exists for agents alongside the human status page, reporting only measured facts. *(Replaces the prototype's hardcoded `/sla-health`.)*

#### Security

- NFR-020: Every customer-facing endpoint requires authentication except deliberately public surfaces (status badges, corpus overview, status doc, docs, marketing pages). This includes MCP (FR-031).
- NFR-021: All server-side fetching enforces SSRF protections; all fetched content is treated as untrusted input to the extraction model (prompt-injection hardening) — a persistent taint re-fenced on every LLM call (AD-14). *(Prototype: implemented — preserve after adversarial verification.)*
- NFR-022: No credentials, passcodes, or secrets in source code or database seeds.
- NFR-023: API keys and agent tokens are ≥256-bit random, shown once, stored as SHA-256 digests, compared constant-time, prefix-identifiable, revocable, and carry scoped permissions (Credentials-at-rest convention).
- NFR-024: All outbound webhooks are signed with the subscription's secret; all inbound webhooks (Stripe) are signature-verified before any core call.
- NFR-025: Tenant isolation is covered by automated tests proving cross-tenant requests fail closed on REST, MCP, and Studio paths.
- NFR-026: Account-less and anonymous traffic carries technical abuse controls — rate limiting (Workers Rate Limiting binding for inbound), anomaly detection, and the same SSRF/content policies as authenticated traffic.

#### Data Governance & Legal

- NFR-030: Respectful-crawler policy: corpus crawling honors robots.txt, fetches with an identifiable user-agent at conservative per-source rate limits (D1 `next_fetch_at` pacing), a public takedown/opt-out process exists (opt-out registry in D1; a listed source is never fetched and its stored raw snapshots are purged), and terms of service forbid targeting login-gated content or personal data.
- NFR-031: The product serves structured facts with provenance, not wholesale republication of source content.
- NFR-032: Launch posture on regulated data: no PHI/PII processing intended, no BAA, terms prohibit extracting personal data; SOC 2 Type II is a roadmap prerequisite for regulated-vertical sales.
- NFR-033: AI-extracted data can be wrong: every response carries validation status and provenance; accuracy limitations are stated in terms; extraction accuracy becomes a measured metric post-launch.
- NFR-034: Customer data and customer-created content are never used to train foundation models — the platform's or third parties' (only providers with contractual no-training terms; stated in terms of service).
- NFR-035: Data residency options are a known non-offering until Phase 4; stated plainly wherever enterprise buyers look.

#### Observability & Audit

- NFR-040: Per-endpoint latency, error, and usage telemetry from day one — the source of truth for NFR-001/003 and console analytics (FR-072).
- NFR-041: The audit stream (FR-073) is durable and queryable — groundwork for SOC 2 evidence (tamper-evidence beyond D1 is a Deferred item).
- NFR-042: Model identity, version, and inference metadata are logged per extraction (tokens/cost into `usage_events` metadata), and extraction-quality drift is monitored over time (validation pass-rate trends per source/model).

#### Scalability & Unit Economics

- NFR-050: Per-query serving and inference costs are measured and tracked against price; agent pay-per-query pricing never sells on-demand inference below cost; cached reads and on-demand refinements are distinguished in the cost model.
- NFR-051: The platform scales horizontally on Cloudflare edge/serverless primitives without customer-visible capacity planning at launch scale.

### Additional Requirements

#### A. Architecture Spine — binding decisions (full text in `ARCHITECTURE-SPINE.md`; IDs stable and citable)

- **AD-1 Platform is Cloudflare [ADOPTED].** All runtime compute and state on Cloudflare primitives (Workers, Workflows, Queues, D1, KV, R2, Vectorize, Workers AI). External services only where Cloudflare has no primitive (Stripe, x402 facilitator). `adapters/ai` may call external model providers through Cloudflare AI Gateway for quality or FR-004 fallback — model IDs as env vars, providers with no-training terms. Moving other compute off-platform is a spine update.
- **AD-2 One deployable API worker.** All backend code ships as `apps/worker`, layered `entry → core ← adapters`. `entry/` has no business logic and no SQL; `core/` imports neither Hono nor Cloudflare types; only `adapters/` touch storage/vendor APIs. Studio static assets deploy as their own trivial worker.
- **AD-3 One refinement core, two entry modes, one run record.** Exactly one filter chain `fetch → sanitize → extract → validate → diff → store → notify` in `core/refinement`. On-demand (HTTP/MCP) runs it synchronously in-request; scheduled runs execute the same filters as Workflow steps — one filter = one step, no fusions. Filter I/O passes references (R2 keys, D1 ids), never inline payloads, identically in both modes. Model fallback lives inside the extract filter. Every execution creates exactly one `REFINEMENT_RUN` (`run_` id; `pipeline_id` nullable; principal attribution mandatory); provenance, quarantine, drift metrics, and billing key off `run_id`. Quarantine writes happen in the chain's shared failure path, never in entry layers.
- **AD-4 Workflows execute, Queues dispatch, everything idempotent.** Every scheduled run = one Workflow instance whose id **is** the `run_` id (re-creation is a no-op). Cron only finds due pipelines and enqueues to `refinery-dispatch`; the consumer spawns Workflow instances. Consumers are idempotent on message keys; every filter output write is idempotent on (`run_id`, filter). The notify filter publishes exactly one typed domain event (schema in `packages/schema`, carrying `requestId`) onto `refinery-webhooks`; `core/notify` at dequeue owns subscription matching, fan-out, `WEBHOOK_DELIVERY` creation, signing, and retries. Webhook targets are attacker-controlled URLs: same SSRF policy as the fetch port, validated at subscription time and re-validated post-DNS-resolution at each delivery. Retry exhaustion → visible `paused` state; `WEBHOOK_DELIVERY` rows are the replay source. Cron never executes work inline.
- **AD-5 Drizzle in `packages/schema` is the schema source of truth.** Tables defined once as Drizzle schema; migrations generated by `drizzle-kit generate`, never hand-written; row types inferred; request/response Zod via `drizzle-zod` plus explicit API schemas. Hand-written DDL or hand-maintained row types are defects.
- **AD-6 Two data classes; every access owner-scoped; scopes minted, never asserted.** Every row is **platform corpus** (owner `platform`) or **tenant resource** (mandatory `workspace_id`). Custom-schema refinement output is tenant-owned and private by default. Platform rows are written only by platform-owned pipeline runs in `core/corpus`; tenant-triggered output is always tenant-owned; an on-demand request matching a live platform entity within its freshness window is served from the corpus as a `cached_read`, never re-refined into it. Anonymous x402 principals read at `platform` scope and their output persists only as run/ledger/quarantine records. `OwnerScope` is a branded type constructible only by `core/tenancy` from the authenticated principal; a workspace id in a body, query, or MCP argument is never a scope source (mismatch = `TENANT_` error). Exactly three derived scopes, minted in core: `platform`; a marketplace grant scope (from `core/marketplace` after an active-install check, exposing only the listed projection and recording the `lst_` ref); an admin scope (admin-role session only, every mint audited). Scope unions (search, change feed, export) are composed only by `core/tenancy`, limited to platform + own + granted. KV and R2 keys embed the owner; Vectorize owner scope = namespace. Every repository method takes the scope for reads and writes. Public surfaces (badges, corpus overview, status doc) read at explicit `platform` scope; tenant-entity badges only by owner opt-in.
- **AD-7 Four principals, one scheme each; one auth middleware; revocation binds at the next request.** Principals: human user (Better Auth session on D1/Drizzle), workspace API key, agent token (workspace-bound, draws a wallet, guardian kill-switch), drive-by x402 agent (payment proof is the credential). One auth middleware on one router resolves all four; session cookies are accepted on `/api/v1` (no parallel Studio routes); sessions and MCP OAuth grants resolve to a workspace-scoped principal (grant pinned to one workspace at consent). MCP OAuth 2.1 tokens are audience-bound (resource indicators, no passthrough); every tool argument Zod-validated; every tool call authorizes through the same `core/tenancy` decision as its REST twin. Role (OWNER/BUILDER/MEMBER/VIEWER) is checked in `core/tenancy` on every path; Studio carries no role logic. Authorization state (key validity, kill state, membership role, admin role) is read from D1 on every request — never cached in KV, never in session/token claims, never carried past a queue message or Workflow step. Admin = role on user accounts, MFA before activation, granted/revoked only by an existing admin (audited), first admin via operational runbook, admin surfaces accept Studio sessions only. Better Auth fences: no `cookieCache`+`secondaryStorage`; per-request config; session rotation on login and privilege change.
- **AD-8 Contract-first API.** Every REST route defined with `@hono/zod-openapi` — one definition yields validation, handler types, and the published OpenAPI document. Every MCP tool's input/output schema derives from the same Zod source objects as its REST operation (one schema module per operation; convert, never redefine). Per-custom-schema tools are generated from the stored schema document by the AD-16 compiler; Studio's live preview renders that output. Studio and all SDKs consume types generated from the OpenAPI document and call nothing outside it; Studio is a pure public-API client with no privileged endpoints or backdoor headers.
- **AD-9 Validate at both boundaries; LLM schema failure fails the run.** Every request body/query is Zod-validated at the route boundary. LLM output must pass the target schema or the run fails: raw snapshot quarantined (R2 + run record), never coerced or defaulted. `z.record(z.any())` is not a schema.
- **AD-10 One error envelope.** All errors leave via app-level `onError` as `{ "error": { "code", "message", "requestId" } }` with domain-prefixed `SCREAMING_SNAKE` codes from a central taxonomy (`AUTH_`, `QUOTA_`, `PAYMENT_`, `REFINE_`, `TENANT_`…). Core throws typed domain errors; only the envelope layer maps to HTTP/JSON-RPC; raw exception text never reaches a response.
- **AD-11 Metering is an append-only ledger: one write path, fixed row contract, delivery-synchronous.** Every billable act is one `usage_events` row written by `core/metering` alone for every principal type. Row contract: unit type, principal attribution (workspace / key / agent token / session-resolved workspace / x402 payment reference), priced amount in micro-USD frozen at serve time, pricing-config version, and when grant-mediated the `lst_` ref and split basis; ledger reads never join mutable config. Classification: one `core/metering` function computes unit type from the serve descriptor (KV/D1 within freshness = `cached_read`; live fetch + extraction = `refinement`); callers report facts, never unit types. One act = one delivered entity payload; list/search = one `cached_read` per request up to a config-named cap; a read-triggered refresh bills as `refinement` only; export of N entities = N `cached_read`; human sessions bill on the playground and API-equivalent reads named in route definitions; Studio management/browsing reads never bill. The append is part of the serve transaction (same `batch()`); `waitUntil` never carries ledger, wallet, or audit writes. Failed runs produce no billable row (or an explicit auto-credit where payment moved). Compensating events (refund, credit, chargeback, courtesy) originate only from a signature-verified Stripe event, `core/metering`'s failed-run auto-credit, or an admin-role action with its audit row; no customer endpoint writes one. No code path updates or deletes `usage_events`/`audit_events`. Payment evidence is single-use: unique x402 payment reference; Stripe processing idempotent by event id. Quota checks read a ledger-derived counter projection with a config-named max staleness. `audit_events` (auth, billing/wallet, pipeline runs, admin actions, role changes, cross-tenant denials) follow the same append-only pattern written by core alone; Workers logs are diagnostics only. Public latency/uptime claims only from measured telemetry.
- **AD-12 Storage topology.** D1 (`refinery-db`) is the sole authoritative store; related D1 writes use `batch()`. Raw fetched snapshots go to R2 (referenced by key), never into D1 rows. KV (hot cache) and Vectorize are derived, rebuildable projections written after D1 commit by the store filter's post-commit hook in both modes — best-effort, self-healing via a rebuild path; a cache entry stores the same shape the DB read returns. R2 keys embed the owner scope; raw and quarantined snapshots are readable only through their owning scope or the audited admin scope and carry bounded retention via R2 lifecycle rules. A takedown/opt-out registration purges stored raw snapshots for that source and stops serving its derived rows.
- **AD-13 Three environments; configuration only through bindings.** `local` (wrangler dev/miniflare), `staging`, `production` as wrangler environments with separate D1/KV/R2/Vectorize/queue resources. No URL, price ID, model ID, or key literal in source — bindings and env vars only; secrets via `wrangler secret`. GitHub Actions CI gates every merge: typecheck, lint, tests, migration dry-run; deploys go staging → production by manual promotion.
- **AD-14 One policed outbound fetch boundary; untrusted origin is a persistent taint.** Every server-side fetch of external content goes through the single fetch port, enforcing SSRF allow/deny (no private ranges, no off-policy redirects), robots.txt for corpus crawling, an identifiable product user-agent, per-source pacing via D1 `next_fetch_at`, and the opt-out registry. Source connectors implement the same port; the policy applies to anonymous x402 traffic. Content that ever entered through the port — stored raw snapshots and refined values included — is re-fenced (`<untrusted_web_content>` + defensive directive) on every LLM call (extraction, diff, summarization, listing copy). LLM output never chooses a fetch target, tool, or write; fetch targets come only from operator configuration and the source registry. Refined values are inert data downstream: escaped in badge SVGs, Studio, and exports.
- **AD-15 One wallet owner; reserve → settle / release; x402 settles after delivery.** `WALLET` (`wal_`) is owned by `core/metering`; balance is authoritative D1 state reconciled to the ledger. Priced work places an atomic conditional hold before the expensive step in one D1 `batch()` (the decrement commits only if the balance/quota predicate still holds; a failed predicate is the 402). Delivery settles the hold and appends the billable row in the same batch; failure or kill releases it. Overdraft and quota overshoot are impossible by construction under concurrency. Agent tokens draw their workspace's wallet; workspace API keys draw it only through the FR-067 top-up path. Kill-switch: holds placed before the kill settle; no new holds after. x402 order is fixed: middleware runs verify-only pre-serve; settlement executes post-delivery from the ledger row; a failed run is never settled. Where a facilitator forces upfront settlement, the compensating refund is owned by `adapters/x402`, triggered only by a metering compensating event.
- **AD-16 One canonical custom-schema document, one compiler.** A custom schema is stored as a D1 tenant resource in one canonical format: a constrained JSON Schema profile whose allowed keyword subset is a meta-schema in `packages/schema`, validated at publish. Exactly one compiler in `packages/schema` maps the document to (a) the runtime validator used by the validate filter, (b) the MCP tool `inputSchema`, (c) OpenAPI component schemas. Diff-severity rules attach to the document in a named field. A second parser or compiler anywhere is a defect.

#### B. Consistency conventions (binding across every story)

- Naming: SQL `snake_case`; TS `camelCase`, types `PascalCase`; routes kebab-case plural under `/api/v1`; Cloudflare resources `refinery-` prefixed kebab-case (`refinery-dispatch`, `refinery-webhooks`, `refinery-webhooks-dlq`).
- IDs: `<prefix>_<ULID>` generated in core: `ws_`, `usr_`, `key_`, `agt_`, `wal_`, `sch_`, `pipe_`, `run_`, `ent_`, `diff_`, `qsn_`, `uev_`, `aev_`, `lst_`, `whk_`, `dlv_`, `opt_`.
- Timestamps: D1 `INTEGER` epoch milliseconds; wire ISO-8601 UTC strings.
- Money: integer micro-USD (1 USD = 1,000,000) in ledger, pricing config, wallets; integer cents only inside the Stripe adapter; floats never represent money.
- Errors: AD-10 envelope; one shared taxonomy module.
- Severity: entity-level `CRITICAL`/`MAJOR`/`MINOR`; per-item finer scale; both enums defined once in `packages/schema`.
- Auth transport: `Authorization: Bearer <credential>` for keys and agent tokens; session cookie for the human principal on the same router (`X-Refinery-Key` dies); 402 responses carry the machine-readable x402 payment-required body — one shape for humans and agents.
- Credentials at rest: keys/tokens ≥256-bit random, shown once, SHA-256 digests, constant-time compare, prefixes `ref_live_`, `ref_test_`, `ref_agent_`; webhook signing secrets stored encrypted with a platform secret, rotatable per subscription with overlap; rotation = issue-new + revoke-old.
- KV keys: `<owner>:<domain>:<entityKey>:<variant>` with owner `platform` | `ws_<id>`; R2 keys carry the same owner prefix.
- Rate limiting: inbound per-principal abuse limits via the Workers Rate Limiting binding (per-colo, 10/60 s windows, never accounting); outbound per-source crawl pacing via `next_fetch_at` in D1; KV counters for neither.
- Pagination: cursor-based `?cursor=&limit=` (limit capped per route); envelope `{ "items": [...], "nextCursor": string | null }`; offset pagination is a defect.
- Logging: structured JSON to Workers observability; `requestId` generated at entry and propagated through queue messages and Workflow params; the audit record is `audit_events`, never logs.
- State mutation: writes only via core services calling Drizzle repositories in `adapters/d1`; no SQL in `entry/`; `waitUntil` carries diagnostics only.
- LLM usage: model IDs are env vars; every call site records tokens/cost into `usage_events` metadata; only no-training providers; customer data never enters any training pipeline.
- Testing: every route has a contract test via `@cloudflare/vitest-pool-workers` against real local bindings; core filters have pure unit tests; MCP has protocol-level tests; a feature without tests does not merge (CI-gated).

#### C. Stack pins (exact; verified 2026-08-29)

| Name | Version |
|---|---|
| TypeScript | 5.9.3 [ADOPTED] |
| Cloudflare Workers | `compatibility_date` ≥ 2026-08-04 (nodejs_compat default) |
| wrangler | 4.127.1 (upgrade from prototype v3) |
| hono | 4.13.5 |
| zod | 4.5.4 (upgrade from prototype 3.x) |
| @hono/zod-openapi | 1.6.1 |
| drizzle-orm / drizzle-kit / drizzle-zod | 0.45.2 / 0.31.10 / 0.8.3 |
| better-auth | 1.7.2 |
| stripe (fetch client, `Stripe.createFetchHttpClient()`) | 22.6.0 |
| @x402/hono (+ @x402/core, @x402/paywall) | 2.24.0 |
| agents (Cloudflare Agents SDK) | 0.22.0 |
| @modelcontextprotocol/sdk | 1.30.0 |
| @modelcontextprotocol/client / server | 2.0.0 (required agents peers) |
| vitest / @cloudflare/vitest-pool-workers | 4.1.11 / 0.22.0 |
| react / react-dom | 18.3.1 [ADOPTED] |
| react-router | 7.18.3 (v8 needs React ≥19.2.7 — deferred) |
| @tanstack/react-query | 5.102.8 |
| vite | 6.4.3 [ADOPTED] |
| tailwindcss | 3.4.19 [ADOPTED] |
| npm workspaces (no turbo) | [ADOPTED] |

#### D. Structural seed, topology, and environments (greenfield restructure of a brownfield repo)

- Directory layout: `apps/worker/src/{core,adapters,entry}`; `apps/web/src/{routes,components,api}` (generated client); `packages/schema` (Drizzle schema, generated types, zod, AD-16 compiler); `packages/sdk` (published SDKs, replaces `packages/integrations`); `packages/extension` dormant. The current 5,025-line `App.tsx`, raw-SQL route files, `lib/db.ts`, and `packages/integrations` are replaced, not extended.
- Topology: web worker (static assets) + api worker; Cron (6h) → Queue `refinery-dispatch` → Workflow `refinement-run`; api worker → Queue `refinery-webhooks` → subscriber endpoints; D1 `refinery-db`, KV cache, R2 raw snapshots, Vectorize, Workers AI; Stripe and x402 facilitator external.
- Seed ERD entities: WORKSPACE, USER, MEMBERSHIP, API_KEY, AGENT_TOKEN, WALLET, CUSTOM_SCHEMA, PIPELINE, REFINEMENT_RUN, REFINED_ENTITY, QUARANTINED_SNAPSHOT, ENTITY_DIFF, WEBHOOK_SUBSCRIPTION, WEBHOOK_DELIVERY, MARKETPLACE_LISTING, USAGE_EVENT (workspace optional), AUDIT_EVENT (workspace optional), OPT_OUT_SOURCE.
- Environment flow: local (wrangler dev + miniflare) → PR CI (typecheck, lint, tests, migration dry-run) → staging (own resources) → manual promotion → production.
- Repository hygiene: no committed build artifacts (`.js`/`.d.ts` in `src/`), no smoke scripts targeting production URLs as "tests", README/license/package metadata consistent with the proprietary decision and the real Node/runtime requirements.

#### E. Deferred decisions with interim rules in force

- Multi-worker split only on a measured platform limit (AD-2).
- D1 >10 GB corpus strategy — revisit at 5 GB.
- x402 facilitator + chain selection — Phase 0 integration spike; protocol and settle order fixed by AD-15; vendor open.
- Pricing numbers — Phase 0 exercise (OQ-2); units, micro-USD, and the AD-11 row contract are fixed now.
- Stripe Connect payouts — Phase 3; ledger accrual is the launch mechanism.
- Browser extension + CLI — post-launch, bound by AD-8.
- Frontend toolchain upgrades (React 19, react-router 8, Vite 8, Tailwind 4, TS 7) — post-launch; decompose on today's toolchain.
- Per-vertical template guardrail detail — feature altitude; FR-012 carries requirements.
- Corpus refresh scheduling — fixed interval per pipeline at launch.
- Lexical search mechanism — single-feature scope; interim rule: no unbounded `LIKE` scans over JSON blobs.
- Raw-snapshot retention length + deletion-request workflow — decide before marketplace exposure of any corpus or the first takedown request.
- Audit tamper-evidence beyond D1 — at SOC 2 readiness or first enterprise contract.
- Enterprise SSO/SAML, data residency — enterprise phase.

#### F. Prototype defects the rebuild must close (code sweep; negative acceptance criteria)

- PD-1: Cron selects pipelines and discards them; no async substrate (no Queues/Workflows/R2); refinement only request-synchronous.
- PD-2: MCP fully unauthenticated and unmetered; hand-rolled JSON-RPC on `POST /mcp`, protocol 2024-11-05; `resources/read` and `prompts/get` missing; tool errors returned as `isError` results.
- PD-3: Three overlapping auth schemes; hardcoded founder passcodes in source, DB seed (plaintext in a `passcode_hash` column), and frontend; any non-agent API key accepted as platform admin.
- PD-4: No tenant column on `refined_entities`, `entity_diffs`, `scheduled_pipelines`, `webhook_subscriptions`, `marketplace_listings`, `api_keys`; unauthenticated `workspaces` routes let anyone join any workspace; KV keys and Vectorize metadata unscoped.
- PD-5: Zod used only on LLM output, and then synthesizes a fallback object on failure; `z.record(z.any())` on two extraction paths; no inbound request validation.
- PD-6: No `onError`/`notFound`; per-handler `try/catch` leaks raw D1 messages; silent `catch {}` blocks.
- PD-7: Raw `env.DB.prepare(...)` SQL in 14 route files with ~40 `as any` casts; four non-transactional writes per entity save; DDL in worker migrations unlinked from Zod (export reads `diff.changes_json`, column is `diff_data`).
- PD-8: `getLatestEntity` returns two incompatible shapes (KV hit vs miss) — callers read `undefined` for 24h after any write.
- PD-9: Rate limit key re-`put` with fresh TTL every request (sliding lockout); search interpolates the user query into three `LIKE '%…%'` scans over JSON.
- PD-10: Cron re-fires the same latest CRITICAL diff to every webhook every 6h forever; no signing, no delivery records, no SSRF check on registered URLs; `POST /marketplace/:id/query` increments creator earnings unauthenticated.
- PD-11: Stripe: no SDK; webhook verification skipped when the secret is unset; non-constant-time signature compare; live price IDs committed in `wrangler.jsonc` and hardcoded fallbacks; agent-token minting endpoint unauthenticated with anonymous 50-credit grants.
- PD-12: Fabricated metrics: `/sla-health` literal (99.998%, 330 PoPs, p50/p95/p99), analytics constants (16ms, 99.4%), seeded "live" agent audit rows, hardcoded confidence scores, "sub-20ms" marketing; audit tables never written.
- PD-13: ~15 hardcoded production URLs across worker, web, extension, and integrations; single unnamed wrangler environment; no CI; 7 pure-function tests total; committed `.js`/`.d.ts` build artifacts; README claims MIT/OpenAPI/Node 20 that are false.
- PD-14: Orphaned promotions router still mounted; dead tables (`refinery_sources`, `refinery_jobs`, `api_usage_metrics`, `creator_payouts`, `workspace_audit_logs`); dead `packages/integrations` workspace.
- PD-15: Mechanics worth carrying forward after evaluation (addendum): 402 discovery headers and body purchase path; per-job `tokens_used`/`duration_ms`/`error_message` accounting; KV hot-cache recipe (24h TTL); embedding recipe (entityKey + summary + first 500 chars, bge-base-en-v1.5); `<untrusted_web_content>` fencing + SSRF allow/deny lists; export download mode with `Content-Disposition` and a row cap.

#### G. Spec kernel story slate (agreed execution order; checkpoints are user-approval gates for `bmad-build`)

The spec's Story Breakdown fixed 18 stories in this order — 1 Platform scaffold & environments [spec_cp]; 2 Identity, workspaces & tenancy [spec_cp, done_cp]; 3 Refinement pipeline core; 4 Scheduled corpus & async substrate; 5 Change intelligence; 6 Webhooks & notifications; 7 Metering ledger, quotas & 402 [spec_cp]; 8 Stripe rail; 9 Agent rail [spec_cp, done_cp]; 10 Public REST contract & search; 11 MCP server [done_cp]; 12 Studio shell & data views; 13 Custom schemas & visual builder [spec_cp]; 14 Onboarding & DX; 15 Operations console; 16 Marketplace [spec_cp]; 17 Fine-tuning export; 18 Client SDKs & integrations [done_cp]. Each carries an `invoke_dev_with` note naming its binding AD IDs. The slate predates the UX contract (2026-09-04) and does not yet trace UX-DRs; the epic design in step 2 reconciles the two.

Spec success signal: Phase 0 exit gate green (every launch FR verified; cross-tenant and billing suites passing; independent security review closed; dev corpus refreshing 14 days unattended), then day-90 week-over-week growth against thresholds frozen at day 30 with bailout rate under its ceiling. Non-goals: promotions/Hermes tooling, BAA/SOC 2/dedicated tenancy at launch, PHI/PII processing, anonymous free usage, extension/CLI at launch, unmeasured latency claims. Open questions carried: OQ-1 name/domain, OQ-2 prices, OQ-3 free quota + agent trial credits, OQ-4 dev-vertical source list, OQ-5 guardianship depth, OQ-6 autonomous fleets, OQ-8 additional rails.

#### H. Open review findings for pickup (not decided upstream; stories that touch them must decide or explicitly defer)

Resolved upstream and not repeated here: EC-101/103/110/111/201/203/302/404/405/505/506/601/701/803, adversarial C1/C3/H3/H4/H5/M2/M4/L4, every architecture-review critical/high/medium (applied into AD-1..16).

| ID | Topic | Lands in | Recommended default |
|---|---|---|---|
| EC-102 | Account-less caller retries after a lost response | Story 9 / FR-062 | Spine already rejects replayed proofs; document that a lost response is a new paid attempt |
| EC-104 | Kill-switch reversibility (suspend vs terminal revoke) | Story 9 / FR-064 | Kill = reversible suspend; permanent revoke is a separate audited action |
| EC-105 | Client idempotency key for relationship-mode retries | Story 7 / FR-062 | Accept `Idempotency-Key` on priced routes, honored for a config window |
| EC-106 | 402 price-quote validity window | Story 7 / FR-062 | Quote carries an expiry; payment matching an unexpired quote is honored |
| EC-107 | x402 under/overpayment handling | Story 9 | Underpayment rejected with shortfall body; overpayment remainder recorded as distinct ledger event |
| EC-108 | Spend-limit period and breach semantics | Story 9 / FR-064 | Per-calendar-day limit; breach returns a distinct `PAYMENT_` reason, not a purchase invitation |
| EC-109 | Unspent wallet balance policy (refund/expiry) | Story 8 / ToS | Refundable on request via original rail; state in terms |
| EC-202 | Quota period definition | Story 7 / FR-060 | Calendar month UTC; ledger timestamp authoritative |
| EC-205 | Reconciliation discrepancy disposition | Story 15 / FR-065 | Operator alert + classification + audit row; customer-favor below threshold |
| EC-207 | Free quota vs funded wallet drain order | Story 7 | Free quota drains first |
| EC-301 | Failed renewal grace state | Story 8 / FR-066 | Grace window with degraded interactive access; pipelines pause; account webhooks still fire; recoverable pause before deletion |
| EC-303 | Downgrade effect and non-query tier limits | Story 8 / FR-061 | Downgrade at cycle end; over-limit resources pause, never delete |
| EC-304 | Plan edits vs existing subscribers; deleting in-use plans | Story 8/15 / FR-074 | Edits apply to new subscriptions unless migrated with notice; in-use plans retire, never delete |
| EC-305 | Subscription lapse vs funded wallets | Story 8/9 | Wallets and agent access independent of subscription state |
| EC-401 | Listing deletion with installers | Story 16 | Installs consume versioned snapshots; deletion delists, never breaks installs; installers notified |
| EC-402 | Install vs clone revenue bypass | Story 16 / FR-043 | A schema is either a free public blueprint or a priced install-only listing |
| EC-403 | Creator price-change notice | Story 16 / FR-083 | Increases take effect after notice; installers may pin a max-price guard |
| EC-406 | Listing moderation and takedown | Story 16 | Publication check against NFR-030/032 rules; takedown path with retirement semantics |
| EC-501 | Workspace deletion semantics | Story 2 | Requires wallet resolution and listing retirement; badges tombstone; recoverable window; audited |
| EC-503 | Which role holds guardianship | Story 9 / FR-052 | OWNER funds; OWNER and BUILDER hold the kill-switch; never orphaned by member removal |
| EC-504 | Clone snapshot vs upstream compliance updates | Story 13 / FR-043 | Snapshots; template compliance updates notify clone owners |
| EC-507 | Sole OWNER loss | Story 2 / FR-052 | ≥1 OWNER invariant; operator-assisted recovery audited |
| EC-602 | Severity flapping / noisy sources | Story 5 | Roll up equivalent diffs within a window; flag unstable sources |
| EC-603 | Permanently dead source (DEFUNCT state) | Story 4/5 | Visible DEFUNCT state; last valid version serves flagged; excluded from live-coverage counts |
| EC-604 | robots.txt disallow mid-life vs history | Story 4 / NFR-030 | New disallow halts fetches (DEFUNCT); takedown process defines what is purged |
| EC-605 | Sample-data entities leaking into live surfaces | Story 4/5/6 / FR-013 | Sample entities never emit events, never in feed/badges, excluded from export; label travels in API responses |
| EC-606 | Source restructure vs content change | Story 5 | Distinct `source-restructured` event type |
| EC-607 | Version-history retention per tier | Story 5/8 | Per-tier entitlement; pricing exercise sets values |
| EC-702 | Delivery ordering/duplication contract | Story 6 / FR-022 | At-least-once, unordered; events carry entity id + version sequence |
| EC-703 | Zero-match filters, event storms, delivery metering | Story 6 | Match count shown; digest on mass-refresh; per-subscription burst cap; deliveries free within plan limits |
| EC-801 | Free-tier signup gating | Story 2/7 / FR-060 | Verified email + anti-automation; per-identity/origin issuance limits; agents paid-only unless OQ-3 says otherwise |
| EC-802 | MCP tool-name collisions at scale | Story 13 / FR-042 | Deterministic namespacing; fail closed on collision (already in FR-042) |
| ADV-M1 | Token-savings baseline (raw HTML vs scraper-markdown) | Story 3/14 / FR-005 | Record both baselines; publish the conservative one |
| ADV-M5 | Discovery-funnel attribution is unmeasurable as specified | Story 14 / FR-114 | Registry-specific links/codes, signup "how did you find us", badge-referrer capture |
| ADV-M6 | Compliance-text owner and review trigger | Story 4 / FR-012 | Named owner, per-phase review, counsel pass in Phase 0 legal workstream |
| ADV-M7 | x402 treasury/AML/fiat posture | Story 9 / Deferred | Answered by the Phase 0 facilitator spike; fallback = relationship-mode-only launch |
| ADV-H8 | RAG-chunk export vs "structured facts" legal posture | Story 17 / FR-090 | Rights review before RAG-chunk export ships; takedown policy covers exports |
| ADV-L1 | "ENTERPRISE" tier name vs disclaimed enterprise features | Story 8 / FR-061 | Founder-editable name; recommend SCALE/TEAM until Phase 4 |
| UX-open | Live-URL schema test "without billing" vs inference cost | Story 13 / FR-041 | Tests consume on-demand quota (or a per-workspace test allowance); UX copy follows |

### UX Design Requirements

Source: `DESIGN.md` (visual identity, tokens, components) and `EXPERIENCE.md` (IA, states, interactions, accessibility, journeys), both final 2026-09-04. Where a UX spine carries prototype-era wording that conflicts with the PRD or spine, the conflict is named and the PRD/spine wins.

**Foundation & tokens**

- UX-DR1: Implement the DESIGN.md token set as the single Tailwind theme source — colors (`bg-canvas #060913`, `bg-surface-primary #090d16`, `bg-surface-elevated #0f172a`, `bg-surface-card #111827`, `border-subtle #1e293b`, `border-focus #334155`, `border-glow`; `primary #f48120`, `primary-hover #ff9838`, `primary-glow`; `accent-blue #3b82f6`, `accent-blue-deep #1d4ed8`, `accent-cyan #38bdf8`, `accent-emerald #10b981`, `accent-amber #f59e0b`, `accent-rose #ef4444`, `accent-purple #a855f7`; `text-primary #f8fafc`, `text-secondary #94a3b8`, `text-tertiary #64748b`, `text-on-accent #060913`; `severity-critical #ef4444`, `severity-major #f97316`, `severity-minor #38bdf8`, `severity-informational #64748b`), typography ramp (display 32/700/-0.02em, h1 24/600, h2 18/600, h3 15/600, body 14/400, body-sm 12, code 13 mono/1.6, badge 11 mono/600/uppercase; sans = system stack, mono = JetBrains Mono/Fira Code), radii (sm 4, md 6, lg 8, xl 12, full), spacing (gutter 24, margin-mobile 16, card-padding 20, dense-gap 8, standard-gap 16). No hardcoded hex or px in components.
- UX-DR2: Severity colors bind to the `packages/schema` severity enums (entity-level CRITICAL/MAJOR/MINOR; per-item finer scale). `severity-informational` is reserved for per-item or no-change states and is never rendered as a fourth entity-level severity (FR-021).
- UX-DR3: Dark-only at launch (`color-scheme: dark`); no white or light backgrounds anywhere; all text meets WCAG AA (4.5:1 normal, 3:1 large text and badges) on the canvas.
- UX-DR4: Preserve the signature keyframe animations from `apps/web/src/index.css` as named utilities with their specified uses — `pulseGlow` 4s (active pipeline heartbeat, live Vectorize status, hero icons), `shimmer` 4s (skeletons, running extraction progress, breaking-change banners), `laserSweep` 3.5s (real-time fetch/diff status lines), `gradientShift` 6s (hero headings, token-economics badges), `floatSlow` 6s (diagrams, hero emblems), `orbitRotate` 20s / 30s reverse. All disabled under `prefers-reduced-motion`.
- UX-DR5: Elevation: L0 flat canvas; L1 panels `#090d16` with 1px `#1e293b`, no drop shadow; L2 hover/focus border `#334155` plus `0 0 20px rgba(0,0,0,.6)`; L3 modals `#0f172a`, `backdrop-filter: blur(12px)`, 1px `rgba(244,129,32,.2)`.
- UX-DR6: Shapes: buttons/inputs 6px; containers/cards 8px; status badges/chips pill (`9999px`).
- UX-DR7: Component tokens: `top-nav` (64px, surface-primary, 1px bottom border), `tab-pill-active`/`inactive`, `button-primary` (orange, `0 0 15px rgba(244,129,32,.25)`), `button-secondary`, `card-interactive`, `code-inspector` (`#04060b` bg, `#e2e8f0` fg). Orange is never a background for error/destructive states.
- UX-DR8: Studio is a pure public-API client (AD-8): React 18 + Tailwind 3 + Lucide, react-router 7.18.3 routed views, TanStack Query 5 server state, typed client generated from the OpenAPI document; session-cookie auth on `/api/v1` (AD-7); no privileged endpoints or backdoor headers. The 5,025-line `App.tsx` is decomposed into `routes/`, `components/`, `api/` with a web test harness, CI-gated (`apps/web` currently has no test runner).

**Shell & information architecture**

- UX-DR9: Sticky 64px top nav: logo; workspace switcher (switch without page reload; the session-resolved principal re-resolves server-side); active tenant badge; agent prepaid balance ticker with Top Up; quick MCP link; profile avatar with platform-admin indicator. **Conflict:** the "Live Edge Badge — Cloudflare Global Network 330+ Cities" is an unmeasured claim (NFR-003, PD-12) — omit or bind to a verified value.
- UX-DR10: Route map (react-router 7) of twelve surfaces with a horizontal scrollable pill bar as secondary nav — `/diffs`, `/dev`, `/pricing`, `/regulatory`, `/schemas`, `/marketplace`, `/export`, `/playground`, `/mcp`, `/help`, `/billing`, `/management`; content canvas max-width 1600px (100% fluid for diff comparisons).
- UX-DR11: Role-gated visibility per EXPERIENCE.md (Schema Studio BUILDER+; Export MEMBER+; Billing OWNER; `/management` platform-admin only) is a rendering convenience driven by the API's principal/membership response; enforcement is server-side (AD-7). VIEWERs never see delete/paid-action buttons. **Conflict:** EXPERIENCE.md labels Founder Console access "(Passcode)" — superseded by FR-070/AD-7: admin-role Studio session with MFA; no passcode UI exists.
- UX-DR12: Global keyboard shortcuts: `⌘K`/`Ctrl+K` command palette (navigate any surface, search schemas, find entities); `⌘Enter`/`Ctrl+Enter` executes the active primary action; chords `g d` `g b` `g p` `g r` `g s` `g m` `g e` `g u` `g c` `g h` `g w`; `Esc` closes modal/drawer or clears filter; `N` creates from an empty state.
- UX-DR13: 1-click copy on every code block, cURL command, JSON preview, and MCP config snippet: explicit icon button flashing green with a checkmark for 1.5s.
- UX-DR14: Voice and tone per the EXPERIENCE.md table — terse engineer copy: extraction success names measured ms, conformance, and token reduction; quarantine copy names the failing JSON path and that the entity was saved as invalid; 402 copy names the exact balance and both remediation paths; diff copy leads with severity and the concrete change; empty states are one sentence plus one primary action. No celebration emoji, no "oops", no "upgrade now" pressure copy.
- UX-DR15: State patterns — cold load: shimmer skeletons matching table geometry, search/filters disabled until workspace context resolves; active extraction: laser sweep over the input card, pulsing orange badge, button label "Refining at Edge…" with an elapsed-ms counter; validation quarantine: rose border, amber badge with error-path locator, payload viewable with failing lines highlighted, save-to-corpus blocked; empty state: centered icon, muted copy, single primary action, shortcut hint; HTTP 402: modal banner with the exact unpaid count and 1-click Stripe top-up or x402 token input — Studio browsing reads stay available, billable actions block until funded (FR-067).
- UX-DR16: No generic spinners — every loading indicator carries explanatory status copy ("Fetching DOM at Edge…", "Synthesizing delta…", "Validating schema contract…").
- UX-DR17: Never conceal billing state: a wallet below its alert threshold or any 402 shows the exact remediation path and top-up button immediately; balances render in USD to four decimals from micro-USD integers; every displayed price comes from the founder-editable pricing config (the `$0.005` / `$0.020` figures in the spines are placeholders, OQ-2).
- UX-DR18: Always show measured units — latency ms, token counts, price per query — sourced from response token-economics and ledger fields; where no measurement exists, show nothing (NFR-003).
- UX-DR19: Monospace for every machine identifier: entity keys, schema slugs, wallet/token IDs, endpoints, JSON, diff snippets, latency metrics.

**Components & surfaces**

- UX-DR20: Unified Playground cockpit (`/playground`, FR-112): 50/50 split; left — URL input with auto-paste, target-schema dropdown (auto-selects when a known schema matches the URL), custom prompt textarea, "Refine at Edge" primary button (`⌘Enter`); progress ticker states Resolving → Edge Fetch → Structured Inference → Schema Validation; right — tabbed inspector (Structured JSON, Validation, Token Economics, Raw HTML Diff) and a metrics bar (measured latency, input tokens, output tokens, token reduction %, ledger cost); persistent "Copy JSON" and "Save to Workspace Corpus" (persists as a tenant resource, AD-6). Runs bill as on-demand refinements under quota (AD-11).
- UX-DR21: Time-travel diff inspector (`/diffs`, `/dev`, FR-044): snapshot slider v1…vN; selecting two snapshots renders a dual-pane diff with line numbers, syntax highlighting, and synchronized vertical scrolling; additions emerald `rgba(16,185,129,.15)`, modifications amber, deletions rose `rgba(239,68,68,.15)`; header with severity badge, entity key, migration directive; side drawer with the classification reasoning ("why CRITICAL"). Mobile switches to a unified inline diff. **Claim discipline:** labels describe the shipped mechanism — semantic field-level diff at launch; "AST" wording appears only when AST diffs ship (FR-021).
- UX-DR22: Dev breaking-changes feed (`/dev`): filter by package (e.g., `stripe-node`), before/after code snippets with migration rules from the dev-vertical per-item schema, and a "Test with MCP" action that runs the same query via the workspace's authenticated MCP endpoint and shows the measured round-trip.
- UX-DR23: Vertical browsing views (`/pricing` pricing matrices, feature comparisons, plan diffs; `/regulatory` tracked filings with clause-level diffs): served from template data; the sample-data label travels from the API (FR-013) and renders prominently; sample entities never appear as live coverage, never carry badges or events (EC-605).
- UX-DR24: Visual Schema Studio (`/schemas`, FR-040..043): 3-column layout (25% tree nav / 45% visual builder / 30% live preview); property rows with field name, type selector (String, Number, Boolean, Array<T>, Object, Enum), required checkbox, validation rules (min, max, regex); dual-mode editing — visual tree ↔ raw canonical JSON Schema document (AD-16) with instant bidirectional sync; the live preview renders the single compiler's outputs (validation status, MCP tool definition/`inputSchema`); any TypeScript/Zod rendering is display-only derived output, never a second input dialect; action bar "Test on Live URL" (sandboxed drawer, no save), "Save Draft", "Publish as MCP Tool" (modal confirming auto-generated namespaced tool slug, description, workspace scope; live in `tools/list` on confirm). Tablet collapses to tabs (Visual | Output); mobile redirects editing to desktop.
- UX-DR25: Marketplace (`/marketplace`, F9): community and verified blueprint listings; 1-click clone for public blueprints and install for listings; creator revenue stats as an 80/20 accrual ledger view with the accrue-now/pay-soon notice; featured and leaderboard ordering.
- UX-DR26: Fine-tuning export (`/export`, FR-090, MEMBER+): corpus-slice selection, format picker (OpenAI JSONL, Llama3, Alpaca, RAG-chunk), diff-derived examples toggle, entitlement state visible, ledger impact (N cached-read acts) shown before confirm.
- UX-DR27: MCP Hub (`/mcp`, FR-111): interactive JSON-RPC tool tester against the workspace's authenticated MCP endpoint; 1-click config generators for Cursor, Claude Code/Desktop, Windsurf with the active workspace key or OAuth path; copy buttons per UX-DR13.
- UX-DR28: Help center (`/help`, FR-110/113/122): guided quickstarts per surface (MCP, REST, Studio, marketplace, export), SDK snippets (TypeScript, LangChain, LlamaIndex), link to the published OpenAPI document; video guides are optional content, not a build dependency.
- UX-DR29: Agent Wallets & Billing (`/billing`, OWNER, F7): Stripe plan tiers with checkout/upgrade; prepaid wallet balance; Stripe top-up flow (FR-063); agent-token pool creation (name, wallet cap, alert threshold); live-streaming transaction ticker with per-unit-type deductions; x402 ledger view; per-token kill-switch plus a workspace-wide "Emergency Kill-Switch" (single click with confirmation; suspends all agent tokens, stops new holds, deletes no data, audit-logged); usage views with a data-freshness indicator.
- UX-DR30: Operations console (`/management`, platform-admin Studio session with MFA, F8): customer and fleet governance (view, suspend, revoke, kill); courtesy actions (quota grant, wallet credit) with reason capture that produce audited compensating events; real-telemetry analytics (latency, cache hit rate, usage, revenue) with zero fabricated values; queryable audit stream; pricing-plan editor (FR-074); operational actions (trigger dispatch, cache purge) — every action audited.
- UX-DR31: Webhook subscription management (FR-022): create with event-type and entity filters; destination type (HTTPS, Slack, Discord, Telegram); send-test-event; current match count with zero-match warning; delivery history; paused state with revive and replay.
- UX-DR32: Public landing page (`apps/web`): keep the animated raw-HTML→JSON before/after demo and the particle/lattice canvas from the prototype; the rotating metric strip shows measured values only or is removed (NFR-003); the pricing section reads the public plans endpoint (FR-061/074); retired claims (sub-20ms, 99.998%, 330 PoPs, "zero hallucination") never reappear.

**Accessibility floor**

- UX-DR33: Focus ring `2px solid #f48120`, offset 2px, on every interactive input, tab, and button; every interactive element reachable via Tab/Shift+Tab; modals trap focus and release cleanly on Esc.
- UX-DR34: Screen-reader semantics: severity badges use `role="status"` with an aria-label such as "Severity Critical: Breaking Change"; diff lines announce additions/removals (`aria-label="Removed line 42"`); extraction progress and 402 banners are live regions.
- UX-DR35: `prefers-reduced-motion: reduce` disables `pulseGlow`, `shimmer`, `orbitRotate`, `laserSweep`, `floatSlow` while keeping color and contrast cues.

**Responsive & platform**

- UX-DR36: Breakpoints — ≥1440px full cockpit with side-by-side splits; 1024–1439px compact 16px padding, scrollable tab bar, drawers as overlays; 768–1023px left drawer as slide-over sheet, schema builder as tabs; <768px read-only feed/monitoring, unified inline diff, schema editing redirects to desktop.

**Named-protagonist journeys (end-to-end acceptance flows)**

- UX-DR37: Journey 1 (Elena, dev lead): copy the Claude Code config from `/mcp` carrying the active workspace credential → `/dev` filter by package → time-travel diff highlights the breaking removal with its migration snippet → "Test with MCP" returns the structured payload with measured latency. E2E-testable; the hardcoded `drefinery.freshbeats.ai` domain in the journey is prototype-era (OQ-1) and never appears in code.
- UX-DR38: Journey 2 (Marcus, data engineer): `/schemas` New Blueprint → name `b2b_saas_pricing`, add properties (`product_name` string, `billing_period` enum, `tiers` array<object>) → live compile → Test on Live URL → 100% conformance → Publish as MCP Tool → tool visible in the workspace's `tools/list` immediately.
- UX-DR39: Journey 3 (Carlos, fleet operator): `/billing` create agent pool token → set wallet cap and alert threshold → watch the ledger ticker deduct per unit type → an errant agent receives a clean machine-readable 402 with no overbilling → Emergency Kill-Switch stops it instantly with zero data loss.

### FR Coverage Map

Every launch FR maps to exactly one epic; two post-launch FRs are explicitly deferred. Notes name where a prerequisite lands.

FR-001: Epic 2 - Refinement pipeline (sanitize, SSRF, hardened extraction, JSON repair, validation)
FR-002: Epic 2 - Strict validation, explicit failure, no silent fallback
FR-003: Epic 2 - Provenance on every refined artifact
FR-004: Epic 2 - Primary/fallback model inside the extract filter; explicit double failure, unbilled
FR-005: Epic 2 - Token economics per response (Studio aggregate view in Epic 6)
FR-006: Epic 2 - Confidence/quality indicators from real signals
FR-010: Epic 3 - Pre-indexed corpus with refresh policies; URL fetch and source connectors
FR-011: Epic 3 - Scheduled pipelines execute, retry, surface failures
FR-012: Epic 2 - Six vertical templates as canonical blueprints with compliance guardrails
FR-013: Epic 3 - Dev vertical genuinely live; other five as labeled sample data
FR-014: Epic 2 - Universal on-demand refinement
FR-020: Epic 3 - Versioned snapshots; invalid extractions quarantined, never diffed
FR-021: Epic 3 - Semantic diff with the canonical severity scale
FR-022: Epic 3 - Filtered, signed, retried webhooks; paused state; replay; chat destinations; test event
FR-023: Epic 3 - Public SVG badges
FR-024: Epic 3 - Authenticated global change feed
FR-030: Epic 4 - MCP server: tools, resources, prompts (per-custom-schema tool provisioning completed in Epic 7)
FR-031: Epic 4 - OAuth 2.1 / RFC 9728 / RFC 8707 MCP authorization
FR-032: Epic 4 - MCP metering parity with REST
FR-033: Epic 4 - Versioned REST surface, OpenAPI, MCP manifest, public corpus overview
FR-034: Epic 4 - Hybrid semantic + lexical search
FR-040: Epic 7 - No-code and raw-JSON schema builder
FR-041: Epic 7 - Live-URL schema testing
FR-042: Epic 7 - Publish provisions MCP tool and REST; live tool preview; namespaced names
FR-043: Epic 7 - Visibility, public blueprints, clone as snapshot
FR-044: Epic 6 - Studio version/diff time-travel
FR-050: Epic 1 - Workspace ownership; server-side roles on every path
FR-051: Epic 1 - Fail-closed cross-tenant access with audit
FR-052: Epic 1 - Four-role matrix; audited role changes
FR-060: Epic 2 - Free-tier monthly quota at zero cost (key issuance lands in Epic 1)
FR-061: Epic 5 - Stripe plans; founder-editable catalog
FR-062: Epic 5 - Agent 402 purchase path; relationship and account-less modes (402 envelope born in Epic 2)
FR-063: Epic 5 - Real-money wallet top-ups
FR-064: Epic 5 - Guardian funding, spend limit, kill-switch
FR-065: Epic 2 - Append-only metering ledger with row contract and customer usage reads (reconciliation against charges verified in Epic 5)
FR-066: Epic 5 - Signature-verified, idempotent Stripe webhook lifecycle
FR-067: Epic 5 - Paid-tier hard-stop 402
FR-070: Epic 8 - Real admin accounts, no passcodes (role and MFA primitives from Epic 1)
FR-071: Epic 8 - Customer and fleet governance; audited courtesy actions
FR-072: Epic 8 - Telemetry-derived console analytics
FR-073: Epic 8 - Queryable audit stream (audit writes are born in every epic per AD-11)
FR-074: Epic 8 - Pricing-plan editor without deployment
FR-080: Epic 9 - Browse and install listings through the grant scope
FR-081: Epic 9 - 80/20 attribution per unit type on collected revenue
FR-082: Epic 9 - Creator accrual ledger with holdback, self-dealing exclusion, clawback
FR-083: Epic 9 - Creator pricing within bounds
FR-084: Epic 9 - Featured listings and revenue-qualified ranking
FR-090: Epic 10 - Four export formats, entitlement-gated, ledgered as cached reads
FR-100: Deferred - Browser extension (Phase 3; no epic)
FR-101: Deferred - CLI (Phase 3; no epic)
FR-110: Epic 6 - Help-center quickstarts per surface
FR-111: Epic 6 - One-click MCP client configuration
FR-112: Epic 6 - Signed-in playground with measured numbers
FR-113: Epic 6 - Copy-ready snippets throughout Studio
FR-114: Epic 6 - End-to-end activation instrumentation
FR-120: Epic 11 - TypeScript SDK on generated OpenAPI types
FR-121: Epic 11 - LangChain and LlamaIndex packages
FR-122: Epic 11 - Studio SDK promotion (snippet surface from Epic 6)

**NFR allocation (primary epic; secondary in parentheses):** NFR-001 Epic 2 (Epic 8 publishes measured p50/p95) · NFR-002 Epic 2 · NFR-003 Epic 8 (Epic 6 display) · NFR-010 Epic 8 · NFR-011 Epic 3 · NFR-012 Epic 3 · NFR-013 Epic 4 · NFR-020 Epic 1 · NFR-021 Epic 2 · NFR-022 Epic 1 · NFR-023 Epic 1 · NFR-024 Epic 3 outbound (Epic 5 inbound) · NFR-025 Epic 1 (extended in Epics 4 and 6) · NFR-026 Epic 5 (inbound limiter born in Epic 2) · NFR-030 Epic 2 fetch port (Epic 3 crawl pacing) · NFR-031 Epic 2 · NFR-032 Epic 6 docs (legal workstream outside code) · NFR-033 Epic 2 · NFR-034 Epic 2 · NFR-035 Epic 6 docs · NFR-040 Epic 1 (Epic 8 consumes) · NFR-041 Epic 8 · NFR-042 Epic 2 logging (Epic 8 drift monitoring) · NFR-050 Epic 2 cost capture (Epic 5 price floors) · NFR-051 Epic 1.

**UX-DR allocation:** UX-DR1–23 Epic 6 · UX-DR24 Epic 7 · UX-DR25 Epic 9 · UX-DR26 Epic 10 · UX-DR27–29 Epic 6 · UX-DR30 Epic 8 · UX-DR31–37 Epic 6 · UX-DR38 Epic 7 · UX-DR39 Epic 6 (wallet backend in Epic 5).

## Epic List

### Epic 1: Workspace Foundation — sign up, own a workspace, hold a key
A developer signs up, lands in a workspace governed by the four-role matrix, invites teammates, mints and revokes scoped API keys, and every request is tenant-scoped, fail-closed, and audit-logged. Story 1 is the platform scaffold the spine mandates (monorepo restructure to `entry/core/adapters`, Drizzle schema kernel, three wrangler environments, CI gates, single error envelope) — the starter template Architecture prescribes.
**FRs covered:** FR-050, FR-051, FR-052
**Also carries:** NFR-020, NFR-022, NFR-023, NFR-025, NFR-040 (telemetry baseline), NFR-051; AD-2, AD-5, AD-6, AD-7, AD-10, AD-13; platform-admin identity (MFA, bootstrap runbook, admin scope) deferred to Epic 8 story 8.1; open findings EC-501, EC-502, EC-507, EC-801. Spec stories 1–2 (spec checkpoints on both; done checkpoint on tenancy).

### Epic 2: On-Demand Refinement — turn any URL into validated JSON, metered from the first call
A signed-in developer refines any URL against a template or supplied schema and gets strict-validated JSON with provenance and token economics, or an explicit quarantined failure that is never billed. Every serve writes its ledger row, free-tier quota applies, and over-quota answers with the machine-readable 402.
**FRs covered:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-012, FR-014, FR-060, FR-065
**Also carries:** F7 preamble (billable unit); NFR-001 (cache projection, internal latency budget), NFR-002, NFR-021, NFR-030 (fetch policy, opt-out registry), NFR-031, NFR-033, NFR-034, NFR-042 (per-extraction logging), NFR-050 (cost capture); AD-3 (sync mode), AD-9, AD-11, AD-12, AD-14, AD-16 (schema document + compiler; six templates seeded as platform blueprints with guardrails); open findings EC-105, EC-106, EC-202, EC-207, EC-801, ADV-M1, ADV-M6. Spec story 3, plus the ledger core of story 7 and the AD-16 kernel of story 13.

### Epic 3: Living Corpus & Change Intelligence — track sources, see what changed, get alerted
A builder puts sources under a refresh policy; the dev SDK vertical refreshes on schedule for real through Workflows and Queues with a GitHub Releases connector; every refresh yields a versioned snapshot; consecutive valid versions produce a CRITICAL/MAJOR/MINOR diff exposed through queryable history, the authenticated global feed, and public badges; webhook subscriptions deliver filtered, signed, retried events to HTTPS and chat destinations with a visible paused state and replay.
**FRs covered:** FR-010, FR-011, FR-013, FR-020, FR-021, FR-022, FR-023, FR-024
**Also carries:** NFR-011, NFR-012, NFR-024 (outbound signing), NFR-030 (robots, crawl pacing); AD-3 (Workflow mode), AD-4, AD-12 (projections); open findings EC-602, EC-603, EC-604, EC-605, EC-606, EC-607, EC-702, EC-703. Spec stories 4–6.

### Epic 4: Agent Access — connect an IDE or agent over MCP, discover the API, search the corpus
An agent or IDE connects over MCP with OAuth 2.1 or an API key; tools derive from the same Zod sources as REST and meter identically; resources and prompts actually resolve; developers discover the platform through the published OpenAPI document, MCP manifest, public corpus overview, and machine-readable status document; hybrid search filters by vertical, schema, and workspace. The core product is demoable end to end after this epic.
**FRs covered:** FR-030, FR-031, FR-032, FR-033, FR-034
**Also carries:** NFR-013, NFR-025 (MCP isolation tests); AD-7 (MCP clauses), AD-8 (contract publication); pagination convention; open finding EC-204. Spec stories 10–11 (done checkpoint after MCP).

### Epic 5: Paying for the Refinery — subscriptions, agent wallets, account-less payment
Humans subscribe through Stripe with a founder-editable catalog and a hard-stop 402 on quota exhaustion; guardians fund prepaid wallets with real money, mint agent tokens, set spend limits, and kill instantly; agents pay per query from a wallet or account-less via x402; the ledger reconciles against charges, and refunds, credits, and chargebacks are explicit compensating events.
**FRs covered:** FR-061, FR-062, FR-063, FR-064, FR-066, FR-067
**Also carries:** NFR-024 (inbound Stripe verification), NFR-026, NFR-050 (price floors); AD-15; the x402 principal added to the auth middleware and MCP; open findings EC-102, EC-104, EC-107, EC-108, EC-109, EC-301, EC-303, EC-304, EC-305, EC-503, ADV-M7, ADV-L1. Spec stories 8–9 (spec + done checkpoints on the agent rail).

### Epic 6: Refinery Studio — see your data, play, and wire your IDE
A human opens the routed Studio: dark-first tokens and animations, workspace switching, vertical corpus views with sample labels, the time-travel diff inspector, the playground with measured latency and token savings, the MCP hub with one-click IDE configs, help-center quickstarts and snippets, pipeline and webhook management, billing and wallet views with the emergency kill-switch, an instrumented activation funnel, and an honest landing page.
**FRs covered:** FR-044, FR-110, FR-111, FR-112, FR-113, FR-114
**Also carries:** UX-DR1–23, UX-DR27–29, UX-DR31–37, UX-DR39; NFR-001/003 display discipline, NFR-025 (Studio isolation tests), NFR-032/035 posture statements in docs; AD-8 (pure client); decomposition of `App.tsx`; open finding ADV-M5. Spec stories 12 and 14.

### Epic 7: Visual Schema Studio — build, test, and publish your own schemas
A builder designs a schema visually or in raw JSON, tests it on a live URL, publishes it to provision its MCP tool and REST access, and shares it as a cloneable public blueprint that other workspaces clone as independent snapshots.
**FRs covered:** FR-040, FR-041, FR-042, FR-043
**Also carries:** UX-DR24, UX-DR38; AD-16 (compiler consumer), AD-8 (live preview); open findings EC-504, EC-802, UX-open (live-test billing). Spec story 13 (spec checkpoint).

### Epic 8: Operations Console — govern customers, fleets, and pricing on real telemetry
An MFA-gated admin governs customers and agent fleets, grants audited courtesy credits, reads analytics computed from telemetry, queries the audit stream, and edits plans without a deploy; the public status page reflects measured availability.
**FRs covered:** FR-070, FR-071, FR-072, FR-073, FR-074
**Also carries:** NFR-003 (measured-only publication), NFR-010 (status page), NFR-040, NFR-041, NFR-042 (drift monitoring); UX-DR30; open findings EC-205, EC-304 (plan retirement). Spec story 15.

### Epic 9: Marketplace — install creator listings, earn from your own
A customer browses and installs creator listings; a creator prices a listing within bounds and watches an 80/20 accrual ledger with holdback, self-dealing exclusion, and chargeback clawback; featured and leaderboard curation ranks revenue-qualified usage.
**FRs covered:** FR-080, FR-081, FR-082, FR-083, FR-084
**Also carries:** UX-DR25; AD-6 (grant scope), AD-11 (attribution); open findings EC-401, EC-402, EC-403, EC-406. Spec story 16 (spec checkpoint).

### Epic 10: Fine-Tuning Export — turn your corpus into training data
A member exports an entitled corpus slice, including diff-derived migration examples, in OpenAI JSONL, Llama3, Alpaca, or RAG-chunk format, and the export lands in the ledger as N cached-read acts.
**FRs covered:** FR-090
**Also carries:** UX-DR26; AD-6, AD-8, AD-11; open finding ADV-H8 (rights review before RAG-chunk export ships). Spec story 17.

### Epic 11: SDKs & Integrations — use the refinery from TypeScript, LangChain, and LlamaIndex
A developer installs the TypeScript SDK, the LangChain loader + tools package, or the LlamaIndex reader from npm and completes a refined query against the API; Studio promotes all three with snippets.
**FRs covered:** FR-120, FR-121, FR-122
**Also carries:** AD-8 (generated types), no committed artifacts; npm publish blocked on OQ-1 — build publish-ready. Spec story 18 (done checkpoint = launch candidate).

**Deferred, no epic in this breakdown:** FR-100 browser extension and FR-101 CLI — Phase 3 fast-follows bound by AD-8 when they arrive.

**Dependency order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11. Each epic uses only its predecessors and stands alone once they exist. Approved changes from the spec slate (2026-09-05): the AD-16 schema kernel and the AD-11 ledger core move into Epic 2 so every serving route is born metered and validated by one compiler; Agent Access precedes paid rails so the persona path and end-to-end demo arrive earlier.

## Epic 1: Workspace Foundation — sign up, own a workspace, hold a key

A developer signs up, lands in a workspace governed by the four-role matrix, invites teammates, mints and revokes scoped API keys, and every request is tenant-scoped, fail-closed, and audit-logged. Story 1.1 is the platform scaffold the spine mandates — the starter template Architecture prescribes — and stories 1.2–1.4 deliver identity and tenancy on top of it. Covers FR-050, FR-051, FR-052; carries NFR-020, NFR-022, NFR-023, NFR-025, NFR-040 (telemetry baseline), NFR-051; binds AD-2, AD-5, AD-6, AD-7, AD-10, AD-13 and the conventions table. No UX-DRs land here: these stories expose the REST and session-auth surface that Studio (Epic 6) consumes. Checkpoints carried from the spec slate: spec review before 1.1 and before 1.2; done review after 1.4 with the NFR-025 fail-closed suite green. Assumptions: `ref_test_` keys are issued only in non-production environments; prototype source is preserved read-only under `legacy/` until launch cutover; platform-admin identity (MFA, bootstrap runbook, admin scope) is built in Epic 8 when the first admin surface exists.

### Story 1.1: Platform scaffold, environments, and CI gates

As a co-founder rebuilding an AI-generated prototype,
I want the repository restructured to the architecture spine's seed with three environments and CI gates,
So that every later story lands in a verified, deployable shape instead of extending code the audit condemned.

**Acceptance Criteria:**

**Given** the repository at its current commit
**When** the scaffold lands
**Then** `apps/worker/src/{core,adapters,entry}`, `apps/web/src`, `packages/schema`, and `packages/sdk` exist per the Structural Seed, with `core/` containing no Hono or Cloudflare imports and `entry/` containing no SQL (AD-2), enforced by a lint rule that fails CI on violation
**And** the prototype worker source, `packages/integrations`, and the prototype SPA are moved under `legacy/` (excluded from npm workspaces, CI, and deploys) as read-only reference until launch cutover; committed `.js`/`.d.ts` build artifacts, the production-URL smoke scripts, and the promotions router are deleted (PD-13, PD-14)

**Given** the Stack table in the spine
**When** `npm install` runs cold on a clean checkout
**Then** every dependency matches its exact pin (wrangler 4.127.1, hono 4.13.5, zod 4.5.4, @hono/zod-openapi 1.6.1, drizzle-orm 0.45.2, drizzle-kit 0.31.10, drizzle-zod 0.8.3, vitest 4.1.11, @cloudflare/vitest-pool-workers 0.22.0, TypeScript 5.9.3) and install succeeds without `--legacy-peer-deps` or overrides

**Given** `apps/worker/wrangler.jsonc`
**When** inspected
**Then** `local`, `staging`, and `production` environments each declare their own D1 (`refinery-db`), KV, R2, Vectorize, Queue (`refinery-dispatch`, `refinery-webhooks`, `refinery-webhooks-dlq`), Workflow, and AI bindings with `compatibility_date` ≥ 2026-08-04 (AD-13)
**And** no URL, Stripe price ID, model ID, or credential literal exists anywhere in source — a CI guard greps for known patterns and fails the build on a hit; secrets are provisioned only via `wrangler secret`

**Given** the single Hono app in `entry/http`
**When** any unhandled or typed domain error occurs
**Then** the response is `{ "error": { "code", "message", "requestId" } }` produced by the app-level `onError`, with `code` drawn from the central taxonomy module (`AUTH_`, `QUOTA_`, `PAYMENT_`, `REFINE_`, `TENANT_`, `INTERNAL_`…) and no raw exception text, stack, or SQL in the body (AD-10)
**And** a contract test provokes an internal error and asserts the envelope

**Given** any inbound request
**When** it enters the worker
**Then** a `requestId` is generated at entry, echoed in a response header, and present in every structured JSON log line for that request (Logging convention)

**Given** `packages/schema` as the schema source of truth
**When** a Drizzle table definition changes
**Then** `drizzle-kit generate` produces the migration (hand-written DDL fails review by a lint check on the migrations folder), row types are inferred, and `wrangler d1 migrations apply` is wired per environment (AD-5)
**And** the shared utilities expose `<prefix>_<ULID>` id generation in core, epoch-millisecond timestamps for D1 with ISO-8601 on the wire, and integer micro-USD money helpers (Conventions)

**Given** a pull request
**When** GitHub Actions runs
**Then** typecheck, lint, the vitest-pool-workers suite against real local bindings, and a D1 migration dry-run must all pass before merge; merging to `main` deploys `staging`; `production` deploys only through a manual promotion job (AD-13, Testing convention)

**Given** the public route `GET /api/v1/health`
**When** called without credentials
**Then** it returns `{ "ok": true, "requestId" }` with no performance or uptime figures (NFR-003) and serves as the scaffold's first passing contract test

**Given** repository metadata
**When** reviewed
**Then** `LICENSE` is a proprietary all-rights-reserved notice for Virgee LLC, `package.json` license fields agree, and the README describes the real stack, runtime requirement, and license with no MIT, BUSL, OpenAPI, or "sub-20ms" claims remaining (PRD Phase 0 identity workstream, PD-12, PD-13)

### Story 1.2: Sign up, sign in, and land in a personal workspace

As a developer exploring the refinery,
I want to create an account with a verified email and sign in to my own workspace,
So that I have an authenticated home for keys, schemas, and usage from the first minute.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only the tables it needs: Better Auth's user, session, account, and verification tables; `workspaces` (`ws_` ids, name, `deleted_at`); `memberships` (workspace, user, role); and `audit_events` (`aev_` ids, nullable `workspace_id`, principal, event type, payload, epoch-ms timestamp) — nothing else

**Given** a visitor on the signup endpoint
**When** they register with email and password
**Then** a Cloudflare Turnstile challenge gates the request, per-identity and per-origin issuance limits apply (EC-801), the account stays inactive until the emailed verification link is used, and on verification a `usr_` user, a personal `ws_` workspace, and an OWNER membership are created in one D1 `batch()` with an `auth.signup` audit row

**Given** Better Auth configuration
**When** reviewed
**Then** it is instantiated per request, uses the Drizzle adapter on D1, never combines `cookieCache` with `secondaryStorage`, rotates the session on login, and sessions carry identity only — no role, plan, or workspace claims (AD-7)

**Given** a signed-in session cookie
**When** the client calls `GET /api/v1/me`
**Then** the one auth middleware resolves the human principal and their selected workspace into a workspace-scoped principal, and the response lists the user, active workspace, and memberships with roles
**And** the same middleware and router serve Studio and API clients alike — no parallel Studio routes exist (AD-7)

**Given** a request without a session or credential to any non-public route
**When** it arrives
**Then** the response is 401 with code `AUTH_REQUIRED` in the standard envelope (NFR-020)

**Given** a signed-in user
**When** they sign out
**Then** the session is invalidated server-side and an `auth.logout` audit row is appended

**Given** the `audit_events` repository
**When** its interface is inspected
**Then** it exposes append and query methods only — no update or delete exists anywhere, including for future admin code — and rows are written by core services alone (AD-11)

**Given** the password-reset flow
**When** a user requests a reset
**Then** a single-use, expiring emailed token completes it, every active session for that user is revoked on success, and `auth.password_reset` is audited

### Story 1.3: Workspace membership, roles, and minted tenant scope

As a workspace owner,
I want to invite teammates with a role, adjust or remove them, and know that every request is confined to my workspace,
So that my team can collaborate without any path leaking another tenant's data.

**Acceptance Criteria:**

**Given** an OWNER of a workspace
**When** they invite an email address with a role (OWNER, BUILDER, MEMBER, or VIEWER)
**Then** an expiring single-use invite is created and emailed, acceptance by a signed-in user creates the membership, and `tenancy.member_invited` and `tenancy.member_joined` audit rows are appended (FR-052)

**Given** an OWNER
**When** they change a member's role or remove a member
**Then** the change is audited (`tenancy.role_changed`, `tenancy.member_removed`), and the removed member's next request against that workspace fails because authorization state is read from D1 on every request — nothing is cached in KV or embedded in the session (AD-7, EC-502)
**And** any BUILDER, MEMBER, or VIEWER attempting these actions receives 403 `TENANT_FORBIDDEN`

**Given** a workspace with exactly one OWNER
**When** anyone attempts to remove or downgrade that OWNER
**Then** the request fails with `TENANT_LAST_OWNER` and the workspace always retains at least one OWNER (EC-507)

**Given** `core/tenancy`
**When** its exports are inspected
**Then** `OwnerScope` is a branded type with no public constructor, minted only from the authenticated principal; every `adapters/d1` repository method requires it for reads and writes; and a compile-time test proves feature code cannot construct one from request data (AD-6)

**Given** a request carrying a workspace id in the body, query string, or path that differs from the principal's resolved scope
**When** it is processed
**Then** the response is `TENANT_MISMATCH` and no repository call is made (AD-6)

**Given** a principal of workspace A
**When** it requests any resource belonging to workspace B by id
**Then** the response is 404 in the standard envelope with no data, and a `tenancy.denied` audit row records principal, target, and route (FR-051)

**Given** the four-role matrix
**When** `core/tenancy.authorize(principal, action)` is called on every route
**Then** OWNER-only actions (billing, plan, settings, invites), BUILDER+ actions (schema design, pipelines, webhooks), MEMBER+ actions (run refinements and queries, use marketplace items), and VIEWER+ actions (view data, history, audit log) resolve exactly per the FR-052 table, and no route performs a role check anywhere else

**Given** a user who belongs to several workspaces
**When** they call `POST /api/v1/me/workspace` with a workspace they are a member of
**Then** the session's active workspace switches without re-login; a workspace they do not belong to returns 404

**Given** an OWNER
**When** they delete the workspace
**Then** it is soft-deleted with a configurable recovery window, every member's access ends at their next request, the action is audited, and a precondition registry (empty in this story; wallets and listings register conditions in later epics) is consulted before deletion proceeds (EC-501)

**Given** the NFR-025 suite
**When** CI runs
**Then** automated tests prove cross-tenant reads and writes fail closed on every REST route shipped so far, for session principals, and the suite is the place later epics extend for keys, MCP, and Studio

### Story 1.4: Workspace API keys and bearer authentication

As a developer wiring the refinery into scripts and agents,
I want to mint scoped API keys, see them listed, and revoke them instantly,
So that machines can call the API under my workspace with no more authority than I grant.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `api_keys` (`key_` id, `workspace_id`, name, display prefix and last four, SHA-256 digest, role scope, `created_by`, `created_at`, `last_used_at`, `revoked_at`)

**Given** a MEMBER or higher
**When** they create a key with a name and a role scope no greater than their own role (BUILDER, MEMBER, or VIEWER)
**Then** a ≥256-bit random key prefixed `ref_live_` in production or `ref_test_` elsewhere is returned exactly once, only its SHA-256 digest is stored, the key is workspace-owned (it survives the creator's removal, FR-050), and `identity.key_created` is audited (NFR-023, Credentials-at-rest convention)

**Given** a request with `Authorization: Bearer ref_…`
**When** the one auth middleware runs
**Then** it resolves the workspace API key principal by digest lookup with a constant-time compare, reads validity and role scope from D1 on that request, and rejects the legacy `X-Refinery-Key` header (AD-7, Auth-transport convention)

**Given** a key
**When** an OWNER or BUILDER revokes it, or a MEMBER revokes a key they created
**Then** the very next request bearing it fails 401 `AUTH_KEY_REVOKED`, `identity.key_revoked` is audited, and rotation is documented as create-new-then-revoke-old with no in-place mutation

**Given** a key principal
**When** it attempts an OWNER-only action (billing, plan, settings, invites) or any future admin surface
**Then** the response is 403 `AUTH_SESSION_REQUIRED` — keys never carry OWNER authority (AD-7)

**Given** the key list endpoint
**When** called by a MEMBER or higher
**Then** it returns names, prefixes, last-four characters, role scope, creation and last-used times, and revocation state — never digests or full keys — using the cursor pagination envelope (Pagination convention)

**Given** any principal
**When** it exceeds the per-principal inbound abuse limit configured for the environment
**Then** the Workers Rate Limiting binding returns 429 `RATE_LIMITED` in the standard envelope, and the binding is used for abuse control only, never for quota accounting (NFR-026, Rate-limiting convention)

**Given** the NFR-025 suite
**When** CI runs
**Then** cross-tenant fail-closed tests now cover key principals on every REST route, including a key of workspace A presented against workspace B's resources

## Epic 2: On-Demand Refinement — turn any URL into validated JSON, metered from the first call

A signed-in developer refines any URL against a template or supplied schema and gets strict-validated JSON with provenance and token economics, or an explicit quarantined failure that is never billed. Every serve writes its ledger row, free-tier quota applies, and over-quota answers with the machine-readable 402. Covers FR-001–FR-006, FR-012, FR-014, FR-060, FR-065 and the F7 billable-unit preamble; carries NFR-001, NFR-002, NFR-021, NFR-030, NFR-031, NFR-033, NFR-034, NFR-042, NFR-050; binds AD-3 (sync mode), AD-9, AD-11, AD-12, AD-14, AD-16. Diff and notify filters are wired as no-ops here and become real in Epic 3. Checkpoints carried from the spec slate: spec review before 2.1 (the AD-16 kernel pulled forward from story 13) and before 2.5 (the ledger core pulled forward from story 7). Assumptions: on-demand fetches record robots.txt status in provenance and enforce it only behind a config flag (corpus crawling always honors it); per-host pacing applies to on-demand fetches with a small configurable minimum interval; the quota period is the calendar month in UTC; `Idempotency-Key` replays are honored for 24 hours; template guardrail texts are ported from the prototype's migrations with the co-founders as named owner and a per-phase review trigger; the 402 body's purchase paths are config values that Epic 5 populates.

### Story 2.1: Canonical schema documents, the single compiler, and the six template blueprints

As a builder,
I want every schema — platform templates and, later, my own — stored in one canonical format and compiled by one compiler,
So that validation, MCP tool shapes, and API documentation can never disagree about what conforms.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `custom_schemas` (`sch_` id, owner scope `platform` or `workspace_id`, slug, name, version, canonical document JSON, visibility `private`/`blueprint`, status `draft`/`published`, severity-rules field, guardrail fields, timestamps) (AD-6, AD-16)

**Given** `packages/schema`
**When** the meta-schema is inspected
**Then** it enumerates the allowed JSON Schema keyword subset (`type`, `properties`, `required`, `items`, `enum`, `const`, `minimum`, `maximum`, `minLength`, `maxLength`, `pattern`, a named `format` subset, `description`, `additionalProperties`, nullable type arrays) with `additionalProperties` defaulting to `false`, and a document using any keyword outside the subset is rejected at publish with `SCHEMA_INVALID` and the violating path (AD-16)

**Given** the compiler module
**When** `compile(document)` is called
**Then** it returns the runtime validator, the MCP tool `inputSchema`, and the OpenAPI component schema from one pass, unit tests pin the validator's semantics to the profile, and a lint guard fails CI if any other JSON Schema parser or a second compiler appears in the worker (AD-16)

**Given** a schema document
**When** it carries the named severity-rules field
**Then** the rules validate against a rule schema defined once in `packages/schema` (empty rules allowed) and travel with the document (FR-021, AD-16)

**Given** the six vertical templates (dev SDK migrations, B2B SaaS pricing, municipal zoning/STR, health-payer prior-auth, FDA/biopharma, SEC 10-K)
**When** the idempotent seed script runs in an environment
**Then** each exists once as a published platform-scoped blueprint with its compliance guardrail directive (for the extraction prompt) and display copy ported from the prototype, plus a named owner and last-reviewed date on the guardrails (FR-012, ADV-M6); SEC 10-K carries no featured or marketing-forward flag

**Given** a VIEWER or higher
**When** they call `GET /api/v1/schemas` or `GET /api/v1/schemas/{slug}`
**Then** the list is the `core/tenancy` union of platform blueprints and the caller's workspace schemas with cursor pagination, the detail returns the document and its compiled OpenAPI component, and another workspace's private schema returns 404 (AD-6)

**Given** an inline schema document supplied by a caller
**When** it reaches the platform
**Then** it is validated against the same meta-schema and compiled by the same compiler as stored schemas, with no separate code path

### Story 2.2: The policed outbound fetch port

As a platform operator,
I want every outbound fetch of external content to pass through one policed port,
So that SSRF, disrespectful crawling, and opted-out sources are impossible by construction rather than by review.

**Acceptance Criteria:**

**Given** `adapters/`
**When** the codebase is linted
**Then** exactly one fetch port implementation exists, any `fetch(` to a non-vendor URL outside it fails CI, and source connectors are typed as implementations of the same port interface (AD-14)

**Given** any target URL
**When** the port is invoked
**Then** only `http`/`https` on ports 80/443 are allowed, DNS is resolved and every address checked against loopback, private, link-local, metadata, and unique-local ranges for IPv4 and IPv6 before connecting, each redirect hop is re-validated with a hop cap, and response size and time are capped (NFR-021)
**And** a test suite proves refusal for decimal, hex, and octal IP literals, IPv6-mapped addresses, `0.0.0.0`, `localhost`, `169.254.169.254`, redirects into private ranges, and a simulated DNS rebind

**Given** an outbound request
**When** it is sent
**Then** the `User-Agent` is the identifiable product bot string with an opt-out URL, both read from environment configuration pending OQ-1 (NFR-030)

**Given** a host's `robots.txt`
**When** a fetch is requested in crawl mode
**Then** a disallowed path is refused with `REFINE_ROBOTS_DISALLOWED`; in on-demand mode the robots verdict (`allowed`, `disallowed`, `unavailable`) is recorded in the fetch metadata and enforced only when the environment flag `ON_DEMAND_HONOR_ROBOTS` is set; robots files are cached as a derived KV projection with a TTL (NFR-030, AD-12)

**Given** the opt-out registry table `opt_out_sources` (`opt_` id, host or URL prefix, reason, timestamp)
**When** a fetch targets a listed source
**Then** the port refuses with `REFINE_SOURCE_OPTED_OUT` without connecting, and adding a registry entry purges every stored raw snapshot whose key matches (AD-12, AD-14)

**Given** the `source_hosts` table (host, `next_fetch_at`, minimum interval)
**When** a fetch for a host is not yet due
**Then** the port refuses with `REFINE_SOURCE_PACED` and a `Retry-After`, `next_fetch_at` is advanced atomically on each permitted fetch, and the interval is environment configuration with a small default for on-demand traffic (Rate-limiting convention, NFR-030)

**Given** a permitted fetch
**When** it completes
**Then** the raw body is written to R2 under an owner-prefixed key with its SHA-256 content hash and a bounded-retention lifecycle rule, and the port returns a reference (`r2Key`, `contentHash`, `contentType`, `bytes`, `fetchedAt`, `finalUrl`, `robots`) — never the body inline (AD-3, AD-12)

**Given** the sanitize filter
**When** it receives a fetch reference
**Then** it strips scripts, styles, and navigation noise, reduces the page to bounded text, writes the artifact to R2, and returns a reference, with unit tests on representative pages

**Given** any model call site
**When** fetched or stored content is passed to a model
**Then** it must be wrapped by the single `fenceUntrusted` helper producing the `<untrusted_web_content>` wrapper and defensive directive; the AI adapter accepts only the `FencedContent` type, so no unfenced path compiles (AD-14)

### Story 2.3: Refine a URL into schema-validated JSON with provenance

As a developer,
I want to POST a URL and a schema and get back JSON that provably conforms, or an explicit failure,
So that I can feed my agents verified facts instead of raw HTML.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `refinement_runs` (`run_` id, nullable `pipeline_id`, principal attribution, nullable `workspace_id`, mode, status, timings, model ids, fallback flag, token and cost fields, error code), `refined_entities` (`ent_` id, owner scope, schema reference and version, entity key, structured data, provenance fields, validation status, version number, `run_id`), and `quarantined_snapshots` (`qsn_` id, `run_id`, R2 keys, error paths) (AD-3, AD-9)

**Given** a MEMBER or higher
**When** they call `POST /api/v1/refine` with `{ url, schema: slug | { document }, instructions? }` defined via zod-openapi
**Then** the single filter chain in `core/refinement` runs synchronously in-request — fetch → sanitize → extract → validate → store, with diff and notify as no-op filters — and exactly one `run_` record is created with mode `sync`, `pipeline_id` null, and the caller's principal — any accessible URL against any accessible schema (FR-001, FR-014, AD-3)

**Given** the extract filter
**When** it runs
**Then** it calls the primary model, then the fallback model on failure, both read from environment variables and optionally routed through AI Gateway, passes only fenced content, applies and records JSON repair, and when both fail marks the run `failed` with `REFINE_EXTRACTION_FAILED` or `REFINE_PROVIDER_UNAVAILABLE` and writes no entity (FR-004, NFR-012, AD-1)

**Given** model output
**When** the validate filter applies the compiled validator
**Then** a failing output is quarantined — raw and model artifacts referenced from a `qsn_` row with the failing paths — the run is `failed`, and the response is 422 `REFINE_VALIDATION_FAILED` listing the paths; nothing is coerced or defaulted, and a lint guard keeps `z.record(z.any())` out of the codebase (FR-002, AD-9)

**Given** a conforming extraction
**When** the store filter runs
**Then** the entity row and run row commit in one D1 `batch()`, the entity is owned by the caller's workspace scope — never written at `platform` scope — and the response is `{ data, provenance, validation, runId }` (AD-6, AD-12)

**Given** any refined artifact
**When** its provenance is read
**Then** it records source URL, final URL, fetch timestamp, content hash, extraction model id and version, whether the fallback served, schema slug and version or inline-document hash, and prompt version (FR-003, NFR-042)

**Given** every model call
**When** it completes
**Then** input and output tokens and the computed cost are recorded on the run row, model ids are never literals, and only providers with no-training terms are configured (LLM-usage convention, NFR-034, NFR-050)

**Given** the refine response
**When** returned
**Then** it carries validation status, provenance, and `fetchedAt`, and the OpenAPI description states that on-demand refinement is seconds-scale (NFR-002, NFR-011, NFR-033)

**Given** an extracted value that looks like a URL
**When** the chain continues
**Then** it is stored as data and never used as a fetch target, tool, or write instruction — a test asserts the chain accepts only the caller-supplied URL (AD-14)

**Given** the contract test suite
**When** it runs against local bindings
**Then** it covers a happy path on a fixture page, a validation failure, a provider outage, an SSRF refusal, an opted-out source, and an unauthenticated call returning 401

### Story 2.4: Token economics, honest confidence, and cached reads

As a developer,
I want each refinement to tell me what it saved and how much to trust it, and repeat reads to come from cache with their age visible,
So that the product's core value claim is measured and fast reads are cheap.

**Acceptance Criteria:**

**Given** a completed refinement
**When** its token economics are returned
**Then** they include raw source bytes, raw HTML tokens measured with a named tokenizer, sanitized input tokens and output tokens from provider usage, and the reduction against both the raw-HTML and the sanitized-text baselines; nothing estimated is displayed (FR-005, NFR-003, ADV-M1)

**Given** an extraction
**When** a confidence indicator is present
**Then** it is computed from real signals (validation passed, repair applied, fallback used, required-field coverage) by a documented formula and is omitted when signals are unavailable — no constant values (FR-006)

**Given** a committed entity
**When** the store filter's post-commit hook runs
**Then** it writes the KV projection under `<owner>:<domain>:<entityKey>:latest` with exactly the shape the D1 read returns and a configured TTL, a projection failure is logged and never fails the run, and a `rebuildProjections(scope)` path restores KV from D1 (AD-12, PD-8)

**Given** a VIEWER or higher
**When** they call `GET /api/v1/entities/{id}` for an entity in their scope
**Then** the response is identical on KV hit and miss and includes provenance, validation status, and `lastRefreshedAt`; an entity outside their scope returns 404 (AD-6, NFR-011)

**Given** a `POST /api/v1/refine` for a URL and schema the caller's workspace refined within the configured freshness window
**When** `fresh` is not set
**Then** the stored result is returned flagged `served: "cached"` with its age, and the serve descriptor records the source as cache rather than live — the fact Story 2.5 classifies (AD-11)

**Given** a source added to the opt-out registry
**When** any read targets an entity derived from it
**Then** the entity is not served (`REFINE_SOURCE_OPTED_OUT`) and its KV projection is purged (AD-12)

**Given** cached entity reads
**When** telemetry is recorded
**Then** per-route latency percentiles are captured and compared against an internal, unpublished budget from configuration for alerting only (NFR-001, NFR-040)

### Story 2.5: Metering ledger, free-tier quota, and the machine-readable 402

As a workspace owner on the free tier,
I want every successful serve recorded once in a ledger that my quota and usage are computed from, and a clear machine-readable 402 when I run out,
So that billing is honest by construction before any money moves.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `usage_events` (`uev_` id, unit type, principal attribution fields, nullable `workspace_id`, run or entity reference, micro-USD price frozen at serve, pricing-config version, nullable `lst_` reference and split basis, nullable unique payment reference, event kind, timestamp), `pricing_configs` (versioned rows with an active pointer), `usage_counters` (workspace, period, unit type, count), and `idempotency_keys` (AD-11)

**Given** the `usage_events` repository
**When** its interface is inspected
**Then** it exposes append and query only, `core/metering` is its sole caller (import-lint), and the payment-reference column carries a uniqueness constraint (AD-11)

**Given** a serving route
**When** it delivers a result
**Then** it declares its serve descriptor in the route definition, one `classify(descriptor)` function in `core/metering` derives `cached_read` or `refinement`, and no caller passes a unit type (AD-11)

**Given** pricing configuration
**When** an environment is seeded
**Then** per-unit micro-USD prices and per-plan quotas per unit type (Free tier included) come from environment-provided config rather than source literals, are labeled placeholders pending OQ-2 and OQ-3, and every ledger row records the config version it was priced under (FR-060, FR-061, AD-13)

**Given** a priced request
**When** it is admitted
**Then** the workspace's calendar-month UTC counter is incremented by an atomic conditional write in the same D1 `batch()` as run creation, a failed predicate returns 402 before the expensive step, delivery appends the ledger row in the same batch as the entity write, and failure releases the reservation so no billable row exists (F7 preamble, AD-15, EC-202)
**And** a concurrency test firing N parallel requests against a quota of N−1 admits exactly N−1

**Given** ledger, counter, and audit writes
**When** the code is linted
**Then** none occur inside `waitUntil` (AD-11, State-mutation convention)

**Given** an over-quota request
**When** the 402 is produced
**Then** the body is one machine-readable shape for humans and agents — error code, unit type, micro-USD price, quote expiry, and purchase paths (`upgrade`, `topUp`, `x402`) read from configuration and left null until Epic 5 — with the prototype's price-per-query response headers carried forward (FR-062, EC-106, PD-15)

**Given** `POST /api/v1/refine` with an `Idempotency-Key` header
**When** the same key and principal repeat within 24 hours
**Then** the stored response is returned and exactly one ledger row exists (EC-105)

**Given** a VIEWER or higher
**When** they call `GET /api/v1/usage`
**Then** the response gives period totals per unit type, remaining quota, an `asOf` freshness stamp, aggregate token savings across the workspace's runs, and a cursor-paged event list, all derived from the ledger (FR-065, FR-005, EC-206)

**Given** the `usage_counters` projection
**When** the rebuild routine runs
**Then** it reproduces the counters from `usage_events` exactly, proven by a test that corrupts a counter and rebuilds it (AD-11, AD-12)

**Given** every serving route shipped so far (live refine, cached refine, entity read)
**When** contract tests run
**Then** each delivered result produces exactly one ledger row, failed runs produce none, and `GET /api/v1/health` produces none

## Epic 3: Living Corpus & Change Intelligence — track sources, see what changed, get alerted

A builder puts sources under a refresh policy; the dev SDK vertical refreshes on schedule for real through Workflows and Queues with a GitHub Releases connector; every refresh yields a versioned snapshot; consecutive valid versions produce a CRITICAL/MAJOR/MINOR diff exposed through queryable history, the authenticated global feed, and public badges; webhook subscriptions deliver filtered, signed, retried events to HTTPS and chat destinations with a visible paused state and replay. Covers FR-010, FR-011, FR-013, FR-020–FR-024; carries NFR-011, NFR-012, NFR-024 (outbound signing), NFR-030 (crawl pacing and robots); binds AD-3 (Workflow mode), AD-4, AD-12. The diff and notify filters that were no-ops in Epic 2 become real here. No spec-slate checkpoints fall in this epic. Assumptions: the cron cadence is environment configuration (default every 15 minutes) so per-pipeline intervals are not bound to the seed diagram's illustrative 6-hour label; tenant-scheduled refreshes bill as `refinement` acts against the workspace's quota on successful store, while platform-owned pipelines never bill; the starter dev-vertical source list is configuration pending OQ-4; badges for non-opted and nonexistent entities return the same neutral "unknown" SVG; webhook deliveries are free within plan limits and produce no ledger rows; version-history retention is unlimited until the pricing exercise sets per-tier values.

### Story 3.1: Tracked sources and scheduled pipelines on the async substrate

As a builder,
I want to put sources under a refresh policy and see each scheduled run succeed, retry, or fail,
So that the corpus stays fresh without anyone pressing a button.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `pipelines` (`pipe_` id, owner scope, schema reference, name, refresh interval, enabled flag, timestamps) and `tracked_sources` (source URL or connector reference, entity key, `pipeline_id`, `next_fetch_at`, status `active`/`stale`/`defunct`, `last_run_at`, `last_success_at`, consecutive-failure count, last error) (FR-010, AD-4)

**Given** a BUILDER or higher
**When** they create, enable, disable, or list pipelines via zod-openapi routes under `/api/v1/pipelines`
**Then** each pipeline binds one schema and one or more tracked sources with a fixed refresh interval, listings show last run, last success, and per-source status with cursor pagination, and every mutation is audited (FR-011)

**Given** the cron trigger at the configured cadence
**When** it fires
**Then** its only work is selecting sources whose `next_fetch_at` is due and enqueueing one message per source onto `refinery-dispatch`; it never executes a refinement inline, and a test proves a fired cron leaves no run rows of its own (AD-4, PD-1)

**Given** the `refinery-dispatch` consumer
**When** it dequeues a message
**Then** it creates a `run_` record and spawns the `refinement-run` Workflow with the run id as the instance id, so a redelivered message is a no-op, and the consumer is idempotent on the message key (AD-4)

**Given** the `refinement-run` Workflow
**When** it executes
**Then** each filter of the single chain is exactly one step (fetch, sanitize, extract, validate, diff, store, notify), steps pass references only, every step's output write is idempotent on (`run_id`, filter), per-step retry applies, the run record records mode `scheduled` with `pipeline_id` set, and the same `core/refinement` functions serve the on-demand path (AD-3, AD-4)

**Given** a scheduled run
**When** it ends
**Then** `next_fetch_at` advances by the pipeline interval and the host pacing rule, success or failure and its error code are visible on the source and pipeline, and consecutive failures beyond a configured threshold move the source to `defunct` — refreshes stop, the last valid version keeps serving flagged as defunct, and the owner is notified once (FR-011, EC-603)

**Given** a source whose `next_fetch_at` is overdue beyond its interval plus a configured grace
**When** anyone reads the source, its pipeline, or its entities
**Then** it is flagged `stale` with `lastRefreshedAt`, and a missed-refresh event is recorded for operator alerting (NFR-011)

**Given** ownership
**When** a pipeline is platform-owned
**Then** its runs write at `platform` scope and produce no ledger rows; when tenant-owned, its runs write at the workspace scope and each successful store produces one `refinement` ledger row against the workspace's quota through the Epic 2 admission path, with a paused pipeline when quota is exhausted (AD-6, AD-11)

**Given** a long-running Workflow
**When** it reaches a step boundary
**Then** it re-checks pipeline enablement and workspace authorization from D1 rather than trusting values carried in Workflow params (AD-7)

### Story 3.2: The dev SDK vertical goes live with real sources and a GitHub Releases connector

As a developer using the launch corpus,
I want the dev SDK breaking-changes vertical refreshing from real sources on schedule, with the other five verticals clearly labeled as samples,
So that the one vertical the launch persona depends on is genuinely alive and nothing else pretends to be.

**Acceptance Criteria:**

**Given** the fetch port interface
**When** the GitHub Releases connector is added
**Then** it implements the same port (SSRF policy, identifiable user-agent, pacing, opt-out registry), authenticates with a secret provided via `wrangler secret`, respects GitHub rate-limit headers by advancing `next_fetch_at`, and returns references like any fetch (FR-010, AD-14)

**Given** the platform-owned dev-vertical pipeline
**When** it is seeded from the configured starter source list (packages and their release or changelog sources, pending OQ-4)
**Then** each package is a tracked source with its entity key, runs on schedule through the Epic 3.1 substrate, and refined entities land at `platform` scope validated against the dev SDK template blueprint (FR-013, AD-6)

**Given** the dev-vertical template's per-item schema
**When** a release is refined
**Then** breaking-change items carry before and after code snippets and migration notes as data fields, ready for the finer per-item severity scale in Story 3.3 (FR-021)

**Given** the other five vertical templates
**When** sample entities are seeded
**Then** each is a platform-scoped entity with `sample: true`, the flag and a human-readable label travel in every API response that includes the entity, and sample entities are excluded from live-coverage counts (FR-013, EC-605)

**Given** a VIEWER or higher
**When** they call `GET /api/v1/corpus/{vertical}` or `GET /api/v1/corpus/{vertical}/{entityKey}`
**Then** results are read at the `core/tenancy` scope union (platform plus own workspace), cursor-paginated, filterable by sample flag, each response carries `lastRefreshedAt` and staleness, and each request produces one `cached_read` ledger row up to the configured entity cap (AD-6, AD-11, NFR-011)

**Given** the AI provider is unavailable
**When** corpus reads are served
**Then** they continue from D1 and KV with their staleness visible, while any refresh attempt fails explicitly with `REFINE_PROVIDER_UNAVAILABLE` and is retried by the substrate (NFR-012)

**Given** the corpus-health metrics
**When** telemetry is read
**Then** tracked-source count, refresh success rate, validation pass rate, and days of unattended refresh are computed from run rows — the inputs for the exit gate's fourteen-day criterion (FR-013, NFR-040)

### Story 3.3: Versioned snapshots and severity-rated semantic diffs

As a developer depending on a tracked entity,
I want every refresh to become a version and every change between valid versions to carry a severity I can trust,
So that I learn what changed and how much it matters without reading the source.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `entity_versions` (entity id, version number, structured data, provenance, `run_id`, created) and `entity_diffs` (`diff_` id, entity id, from and to versions, entity-level severity, changes, per-item severities, reasoning, source-restructured flag, change hash, created) (FR-020, FR-021)

**Given** a successful run for a tracked entity
**When** the store filter commits
**Then** a new version row is written in the same batch as the entity head, the head's version number increments, and a quarantined run never creates a version — quarantined snapshots are recorded for diagnostics only and are never diff bases (FR-020, AD-9)

**Given** two consecutive valid versions
**When** the diff filter runs — in both entry modes, as one step of the single chain
**Then** it computes a semantic field-level diff, assigns exactly one entity-level severity from the `CRITICAL`/`MAJOR`/`MINOR` enum in `packages/schema` using the schema document's severity rules plus generic field rules (including price-increase asymmetry), assigns per-item severities from the finer enum where the schema defines items, and records human-readable reasoning (FR-021, Severity convention)

**Given** any model call inside the diff filter
**When** stored versions are summarized or classified
**Then** the content passes through `fenceUntrusted` again — the untrusted taint persists beyond fetch time (AD-14)

**Given** a diff whose change hash equals a diff emitted for the same entity within the configured window
**When** it is produced
**Then** it is rolled up into the existing diff rather than re-emitted, and a source that flaps beyond a threshold is flagged `unstable` on its tracked source (EC-602)

**Given** a refresh whose content hash or structure delta exceeds the configured bound
**When** the diff is computed
**Then** it is emitted as a distinct `source-restructured` event type rather than a content severity (EC-606)

**Given** a VIEWER or higher
**When** they call `GET /api/v1/entities/{id}/versions`, `GET /api/v1/entities/{id}/versions/{n}`, or `GET /api/v1/entities/{id}/diffs`
**Then** history is owner-scoped and cursor-paginated, any two versions can be requested for comparison, each request produces one `cached_read` ledger row, and retention depth reads from per-tier configuration (default unlimited) (FR-020, AD-6, AD-11, EC-607)

**Given** an entity flagged `sample: true`
**When** it is refreshed or seeded
**Then** no diff is computed and no change event is produced (EC-605)

### Story 3.4: Global change feed and public badges

As a developer watching the ecosystem,
I want one authenticated stream of recent changes across the corpus and a README badge per tracked entity,
So that I can scan what moved and show my project's dependency status at a glance.

**Acceptance Criteria:**

**Given** a VIEWER or higher
**When** they call `GET /api/v1/changes` with optional `vertical` and `severity` filters
**Then** the feed is one named composite read in `core/corpus` over the `core/tenancy` union of platform corpus and the caller's workspace (marketplace grants join the union in Epic 9), cursor-paginated newest first, excludes sample entities, and produces one `cached_read` ledger row per request (FR-024, AD-6, AD-11)

**Given** the public route `GET /badge/{entityKey}.svg`
**When** called without credentials
**Then** a platform-corpus entity renders an SVG with its latest version label colored by its latest entity-level severity from the shared enum, with `Cache-Control: max-age=600`; the version label is escaped so refined values are inert (FR-023, AD-14)

**Given** a tenant-owned entity
**When** its workspace has not enabled the public badge
**Then** the badge route returns the same neutral "unknown" SVG, status, and headers it returns for a nonexistent entity key — the two are indistinguishable (AD-6, S-15)

**Given** a BUILDER or higher
**When** they enable or disable the public badge on a tenant-owned entity
**Then** the change is audited and the badge appears or reverts at the next request (AD-6, EC-506)

**Given** a badge render
**When** telemetry is recorded
**Then** the referrer host is captured for the discovery-funnel metric and no ledger row is written, because public surfaces have no billable principal (ADV-M5, AD-11)

**Given** a sample or defunct entity
**When** its badge is requested
**Then** a sample entity renders the neutral badge and a defunct entity renders its last valid version with a defunct marker (EC-603, EC-605)

### Story 3.5: Webhook subscriptions with filtered, signed, retried delivery

As a builder who depends on change alerts,
I want subscriptions that deliver only the events I asked for, signed, retried, and never silently lost,
So that my team learns about a breaking change before production does.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `webhook_subscriptions` (`whk_` id, workspace, name, destination type `https`/`slack`/`discord`/`telegram`, destination config, event-type filters, entity filters, encrypted signing secret, status `active`/`paused`, failure counters, timestamps) and `webhook_deliveries` (`dlv_` id, subscription, event id, attempt, status, response code, `next_attempt_at`, timestamps) (FR-022, AD-4)

**Given** a BUILDER or higher
**When** they create a subscription
**Then** the destination URL passes the same SSRF allow/deny policy as the fetch port at creation, the signing secret is generated, shown once, and stored encrypted with the platform secret, filters are validated against the event and entity vocabularies, and the response shows the subscription's current match count with a zero-match warning (FR-022, AD-4, EC-703, Credentials-at-rest convention)
**And** a pipeline may carry its own notification target, which creates a subscription filtered to that pipeline's entities (FR-022)

**Given** the notify filter
**When** a store commits a new version or diff
**Then** it publishes exactly one typed domain event — schema in `packages/schema`, carrying `requestId`, entity id, version sequence, diff id, severity, and sample flag — onto `refinery-webhooks`, and nothing else; sample entities publish nothing (AD-4, EC-605, EC-702)

**Given** the `refinery-webhooks` consumer
**When** it dequeues an event
**Then** `core/notify` matches every active subscription by event type and entity filters at dequeue time, creates one delivery row per match, signs the payload with the subscription's secret and a timestamp header, re-validates the destination after DNS resolution, and POSTs; a subscription created after the diff but before dequeue receives the event (AD-4, NFR-024)

**Given** a failed delivery
**When** retries run
**Then** attempts are bounded with backoff and recorded per delivery row, exhaustion routes the message to `refinery-webhooks-dlq`, moves the subscription to `paused`, appends `notify.subscription_paused`, and notifies the owner out of band by email with the cause (including chat-credential failures such as an uninstalled Slack app) (FR-022, EC-701, EC-704)

**Given** a paused subscription
**When** the owner revives it
**Then** missed deliveries are replayed from delivery rows in order of creation, and the contract documented in OpenAPI states at-least-once, unordered delivery with entity id and version sequence for consumer deduplication (FR-022, EC-702)

**Given** a mass refresh producing more matching events for one subscription than its burst cap within the window
**When** deliveries are dispatched
**Then** the excess is delivered as a single digest event and the cap is enforced per subscription (EC-703)

**Given** Slack, Discord, or Telegram destinations
**When** an event is delivered
**Then** the destination adapter formats a message leading with severity and the concrete change, uses the same retry and paused semantics, and vendor API endpoints are the only non-policy-checked URLs (FR-022)

**Given** a subscription owner
**When** they call the send-test-event endpoint
**Then** a synthetic signed event is delivered through the real path and appears in the delivery history (FR-022)

**Given** webhook deliveries
**When** metering is inspected
**Then** no ledger rows are written for deliveries, delivery rows are the record, and every delivery attempt log carries the originating `requestId` (AD-11, Logging convention)

## Epic 4: Agent Access — connect an IDE or agent over MCP, discover the API, search the corpus

An agent or IDE connects over MCP with OAuth 2.1 or an API key; tools derive from the same Zod sources as REST and meter identically; resources and prompts actually resolve; developers discover the platform through the published OpenAPI document, MCP manifest, public corpus overview, and machine-readable status document; hybrid search filters by vertical, schema, and workspace. The core product is demoable end to end after this epic. Covers FR-030–FR-034; carries NFR-013, NFR-020, NFR-025 (MCP isolation tests); binds AD-7 (MCP clauses), AD-8, AD-11 (parity), AD-12 (search projections) and the Pagination convention. Checkpoint carried from the spec slate: done review after 4.4, the "core product demoable end-to-end" gate. Assumptions: Better Auth's OAuth provider capability serves as the OAuth 2.1 authorization server (the spine rejected an external IdP); the lexical index is a D1 FTS5 virtual table maintained as a derived projection, with the decision recorded in the architecture memlog and a token-table fallback if FTS5 proves unavailable; MCP tool names are deterministic — `refinery_<slug>` for platform tools and blueprints, `custom_<slug>` for a workspace's own schemas, `mkt_<slug>` reserved for installed marketplace listings — so tenant and platform names can never collide.

### Story 4.1: Published API contract — OpenAPI document, discovery index, corpus overview, and status document

As a developer integrating without hand-holding,
I want the REST contract, a discovery index, a public corpus overview, and a machine-readable status document published from the code that serves them,
So that I can build against documentation that cannot drift from behavior.

**Acceptance Criteria:**

**Given** every route shipped so far
**When** the codebase is linted
**Then** each is defined with `@hono/zod-openapi`, a route without a definition fails CI, and every list endpoint uses the `{ items, nextCursor }` envelope with a per-route limit cap — offset pagination fails a test (AD-8, Pagination convention)

**Given** the public route `GET /api/v1/openapi.json`
**When** called without credentials
**Then** it serves the OpenAPI 3.1 document generated from the route definitions, including the six template blueprints' component schemas and the error envelope schema, and a CI step fails if a committed snapshot of the document drifts from the generated one (FR-033, AD-8)

**Given** the public root `GET /`
**When** called
**Then** it returns a discovery index linking the OpenAPI document, the MCP manifest location, the status document, the corpus overview, and documentation, with no performance figures (FR-033, NFR-003)

**Given** the public route `GET /api/v1/corpus-overview`
**When** called
**Then** it reads at explicit `platform` scope and reports per-vertical entity counts split live versus sample, latest refresh timestamps, and tracked-source counts, all computed from D1 at request time (FR-033, AD-6, FR-013)

**Given** the public route `GET /api/v1/status`
**When** called
**Then** it reports only measured facts — reachability checks of D1, KV, R2, Vectorize, and the AI binding executed for the request, the last successful platform refresh time, and the deployment version — with no uptime percentage until telemetry can compute one (NFR-013, NFR-003, PD-12)

**Given** the generated OpenAPI document
**When** CI runs
**Then** a typed TypeScript client is generated into `apps/web/src/api` and `packages/sdk/src/generated`, committed generation is checked for drift, and no client code may call a path absent from the document (AD-8)

**Given** the public discovery routes
**When** requested repeatedly
**Then** they carry cache headers, produce no ledger rows, and are covered by the inbound rate-limit binding for abuse only (AD-11, NFR-026)

### Story 4.2: Hybrid search across the corpus

As a developer or agent looking for a fact,
I want to search the corpus by meaning and by keyword, filtered to a vertical, schema, or my workspace,
So that I find the right entity without knowing its key.

**Acceptance Criteria:**

**Given** the Vectorize binding per environment
**When** it is provisioned
**Then** the owner scope is the Vectorize namespace (`platform` or `ws_<id>`), and no vector is inserted outside a namespace (AD-6)

**Given** a committed entity
**When** the store filter's post-commit hook runs
**Then** it upserts an embedding built from the entity key, summary, and the first 500 characters of the structured JSON using the embedding model named by an environment variable, best-effort with failure logged and never failing the run, and `rebuildProjections(scope)` regenerates a scope's vectors from D1 (AD-12, PD-15)

**Given** the lexical index
**When** this story lands
**Then** it is a derived projection (D1 FTS5 virtual table or the recorded fallback) maintained alongside the entity write, a test fails on any `LIKE '%…%'` scan over JSON columns, and the mechanism decision is appended to the architecture memlog (FR-034, Deferred interim rule, PD-9)

**Given** a VIEWER or higher
**When** they call `GET /api/v1/search?q=…` with optional `vertical`, `schema`, `workspace`, and `includeSamples` filters
**Then** semantic results (namespace-filtered top-K) and lexical results are fused into one ranked list, the query runs over the `core/tenancy` union of platform and own workspace only, sample entities are labeled and excluded unless requested, results are cursor-paginated with entity summaries and provenance references, and the request produces one `cached_read` ledger row up to the configured entity cap (FR-034, AD-6, AD-11)

**Given** an entity outside the caller's scope
**When** it would match a query
**Then** it never appears — a cross-tenant search test in the NFR-025 suite proves isolation at the namespace level (NFR-025)

**Given** a query string
**When** it is processed
**Then** its length is capped, it is Zod-validated at the boundary, and it is never interpolated into SQL (AD-9)

### Story 4.3: Authenticated MCP server with OAuth 2.1 and API-key access

As an agent developer in Cursor or Claude Code,
I want to connect to the refinery over MCP with either a user-delegated OAuth flow or my workspace API key and call tools that match the REST API exactly,
So that my IDE agents use the same governed surface as everything else.

**Acceptance Criteria:**

**Given** the Agents SDK
**When** the MCP server is mounted at `/mcp` on the single worker
**Then** it speaks Streamable HTTP per the 2026-07-28 specification, `initialize` advertises that protocol version, and no handler is reachable except through the one auth middleware (FR-030, FR-031, AD-2, AD-7)

**Given** the public route `/.well-known/oauth-protected-resource`
**When** an MCP client discovers it
**Then** it serves RFC 9728 protected-resource metadata naming this server's resource identifier and its authorization server, and the authorization server exposes its metadata, PKCE, and the resource-indicator requirement (FR-031)

**Given** a user completing the OAuth 2.1 consent flow
**When** they authorize a client
**Then** the consent screen pins exactly one workspace, the issued token is audience-bound to this server via RFC 8707 resource indicators, a token minted for any other audience is rejected, and the token carries identity only — role and validity are read from D1 on every request (FR-031, AD-7)

**Given** a request to `/mcp` with `Authorization: Bearer ref_…`
**When** the middleware runs
**Then** the workspace API key principal is resolved exactly as on REST, and a free-tier key satisfies authentication at zero cost (FR-031, AD-7)

**Given** a `tools/call` without a valid credential
**When** it arrives
**Then** the response is a JSON-RPC error mapped from the `AUTH_REQUIRED` envelope by the single error layer, and no tool executes (FR-031, NFR-020, AD-10)

**Given** the tool set (`refine_url`, `get_entity`, `list_corpus`, `search`, `list_versions`, `get_diff`, `list_changes`)
**When** `tools/list` is served
**Then** every tool's input and output schema is generated from the same Zod schema module as its REST operation by one converter, and a test asserts each tool schema deep-equals the conversion of its REST source; a hand-authored tool schema fails CI (FR-030, AD-8)

**Given** published schemas visible to the principal's scope
**When** `tools/list` is served
**Then** one additional tool per schema appears, named `refinery_<slug>` for platform blueprints, with its `inputSchema` produced by the AD-16 compiler (FR-030, FR-042, AD-16)

**Given** `resources/list` and `prompts/list`
**When** they advertise `refinery://corpus/{vertical}` resources and the `check_sdk_upgrade` prompt
**Then** `resources/read` and `prompts/get` are implemented and return corpus data and the typed prompt with arguments — nothing advertised is unreachable (FR-030, PD-2)

**Given** any tool argument
**When** it is received
**Then** it is Zod-validated at the boundary, and the tool resolves through the same `core/tenancy` authorization as its REST twin — a test proves a tool never grants what its REST counterpart denies (AD-7, AD-9)

**Given** the public route `GET /mcp/manifest`
**When** called
**Then** it serves a discovery document with the server URL, supported auth methods, and tool names, and the OpenAPI discovery index links to it (FR-033)

**Given** the NFR-025 suite
**When** CI runs
**Then** protocol-level tests cover `initialize`, `tools/list`, `tools/call`, `resources/read`, `prompts/get`, unauthenticated and wrong-audience failures, and a workspace-A token calling a tool against workspace B's entity receives an error with a `tenancy.denied` audit row (NFR-025)

### Story 4.4: MCP metering parity, 402 over MCP, and end-to-end verification

As a founder,
I want an MCP call and its REST twin to leave identical ledger attribution, and the whole product provable end to end against a deployed environment,
So that the primary agent surface can never become an unmetered back door and the launch gate has something to run.

**Acceptance Criteria:**

**Given** a tool call
**When** it delivers a result
**Then** it declares the same serve descriptor as its REST twin, `classify` yields the same unit type, and the ledger row attributes to the OAuth grant's pinned workspace or the API key exactly as REST does (FR-032, AD-11)

**Given** `resources/read` and `prompts/get`
**When** they serve corpus data
**Then** each request produces one `cached_read` ledger row up to the entity cap, so the resource surface cannot bypass metering (FR-032, EC-204)

**Given** an over-quota principal
**When** it calls any priced tool
**Then** the JSON-RPC error carries the same machine-readable 402 body used on REST in its `data` field, and no work is performed (FR-062, AD-11)

**Given** the parity test
**When** CI runs
**Then** for every tool with a REST twin, calling both with the same principal and arguments yields identical unit type, priced amount, pricing-config version, and attribution, and a redelivered MCP request with the same request id produces one row (FR-032, AD-11)

**Given** the inbound rate-limit binding
**When** MCP traffic exceeds the per-principal abuse limit
**Then** the JSON-RPC error maps `RATE_LIMITED` and the limit is shared with REST for the same principal (NFR-026)

**Given** the staging environment
**When** the end-to-end verification suite runs
**Then** it signs up a user, mints a key, connects an MCP client with the generated configuration, lists tools, refines a fixture URL, reads a corpus entity, reads a diff, confirms ledger rows and quota movement, and exercises a cross-tenant denial — green is a precondition of the done checkpoint (PRD §6 exit gate)

**Given** the done checkpoint
**When** the founders review
**Then** the walkthrough demonstrates the launch persona's path — signup to first refined query over MCP — with measured latency shown from telemetry and no fabricated figure anywhere in the demo (NFR-003)

## Epic 5: Paying for the Refinery — subscriptions, agent wallets, account-less payment

Humans subscribe through Stripe with a founder-editable catalog and a hard-stop 402 on quota exhaustion; guardians fund prepaid wallets with real money, mint agent tokens, set spend limits, and kill instantly; agents pay per query from a wallet or account-less via x402; the ledger reconciles against charges, and refunds, credits, and chargebacks are explicit compensating events. Covers FR-061, FR-062, FR-063, FR-064, FR-066, FR-067; carries NFR-024 (inbound verification), NFR-026, NFR-050 (price floors); binds AD-7 (agent and drive-by principals), AD-11, AD-15. Checkpoints carried from the spec slate: spec review before 5.3 (the agent rail) and done review after 5.5 with a clean reconciliation run. Assumptions: tier display names are configuration and the catalog ships with non-"ENTERPRISE" names until Phase 4 (ADV-L1); a failed renewal opens a seven-day grace window in which interactive access continues, scheduled pipelines pause, and account notifications still fire; downgrades apply at cycle end with over-limit resources paused, never deleted; spend limits are per calendar day UTC; the kill-switch is a reversible suspend and permanent revocation is a separate audited action; OWNERs fund wallets and OWNERs or BUILDERs hold the kill-switch; unspent balances are refundable on request via the original rail and the policy is stated in terms; the x402 facilitator and chain come from the Phase 0 spike behind an `X402_ENABLED` flag that defaults off until the spike lands, with relationship-mode-only launch as the named fallback; a chargeback suspends the funded wallet pending resolution.

### Story 5.1: Plan catalog and Stripe subscriptions with a webhook-driven lifecycle

As a workspace owner,
I want to subscribe to a paid plan and have my quota follow what I actually paid for, through renewals, failures, downgrades, and cancellation,
So that access tracks money with no manual intervention and no silent overage.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `plans` (slug, display name, Stripe price reference stored as data, quotas per unit type, resource limits, status `active`/`retired`, version), `subscriptions` (workspace, plan, Stripe customer and subscription ids, status `active`/`grace`/`canceled`, current period, `grace_until`), and `stripe_events` (unique event id, processed timestamp) (FR-061, FR-066)

**Given** the plan catalog
**When** it is seeded per environment
**Then** the committed tier structure exists — Free, two paid tiers, agent pay-per-query — with every price and quota labeled placeholder pending OQ-2, no Stripe price id in source, and tier display names read from configuration (FR-061, AD-13, ADV-L1)

**Given** an OWNER
**When** they call `POST /api/v1/billing/checkout` for a plan
**Then** a Stripe Checkout session is created through the fetch-based Stripe client, the workspace is bound to a Stripe customer, and the audit stream records `billing.checkout_started` (FR-061, FR-066)

**Given** `POST /api/v1/billing/stripe/webhook`
**When** any event arrives
**Then** `adapters/stripe` verifies the signature before any core call, a missing webhook secret fails closed rather than skipping verification, the event id is recorded in `stripe_events` and a redelivery changes nothing, and unrecognized event types are acknowledged without side effects (FR-066, NFR-024, AD-11, PD-11)

**Given** a verified `checkout.session.completed` or `invoice.paid` event
**When** processed
**Then** the subscription becomes `active` on the paid plan in one D1 batch with a `billing.provisioned` audit row, and quota admission in `core/metering` reads the plan's per-unit quotas from the next request (FR-061, FR-066)

**Given** a verified `invoice.payment_failed` event
**When** processed
**Then** the subscription enters `grace` with `grace_until` set from configuration, interactive access continues, the workspace's scheduled pipelines pause with a visible reason, the owner is emailed, and the grace expiry reverts the workspace to the Free plan's quotas with resources paused recoverably — nothing is deleted (FR-066, EC-301)

**Given** a verified `customer.subscription.deleted` event or an owner-initiated downgrade
**When** processed
**Then** the change applies at the end of the current period, resources exceeding the new plan's limits are paused with owner notification and never deleted, and `billing.revoked` or `billing.downgraded` is audited (FR-066, EC-303)

**Given** the plan catalog
**When** a plan is edited or retired
**Then** edits apply to new subscriptions only unless an explicit migration with notice is executed, a plan with active subscribers cannot be deleted — only retired from sale — and every catalog change appends an audit row (FR-061, FR-074, EC-304)

**Given** the public route `GET /api/v1/billing/plans`
**When** called
**Then** it lists active plans with names, prices, and quotas per unit type from the catalog, and is the only source the landing page and Studio read prices from (FR-061)

**Given** an OWNER
**When** they call `POST /api/v1/billing/portal`
**Then** a Stripe customer-portal session is returned for payment-method and invoice management, and no card data ever touches the platform

### Story 5.2: Paid-tier hard stop and real-money wallet top-ups

As a paying workspace owner,
I want a clear 402 when my quota runs out that lets me upgrade or top up a wallet with real money, and I want the wallet to be impossible to overdraw,
So that I never face silent overage and the platform never credits money it did not collect.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `wallets` (`wal_` id, workspace, balance in micro-USD, status, alert threshold) and `wallet_holds` (hold id, wallet, amount, `run_id`, status `held`/`settled`/`released`), and `core/metering` is the only module that reads or writes them (AD-15)

**Given** a paid subscriber whose period quota is exhausted
**When** their next priced request arrives
**Then** the response is the machine-readable 402 with `upgrade` and `topUp` paths populated, the same shape agents receive, and no silent overage billing occurs (FR-067, FR-062)

**Given** an OWNER
**When** they call `POST /api/v1/billing/wallet/topup` with an amount
**Then** a Stripe Checkout session in payment mode is created, and the wallet is credited only when the verified `checkout.session.completed` event arrives — in one batch with a `wallet_topup` compensating ledger event, idempotent by Stripe event id; a test proves no code path credits a wallet without a verified event (FR-063, AD-11, AD-15, PD-11)

**Given** a workspace API key whose quota is exhausted and whose workspace holds a funded wallet
**When** a priced request arrives
**Then** admission places an atomic conditional hold on the wallet in the same batch as run creation, the hold settles on delivery together with the ledger row and releases on failure, and this over-quota path is the only way a workspace key draws the wallet (FR-067, AD-15)

**Given** N concurrent priced requests against a wallet funding N−1
**When** they race
**Then** exactly N−1 are admitted, the balance never goes negative, and no request is serialized to achieve it (AD-15)

**Given** free quota and a funded wallet on the same workspace
**When** priced requests arrive
**Then** free quota drains before any wallet hold is placed (EC-207)

**Given** a wallet balance crossing its alert threshold
**When** a settle completes
**Then** the owner is notified once per crossing and the event is audited (FR-064)

**Given** a verified `charge.dispute.created` event
**When** processed
**Then** the funded wallet is suspended pending resolution, a `chargeback` compensating event is appended, and the workspace owner is notified; a resolved dispute lifts or finalizes the suspension through its verified follow-up event (AD-11, FR-065)

**Given** the workspace-deletion precondition registry
**When** this story lands
**Then** it registers a condition requiring wallet balances to be zero or refunded before deletion proceeds, and the unspent-balance policy — refundable on request via the original rail — is published in the terms surface (EC-109, EC-501)

### Story 5.3: Agent tokens, guardian wallets, spend limits, and the kill-switch

As a fleet operator,
I want to mint agent tokens that draw on a prepaid wallet under a daily spend limit, and stop any of them instantly,
So that my agents can buy intelligence autonomously without ever running away with my money.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `agent_tokens` (`agt_` id, workspace, wallet, name, SHA-256 digest, display prefix and last four, daily spend limit in micro-USD, status `active`/`suspended`/`revoked`, `created_by`, `last_used_at`) (FR-064, AD-7)

**Given** an OWNER or BUILDER
**When** they create an agent token with a name and daily spend limit
**Then** a ≥256-bit random `ref_agent_` token is returned once, only its digest is stored, it is bound to the workspace's wallet, it is workspace-owned so no member's removal orphans it, and `identity.agent_token_created` is audited (FR-064, EC-503, NFR-023)

**Given** a request with `Authorization: Bearer ref_agent_…` on REST or MCP
**When** the one auth middleware runs
**Then** it resolves the agent-token principal, reading kill state and wallet binding from D1 on that request with no cache, and the principal never authorizes OWNER-only actions (AD-7)

**Given** an agent-token request for priced work
**When** admission runs
**Then** a wallet hold is placed atomically before the expensive step, an unfunded wallet returns the machine-readable 402 with the `topUp` path, delivery settles the hold with the ledger row attributed to the token and workspace, and failure releases it with nothing billed (FR-062, AD-15)

**Given** a token whose settled spend for the current UTC day plus the requested hold exceeds its spend limit
**When** a priced request arrives
**Then** it is refused with the distinct `PAYMENT_SPEND_LIMIT` reason rather than a purchase invitation, and the limit resets at the UTC day boundary (FR-064, EC-108)

**Given** an OWNER or BUILDER
**When** they call the kill endpoint for a token
**Then** the token is `suspended` immediately, the very next request bearing it fails `AUTH_TOKEN_KILLED`, holds placed before the kill settle normally, no new hold is placed after it — proven by a test with an in-flight run — and `identity.agent_token_killed` is audited (FR-064, AD-7, AD-15, EC-104)

**Given** a suspended token
**When** an OWNER or BUILDER reinstates it
**Then** access resumes at the next request; permanent revocation is a separate audited action that cannot be reversed (EC-104)

**Given** an OWNER or BUILDER
**When** they call the workspace-wide emergency kill endpoint
**Then** every active agent token in the workspace is suspended in one batch, in-flight holds settle, no data is deleted, and the action is audited with the actor (FR-064, UX-DR29)

**Given** a workspace whose subscription lapsed or is in grace
**When** its funded agent tokens make priced requests
**Then** they continue to draw the wallet — agent access is independent of subscription state (EC-305)

**Given** the NFR-025 suite
**When** CI runs
**Then** agent-token principals are covered on REST and MCP, including a workspace-A token against workspace-B resources and a killed token against any resource (NFR-025)

### Story 5.4: Account-less x402 payment

As an autonomous agent with no account,
I want to pay per request with an x402 payment and receive the result in the same exchange,
So that I can buy refined data without a signup, a form, or a human.

**Acceptance Criteria:**

**Given** the `X402_ENABLED` flag
**When** it is off
**Then** priced routes answer credential-less requests with the standard 402 whose `x402` path is null, and no facilitator call is made — relationship-mode-only launch remains available as the fallback (ADV-M7)

**Given** the flag is on and a priced route receives a request with no session, key, or agent token
**When** the `@x402/hono` middleware runs
**Then** it returns the 402 challenge carrying x402 payment requirements inside the same machine-readable body used everywhere else, and no work is performed (FR-062, AD-7)

**Given** a request presenting a payment authorization
**When** the middleware runs
**Then** it verifies the authorization only — nothing settles pre-serve — resolves a drive-by principal whose credential is the payment proof, and the principal reads at `platform` scope (AD-7, AD-15)

**Given** a drive-by on-demand refinement
**When** it completes
**Then** the result is delivered in-response and persisted only as run, ledger, and quarantine records — never as a tenant resource and never into the platform corpus (AD-6)

**Given** a delivered result
**When** the ledger row commits with the payment reference
**Then** settlement executes post-delivery from that row through `adapters/x402`, a failed run is never settled, and where the facilitator forces upfront settlement the compensating refund is owned by `adapters/x402` and triggered only by a metering compensating event (AD-15, F7 preamble)

**Given** a payment reference already present in `usage_events`
**When** it is presented again
**Then** the uniqueness constraint treats the request as unpaid, the 402 is returned, and documentation states that a lost response requires a new payment (AD-11, EC-102)

**Given** a payment short of the quoted amount or in excess of it
**When** verified
**Then** a shortfall is refused with `PAYMENT_SHORTFALL` naming the required amount, and an overpayment remainder is recorded as a distinct compensating ledger event kind (EC-107)

**Given** anonymous traffic
**When** it exceeds rate or anomaly thresholds keyed by payer identity and network origin
**Then** it receives 429 `RATE_LIMITED`, and every anonymous fetch passes the same SSRF and content policy as authenticated traffic (NFR-026, AD-14)

**Given** `/mcp`
**When** a priced tool is called without a credential and the flag is on
**Then** the same x402 challenge and verify-only flow apply, and a paid tool call leaves a ledger row attributed by payment reference (AD-7, FR-032)

**Given** the Phase 0 facilitator spike
**When** it concludes
**Then** the chosen facilitator, chain, custody, fiat-conversion, and ledger-treatment answers are recorded in the architecture memlog before the flag is enabled in production (ADV-M7, Deferred)

### Story 5.5: Billing reconciliation and money invariants

As a founder,
I want the ledger to reconcile against Stripe charges and wallet balances over a sustained test period, and prices to be provably above cost,
So that the exit gate's billing-integrity criteria are measured rather than asserted.

**Acceptance Criteria:**

**Given** the reconciliation job
**When** it runs on schedule against an environment
**Then** it compares ledger sums per workspace (billable rows, top-ups, settles, releases, refunds, chargebacks) with wallet balances and Stripe balance transactions for the period, and writes a reconciliation report with every discrepancy classified `courtesy`, `defect`, or `fraud` (FR-065, AD-11, EC-205)

**Given** a discrepancy
**When** it is detected
**Then** an operator alert is raised, the finding is audited, and no ledger row is edited — resolution happens only through compensating events from the three authorized origins (AD-11)

**Given** the pricing configuration
**When** a new version is activated
**Then** validation refuses an on-demand `refinement` price below the measured inference cost floor computed from run rows for the previous period, and the floor check is recorded with the version (NFR-050)

**Given** the `usage_counters` and wallet projections
**When** the rebuild routine runs after the reconciliation window
**Then** rebuilt counters equal live counters and wallet balances equal ledger-derived balances, proven in CI with seeded traffic (AD-11, AD-15)

**Given** the sustained test harness on staging
**When** it drives mixed traffic — free-tier, subscription, wallet, agent-token, and x402 when enabled — for the configured window
**Then** every exit-gate billing assertion holds: real charges for every top-up, no billable row without delivery, no delivery without a row, no overdraft, kill-switch honored, and the reconciliation report is clean (PRD §6 exit gate)

**Given** the done checkpoint for the agent rail
**When** the founders review
**Then** the full 402 and wallet flow including a real Stripe test-mode charge, an agent-token purchase, a kill during an in-flight run, and the reconciliation report are demonstrated end to end

## Epic 6: Refinery Studio — see your data, play, and wire your IDE

A human opens the routed Studio: dark-first tokens and animations, workspace switching, vertical corpus views with sample labels, the time-travel diff inspector, the playground with measured latency and token savings, the MCP hub with one-click IDE configs, help-center quickstarts and snippets, pipeline and webhook management, billing and wallet views with the emergency kill-switch, an instrumented activation funnel, and an honest landing page. Covers FR-044, FR-110–FR-114; carries UX-DR1–23, UX-DR27–29, UX-DR31–37, UX-DR39, NFR-001/003 display discipline, NFR-025 (Studio path), NFR-032/035 posture statements; binds AD-8 (pure public-API client), AD-13 (assets worker per environment). The 5,025-line prototype `App.tsx` is replaced, never extended. No spec-slate checkpoints fall here. Assumptions: the playground shows a live elapsed-time counter and, after completion, the measured per-stage timings from the run record — no fabricated stage transitions, since the refine call is synchronous at launch; the prototype's "Save to Workspace Corpus" button becomes "Track this source" because on-demand results already persist to the workspace corpus; the MCP tester and IDE config generators use a workspace API key the user pastes, held in browser memory only; the live transaction ticker polls the usage endpoint rather than claiming a websocket; the admin-mode indicator renders only once the API reports the admin role in Epic 8; the "how did you find us" prompt is a one-time onboarding modal; SDK snippets arrive with Epic 11.

### Story 6.1: Design system foundation, shared components, and Studio sign-in

As a Studio user,
I want the dark-first visual identity, accessible shared components, and working sign-in, sign-up, verification, and reset screens,
So that every later Studio surface is built from one consistent, accessible kit.

**Acceptance Criteria:**

**Given** `apps/web`
**When** this story lands
**Then** the Tailwind theme is generated from the DESIGN.md token set — colors, typography ramp, radii, spacing, animation names — with `color-scheme: dark`, a lint rule fails CI on hardcoded hex or pixel values in components, and the legacy `App.tsx` is not imported anywhere (UX-DR1, UX-DR3, UX-DR8)

**Given** the signature keyframes
**When** ported from the prototype stylesheet
**Then** `pulseGlow`, `shimmer`, `laserSweep`, `gradientShift`, `floatSlow`, and `orbitRotate` exist as named utilities with their documented applications, and `prefers-reduced-motion: reduce` disables all of them while color and contrast cues remain (UX-DR4, UX-DR35)

**Given** the shared component kit
**When** reviewed
**Then** it provides `CopyButton` (icon button flashing green with a checkmark for 1.5 s), `SeverityBadge` bound to the `packages/schema` enums with `role="status"` and an aria-label naming the severity, `StatusLoader` (never a bare spinner — status copy required by its props), `EmptyState` (icon, one sentence, one primary action, shortcut hint), `Skeleton` (shimmer matching table geometry), `MonoId` (monospace identifiers), `Modal` (focus trap, `Esc` release, L3 elevation), `Toast` (shows `requestId` on errors), and pill `StatusPill`, each with component tests (UX-DR2, UX-DR13, UX-DR15, UX-DR16, UX-DR19, UX-DR33, UX-DR34)

**Given** elevation and shape rules
**When** components render
**Then** panels use L1 borders without drop shadows, hover and focus use the L2 border and glow, modals use L3 backdrop blur and orange-tinted border, buttons and inputs use 6 px radius, cards 8 px, badges pill, and orange never fills an error or destructive state (UX-DR5, UX-DR6, UX-DR7)

**Given** the microcopy module
**When** any surface renders copy
**Then** strings come from a central module following the EXPERIENCE.md voice table, and a lint rule fails CI on banned consumer phrases such as "Oops", celebration emoji, or "Upgrade now" (UX-DR14)

**Given** the auth screens
**When** a visitor signs up, verifies email, signs in, or resets a password
**Then** each flow calls the Better Auth endpoints from Epic 1 through the generated client, renders Turnstile on signup, shows verification and reset states honestly, and records the `?src=` referral parameter on signup for the discovery funnel (FR-114, ADV-M5)

**Given** every interactive element
**When** navigated by keyboard
**Then** it is reachable via Tab and Shift+Tab, shows the 2 px orange focus ring with 2 px offset, and all text meets WCAG AA contrast on the canvas, verified by an automated accessibility check in CI (UX-DR3, UX-DR33)

**Given** `apps/web`
**When** CI runs
**Then** a vitest component-test harness exists and gates merge, and the SPA deploys as its own static-assets worker per environment with the API base read from environment configuration — no literal URLs (AD-13, PD-13)

### Story 6.2: Routed shell, navigation, workspace switching, and the command palette

As a Studio user,
I want a routed application with the twelve surfaces, a top bar that knows my workspace and balance, and keyboard navigation everywhere,
So that I move through the cockpit as fast as I think.

**Acceptance Criteria:**

**Given** react-router 7.18.3 and TanStack Query 5
**When** the shell loads
**Then** the twelve routes (`/diffs`, `/dev`, `/pricing`, `/regulatory`, `/schemas`, `/marketplace`, `/export`, `/playground`, `/mcp`, `/help`, `/billing`, `/management`) exist as lazily loaded views with placeholder pages for surfaces later stories fill, all server state flows through the generated OpenAPI client, and a lint rule forbids any `fetch` outside that client (UX-DR8, UX-DR10, AD-8)

**Given** the sticky 64 px top bar
**When** rendered
**Then** it shows the logo, a workspace switcher that calls the workspace-selection endpoint and re-fetches all queries without a page reload, the active tenant badge, a prepaid-balance ticker with a Top Up link that hides gracefully when no wallet exists, a quick MCP link, and the profile menu; no unmeasured "330+ cities" edge badge appears (UX-DR9, NFR-003)

**Given** the horizontal pill-bar secondary navigation
**When** the viewport narrows
**Then** it scrolls horizontally, and the content canvas caps at 1600 px except diff views, which go fluid (UX-DR10)

**Given** the principal's memberships from the API
**When** navigation renders
**Then** Schema Studio requires BUILDER+, Export MEMBER+, Billing OWNER, Management the admin flag, and VIEWERs never see delete or paid-action buttons — purely by reading the API's role, with no role logic of Studio's own (UX-DR11, AD-7)

**Given** global keyboard shortcuts
**When** pressed
**Then** `⌘K`/`Ctrl+K` opens a command palette that navigates to any surface, searches schemas, and finds entities; `g` chords (`d b p r s m e u c h w`) navigate; `Esc` closes modals and drawers or clears the active filter; `⌘Enter`/`Ctrl+Enter` triggers the surface's primary action; `N` creates from an empty state (UX-DR12)

**Given** any API response with the standard error envelope
**When** received
**Then** a toast shows the message and `requestId`, and a 402 response opens the global banner with the exact unit and price, quote expiry, and the upgrade, top-up, or x402 paths present in the body (UX-DR15, UX-DR17)

**Given** the responsive rules
**When** rendered at ≥1440 px, 1024–1439 px, 768–1023 px, and <768 px
**Then** side-by-side layouts, compact padding with overlay drawers, slide-over drawer with tabbed builders, and read-only monitoring mode apply respectively (UX-DR36)

**Given** two users in different workspaces
**When** an end-to-end test drives Studio for each
**Then** neither sees the other's entities, keys, or settings on any surface, extending the NFR-025 suite to the Studio path (NFR-025)

### Story 6.3: Corpus browsing and the time-travel diff inspector

As a developer,
I want to browse each vertical, open an entity, and scrub through its versions with a severity-rated diff,
So that I see what changed and why it matters without touching the API.

**Acceptance Criteria:**

**Given** `/dev`, `/pricing`, and `/regulatory`
**When** a user opens one
**Then** it lists corpus entities from the vertical endpoint with cursor pagination, filters, `lastRefreshedAt` and staleness, and every sample entity carries a prominent label from the API's flag; `/dev` filters by package and shows before-and-after snippets with migration notes (UX-DR22, UX-DR23, FR-013)

**Given** `/diffs`
**When** opened
**Then** it shows the authenticated global change feed filtered by vertical and severity with severity badges and one-line change summaries, newest first (FR-024)

**Given** an entity detail
**When** opened
**Then** a snapshot slider spans v1…vN, selecting any two versions renders a dual-pane diff with line numbers, syntax highlighting, synchronized vertical scrolling, emerald additions, amber modifications, and rose deletions, a header with severity badge, entity key in monospace, and migration directive, and a side drawer with the diff's reasoning (FR-044, UX-DR21)

**Given** diff lines
**When** read by assistive technology
**Then** additions and removals announce themselves via aria-labels, and the severity badge announces its level (UX-DR34)

**Given** the diff inspector's labels
**When** reviewed
**Then** they describe the shipped mechanism — "semantic diff" — and the word "AST" appears nowhere in the UI until AST diffs ship (FR-021, UX-DR21)

**Given** a viewport under 768 px
**When** a diff renders
**Then** it switches to a unified inline diff (UX-DR21, UX-DR36)

**Given** an entity view
**When** rendered
**Then** it offers a copy-ready cURL snippet for the entity and its diffs through `CopyButton` (FR-113)

**Given** a defunct or unstable source
**When** its entity renders
**Then** the state is shown with its last valid version flagged, matching the API (EC-603, EC-602)

### Story 6.4: Playground with measured token economics and the activation funnel

As a new signup,
I want to paste a URL, watch it distill, and see exactly what it cost and saved,
So that I reach my first refined query in minutes and trust the numbers.

**Acceptance Criteria:**

**Given** `/playground`
**When** rendered
**Then** it is a 50/50 split with a URL input that accepts auto-paste, a target-schema dropdown that auto-selects when the URL's host matches a template's example sources, an instructions textarea, and a "Refine at Edge" primary button bound to `⌘Enter` (UX-DR20, FR-112)

**Given** a refine in progress
**When** the request runs
**Then** the input card shows the laser sweep and pulsing badge, the button reads "Refining at Edge…" with a live elapsed-millisecond counter, and no stage transition is displayed that the client cannot know (UX-DR15, NFR-003)

**Given** a completed refine
**When** the result renders
**Then** the right panel offers tabs for Structured JSON, Validation, Token Economics, and Raw Source (the raw snapshot fetched from an owner-scoped run endpoint added here), the metrics bar shows measured latency, per-stage timings from the run record, input and output tokens, reduction against both baselines, and the ledger cost from the response, and `CopyButton` copies the JSON (FR-005, FR-112, UX-DR18, AD-12)

**Given** a quarantined result
**When** it renders
**Then** the card shows the rose border and amber badge with the error-path locator, failing lines highlighted in the payload, and copy that names the failing path and that the entity was saved as invalid (UX-DR15, FR-002)

**Given** a successful refine
**When** the user clicks "Track this source"
**Then** a pipeline is created for that URL and schema through the pipelines endpoint, replacing the prototype's "Save to Workspace Corpus" (FR-010)

**Given** an over-quota user
**When** they refine
**Then** the global 402 banner appears with the exact remediation paths, and browsing surfaces remain usable (UX-DR15, FR-067)

**Given** the activation funnel
**When** a user signs up, creates a key, runs a first refine, copies an MCP config, or has their first MCP call recorded server-side
**Then** each event reaches `POST /api/v1/telemetry/events` (session principal, never ledgered) with timestamps and the signup source, and the metrics service can compute time-to-first-refined-query, MCP-connection rate, and bailout rate from them (FR-114, ADV-M5)

**Given** a first Studio visit
**When** the onboarding modal appears
**Then** it asks once how the user found the product with registry and badge options, stores the answer as a telemetry event, and never blocks the playground (ADV-M5)

**Given** the workspace's aggregate token savings from the usage endpoint
**When** displayed
**Then** the figure is the ledger-derived measurement, or nothing is shown (FR-005, NFR-003)

### Story 6.5: MCP Hub, help center, and copy-ready snippets

As a developer in an agentic IDE,
I want one-click MCP configuration, a tool tester, and quickstarts with copy-ready snippets,
So that connecting my IDE takes one paste and no guesswork.

**Acceptance Criteria:**

**Given** `/mcp`
**When** rendered
**Then** config generators for Cursor, Claude Code, Claude Desktop, and Windsurf produce the exact JSON for this workspace's MCP endpoint using a key the user selects or pastes, plus the OAuth connection instructions, each with `CopyButton`, and copying records the funnel event (FR-111, UX-DR27)

**Given** the tool tester
**When** the user pastes a workspace key held in browser memory only
**Then** they can run `initialize`, `tools/list`, and `tools/call` against the authenticated MCP endpoint and see the JSON-RPC response with measured round-trip time (UX-DR27, NFR-003)

**Given** `/help`
**When** rendered
**Then** it offers guided quickstarts for MCP, REST, Studio, marketplace, and export, links the published OpenAPI document and MCP manifest, provides cURL snippets throughout, and states the launch posture plainly: no PHI processing, no BAA, no data residency, and the accuracy disclaimer (FR-110, FR-113, NFR-032, NFR-033, NFR-035, UX-DR28)

**Given** the SDK section of `/help`
**When** rendered before Epic 11 ships
**Then** it shows the REST quickstart and marks SDK packages as forthcoming rather than advertising unpublished packages (FR-122, PD-13)

**Given** every code block, cURL command, and config snippet in Studio
**When** rendered
**Then** it uses monospace and includes the `CopyButton` with checkmark feedback (UX-DR13, UX-DR19)

**Given** the Elena journey
**When** the end-to-end test runs on staging
**Then** it copies the Claude Code config from `/mcp` with the active workspace credential, filters `/dev` by package, opens the time-travel diff showing the breaking removal with its migration snippet, runs "Test with MCP", and receives the structured payload with measured latency — no hardcoded domain or fabricated timing anywhere in the flow (UX-DR37, NFR-003)

### Story 6.6: Members, keys, pipelines, and webhook management

As a builder,
I want to manage my team, keys, scheduled pipelines, and webhook subscriptions from Studio,
So that the refinery's dependency features are usable without the API.

**Acceptance Criteria:**

**Given** workspace settings
**When** an OWNER opens members
**Then** they can invite by email with a role, change roles, and remove members with confirmation, the last OWNER cannot be removed, and non-OWNERs see the list read-only (FR-052)

**Given** the API keys panel
**When** a MEMBER or higher creates a key
**Then** the key is shown once in monospace with `CopyButton` and a warning, the list shows prefix, last four, scope, and last-used, and revoke asks for confirmation (FR-050, NFR-023)

**Given** the pipelines view
**When** a BUILDER or higher creates one
**Then** they pick a schema, add sources or a connector, choose an interval, optionally set a notification target, and the list shows enabled state, last run, staleness, defunct or unstable flags, and pause reasons; VIEWERs cannot edit (FR-011, UX-DR11)

**Given** the webhooks view
**When** a BUILDER or higher creates a subscription
**Then** they choose HTTPS, Slack, Discord, or Telegram, set event-type and entity filters, see the current match count with a zero-match warning, receive the signing secret once, and can send a test event (FR-022, UX-DR31)

**Given** a subscription's delivery history
**When** opened
**Then** it lists attempts with status and response codes, a paused subscription shows its cause and a Revive button that triggers replay, and the burst-cap digest state is visible (FR-022, UX-DR31)

**Given** any of these lists with no items
**When** rendered
**Then** the `EmptyState` component appears with one sentence, one action, and the `N` shortcut hint (UX-DR15)

### Story 6.7: Billing, wallets, and agent governance views

As a workspace owner or fleet operator,
I want to see my plan, fund a wallet, mint and kill agent tokens, and watch spend in real time,
So that billing is never a surprise and a runaway agent is one click from stopped.

**Acceptance Criteria:**

**Given** `/billing`
**When** an OWNER opens it
**Then** plans render from the public plans endpoint with prices per unit type, upgrade and checkout hand off to Stripe, the customer-portal link manages cards, and the current subscription state including grace is shown honestly (FR-061, FR-066)

**Given** the wallet card
**When** rendered
**Then** the balance shows in USD to four decimals from micro-USD, top-up hands off to Stripe Checkout, and the alert threshold is editable (FR-063, UX-DR17)

**Given** the agent tokens panel
**When** an OWNER or BUILDER creates a token
**Then** they set a name, daily spend limit, and alert threshold, the token is shown once with `CopyButton`, and the list shows status, spend today, and last-used (FR-064)

**Given** a token row
**When** the user clicks Kill, Reinstate, or Revoke
**Then** a confirmation modal names the consequence, and the Emergency Kill-Switch button suspends every token after an explicit confirmation, stating that no data is deleted (FR-064, UX-DR29, UX-DR39)

**Given** the live ledger ticker
**When** rendered
**Then** it polls the usage endpoint and shows each deduction with its unit type and price, remaining quota, and the `asOf` freshness stamp — no websocket is claimed (FR-065, UX-DR29)

**Given** the x402 view
**When** rendered
**Then** it lists account-less payments by reference from the ledger when the feature is enabled, or explains that it is disabled (FR-062)

**Given** a wallet below its threshold or a 402 anywhere in Studio
**When** displayed
**Then** the remediation path and top-up button appear immediately — billing state is never concealed (UX-DR16, UX-DR17)

### Story 6.8: Public landing page with measured claims only

As a visitor,
I want a landing page that shows what the refinery does with an honest demo and real pricing,
So that I understand the product in one animation and never read a fabricated number.

**Acceptance Criteria:**

**Given** the landing route on the web worker
**When** rendered
**Then** the animated raw-HTML-to-JSON before-and-after demo and the particle/lattice canvas are ported from the prototype as components with the debounced, GPU-friendly behavior preserved, and both respect reduced motion (UX-DR32)

**Given** the metric strip
**When** rendered
**Then** it shows only values fetched from the corpus overview and telemetry-backed public metrics, or is omitted entirely; a CI lint fails on the retired strings ("sub-20ms", "99.998%", "330", "zero hallucination", "100% deterministic") anywhere in `apps/web` (NFR-003, PD-12)

**Given** the pricing section
**When** rendered
**Then** it reads the public plans endpoint and labels introductory pricing per the catalog, with no hardcoded dollar figures (FR-061)

**Given** the brand
**When** rendered
**Then** the product name, domain, and slogan come from configuration pending OQ-1, and the call to action leads to signup with the referral parameter (ADV-M5)

**Given** the page
**When** audited
**Then** it meets WCAG AA contrast, renders without JavaScript errors on mobile Safari, and contains no link to unpublished packages or retired surfaces (UX-DR3, PD-13)

## Epic 7: Visual Schema Studio — build, test, and publish your own schemas

A builder designs a schema visually or in raw JSON, tests it on a live URL, publishes it to provision its MCP tool and REST access, and shares it as a cloneable public blueprint that other workspaces clone as independent snapshots. Covers FR-040–FR-043; carries UX-DR24, UX-DR38, NFR-025 (per-schema tool isolation); binds AD-6 (tenant-owned documents), AD-8 (live preview renders compiler output), AD-16 (single compiler). The schema kernel and compiler already exist from Story 2.1; this epic adds authoring, testing, publishing, and sharing. Checkpoint carried from the spec slate: spec review before 7.1. Assumptions: a live-URL test bills as a `refinement` act against the workspace's quota, with a per-workspace daily free-test allowance as a configuration lever defaulting to zero — the open decision from the requirements inventory, resolved this way unless you flip the lever; published schema versions are immutable and edits create a new version, with entities recording the version they were validated against; deleting a schema that pipelines depend on requires explicit confirmation and pauses those pipelines; a clone records its source slug and version, and a platform blueprint's compliance update raises a notice to clone owners with one-click re-sync deferred.

### Story 7.1: Custom schema authoring API — drafts, versions, publish, provisioning, and blueprints

As a builder,
I want to create and version my own schemas, publish them so my agents get a tool and my API gets a slug, and optionally share them as blueprints,
So that the refinery speaks my domain, not just the six templates.

**Acceptance Criteria:**

**Given** a BUILDER or higher
**When** they call `POST /api/v1/schemas` with a name, slug, and canonical document
**Then** the document is validated against the meta-schema, rejected with `SCHEMA_INVALID` and the violating path when out of profile, stored as a `draft` tenant resource under the workspace scope, and audited (FR-040, AD-6, AD-16)

**Given** an existing schema
**When** a BUILDER or higher updates its document
**Then** a draft of the next version is written — a published version is never mutated — and entities keep the version they were validated against (FR-040)

**Given** a draft
**When** `POST /api/v1/schemas/{slug}/publish` is called
**Then** the compiler runs once to produce the validator, MCP `inputSchema`, and OpenAPI component, the version becomes `published`, the MCP tool `custom_<slug>` appears in the workspace's `tools/list` at the next request, `POST /api/v1/refine` accepts the slug for that workspace, and `schema.published` is audited (FR-042, AD-8, AD-16)

**Given** a slug whose generated tool name collides with an existing tool visible to the workspace
**When** publish is attempted
**Then** it fails closed with `SCHEMA_TOOL_NAME_CONFLICT` and a suggested slug (FR-042, EC-802)

**Given** a published tenant schema
**When** another workspace calls `tools/list`, `GET /api/v1/schemas/{slug}`, or refine with that slug
**Then** the tool is absent, the schema returns 404, and refine returns 404 — a test in the NFR-025 suite proves it on REST and MCP (FR-050, NFR-025)

**Given** a BUILDER or higher
**When** they set a schema's visibility to `blueprint`
**Then** the document becomes readable to every workspace as a public blueprint, the change is audited, and switching back to `private` stops new clones without touching existing ones (FR-043)

**Given** any workspace's BUILDER or higher
**When** they call `POST /api/v1/schemas/{slug}/clone` on a blueprint
**Then** an independent copy is created in their workspace as a draft recording the source slug and version, and later changes to the source never propagate (FR-043, EC-504)

**Given** a platform blueprint whose compliance guardrail text is republished
**When** the new version publishes
**Then** every workspace holding a clone receives a `schema.blueprint_updated` notice naming the change, and the clone is left untouched (FR-012, EC-504)

**Given** a schema with active pipelines
**When** a BUILDER or higher deletes it
**Then** the request requires an explicit confirmation flag, the pipelines pause with a visible reason, the schema is soft-deleted, and the action is audited (FR-040)

**Given** `GET /api/v1/schemas/{slug}/preview`
**When** called for a draft or published version
**Then** it returns the compiler's three outputs plus the generated tool name for the builder's live preview — the same function, not a second rendering path (FR-042, AD-8)

**Given** `GET /api/v1/schemas/{slug}/entities`
**When** called by a VIEWER or higher
**Then** it lists entities refined against that schema within the caller's scope with cursor pagination and one `cached_read` ledger row per request (AD-6, AD-11)

### Story 7.2: Live-URL schema testing

As a builder,
I want to run my draft schema against a real URL before I publish it,
So that I know it extracts what I expect without polluting my corpus.

**Acceptance Criteria:**

**Given** a BUILDER or higher
**When** they call `POST /api/v1/schemas/test` with a URL and either a draft slug or an inline document
**Then** the single chain runs in-request in `test` mode through the policed fetch port, extracts with fenced content, and validates against the compiled candidate document (FR-041, AD-3, AD-14, AD-16)

**Given** a test run
**When** it completes
**Then** the store filter writes no corpus entity and no version, the run record is created with mode `test` under the workspace scope, and the response returns the extracted data, validation status with failing paths, provenance, measured latency, and token economics (FR-041, AD-3)

**Given** a test that fails validation
**When** it returns
**Then** the failing paths are reported, the raw and model artifacts are quarantined under the run with the shorter test-retention rule, and no change event is produced (AD-9, AD-12)

**Given** a test run
**When** admission runs
**Then** it is classified as a `refinement` act against the workspace's quota unless the workspace's daily free-test allowance from configuration covers it, and the ledger row is marked `test` so usage views can separate it (AD-11, F7 preamble)

**Given** an over-quota workspace with no remaining allowance
**When** a test is attempted
**Then** the standard 402 is returned before any fetch (FR-067)

**Given** a test target
**When** it is opted out, paced, or fails SSRF policy
**Then** the same `REFINE_` errors apply as for any refinement (AD-14)

### Story 7.3: Visual builder with raw-JSON mode, live preview, test drawer, and publish flow

As a data engineer,
I want to build a schema by dragging in properties or editing JSON, see the compiled tool as I type, test it on a live URL, and publish it as an MCP tool,
So that a new extraction target is live for my agents in minutes.

**Acceptance Criteria:**

**Given** `/schemas`
**When** a BUILDER or higher opens it
**Then** the layout is 25 % tree navigation (own schemas, drafts, platform blueprints), 45 % visual builder, 30 % live preview at desktop widths; tablet collapses to tabs (Visual | Output); mobile shows a message directing editing to desktop (UX-DR24, UX-DR36)

**Given** the visual builder
**When** a user adds a property
**Then** the row offers name, type (String, Number, Boolean, Array<T>, Object, Enum), required checkbox, and validation rules (min, max, pattern, enum values), nested objects and arrays are editable, and every edit updates the canonical document locally with no latency (UX-DR24, FR-040)

**Given** raw-JSON mode
**When** the user edits the canonical document directly
**Then** the visual tree reflects it instantly, an out-of-profile keyword shows the meta-schema error at its path, and no TypeScript, Zod, or other dialect is accepted as input (UX-DR24, AD-16)

**Given** the live preview drawer
**When** the document changes
**Then** it debounces a call to the preview endpoint and renders the validator status, the generated MCP tool definition with its `custom_<slug>` name, and the OpenAPI component; any TypeScript-style rendering is derived from the compiler output and labeled display-only (FR-042, AD-8)

**Given** the Test on Live URL drawer
**When** the user pastes a URL and runs the test
**Then** the result renders like the playground — structured JSON, validation with failing lines highlighted, measured latency and token economics — with a note that the test counts against on-demand quota unless covered by the allowance (FR-041, UX-DR15)

**Given** the action bar
**When** the user clicks Save Draft
**Then** the draft persists via the schemas API and the tree shows its version (FR-040)

**Given** the action bar
**When** the user clicks Publish as MCP Tool
**Then** a modal confirms the auto-generated tool name, description, and workspace scope, a collision offers a rename, and on confirm the schema is published and the modal shows the tool as live in `tools/list` with a `CopyButton` for the MCP config (FR-042, UX-DR24, UX-DR38)

**Given** a published schema
**When** the user toggles Blueprint visibility
**Then** a confirmation explains that any workspace can clone the document, and the blueprint gallery in the tree lets any BUILDER clone platform or community blueprints into their workspace (FR-043)

**Given** a clone of a platform blueprint
**When** a compliance-update notice exists for it
**Then** a banner shows the notice with a link to the new version (EC-504)

**Given** the Marcus journey
**When** the end-to-end test runs on staging
**Then** it creates `b2b_saas_pricing` with `product_name`, `billing_period` enum, and `tiers` array of objects, watches the preview compile, tests a fixture URL to 100 % conformance, publishes, and finds the tool in the workspace's `tools/list` (UX-DR38)

**Given** the builder surfaces
**When** navigated by keyboard
**Then** `⌘Enter` runs the active test, `Esc` closes drawers, every control is reachable, and focus is trapped in modals (UX-DR12, UX-DR33)

## Epic 8: Operations Console — govern customers, fleets, and pricing on real telemetry

An MFA-gated admin governs customers and agent fleets, grants audited courtesy credits, reads analytics computed from telemetry, queries the audit stream, and edits plans without a deploy; the public status page reflects measured availability. Covers FR-070–FR-074; carries NFR-003 (measured-only publication), NFR-010 (status page), NFR-040, NFR-041, NFR-042 (drift monitoring); binds AD-6 (audited admin scope), AD-7 (admin clauses), AD-11 (courtesy actions as compensating events), AD-13. No spec-slate checkpoints fall here. Assumptions: per-request telemetry is sampled into D1 and rolled up by cron into per-route, per-hour aggregates, which stays inside the spine's named primitives — Workers Analytics Engine is noted in the architecture memlog as a possible amendment; public latency figures appear on the status document only after a configured telemetry window, behind a flag; Stripe price ids are entered as data in the plan editor and validated against Stripe rather than created by the platform; availability is measured from a cron health sampler; incidents are declared manually by admins; admin sessions require a per-session MFA step-up.

### Story 8.1: Platform admin role with MFA, bootstrap runbook, and the audited admin scope

As a co-founder operating the platform,
I want admin to be a role on my own account behind a second factor, granted only by another admin and bootstrapped by a runbook,
So that operator access is real, personal, and auditable — never a shared passcode.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `user_roles` (user, role, `granted_by`, `granted_at`, `revoked_at`) and the Better Auth TOTP tables, and a CI grep guard fails on any `passcode` identifier or literal in source, seeds, or the SPA (FR-070, NFR-022, PD-3)

**Given** a user with the `platform_admin` role
**When** they sign in
**Then** the role activates only after TOTP enrollment and a per-session second-factor step-up, `GET /api/v1/me` reports `isAdmin` only for such a session, and sessions rotate on the privilege change (AD-7)

**Given** an existing admin
**When** they call `POST /api/v1/admin/admins` or the revoke counterpart for another user
**Then** the grant or revocation is written with the actor and an `admin.role_granted` or `admin.role_revoked` audit row; no other path — env flag, seed migration, plan tier, or key type — can confer the role (AD-7)

**Given** an empty environment
**When** the first admin is needed
**Then** a documented operational runbook executes a single D1 statement through `wrangler d1 execute` against the target environment and records the action in `audit_events`; no code path performs the bootstrap (AD-7)

**Given** any request to `/api/v1/admin/*`
**When** it carries an API key, agent token, or MCP token
**Then** the response is 403 `AUTH_SESSION_REQUIRED` — admin surfaces accept Studio sessions only (AD-7)

**Given** `core/tenancy.mintAdminScope(principal)`
**When** called for an admin session
**Then** it returns the admin scope and appends an `admin.scope_minted` audit row with route and reason; called for any other principal it throws `TENANT_FORBIDDEN`, and a test proves admin routes cannot read cross-tenant data without the minted scope (AD-6)

**Given** the break-glass scenario of both founders locked out
**When** the runbook is consulted
**Then** it documents the recovery procedure as an operational process, not an application feature (AD-7)

### Story 8.2: Customer and fleet governance with audited courtesy actions

As a platform operator,
I want to find any customer or agent fleet, suspend, revoke, or kill when needed, and grant credits with a reason,
So that support and abuse response happen through the product with a full trail.

**Acceptance Criteria:**

**Given** an admin session
**When** it calls `GET /api/v1/admin/workspaces` with search filters
**Then** results are read through the minted admin scope with cursor pagination and show plan, subscription state, wallet balance, token counts, pipeline counts, and usage for the period (FR-071, AD-6)

**Given** a workspace detail
**When** opened by an admin
**Then** it lists members, keys, agent tokens, pipelines, subscriptions, and recent ledger events, all read at admin scope with an audit row per detail view (FR-071)

**Given** an admin
**When** they suspend or unsuspend a workspace, revoke a key, or kill an agent token
**Then** every principal of a suspended workspace fails at its next request with `TENANT_SUSPENDED`, each action requires a reason and appends an `admin.*` audit row with actor, target, reason, and `requestId`, and the kill uses the same core path as the owner's kill-switch (FR-071, AD-7)

**Given** an admin
**When** they grant courtesy quota or a wallet credit with a mandatory reason
**Then** `core/metering` appends a `courtesy_quota` or `courtesy_credit` compensating ledger event through the admin authority path together with its audit row, the credit is visibly distinct from paid transactions in the workspace's usage view and ledger, and no customer-facing endpoint can produce these event kinds (FR-071, FR-065, AD-11)

**Given** a refund request for an unspent wallet balance
**When** an admin approves it
**Then** the refund is initiated through the Stripe adapter and the wallet is debited only when the verified refund event arrives as a compensating event — never by direct edit (AD-11, AD-15, EC-109)

**Given** the last-OWNER recovery case
**When** an admin executes the operator-assisted ownership transfer
**Then** a new OWNER membership is written with an audit row naming the request (EC-507)

**Given** every admin action
**When** logged
**Then** the audit row is the record and Workers logs carry only diagnostics (AD-11, Logging convention)

### Story 8.3: Telemetry-derived analytics, drift monitoring, and reconciliation review

As a co-founder,
I want console analytics, corpus-health signals, extraction-drift trends, and reconciliation findings computed from what the platform actually measured,
So that every number I make decisions on is real.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `telemetry_samples` (sampled per-request route, latency, status, principal type, serve source, timestamp), `telemetry_rollups` (route, hour, count, p50, p95, error rate, cache-hit ratio), and `health_samples` (component, timestamp, ok, latency) (NFR-040)

**Given** any request
**When** it completes
**Then** a sample is written at the configured sampling rate inside `waitUntil` — permitted because telemetry is diagnostics — and a cron rolls samples into hourly aggregates (NFR-040, State-mutation convention)

**Given** `GET /api/v1/admin/analytics`
**When** an admin calls it
**Then** latency p50 and p95 per route, error rates, cache-hit ratio derived from serve descriptors, usage per unit type, revenue from ledger sums, active workspaces, and corpus health come only from rollups, run rows, and the ledger; a test against an empty database returns zeros or nulls and never a constant (FR-072, NFR-003, PD-12)

**Given** the activation and stickiness metrics
**When** computed
**Then** time-to-first-refined-query, MCP-connection rate, discovery-funnel attribution, bailout count and rate, week-4 retention, and dependency signals (pipelines and subscriptions per active workspace) derive from telemetry events, run rows, and audit rows per PRD §5 (FR-114)

**Given** the counter-metrics
**When** computed
**Then** cost per query versus price per unit type, free-tier abuse signals, opt-out request counts, and extraction error reports are exposed alongside the growth metrics (NFR-050, PRD §5)

**Given** extraction runs
**When** drift monitoring runs on schedule
**Then** validation pass-rate trends per source and per model are computed from run rows, a drop below the configured threshold raises an operator alert, and the trend is queryable by the console (NFR-042)

**Given** missed refreshes and defunct or unstable sources
**When** the alerts view is read
**Then** they are listed from the events recorded in Epic 3 with links to the affected pipelines (NFR-011)

**Given** reconciliation reports from Story 5.5
**When** an admin reviews one
**Then** each discrepancy shows its classification, the admin can resolve it with a courtesy action or a note, and the resolution is audited (EC-205)

**Given** the `PUBLISH_LATENCY` flag
**When** enabled after the configured telemetry window
**Then** `GET /api/v1/status` includes cached-read p50 and p95 computed from rollups, and nothing else about performance is published anywhere (NFR-001, NFR-003)

### Story 8.4: Pricing-plan editor, audit stream explorer, and the public status page

As a co-founder,
I want to change plans and prices without a deployment, search the audit trail, and run a status page that reports measured availability,
So that pricing, accountability, and transparency are operational rather than engineering tasks.

**Acceptance Criteria:**

**Given** an admin
**When** they create a new pricing-config version with per-unit prices and per-plan quotas
**Then** validation applies the measured cost floor from Story 5.5, activation flips the active pointer with an audit row, subsequent ledger rows carry the new version, and historical rows are untouched (FR-074, AD-11, NFR-050)

**Given** the plan catalog editor
**When** an admin adds, renames, or retires a plan
**Then** the Stripe price id is entered as data and validated against Stripe for existence and amount, an in-use plan can be retired from sale but never deleted, edits apply to new subscriptions unless an explicit migration with notice is executed, and every change is audited (FR-061, FR-074, EC-304)

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `incidents` (title, status, component, started, resolved, notes) (NFR-010)

**Given** `GET /api/v1/admin/audit`
**When** an admin queries by workspace, principal, event type, or time range
**Then** results are cursor-paginated newest first and read-only (FR-073, NFR-041)

**Given** `GET /api/v1/audit`
**When** a VIEWER or higher calls it
**Then** they see their own workspace's audit events only — auth, billing and wallet, pipeline runs, role changes, and denials — per the FR-052 matrix (FR-073, FR-052)

**Given** the cron health sampler
**When** it runs
**Then** it probes D1, KV, R2, Vectorize, the AI binding, and the refine route on schedule and writes `health_samples`, from which availability over the trailing window is computed (NFR-010, NFR-003)

**Given** the public `/status` page on the web worker
**When** rendered
**Then** it shows component health from the status document, measured availability over the trailing window with the measurement method stated, current and past incidents, and no SLA or contractual language (NFR-010, NFR-013)

**Given** an admin
**When** they declare, update, or resolve an incident, trigger dispatch for a pipeline, or purge and rebuild a KV or Vectorize projection
**Then** each action is audited and the rebuild uses the projection rebuild path from Epics 2 and 4 (AD-12)

### Story 8.5: Operations console views in Studio

As a platform operator,
I want the console surfaces in Studio behind my admin session,
So that governance, analytics, pricing, and incidents are one cockpit away.

**Acceptance Criteria:**

**Given** `/management`
**When** a non-admin session or any non-session principal reaches it
**Then** the route is absent from navigation and the page renders a 404 state, matching the API's refusal (UX-DR11, AD-7)

**Given** an admin session without the step-up
**When** `/management` loads
**Then** it prompts for the TOTP second factor before any console data is requested (AD-7)

**Given** the customers and fleets view
**When** rendered
**Then** it searches workspaces, opens the detail with members, keys, tokens, pipelines, subscriptions, and ledger events, and every governance action opens a confirmation modal that captures the mandatory reason (FR-071, UX-DR30)

**Given** the courtesy-action modal
**When** an admin grants quota or credit
**Then** it shows the resulting ledger event kind and warns that the grant is visible to the customer as a courtesy (FR-071)

**Given** the analytics view
**When** rendered
**Then** every tile and chart binds to the analytics endpoint, shows the measurement window, renders an explicit "no data yet" state instead of a placeholder value, and the corpus-health and activation tiles use the token palette (FR-072, NFR-003, UX-DR18)

**Given** the drift, alerts, and reconciliation views
**When** rendered
**Then** trends show per source and model with thresholds, alerts link to pipelines, and reconciliation discrepancies expose their resolution actions (NFR-042, EC-205)

**Given** the pricing editor view
**When** an admin edits a config version or plan
**Then** the form validates against the cost floor before submit, shows the diff from the active version, and requires confirmation naming that the change applies without deployment (FR-074)

**Given** the audit explorer view
**When** rendered
**Then** filters by workspace, principal, type, and time drive the admin audit endpoint with cursor pagination and monospace identifiers (FR-073, UX-DR19)

**Given** the incidents and operations view
**When** rendered
**Then** admins declare and resolve incidents, trigger dispatch, and rebuild projections, each behind a confirmation modal (NFR-010, AD-12)

## Epic 9: Marketplace — install creator listings, earn from your own

A customer browses and installs creator listings; a creator prices a listing within bounds and watches an 80/20 accrual ledger with holdback, self-dealing exclusion, and chargeback clawback; featured and leaderboard curation ranks revenue-qualified usage. Covers FR-080–FR-084; carries UX-DR25, NFR-025 (grant-scope isolation), NFR-030/032 (listing content rules); binds AD-6 (grant scope minted by `core/marketplace`), AD-11 (`lst_` attribution and split basis), AD-16 (listed schemas are canonical documents). Stripe Connect payouts stay a Phase 3 fast-follow; accrual is the launch mechanism. Checkpoint carried from the spec slate: spec review before 9.1. Assumptions: usage of a priced listing draws the buyer's wallet at the listing price per unit type and never consumes plan quota, while free listings consume quota like any query — this is how "revenue actually collected" becomes attributable per query; price bounds floor at the platform's base price per unit type so a listing can never earn below its serving-cost class; installing a listing is a BUILDER+ action because it provisions a tool, and using an installed item is MEMBER+; the holdback window defaults to 30 days; the six vertical templates ship as platform-published free listings for cold-start supply; the publication content check is rule-based at launch (no model-based moderation).

### Story 9.1: Listings, pricing within bounds, installs, and the marketplace grant scope

As a creator,
I want to publish a schema or a feed as a listing with my own price, and as a customer I want to install one and use it under my workspace,
So that useful extraction targets spread beyond the workspace that built them.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `marketplace_listings` (`lst_` id, creator scope `platform` or workspace, kind `schema`/`feed`, source schema id and version snapshot or pipeline id, title, description, price per unit type in micro-USD, status `draft`/`published`/`retired`/`removed`, featured flag, timestamps) and `listing_installs` (installer workspace, listing, version snapshot, max-price guard, status, timestamps) (FR-080, AD-6)

**Given** a BUILDER or higher in the creator workspace
**When** they create a listing from a published schema or a pipeline
**Then** the listing snapshots the schema version or binds the pipeline, and a schema with `blueprint` visibility cannot become a priced listing nor a priced listing's schema become a blueprint — one or the other (FR-080, EC-402)

**Given** a listing price per unit type
**When** it is set
**Then** it must fall within the platform bounds from the active pricing config — floor at the base price for that unit type, cap as configured — or the request fails `MARKET_PRICE_OUT_OF_BOUNDS` (FR-083)

**Given** publish
**When** called on a draft listing
**Then** a rule-based content check rejects listings whose schema or sources target login-gated content or personal data and requires guardrail fields for regulated-domain templates, returning `MARKET_CONTENT_REJECTED` with the reason; on success the listing is `published` and audited (NFR-030, NFR-032, EC-406)

**Given** a VIEWER or higher
**When** they call `GET /api/v1/marketplace/listings` or a listing detail
**Then** published listings are cursor-paginated with filters for kind, vertical, and price, showing creator, price per unit type, install count, and revenue-qualified query count (FR-080, FR-084)

**Given** a BUILDER or higher in another workspace
**When** they install a listing
**Then** an install row snapshots the listing version, a schema listing's tool appears in the installer's `tools/list` as `mkt_<slug>` and its slug is accepted by refine for that workspace, and the install is audited (FR-080, FR-042)

**Given** an installed feed listing
**When** the installer reads corpus entities, search, or the change feed
**Then** `core/marketplace.mintGrantScope(installer, listing)` runs the active-install check and returns a grant scope exposing only the listed projection with the `lst_` reference recorded into the serve descriptor, and `core/tenancy` composes the union platform + own + granted (AD-6)

**Given** a workspace without an active install
**When** it reads a feed's entities or calls `mkt_<slug>`
**Then** the response is 404 with a `tenancy.denied` audit row, and the NFR-025 suite proves it on REST and MCP (NFR-025)

**Given** an installer
**When** they uninstall
**Then** the grant and tool disappear at the next request and the install row is marked uninstalled (AD-7)

**Given** the seed script
**When** it runs per environment
**Then** the six vertical templates exist as platform-published free listings — the marketplace's cold-start supply (FR-012, PRD §6 Phase 1)

### Story 9.2: Attribution, 80/20 accrual, and fraud controls

As a creator,
I want every paid use of my listing to accrue my share into a ledger I can inspect, with self-dealing excluded and chargebacks clawed back,
So that the marketplace pays for real value and cannot be pumped.

**Acceptance Criteria:**

**Given** a serve through an installed listing
**When** `core/metering` prices the act
**Then** it uses the listing's price for the classified unit type, draws the buyer's wallet for a priced listing or the buyer's quota for a free listing, and writes the ledger row with the `lst_` reference, the split basis, and the creator's share in micro-USD frozen at serve time (FR-081, AD-11, AD-15)

**Given** a buyer principal whose workspace, keys, agent tokens, or wallet belong to the listing's creator
**When** the act is priced
**Then** the split basis is `self_dealing`, the creator share is zero, and the row is excluded from revenue-qualified counts (FR-082, FR-084)

**Given** the `creator_accruals` projection (per listing, unit type, period: accrued, held, released, clawed back)
**When** rebuilt from `usage_events`
**Then** it matches exactly, proven by a corrupt-and-rebuild test (AD-11, AD-12)

**Given** an accrual
**When** its holdback window from configuration elapses
**Then** it moves from `held` to `released` and stays in the ledger — no payout occurs at launch (FR-082)

**Given** a verified chargeback on a buyer's top-up
**When** the compensating event lands
**Then** clawback rows attributed to the affected listings reduce accrued or future earnings, and a negative balance offsets later accruals (FR-082, AD-11)

**Given** the creator workspace's OWNER
**When** they call `GET /api/v1/marketplace/earnings`
**Then** they see per-listing, per-unit-type accruals with held, released, and clawed-back amounts, the public accrue-now, pay-soon notice text, and cursor-paged ledger events (FR-082, FR-065)

**Given** a listing's revenue-qualified query count
**When** computed
**Then** it counts only rows with collected revenue and excludes self-dealing (FR-084)

**Given** the reconciliation job from Story 5.5
**When** it runs
**Then** creator accruals are included, and the sum of creator shares never exceeds 80 % of collected listing revenue for the period (FR-081)

**Given** the workspace-deletion precondition registry
**When** this story lands
**Then** it registers a condition requiring the workspace's listings to be retired first (EC-501)

### Story 9.3: Listing lifecycle, price-change notice, moderation, and curation

As a customer who installed a listing,
I want retirement, price increases, and takedowns to never break me silently,
So that a dependency on someone else's schema is safe to build on.

**Acceptance Criteria:**

**Given** a creator
**When** they retire a listing or delete its underlying schema
**Then** the listing delists from browse, existing installs keep working on their snapshot, installers receive a `marketplace.listing_retired` notice, and the action is audited (EC-401)

**Given** a creator
**When** they raise a listing's price
**Then** the increase takes effect after the configured notice period, installers are notified with the effective date, and a decrease applies immediately (FR-083, EC-403)

**Given** an installer
**When** they set a max-price guard on an install
**Then** a serve whose listing price exceeds the guard is refused with `MARKET_PRICE_GUARD` before any work (EC-403)

**Given** any authenticated user
**When** they report a listing
**Then** a `listing_reports` row with reason is created — the only table this story adds — and surfaced to admins (EC-406)

**Given** an admin session
**When** it removes a listing
**Then** the listing becomes `removed`, installs pause with the stated reason, installers are notified, and the takedown is audited (EC-406, AD-7)

**Given** an admin session
**When** it sets or clears the featured flag
**Then** the change is audited and browse ordering reflects it (FR-084)

**Given** the leaderboard ordering
**When** listings are ranked
**Then** the rank uses revenue-qualified query counts over the trailing window, excludes self-dealing, and ties break by install count (FR-084)

**Given** a listing detail
**When** viewed
**Then** feed listings show a sample of their entities through the listed projection at no charge, and schema listings show the compiled tool definition (FR-080, AD-8)

### Story 9.4: Marketplace views in Studio

As a customer and as a creator,
I want to browse, install, publish, price, and watch earnings from Studio,
So that the marketplace is a place, not an API.

**Acceptance Criteria:**

**Given** `/marketplace`
**When** rendered
**Then** it shows verified (platform) and community listings with filters, featured and leaderboard sections, and each card shows price per unit type in monospace with the sample or install counts (UX-DR25, UX-DR19)

**Given** a listing detail
**When** a BUILDER or higher clicks Install
**Then** a confirmation names the price per unit type and that priced usage draws the wallet, offers a max-price guard, and on confirm shows the `mkt_<slug>` tool with a `CopyButton` for the MCP config (FR-080, UX-DR13)

**Given** the installed listings view
**When** rendered
**Then** it lists installs with version, guard, uninstall, and any retirement, price-change, or takedown notices (EC-401, EC-403, EC-406)

**Given** the creator dashboard
**When** a BUILDER or higher creates a listing
**Then** they pick a published schema or pipeline, set the price with the bounds shown, and publish; content-check rejections show the reason (FR-083, EC-406)

**Given** the earnings view
**When** the creator workspace's OWNER opens it
**Then** it shows accrued, held, released, and clawed-back amounts per listing and unit type, the accrue-now, pay-soon notice, and the ledger events with `asOf` freshness (FR-082)

**Given** a listing card or detail
**When** the listing is a regulated-domain template
**Then** its display copy carries the guardrail text (FR-012)

**Given** any empty list
**When** rendered
**Then** the `EmptyState` component appears with one action (UX-DR15)

## Epic 10: Fine-Tuning Export — turn your corpus into training data

A member exports an entitled corpus slice, including diff-derived migration examples, in OpenAI JSONL, Llama3, Alpaca, or RAG-chunk format, and the export lands in the ledger as N cached-read acts. Covers FR-090; carries UX-DR26, NFR-031 (structured facts, not republication), NFR-034 (no training on customer data by the platform — exports are the customer's own choice); binds AD-6 (owner-scoped reads only), AD-8, AD-11 (entitlements gate access, the ledger still records usage), AD-12 (R2 delivery, bounded retention), AD-14 (refined values inert). Export formats beyond OpenAI JSONL are first in the pre-agreed cut order, so each format is an independently removable formatter. No spec-slate checkpoints fall here. Assumptions: ledger rows gain an `act_count` field so an export of N entities is recorded as N acts without N rows — a row-contract extension to record in the architecture memlog; an `exp_` id prefix extends the ID convention; exports above a configured row threshold run as a Workflow delivering to R2 and smaller ones download synchronously; the RAG-chunk format ships behind an `EXPORT_RAG_ENABLED` flag until the rights review in the Phase 0 legal workstream clears it; the entitlement is a per-plan export feature flag plus a maximum row count per export from the plan catalog.

### Story 10.1: Export engine — entitled corpus slices in four formats, ledgered as cached reads

As a workspace member,
I want to export a slice of my corpus, including what changed between versions, as ready-to-use training or retrieval files,
So that the refinery's validated facts and change history become my model's memory.

**Acceptance Criteria:**

**Given** the Drizzle schema
**When** this story lands
**Then** it adds only `exports` (`exp_` id, workspace, slice specification, format, include-diffs flag, status `queued`/`running`/`done`/`failed`, row count, R2 key, ledger reference, `created_by`, timestamps), and `usage_events` gains an `act_count` column defaulting to 1 with the change recorded in the architecture memlog (FR-090, AD-11)

**Given** a MEMBER or higher
**When** they call `POST /api/v1/exports` with a slice (vertical, schema, entity filter, date range, include diffs) and a format
**Then** the slice resolves through the `core/tenancy` union of platform, own, and granted scope only, sample entities, quarantined snapshots, and opted-out sources are excluded, and a workspace whose plan lacks the export entitlement or whose slice exceeds the plan's row cap receives `EXPORT_NOT_ENTITLED` before any work (FR-090, AD-6, EC-605)

**Given** an admitted export of N entities
**When** admission runs
**Then** N `cached_read` acts are reserved against quota or wallet through the Epic 2 and Epic 5 admission path before the export starts, one ledger row with `act_count` N commits when the file is delivered, granted entities carry their `lst_` reference and creator share, and a failed export releases the reservation with no billable row (AD-11, AD-15, FR-081)

**Given** the four formatters
**When** unit-tested
**Then** OpenAI JSONL emits chat-format examples (system instruction, user prompt built from the entity key and source excerpt, assistant structured JSON), Llama3 emits its instruction format, Alpaca emits instruction/input/output records, and RAG-chunk emits chunks with provenance metadata; each formatter is a pure function that validates its own output and is independently removable per the cut order (FR-090)

**Given** the include-diffs flag
**When** set
**Then** diff-derived examples are emitted as before-and-after pairs with severity and migration text — the change-intelligence dataset — in the chosen format (FR-090)

**Given** the `EXPORT_RAG_ENABLED` flag
**When** it is off
**Then** RAG-chunk requests fail `EXPORT_FORMAT_DISABLED` with a message that the format awaits rights review, and the format is absent from the discovery document (ADV-H8)

**Given** an export above the configured row threshold
**When** it runs
**Then** it executes as a Workflow instance keyed by the export id, streams rows in batches, writes the file to R2 under an owner-prefixed key with bounded retention, and marks the export `done`; a smaller export returns the file synchronously with `Content-Disposition` (AD-4, AD-12, PD-15)

**Given** `GET /api/v1/exports/{id}/download`
**When** called by a MEMBER or higher of the owning workspace
**Then** the file streams from R2 through the worker with owner-scope enforcement; any other workspace receives 404 with a denial audit row (AD-6, NFR-025)

**Given** refined values in any export
**When** serialized
**Then** they are emitted as data with no interpretation, and no source content beyond the stored structured fields and bounded excerpts is included (AD-14, NFR-031)

**Given** a source added to the opt-out registry
**When** undelivered export artifacts reference it
**Then** those artifacts are purged and future exports exclude the source; terms state that already-delivered exports are outside recall (AD-12, EC-604)

**Given** the OpenAPI document
**When** regenerated
**Then** the export routes, slice schema, and format enum are published and the generated client exposes them (AD-8)

### Story 10.2: Export views in Studio

As a workspace member,
I want to build a slice, see what it will cost, and download the result from Studio,
So that producing a training set is a form, not a script.

**Acceptance Criteria:**

**Given** `/export`
**When** a MEMBER or higher opens it
**Then** the slice builder offers vertical, schema, entity filter, date range, and an include-diffs toggle, and the format picker shows OpenAI JSONL, Llama3, Alpaca, and RAG-chunk with the RAG option disabled and explained while its flag is off (UX-DR26)

**Given** a configured slice
**When** previewed
**Then** the view shows the entitlement state, the plan's row cap, the resolved row count, and the ledger impact as N cached-read acts with the price in monospace before the user confirms (UX-DR26, UX-DR18, AD-11)

**Given** an export in progress
**When** rendered
**Then** the row shows `StatusLoader` copy with the batch progress reported by the API, never a bare spinner (UX-DR15)

**Given** the export history
**When** rendered
**Then** it lists exports with format, row count, status, retention expiry, and a download button that calls the owner-scoped download route; failed exports show their error code (UX-DR26)

**Given** an over-quota or unentitled workspace
**When** it attempts an export
**Then** the global 402 banner or the entitlement message appears with the upgrade path (FR-067, UX-DR17)

**Given** an empty history
**When** rendered
**Then** the `EmptyState` component appears with one action (UX-DR15)

## Epic 11: SDKs & Integrations — use the refinery from TypeScript, LangChain, and LlamaIndex

A developer installs the TypeScript SDK, the LangChain loader + tools package, or the LlamaIndex reader from npm and completes a refined query against the API; Studio promotes all three with snippets. Covers FR-120–FR-122; carries NFR-023 (credentials never logged by clients); binds AD-8 (clients consume generated OpenAPI types and call nothing outside the document), AD-13 (no literal URLs). This epic replaces the prototype's dead `packages/integrations`, which duck-typed the frameworks without depending on them. Checkpoint carried from the spec slate: done review after 11.3 — the launch candidate. Assumptions: package names use a scope placeholder from configuration pending OQ-1 and are marked `private` until the commercial name lands, so publishing is build-ready but blocked; the framework integrations are separate packages in the same workspace sharing one version line with the SDK, so plain SDK users never inherit framework peer dependencies; `@langchain/core` and `llamaindex` become real peer dependencies at versions verified against the registry at build time and recorded in the architecture memlog; the exit-gate traceability report is generated from this document's FR coverage and test tags.

### Story 11.1: TypeScript SDK on the generated OpenAPI types

As a developer,
I want a typed client that mirrors the REST contract exactly, handles pagination and payment errors for me, and runs anywhere fetch runs,
So that integrating the refinery is an import, not a study of the docs.

**Acceptance Criteria:**

**Given** `packages/sdk`
**When** this story lands
**Then** it is an npm workspace member with `dist/` git-ignored, ESM and CJS builds, type declarations, a `publishConfig`, a placeholder scoped name from configuration, `private: true` pending OQ-1, and `npm pack` succeeding in CI — the prototype's committed `.js`/`.d.ts` artifacts pattern is gone (FR-120, PD-13)

**Given** the generated types from Story 4.1
**When** the client is built
**Then** every method's request and response types come from `packages/sdk/src/generated`, a CI drift check fails when the OpenAPI document changes without regeneration, and no method calls a path absent from the document (AD-8)

**Given** `new RefineryClient({ credential, baseUrl })`
**When** constructed
**Then** it accepts a workspace API key or agent token, requires `baseUrl` explicitly or from an environment variable with no default literal, sends `Authorization: Bearer`, and never logs the credential (AD-13, NFR-023, Auth-transport convention)

**Given** the client's surface
**When** reviewed
**Then** it offers typed methods for refine, entities, corpus, versions and diffs, changes, search, schemas, pipelines, webhooks, exports, and usage, with cursor-paginated lists exposed as async iterators over the `{ items, nextCursor }` envelope (FR-120, Pagination convention)

**Given** an error envelope response
**When** received
**Then** the client throws `RefineryError` carrying `code`, `message`, and `requestId`, and a 402 throws `PaymentRequiredError` exposing the machine-readable payment body — unit, price, quote expiry, and purchase paths (AD-10, FR-062)

**Given** a priced call
**When** the caller supplies an idempotency key
**Then** the client sends `Idempotency-Key`, and the client retries with backoff only on idempotent reads and network failures, never on priced writes (EC-105)

**Given** the runtime matrix
**When** the test suite runs
**Then** the client passes contract tests against the local worker on Node 22+, inside a Worker, and in a browser-like environment, with no Node-only dependencies (FR-120)

**Given** the package README
**When** rendered
**Then** it contains a quickstart that compiles in CI from the same snippet source Studio uses, and declares the maintenance commitment across SDK releases (FR-122, ADV-L5)

### Story 11.2: LangChain loader + tools and the LlamaIndex reader

As an agent-framework developer,
I want a document loader, agent tools, and a reader that plug straight into LangChain and LlamaIndex,
So that the refinery is one line away inside the frameworks I already use.

**Acceptance Criteria:**

**Given** `packages/sdk-langchain`
**When** this story lands
**Then** it depends on `packages/sdk` and declares `@langchain/core` as a real peer dependency at a registry-verified version recorded in the architecture memlog, shares the SDK's version line, and is publish-ready under the same placeholder scope (FR-121)

**Given** `RefineryLoader`
**When** used as a LangChain document loader
**Then** it yields documents from corpus entities, a schema's entities, or a search query, each carrying provenance, validation status, and staleness in metadata, paginating through the SDK's iterators (FR-121, FR-003)

**Given** the LangChain tools (`refine_url`, `search`, `get_entity`, `get_diff`)
**When** their schemas are inspected
**Then** each tool's input schema derives from the same shared schema definitions the REST and MCP surfaces use, converted by one generator — a hand-authored tool schema fails CI (AD-8)

**Given** `packages/sdk-llamaindex`
**When** this story lands
**Then** it implements the LlamaIndex reader interface with `llamaindex` as a real peer dependency at a registry-verified version, and `RefineryReader.loadData` returns nodes with the same provenance metadata (FR-121)

**Given** both packages
**When** the test suite runs
**Then** tests execute with the real framework packages installed as dev dependencies against the local worker, covering a loader run, a tool call, a reader load, an error envelope, and a 402 (FR-121)

**Given** the examples directory
**When** CI runs
**Then** an example agent per framework compiles and executes against the local worker, and the examples are the source of Studio's framework snippets (FR-122)

### Story 11.3: Studio SDK promotion, publish readiness, and the launch-candidate checklist

As a co-founder,
I want Studio to hand developers working snippets for all three packages, the packages to be one command from npm, and a traceable verification that every launch requirement is met,
So that the launch candidate is a fact, not a feeling.

**Acceptance Criteria:**

**Given** `/help`
**When** the SDK section renders
**Then** it shows install and first-refine snippets for the SDK, the LangChain package, and the LlamaIndex package with `CopyButton`, generated from the single snippet source that CI compiles, replacing the "forthcoming" state from Epic 6 (FR-122, FR-113)

**Given** the release pipeline
**When** CI runs on `main`
**Then** `npm publish --dry-run` succeeds for all three packages, versions are managed with changesets on one shared line, and actual publication is gated by an explicit release job that fails with `PUBLISH_BLOCKED_ON_OQ1` until the commercial scope is configured (FR-120, FR-121, OQ-1)

**Given** the framework-registry discovery channel
**When** the packages are prepared
**Then** their manifests carry the keywords, README badges, and repository metadata the registries index, and the READMEs link the MCP manifest so each package is also an MCP discovery pointer (FR-122)

**Given** the traceability report tool
**When** it runs in CI
**Then** it maps every launch FR (F1–F10, F12, F13) to the test tags that verify it using this document's coverage map, fails on any launch FR with zero verifying tests, and publishes the report as a build artifact (PRD §6 exit gate)

**Given** the launch-candidate checklist
**When** the done review runs
**Then** it records: the traceability report green, the NFR-025 isolation suite green on REST, MCP, and Studio, the Story 5.5 billing harness clean over its window, fourteen consecutive days of unattended dev-vertical refresh evidenced from telemetry, the end-to-end suite green against the production-candidate deployment, zero known critical or high defects, and the independent security review scheduled with its scope (tenancy, billing, SSRF, secrets) against a named standard (PRD §6 exit gate)

**Given** the `legacy/` reference folder
**When** the launch candidate is declared
**Then** it is deleted from the repository with its removal recorded, and the legacy production deployment cutover is documented as a runbook step (Story 1.1 assumption)
