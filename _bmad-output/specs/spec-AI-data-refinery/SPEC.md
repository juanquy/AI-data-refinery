---
id: SPEC-AI-data-refinery
companions:
  - ../../planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/prd.md
  - ../../planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/addendum.md
  - ../../planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/ARCHITECTURE-SPINE.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. `prd.md` carries the binding FR/NFR register (FR-001..FR-122, NFR-001..NFR-051), roadmap gates, and glossary; `addendum.md` carries brand voice, GTM depth, and prototype mechanics to evaluate; `ARCHITECTURE-SPINE.md` carries the binding architecture rules AD-1..AD-16 with stable, citable IDs.

# Universal Data Refinery

## Why

An opportunity to capture and a vision to realize. The web is built for human eyes — 2–5 MB pages that waste LLM tokens and cause hallucination — and scrapers (Firecrawl, Jina, Apify) return raw unvalidated text and forget it. No incumbent combines pre-indexed corpora, severity-rated change intelligence, native MCP, and agent-native billing; the window is open now because MCP standardized OAuth 2.1 auth (2026-07-28 spec) and x402 agent payments became real infrastructure under Linux Foundation governance. Two co-founders (Virgee LLC) are rebuilding an AI-generated prototype into the real platform; the driver is proper engineering and audit, and launch is quality-gated, not calendar-gated. The named risk: every competitor is one feature from parity — the moat is the combination, guarded by a monthly market checkpoint.

## Capabilities

- **CAP-1 Refinement pipeline** *(F1)*
  - **intent:** A customer or agent can refine any accessible source (URL or supplied document) into JSON validated against a target schema, with provenance and token economics attached.
  - **success:** A conforming extraction is served with provenance (source URL, fetch time, content hash, model + schema versions) and validation status; a failing one is flagged, quarantined, never served as valid, and never billed.

- **CAP-2 Corpus & freshness** *(F2)*
  - **intent:** The platform maintains a pre-indexed corpus of tracked entities under refresh policies — the dev SDK/breaking-changes vertical genuinely live at launch — alongside universal on-demand refinement of any URL.
  - **success:** The dev-vertical corpus refreshes on schedule for 14 consecutive days with no manual intervention; the other five vertical templates ship with clearly labeled sample data; any URL refines on demand against any accessible schema.

- **CAP-3 Change intelligence** *(F3)*
  - **intent:** Every refresh yields a versioned snapshot; consecutive versions produce a semantic diff with a severity rating on one canonical scale, delivered through queryable history, filtered webhooks, public badges, and an authenticated global change feed.
  - **success:** A tracked change produces a CRITICAL/MAJOR/MINOR-rated diff; every matching webhook subscription receives a signed delivery with bounded retries; a persistently failing endpoint moves to a visible paused state with missed events replayable.

- **CAP-4 Agent access — MCP, REST, search** *(F4)*
  - **intent:** Agents and developers reach the refinery through an authenticated MCP server and a versioned REST API with hybrid semantic + lexical search and machine-readable discovery documents.
  - **success:** No MCP tool call executes unauthenticated; an MCP call and its REST twin produce identical ledger attribution; the OpenAPI spec and MCP manifest are published; search filters by vertical, schema, and workspace.

- **CAP-5 Visual Schema Studio** *(F5)*
  - **intent:** Workspace members build custom schemas in a no-code builder (raw JSON for experts), test them against live URLs, and publish them — provisioning the schema's MCP tool and REST access, with optional sharing as cloneable public blueprints.
  - **success:** A published schema's tool appears in MCP tools/list scoped to its workspace, matching the builder's live preview; another workspace can clone a public blueprint; Studio browses version and diff history.

- **CAP-6 Workspaces & tenancy** *(F6)*
  - **intent:** All customer resources belong to a workspace with the four-role matrix (OWNER/BUILDER/MEMBER/VIEWER) enforced server-side on every path.
  - **success:** Automated tests prove cross-tenant requests fail closed (401/404, never data) on REST, MCP, and Studio, with denials audit-logged.

- **CAP-7 Billing & metering** *(F7)*
  - **intent:** Humans pay via Stripe subscriptions and agents pay per query — from guardian-governed prepaid wallets or account-less x402 — against two billable units (cached corpus read; on-demand refinement) recorded in one metering ledger.
  - **success:** A query bills only on successful delivery; the ledger reconciles against charges over a sustained test period; an over-quota or unfunded request receives a machine-readable 402 with a purchase path; a guardian kill-switch takes effect immediately, with nothing billed after it.

- **CAP-8 Operations console** *(F8)*
  - **intent:** Operators govern customers and agent fleets through authenticated admin accounts, with real-telemetry analytics, a queryable audit stream, audit-logged courtesy actions, and a no-deploy pricing editor.
  - **success:** The audit stream records auth, billing/wallet, pipeline, admin, and cross-tenant-denial events and is queryable; console metrics derive from telemetry with zero fabricated values; a founder changes a plan without a deployment.

