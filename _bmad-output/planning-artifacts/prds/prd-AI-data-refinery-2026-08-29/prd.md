---
title: Universal Data Refinery PRD
status: final
created: 2026-08-29
updated: 2026-08-29
---

# Universal Data Refinery — Product Requirements Document

> Working name: **Universal Data Refinery** — a commercial name and dedicated website are pending, under the **Virgee LLC** umbrella (following the FeltIQ pattern). The product is owned jointly by its two co-founders under Virgee LLC. Software is **fully proprietary** (all rights reserved, Virgee LLC). The existing repository is a **prototype produced with the AntiGravity IDE (AI-generated)**: it is evidence of intent, not the product boundary. Where this PRD and the prototype disagree, the PRD is authoritative.

## 1. Vision

### The Problem

The internet was designed for human eyes, not artificial intelligence:

- **The web is bloated.** A typical webpage is 2–5MB of HTML, JavaScript bundles, tracking cookies, and ads.
- **Raw HTML wastes context.** Feeding it to an LLM burns thousands of expensive tokens and causes models to hallucinate or miss key facts.
- **Scrapers only return raw text.** Tools like Firecrawl, Jina Reader, and Apify convert pages into large chunks of unvalidated Markdown. Some now track changes and most ship MCP servers — but none validate output against strict schemas, none rate the *severity* of what changed, and none maintain a versioned corpus an agent can query as memory.

### The Product

Universal Data Refinery continuously distills messy web sources into schema-validated JSON, detects semantic changes over time with severity ratings, and serves the results to both humans and autonomous AI agents over MCP and REST.

Its customer is anyone — person or business — participating in the **machine-to-machine autonomous economy**, and its defining trait is that it bills both kinds of customer natively:

- **Human subscribers** pay through standard Stripe subscriptions.
- **Autonomous agents** — which have no credit cards and cannot fill out forms — pay per query (e.g., $0.005) either from guardian-governed prepaid wallets or via account-less x402 payment, with no signup at all.

**Subscriptions are the revenue base.** Agent-native billing is the strategic bet on where the machine-to-machine economy is going — as of mid-2026, fewer than 5% of MCP servers earn revenue and global agent-to-tool payment volume is small — so agent billing is a differentiating capability and an option on the future, not a launch revenue expectation.

### Why Now

- Every major web-data player now ships an MCP server, but none combine pre-indexed corpora with severity-rated semantic diffs — the core wedge is open. The nearest occupant in the launch vertical, Upstash's free **Context7**, pre-indexes library docs over MCP but offers no schema validation, no versioning, and no change intelligence — so differentiation there rests entirely on the validated, versioned, severity-rated half of the combination. <!-- research-landscape.md §1 -->
- Agent-native payments (x402 / HTTP 402) crossed from speculative to real infrastructure in 2026, with Linux Foundation governance and precedents like Apify's agent pay-per-event billing — while remaining small enough that no incumbent owns it. <!-- research-landscape.md §3 -->
- The MCP specification (2026-07-28) standardized OAuth 2.1 auth for servers, making paid, authenticated, enterprise-grade MCP services viable. <!-- research-landscape.md §2 -->

### Scope Commitments

- **Horizontal platform.** The product is agent-data infrastructure for any domain. The six seeded verticals (health-payer prior-auth, SEC 10-K, municipal zoning/STR, FDA/biopharma, SaaS pricing, dev SDK migrations) are **pre-built schema templates**, not separate go-to-market motions. Regulated-enterprise sales requiring BAA/SOC 2 procurement are out of scope for launch.
- **Five product surfaces:** MCP + REST API (core, machine-facing), Refinery Studio web dashboard (human-facing), client SDKs & framework integrations (TypeScript, LangChain, LlamaIndex — launch), browser extension, and a CLI (net-new — docs-only in the prototype).

### Launch Definition

"Launched" means **publicly available** — not gated on a first paying customer. Launch timing is **quality-gated, not calendar-gated**: the product releases when it is functionally ready and error-free (the Phase 0 exit gate in §6 defines what that means), however long that takes.

## 2. Target Customers & Positioning

### Customer Classes

The platform serves two customer classes as first-class citizens, distinguished by how they pay:

1. **Human subscribers** — individuals and businesses on Stripe subscriptions.
2. **Autonomous AI agents** — machine customers paying per query in two modes: **relationship mode** (a dedicated token drawing on a prepaid wallet, governed by a **guardian** — the agent's operator, who funds the wallet and holds a kill-switch) and **account-less mode** (per-request x402 payment with no signup, where the payment itself is the governance, backed by technical abuse controls).

### Launch Persona

**[ASSUMPTION — validate post-launch]** The first users are expected to be **solo developers wiring MCP tools into Cursor, Claude Code, and similar agentic IDEs**. Their week-one behavior is exploration — playing with the product. This is a hypothesis, not a validated fact; the founders explicitly do not know for sure.

Product implications of this persona:
- Sign-up-to-first-refined-query must be near-frictionless (minutes, not a sales call).
- A **free tier or sandbox** is required — "playing" cannot sit behind a paywall.
- Validation plan: instrument the activation funnel and interview early signups; revisit this section when real usage data exists.

**[ASSUMPTION]** The expected path to agent (paid) usage: developers adopt personally, then advocate for their companies to pay — company fleets with operator-set wallets and kill-switches. Whether unknown third-party agent fleets will discover and pay for the API autonomously is an open question. Launch *includes* the account-less x402 capability (it rides the 402 path the platform needs anyway), but **no revenue expectation attaches to it** — it exists so the answer to OQ-6 can be measured rather than guessed.

**Open question (OQ-5):** how deep platform-mediated guardianship goes beyond wallet + kill-switch (spend policies, per-tool budgets, approval flows) is deliberately undecided.

### Positioning

> **"We don't just scrape the web — we clean and normalize it."**

Expanded: scrapers (Firecrawl, Jina Reader, Apify) return raw text on demand and forget it. Universal Data Refinery maintains a **validated, versioned corpus**: strict schema-validated JSON, a memory of every version, severity-rated semantic diffs of what changed — and agents can query and **pay for it natively** over MCP. Per the August 2026 landscape research (`research-landscape.md`), no incumbent combines pre-indexed corpora, severity-rated change intelligence, native MCP, and agent-native billing.

**Named risk — the moat is the combination.** Each element individually has a strong owner: pre-indexed corpora (Exa, Diffbot, Context7), change tracking (Firecrawl Monitor; adjacent change-detection tools like Visualping and Fluxguard, which do AI diff summaries but not schema-validated, severity-rated, agent-consumable feeds), native MCP (universal), agent billing (Apify). Every competitor is one feature from parity — which is why the Phase 0 market checkpoint (§6) exists. Additionally, any externally published claim sourced from secondary research (acquisition reports, payment-volume figures) is re-verified before it appears in launch copy (Phase 0 honesty workstream).

## 3. Features & Functional Requirements

Requirements carry globally numbered stable IDs. Where the prototype already implements a requirement, it is noted; where the prototype contradicts the requirement, the gap is called out — **the requirement, not the prototype, is authoritative.** Requirements state capabilities; implementation choices belong to the architecture document.

### F1. Refinery Core — extraction pipeline

- **FR-001** The system refines a source (URL or supplied document) into JSON validated against a target schema, through a pipeline of: content sanitization, SSRF/allowlist enforcement, AI extraction hardened against prompt injection in source content, automated JSON repair, and schema validation. *(Prototype: implemented.)*
- **FR-002** Validation is strict by default. An extraction that fails schema validation is flagged as such and never silently served as valid. Any permissive-fallback path must be explicit in the API response. *(Prototype gap: silent permissive fallback.)*
- **FR-003** Every refined artifact records provenance: source URL, fetch timestamp, source content hash, extraction model and version, and schema version. *(Supports the AI-evidence expectations enterprise buyers now audit for.)*
- **FR-004** Extraction supports a primary and fallback model: on primary failure the fallback is attempted; if both fail, the request fails **explicitly** (never a silent partial result), the failure is recorded, and the query is not billable (see F7).
- **FR-005** Each refinement response can report its **token economics** — raw source size versus refined output tokens — and Studio surfaces aggregate token savings. Like every published number, these are measured, never estimated (NFR-003). *(The "85%+ token reduction" value prop in prototype marketing becomes a measured claim or no claim.)*
- **FR-006** Any confidence or quality indicator shown for an extraction is computed from real validation and extraction signals. *(Prototype gap: per-entity confidence scores are hardcoded 0.96–0.99 literals.)*

### F2. Corpus & Freshness

- **FR-010** The platform maintains a pre-indexed corpus of tracked entities, each with a defined refresh policy, rather than refining only on demand. Ingestion supports both generic URL fetching and structured **source connectors** (e.g., the GitHub Releases API for the dev vertical) where an API beats scraping.
- **FR-011** Scheduled pipelines execute on their schedule, refresh their tracked sources, retry on failure, and surface failures to their owners. *(Prototype gap: the cron lists pipelines but never executes them.)*
- **FR-012** The six vertical template packs (dev SDK migrations, B2B SaaS pricing, municipal zoning/STR, health-payer prior-auth, FDA/biopharma, SEC 10-K) ship as schema templates with example tracked sources. They are content on the platform, not separate products. Each template embeds its **compliance guardrails in the extraction prompt and display copy** (HIPAA no-PHI directive, FDA "not medical advice", SEC "not investment advice", Fair Housing nondiscrimination) — carried from the prototype and kept current. *(Positioning note: SEC 10-K is the most contested of the six — Daloopa and AlphaSense are already agent-native there — so it is not marketing-forward.)*
- **FR-013** Launch corpus: the **dev SDK / breaking-changes vertical is genuinely live at launch** — real tracked sources, refreshing on schedule — matching the launch persona. Everything else is served by universal on-demand refinement (FR-014). The other five vertical templates ship with **clearly labeled sample data**, never presented as live coverage.
- **FR-014** Universal on-demand refinement: any URL can be refined against any accessible schema at query time.

### F3. Change Intelligence

- **FR-020** Every refresh of a tracked entity produces a versioned snapshot; version history is queryable. Only **validated** snapshots enter version history as diff bases — a flagged-invalid extraction is recorded for diagnostics but quarantined, never diffed against, so a failed extraction can't fire phantom CRITICAL alerts.
- **FR-021** The system computes a semantic diff between consecutive versions and assigns a severity rating on one **canonical entity-level scale: CRITICAL / MAJOR / MINOR** using domain-aware rules; per-item severity within a diff (e.g., individual breaking changes in the dev vertical) may carry its own finer scale, but the two vocabularies are defined once and used consistently across API, MCP, badges, and UI. *(Prototype mixes CRITICAL/MAJOR/MINOR/INFORMATIONAL with CRITICAL/HIGH/MEDIUM/LOW. Prototype implements field-level heuristics; true AST-level diffs for the dev vertical are a post-launch enhancement — public claims must match the shipped mechanism.)*
- **FR-022** Customers subscribe to change events via webhooks. Deliveries honor each subscription's event-type and entity filters, fan out to **all** matching subscriptions, are signed, and are retried on failure. Supported destinations include generic HTTPS endpoints and chat-native targets (Slack, Discord, Telegram); scheduled pipelines can carry their own notification target; a **send-test-event** affordance exists for every subscription. Retries are bounded: a persistently failing endpoint moves the subscription to a visible **paused/dead-letter state**, with missed events replayable once the customer revives it — alerts are the product's dependency signal and must never be silently lost. *(Prototype gap: only the single latest CRITICAL/MAJOR diff fires, filters ignored.)*
- **FR-023** Public SVG status badges per tracked entity, rendering the latest version label and colored by latest diff severity — designed as a GitHub-README embed, doubling as a distribution surface. *(Prototype: implemented.)*
- **FR-024** An authenticated **global change feed**: the cross-corpus stream of recent diffs, filterable by vertical and severity. *(Prototype exposes this unauthenticated; it moves behind auth per NFR-020.)*

### F4. Agent Access — MCP, REST, Search

- **FR-030** A native MCP server exposes the refinery as tools/resources/prompts, including one tool per published custom schema. *(Prototype: implemented, unauthenticated.)*
- **FR-031** The MCP server complies with the current MCP authorization spec (2026-07-28): OAuth 2.1 resource server with protected-resource metadata (RFC 9728) and resource indicators (RFC 8707). No tool call executes unauthenticated; free-tier keys satisfy auth at zero cost.
- **FR-032** MCP tool calls are metered and attributed to the calling key/wallet/workspace identically to REST calls. *(Prototype gap: `/mcp` bypasses all metering — this defeats the business model and must be closed.)*
- **FR-033** A versioned REST API provides: per-vertical query endpoints, universal refine, search, version history/diffs, and usage/stats — with published machine-readable discovery documents (OpenAPI spec; MCP manifest) and a public corpus-overview endpoint (entity counts, index health) as a deliberate public surface.
- **FR-034** Hybrid search across the corpus: semantic (vector) plus lexical, filterable by vertical/schema/workspace.

### F5. Visual Schema Studio

- **FR-040** Workspace members create, edit, and delete custom schemas via a no-code builder (with raw JSON editing for experts).
- **FR-041** A schema can be tested interactively against a live URL before publishing.
- **FR-042** Publishing a schema provisions its MCP tool and REST access, scoped to its workspace (see F6); the builder shows a live preview of the MCP tool definition being generated.
- **FR-043** Schemas carry a **visibility setting**: private to their workspace, or published as a public blueprint that other workspaces can clone and customize. Public blueprints are how the six vertical templates (FR-012) are delivered.
- **FR-044** Studio provides **version and diff browsing** for tracked entities — the visual counterpart of FR-020/021, so humans can time-travel through what changed without the API.

### F6. Workspaces & Tenancy

- **FR-050** All customer resources (schemas, pipelines, webhooks, API keys, agent tokens, wallets, exports, marketplace listings) belong to a workspace with membership and roles enforced **server-side** on every path — REST, MCP, and Studio. *(Prototype gap: client-supplied `workspaceId` trusted; MCP lists every tenant's schemas unauthenticated.)*
- **FR-051** Cross-tenant access attempts fail closed (401/404, never data) and are audit-logged.
- **FR-052** Workspace roles follow the four-role matrix; role changes are audit-logged:

| Capability | OWNER | BUILDER | MEMBER | VIEWER |
|---|---|---|---|---|
| Billing, plan, workspace settings, invites | ✓ | — | — | — |
| Schema design & publishing, pipelines, webhooks | ✓ | ✓ | — | — |
| Run refinements & queries, use marketplace items | ✓ | ✓ | ✓ | — |
| View data, history, audit log | ✓ | ✓ | ✓ | ✓ |

### F7. Billing & Metering

**The billable unit.** Two distinct billable units exist platform-wide: a **cached corpus read** (serving already-refined data — cheap) and an **on-demand refinement** (fetch + AI extraction — expensive, priced above its measured inference cost per NFR-050). Prices, quotas, the metering ledger, and creator attribution all count the two separately. A query is billable only when the platform **successfully delivers** the requested result: failed extractions (provider outage, fetch failure, or strict-validation failure with nothing servable) are not billable — in relationship mode they are auto-credited to the wallet, in account-less mode the payment is refunded or never settled. A retry of a failed query is a new attempt, not a second charge.

- **FR-060** Free tier: signup yields an API key + MCP access with a monthly quota (counting both unit types) at zero cost.
- **FR-061** Paid human plans are Stripe subscriptions; the plan catalog (names, prices, quotas) is founder-editable configuration, not code. The **tier structure** is committed: Free, PRO, ENTERPRISE, plus agent pay-per-query. All **dollar amounts and quota numbers are placeholders** (prototype seeds: PRO $49/10k, ENTERPRISE $299/100k, $0.005/agent-query) — the Phase 0 pricing exercise sets the real ones, per-unit-type, from measured unit costs and the competitor anchors in `research-landscape.md`.
- **FR-062** Agent flow: an over-quota or unfunded request receives HTTP 402 with machine-readable price headers and a machine-navigable purchase path. Agents pay in one of **two modes**: (a) **relationship mode** — a dedicated agent token drawing on a guardian-governed prepaid wallet; or (b) **account-less mode** — per-request x402 payment with no signup, matching the Apify precedent. *(Match-Apify decision: account-less payment is launch scope.)*
- **FR-063** Wallet top-ups move real money (rails: Stripe; x402). A top-up without a corresponding successful charge is a defect. *(Prototype gap: top-up grants quota without charging.)*
- **FR-064** Guardian controls apply to relationship-mode tokens: funding, spend limit, and an immediate kill-switch that revokes the token's access — effective immediately for new requests; nothing is billed to a revoked token after the kill. Account-less requests carry no standing access to govern — their control is the payment itself, backed by technical abuse controls (NFR-026), since terms-of-service remedies are unenforceable against anonymous callers.
- **FR-065** A metering ledger records every billable query with its unit type (cached corpus read vs. on-demand refinement) and key/agent/workspace attribution; customers can query their own usage; the ledger reconciles against charges, and refunds/credits/chargebacks appear as explicit ledger events.
- **FR-066** Stripe lifecycle is webhook-driven and signature-verified: provisioning on successful payment, revocation on subscription end. *(Prototype: implemented.)*
- **FR-067** A paid subscriber who exhausts quota gets a **hard stop with the same machine-readable 402 mechanism agents get** (FR-062) — pointing at plan upgrade or wallet top-up. No silent overage billing.

### F8. Operations Console

- **FR-070** Operator/admin access uses real authenticated accounts; no shared passcodes in source or database. *(Prototype gap: three hardcoded passcodes.)*
- **FR-071** Operators govern human customers and agent fleets: view, suspend, revoke, kill-switch — plus deliberate, audit-logged courtesy actions (manual quota grants, wallet credits) that are visibly distinct from paid transactions in the ledger (FR-065).
- **FR-072** Console analytics (latency, cache hit rate, usage, revenue) are computed from real telemetry. Fabricated metrics are a defect. *(Prototype gap: hardcoded SLA/latency/uptime constants.)*
- **FR-073** An audit stream is actually written and queryable: auth events, billing/wallet events, pipeline runs, admin actions, cross-tenant denials. *(Prototype gap: audit tables read but never written.)*
- **FR-074** Pricing-plan editor for founder-controlled plan changes without deployment. *(Prototype: implemented.)*

### F9. Marketplace *(launch)*

- **FR-080** Customers browse and install schema templates and feeds published by creators.
- **FR-081** Usage of marketplace items is attributed to their creator with an **80/20 creator revenue share**, computed per query on revenue actually collected, per unit type (cached vs. on-demand — so the share never exceeds what the query earned net of serving cost class). *(Match-Apify on the split — parity with the 80% incumbent norm; supersedes the prototype's 70/30.)*
- **FR-082** Creator earnings **accrue from launch** in a ledger each creator can inspect; Stripe Connect payouts (onboarding, tax handling, transfers) are the **first committed Phase 3 fast-follow**, and the accrue-now/pay-soon arrangement is stated publicly to creators. Payouts ship with **fraud controls as requirements, not options**: a holdback window before funds release, exclusion of self-dealing (queries from the creator's own keys/wallets/workspaces earn no share), and chargeback clawback from accrued or future earnings. *(Final decision after review: the live-payouts-at-launch variant was reversed when review surfaced a chargeback money-pump and the zero-creator cold start.)*
- **FR-083** Creators set their own per-query price per listing (within platform-defined bounds).
- **FR-084** Marketplace curation: featured listings and usage-based ranking (query-count leaderboard).

### F10. Fine-Tuning Export *(launch)*

- **FR-090** Workspace-scoped corpus slices export as OpenAI JSONL, Llama3, Alpaca, and RAG-chunk formats, gated by the workspace's entitlements — including **diff-derived training examples** (change histories as migration-training data), a distinct dataset the change intelligence uniquely enables. *(Prototype: implemented, ungated.)*

### F11. Post-Launch Surfaces

- **FR-100** Browser extension (Chrome/Brave): capture and refine pages from the browser into the user's workspace. *(Post-launch.)*
- **FR-101** CLI for developers: refine, query, diff, and manage schemas from the terminal. *(Post-launch; net-new.)*

### F12. Onboarding & Developer Experience *(launch)*

The activation promise in §2 ("minutes, not a sales call") is a feature, not a hope:

- **FR-110** An in-product help center with guided quickstarts per surface (MCP, REST, Studio, marketplace, export).
- **FR-111** One-click **MCP client configuration generation** for the agentic IDEs the launch persona lives in (Cursor, Claude Code/Desktop, Windsurf — extending as the ecosystem moves).
- **FR-112** A signed-in **playground**: paste a URL and an instruction, watch it distill — displaying latency and token savings (FR-005). Free-tier quota applies; there is no anonymous usage (per the free-tier decision and NFR-020).
- **FR-113** Copy-ready snippets (cURL, SDK code) throughout Studio.
- **FR-114** The activation path is instrumented end-to-end, feeding §5's time-to-first-refined-query and bailout metrics.

### F13. Client SDKs & Integrations *(launch)*

- **FR-120** A TypeScript client SDK for the REST API, published to npm under the commercial brand.
- **FR-121** Framework-native integrations: a LangChain document loader + agent tools package and a LlamaIndex reader, published and versioned with the SDK. *(All three exist as working prototype code in `packages/integrations`; launch work is rebranding, hardening, and publishing.)*
- **FR-122** Studio promotes the SDKs with copy-paste snippets (ties FR-113); framework package registries are a second discovery channel alongside MCP registries.

### Explicitly Out of Scope

- Promotions / AI social-campaign / RSS broadcast module and the Hermes marketing agent — internal Virgee tooling at most, not product.
- Regulated-enterprise compliance packages (BAA, SOC 2 certification, dedicated tenancy) at launch — the audit and provenance groundwork above is in scope; certifications are roadmap items.

## 4. Non-Functional Requirements & Cross-Cutting Concerns

### Performance

- **NFR-001** Cached corpus reads (REST and MCP) target low-latency edge serving. The product makes **no public latency claim until telemetry exists**, then publishes measured p50/p95. *(Prototype marketing claims "sub-20ms" and hardcodes 16ms in analytics — both retired.)*
- **NFR-002** On-demand refinement (fetch + AI extraction) is seconds-scale, not milliseconds; the product sets honest expectations in UI and docs. Comparator anchor: Firecrawl-class extraction runs 5–15s.
- **NFR-003** Every published performance or uptime figure anywhere (site, docs, console) is derived from real measurement (ties FR-072).

### Availability & Reliability

- **NFR-010** Launch availability posture: **99.9% internal target with a public status page; no contractual SLA at launch.** Contractual SLAs arrive with enterprise plans once operational history exists. *(Prototype's "99.998% uptime" constant is retired.)*
- **NFR-011** Missed scheduled refreshes are detected and alerted on; staleness of any tracked entity is visible to customers (last-refreshed timestamp on every response).
- **NFR-012** When the AI provider is unavailable, cached corpus data continues to serve, flagged with staleness; extraction requests fail explicitly rather than degrade silently.
- **NFR-013** Alongside the human status page, a **machine-readable health/status document** exists for agents — reporting only measured facts (per NFR-003), replacing the prototype's hardcoded "SLA health" endpoint.

### Security

- **NFR-020** Every customer-facing endpoint requires authentication, except deliberately public surfaces (status badges, docs, marketing pages). This includes MCP (FR-031).
- **NFR-021** All server-side fetching enforces SSRF protections; all fetched content is treated as untrusted input to the extraction model (prompt-injection hardening). *(Prototype: implemented — preserve.)*
- **NFR-022** No credentials, passcodes, or secrets in source code or database seeds (ties FR-070).
- **NFR-023** API keys and agent tokens are stored hashed, are revocable, and carry scoped permissions.
- **NFR-024** All outbound webhooks are signed; all inbound webhooks (Stripe) are signature-verified.
- **NFR-025** Tenant isolation (F6) is covered by automated tests that prove cross-tenant requests fail closed on REST, MCP, and Studio paths.
- **NFR-026** Account-less and anonymous traffic carries **technical abuse controls** — rate limiting, anomaly detection, and the same SSRF/content policies as authenticated traffic — because terms-of-service remedies do not bind anonymous callers.

### Data Governance & Legal

- **NFR-030** Source acquisition follows a **respectful-crawler policy**: corpus crawling honors robots.txt, fetches with an identifiable user-agent at conservative rate limits, a public takedown/opt-out process exists for source owners, and the terms of service forbid customers from targeting login-gated content or personal data.
- **NFR-031** The product serves **structured facts with provenance** (FR-003), not wholesale republication of source content.
- **NFR-032** Launch posture on regulated data: the platform does not intend to process PHI/PII, offers no BAA, and its terms prohibit customers from using it to extract personal data. Compliance certifications (SOC 2 Type II) are roadmap items, prerequisites for regulated-vertical sales (see §1 scope commitment).
- **NFR-033** AI-extracted data can be wrong: every response carries validation status and provenance; accuracy limitations are stated in terms of service; extraction accuracy becomes a measured metric post-launch.
- **NFR-034** **Customer data and customer-created content are never used to train foundation models** — the platform's or third parties'. This commitment is stated in the terms of service. *(A trust promise the prototype docs already made; the product keeps it.)*
- **NFR-035** Data residency options are a **known non-offering** until Phase 4 enterprise scope; the limitation is stated plainly wherever enterprise buyers would look for it.

### Observability & Audit

- **NFR-040** Per-endpoint latency, error, and usage telemetry from day one — the source of truth for NFR-001/003 and console analytics (FR-072).
- **NFR-041** The audit stream (FR-073) is durable and queryable — the groundwork for future SOC 2 evidence.
- **NFR-042** Model identity, version, and inference metadata are logged per extraction, and extraction-quality **drift is monitored** over time (validation pass-rate trends per source/model) — matching 2026 enterprise-buyer expectations for AI-specific audit evidence (ties FR-003).

### Scalability & Unit Economics

- **NFR-050** Per-query serving and inference costs are measured and tracked against price. Agent pay-per-query pricing must not sell on-demand inference below cost; cached corpus reads and on-demand refinements are distinguished in the cost model.
- **NFR-051** The platform runs on edge/serverless primitives that scale horizontally without customer-visible capacity planning at launch scale.

## 5. Success Metrics

**North star: sustained usage growth.** Ninety days after going public, success is a platform whose usage trends **incrementally upward over time rather than flat-lining** — measured as week-over-week growth in active workspaces and total refined queries.

**Falsifiability rule.** Absolute targets are deliberately not set pre-launch — but they are not set *after the verdict* either: at day 30 post-launch, the co-founders set explicit numeric thresholds (week-over-week growth rate, bailout-rate ceiling, week-4 retention floor) from the first 30 days' baseline, record them in this PRD, and **freeze them** for the day-90 judgment and the Phase 2→3 gate. Moving the goalposts after seeing the trend is prohibited — the north star must be able to fail.

All metrics below come from the platform's own telemetry (NFR-040) — never estimated or hand-entered.

### Activation — the persona test

- **Time-to-first-refined-query**: % of signups that run their first refined query within 24 hours.
- **MCP connection rate**: % of activated users that connect via MCP specifically. *If this is low, the solo-MCP-dev launch persona (§2) is wrong and that section gets rewritten — this metric exists to test the hypothesis.*
- **Discovery funnel**: signups attributable to MCP registries and badge embeds — the check on whether Phase 1 distribution works in a 10k+-server field.

### Stickiness

- **Bailout count**: users who use the product once and never return. Tracked as an absolute count and as a one-and-done rate (% of activated users with no second-session activity). *This is the counterweight to signup vanity — a rising signup line with a rising bailout rate is a flat-lining product wearing makeup.*
- **Week-4 retention** of activated users.
- **Dependency signals**: scheduled pipelines and webhook subscriptions per active workspace — a scheduled pipeline means someone *depends* on the refinery, not just plays with it.

### Monetization signals *(signals, not targets, at this stage)*

- First free→paid conversions; conversion rate once volume exists.
- First funded agent wallet; first HTTP 402-paid query; count of active agent tokens.

### Corpus health — the supply side

- Tracked entities live and fresh in the dev vertical (FR-013); refresh success rate; extraction validation pass rate (strict-pass vs. flagged, per FR-002).
- **Aggregate token savings delivered** (FR-005) — the measured version of the product's core value claim.

### Counter-metrics — what keeps the above honest

- **Cost per query vs. price** (NFR-050) — growth that loses money per query is not success.
- **Extraction error / hallucination reports** — usage growth on top of wrong data is borrowed time.
- **Free-tier abuse rate** and anomalous automated signups.
- **Takedown/opt-out requests** (NFR-030) — the respectful-crawler policy's health gauge.

## 6. Go-to-Market Roadmap

The roadmap is **gate-based, not date-based** — each phase opens when the previous phase's exit gate is verifiably met. Development continues AI-assisted (the prototype was produced with the AntiGravity IDE); the gates therefore lean deliberately on **independent verification** — automated tests, security review, reconciliation checks — rather than on the builder's own assessment.

### Phase 0 — Launch-Readiness Engineering

Close the gap between what the prototype claims and what the product does. Five workstreams:

1. **Trust & security** — MCP OAuth 2.1 auth and metering (FR-031/032); server-side tenancy enforcement with fail-closed tests (F6, NFR-025); real admin accounts, secrets purged from source and seeds (FR-070, NFR-022).
2. **Billing integrity** — wallet top-ups charge real money (FR-063); metering ledger reconciles with charges (FR-065); free tier live (FR-060); guardian kill-switch verified end-to-end (FR-064); **account-less x402 payment path** live (FR-062); paid-tier hard-stop behavior (FR-067); creator accrual ledger with self-dealing exclusion (FR-081/082); and the **pricing exercise** — real per-unit prices set from measured unit costs (NFR-050 telemetry) plus the competitor anchors, before anything goes public.
3. **Data engine** — scheduler actually executes pipelines (FR-011); strict validation surfaced, never silent (FR-002); provenance on every artifact (FR-003); dev-vertical corpus genuinely live and refreshing (FR-013); webhook fan-out honoring filters (FR-022).
4. **Honesty layer** — real telemetry and analytics (FR-072, NFR-040); audit stream written and queryable (FR-073); every fabricated metric and claim retired (NFR-001/003/010).
5. **Identity & legal** — commercial name and website under Virgee; proprietary license applied and README fixed; terms of service embodying the fetch policy (NFR-030), no-PHI posture (NFR-032), and accuracy disclaimers (NFR-033); status page; promotions module and internal-tooling remnants removed from the product.

**Standing market checkpoint** *(the timing safeguard on an open-ended phase)*: the co-founders re-scan the competitive landscape monthly during Phase 0. A named trigger event — a competitor shipping severity-rated diffs or a pre-indexed vertical corpus — forces an explicit scope-vs-speed decision rather than silent continuation.

**Pre-agreed cut order**: if a checkpoint forces speed, launch scope sheds in this order, and only this order: (1) export formats beyond OpenAI JSONL (FR-090), (2) marketplace reduced to free blueprints only (F9 → FR-043), (3) SDK packages to post-launch (F13), (4) chat-native webhook destinations (FR-022). The core — refinery, corpus, change intelligence, authenticated+metered MCP/REST, tenancy, billing integrity, DX (F1–F8, F12) — is never cut.

**Exit gate — the definition of "functionally ready and error free":**
- Every launch-scope FR (F1–F10, F12, F13) implemented and verified.
- Automated test coverage proving: cross-tenant isolation (REST + MCP + Studio), the full 402/wallet flow including real charges, quota enforcement, and Stripe lifecycle.
- Billing reconciliation runs clean: ledger ↔ charges match over a sustained test period.
- Security review passed — meaning: an application security review **independent of the code's authors and authoring toolchain** (external reviewer, or at minimum tooling-plus-reviewer the founders didn't write the code with), scoped to an established standard (e.g., OWASP ASVS), covering the tenancy, billing, SSRF, and secrets surfaces, with every critical and high finding closed. Zero known critical or high defects overall.
- Dev-vertical corpus refreshing for a sustained period (e.g., 14 consecutive days) with no manual intervention.
- End-to-end verification green against the production-candidate deployment.

### Phase 1 — Public Launch

Flip to public: free tier open, paid plans at the Phase 0-decided prices, agent wallets and account-less x402 live, marketplace in accrual mode seeded with the six vertical templates as founder-published listings (the marketplace's cold-start supply), fine-tuning export, and the SDK/integration packages on npm. Distribution moves: listings in MCP registries and directories (the official registry, Glama, Smithery, PulseMCP — where the launch persona discovers tools) plus framework package registries (FR-122) and badge embeds (FR-023) — listing alone is not a strategy in a 10k+-server field, so the §5 discovery-funnel metric checks whether any of it works; public docs; positioning per §2.

### Phase 2 — Validate & Calibrate *(the first ~90 days of being public)*

Run the §5 metrics. Interview early users. Watch the **bailout count** and the MCP-connection rate — they judge the persona hypothesis. Calibrate the Phase 0 prices against real usage. Recruit marketplace creators against the accrual ledger and the public 80/20. Fix what the activation funnel exposes. **Gate to Phase 3:** the pre-registered growth thresholds (§5) are met, and the persona is confirmed or §2 has been revised.

### Phase 3 — Committed Fast-Follows

- **Creator payouts** (Stripe Connect onboarding, tax handling, transfers) — the first fast-follow, honoring the FR-082 accrual commitment and shipping with its fraud controls.
- **SOC 2 Type II readiness** — controls and evidence collection begin here (much of the groundwork is FR-073/NFR-041), so procurement conversations on the dev→company-pays path aren't dead on arrival; certification itself completes in Phase 4.
- **Browser extension and CLI** (FR-100/101). *(The extension has working prototype code; the CLI is net-new.)*
- **Deeper change intelligence** — e.g., true AST-level diffs for the dev vertical (upgrading FR-021's mechanism to match ambition).
- **Additional agent payment rails** beyond launch x402 — Stripe Machine Payments Protocol (rides the already-committed Stripe rail), Skyfire, card-rail schemes — per OQ-8.

### Phase 4 — Earned Expansion *(conditional, not promised)*

Opens only on demonstrated pull (sustained growth plus inbound enterprise interest): SOC 2 Type II certification completed (readiness began in Phase 3), contractual SLAs on operational history, enterprise plans including data residency options (NFR-035) and customer-supplied private corpora on dedicated tenancy, deeper guardian governance (spend policies, approvals), and activation of regulated verticals — the research identifies health-payer policy and municipal zoning as the open agent-native wedges, with CMS-0057 deadlines (2026–27) as an active tailwind for the former. Regulated-vertical sales remain out of scope until this phase's prerequisites (certifications, BAA capability) exist.

## 7. Open Questions

| # | Question | Owner | Revisit when |
|---|----------|-------|--------------|
| OQ-1 | Commercial product name + domain (under Virgee, FeltIQ pattern) | Co-founders | Before Phase 0 identity workstream completes |
| OQ-2 | Pricing numbers per unit type (structure committed; dollars are placeholders) | Co-founders | **Phase 0** pricing exercise — measured unit costs + competitor anchors from `research-landscape.md`; Phase 2 recalibrates |
| OQ-3 | Free-tier quota size — anchors: Bright Data MCP gives 5k free req/mo, Context7 is free outright; includes whether agents get free trial credits (the prototype's anonymous 50-credit minting) or the free tier stays human-signup-only | Co-founders | Phase 0 billing workstream (set generous, tighten with data) |
| OQ-4 | Launch source list for the dev vertical (which SDKs/packages, how many) | Co-founders | Phase 0 data-engine workstream |
| OQ-5 | Depth of platform-mediated guardianship beyond wallet + kill-switch (spend policies, approvals) | Co-founders | Phase 4, or earlier if agent adoption outpaces expectations |
| OQ-6 | Whether third-party agent fleets discover and pay autonomously (vs. developer-advocated company adoption) | Market | Phase 2 metrics (agent-token activations) |
| OQ-7 | ~~Marketplace payout timing~~ **Resolved**: accrual at launch with fraud controls; Stripe Connect payouts are the first Phase 3 fast-follow (FR-082) | — | — |
| OQ-8 | Which **additional** agent rails after launch x402 — Stripe Machine Payments Protocol, Skyfire, card-rail schemes (Mastercard Agent Pay, Visa Intelligent Commerce) | Co-founders | Phase 3, per ecosystem maturity |
| OQ-9 | User journeys for the human actor types (subscriber, guardian/operator, schema builder, marketplace creator, platform operator) — deliberately deferred | UX phase (`bmad-ux`) | Before UI design begins |

### Assumptions Index

Inline `[ASSUMPTION]` tags live in §2 (launch persona; agent-payer path). Both are hypotheses with validation plans tied to §5 metrics (MCP connection rate, bailout count, agent-token activations — OQ-6).

## 8. Glossary

- **Refinement** — the pipeline run that turns a source into schema-validated JSON (F1).
- **Cached corpus read** — serving an already-refined, stored result; the cheap billable unit.
- **On-demand refinement** — a fresh fetch + AI extraction at query time; the expensive billable unit, priced above measured cost.
- **Billable query** — a successfully delivered cached corpus read or on-demand refinement (see F7 preamble); failures are never billable.
- **Tracked entity** — a source under a refresh policy whose versions and diffs accumulate in the corpus (F2/F3).
- **Workspace** — the tenancy unit owning all customer resources (F6).
- **Agent token** (`ref_agent_…`) — a machine credential in relationship mode, drawing on a guardian-funded wallet.
- **Account-less mode** — per-request x402 payment with no signup; the payment is the governance.
- **Guardian** — the human operator who funds a relationship-mode wallet, sets spend limits, and holds the kill-switch.
- **Blueprint** — a schema published for other workspaces to clone (FR-043); the six vertical templates ship as blueprints.