- **CAP-9 Marketplace** *(F9)*
  - **intent:** Customers browse and install creator-published schema templates and feeds; usage accrues an 80/20 creator revenue share from launch, with live payouts as the first committed fast-follow.
  - **success:** Usage of an installed listing produces per-query, per-unit-type accrual visible in the creator's ledger; self-dealing queries earn zero; the accrue-now/pay-soon arrangement is stated publicly to creators.

- **CAP-10 Fine-tuning export** *(F10)*
  - **intent:** Workspaces export corpus slices — including diff-derived training examples — as OpenAI JSONL, Llama3, Alpaca, and RAG-chunk datasets, gated by entitlements.
  - **success:** An export honors workspace entitlements, produces valid files in each format, and lands in the metering ledger.

- **CAP-11 Onboarding & developer experience** *(F12)*
  - **intent:** A new signup reaches their first refined query in minutes through guided quickstarts, one-click MCP client configuration for agentic IDEs, a signed-in playground showing measured latency and token savings, and copy-ready snippets.
  - **success:** The activation path emits end-to-end telemetry feeding the time-to-first-refined-query and bailout metrics; the playground refines a pasted URL under free-tier quota and displays measured numbers.

- **CAP-12 Client SDKs & integrations** *(F13)*
  - **intent:** Developers consume the platform through a TypeScript SDK, a LangChain loader + tools package, and a LlamaIndex reader, published to npm under the commercial brand.
  - **success:** Each package installs from npm and completes a refined query against the production API; Studio surfaces copy-paste snippets for all three.

## Constraints

- The architecture spine (`ARCHITECTURE-SPINE.md`, AD-1..AD-16) is binding on all implementation: Cloudflare platform, hexagonal modular monolith, append-only ledger, minted tenancy scopes. AD IDs are stable and citable downstream.
- Fully proprietary — all rights reserved, Virgee LLC. No open-core, no public source.
- Launch is quality-gated, never calendar-gated. The Phase 0 exit gate (prd.md §6) defines "ready"; because development is AI-assisted, gates rest on verification independent of the code's authors and toolchain.
- Exactly two billable units (cached corpus read; on-demand refinement); a query bills only on successful delivery; on-demand is priced above measured inference cost.
- Every published performance or uptime number is measured, never estimated or fabricated.
- Respectful-crawler policy: robots.txt honored, identifiable user-agent, conservative rates, public takedown/opt-out; terms forbid targeting login-gated content or personal data.
- Customer data and customer-created content never train foundation models — the platform's or third parties'.
- MCP complies with the 2026-07-28 authorization spec (OAuth 2.1, RFC 9728/8707); no customer-facing surface is unauthenticated except named public surfaces (badges, corpus overview, status, docs).
- Pricing tier structure is committed (Free / PRO / ENTERPRISE / agent pay-per-query); every dollar and quota number is a placeholder until the Phase 0 pricing exercise; plans are founder-editable configuration, not code.
- Under schedule pressure, scope sheds only in the pre-agreed cut order (export formats → marketplace-to-blueprints → SDKs → chat destinations); F1–F8 + F12 are never cut.
- Availability posture at launch: 99.9% internal target with a public status page; no contractual SLA.

## Non-goals

- The promotions/social-campaign module and Hermes marketing agent — internal Virgee tooling at most, never product.
- Regulated-enterprise compliance packages at launch: no BAA, no SOC 2 certification, no dedicated tenancy (audit and provenance groundwork ships; certifications are roadmap).
- No PHI/PII processing, and no data-residency options before Phase 4 — both stated plainly where buyers look.
- No anonymous usage: the free tier requires signup; account-less x402 access is paid per request.
- Browser extension and CLI are not launch surfaces (committed Phase 3 fast-follows, FR-100/101).
- No public latency claims until telemetry exists to back them.

## Success signal

The Phase 0 exit gate passes green — every launch FR verified, cross-tenant and billing test suites passing, an independent security review closed, the dev corpus refreshing 14 days unattended — and by day 90 of being public, active workspaces and refined queries grow week-over-week against numeric thresholds frozen at day 30, with the bailout (one-and-done) rate under its frozen ceiling.

## Assumptions

- Launch persona: solo developers wiring MCP tools into Cursor/Claude Code-class IDEs, whose week-one behavior is exploration. A hypothesis with a validation plan (MCP-connection rate, activation funnel), not a fact.
- Agent-paid usage arrives via personal adoption → company pays; whether third-party agent fleets discover and pay autonomously is unknown, so account-less x402 ships with zero revenue expectation attached.

## Open Questions

- OQ-1 — Commercial product name and domain (under Virgee; FeltIQ pattern)?
- OQ-2 — Real pricing numbers per unit type (Phase 0 exercise from measured unit costs + competitor anchors)?
- OQ-3 — Free-tier quota size, and do agents get free trial credits or is free human-signup-only?
- OQ-4 — Launch source list for the dev vertical (which SDKs/packages, how many)?
- OQ-5 — How deep does platform-mediated guardianship go beyond wallet + kill-switch?
- OQ-6 — Do third-party agent fleets discover and pay autonomously? (Measured in Phase 2, not decided.)
- OQ-8 — Which additional agent payment rails after launch x402 (Stripe MPP, Skyfire, card-rail schemes)?
- OQ-9 — User journeys for the five human actor types — deferred to the UX phase (`bmad-ux`).
