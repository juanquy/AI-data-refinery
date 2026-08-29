---
title: Repo → PRD Input Reconciliation
input: repository /Users/ariel/Development/AI-data-refinery (prototype, AntiGravity-generated)
prd: prd-AI-data-refinery-2026-08-29/prd.md
date: 2026-08-29
---

# Input Reconciliation — Repository

Legend: **COVERED** = PRD includes it · **EXCLUDED** = PRD explicitly drops/defers it · **GAP** = present in repo, PRD neither includes nor excludes.

## API surfaces & endpoints

- **Public aggregate corpus-overview endpoint** `/api/v1/stats` (per-domain entity counts + latest diffs) — `apps/worker/src/index.ts`. FR-033 covers per-customer "usage/stats"; a public corpus-size/index-health view is a different thing. **GAP (minor)**
- **Global change firehose** `/api/v1/diffs` — unauthenticated cross-domain feed of recent diffs — `apps/worker/src/index.ts`. PRD covers per-entity history (FR-020) and webhook subscriptions (FR-022) but never a global change feed as a product surface. **GAP**
- **RSS 2.0 change feed** `/api/v1/promotions/feed.rss` for Zapier/IFTTT/Buffer consumers — `apps/worker/src/routes/promotions.ts`. It lives inside the excluded promotions module, but as a *change-distribution rail* it is a product capability the exclusion silently swallows. **GAP-inside-exclusion**
- **Badge semantics** `/badge/:package.svg` renders the entity's latest `version_label` and colours by latest diff severity (red CRITICAL / amber MAJOR / green default), `Cache-Control: 600`, pitched as a GitHub-README embed — `apps/worker/src/index.ts`, `docs/ROADMAP_AND_COMPETITORS.md`. FR-023 says "public SVG status badges" without the severity/version semantics or the README-embed distribution play. **Partial GAP**
- **Machine-readable trust/health endpoint** `/api/v1/enterprise/sla-health` (uptime, PoP count, p50/p95/p99, TLS/AES posture, GDPR/SOC2-ready flags) — `apps/worker/src/routes/enterprise.ts`. NFR-001/003/010 retire the fabricated numbers and NFR-010 promises a human status page; a machine-readable posture/health document for agents is not an FR. **Partial GAP**
- **Service-discovery documents**: root `/` endpoint index, `/mcp/manifest`, README's "REST / OpenAPI Endpoints" claim — `apps/worker/src/index.ts`, `routes/mcp.ts`, `README.md`. FR-033 has no OpenAPI-spec / discovery-document requirement. **GAP (minor)**
- **Anonymous abuse control**: 20 on-demand refinements/hour/IP via KV, with an explicit upgrade message — `apps/worker/src/routes/custom.ts`. PRD lists "free-tier abuse rate" only as a counter-metric; no rate-limiting or anonymous-sandbox FR. **GAP**
- **Zero-signup usage**: on-demand refine works with no key at all. NFR-020 requires auth on every customer-facing endpoint, so this is effectively excluded — but the "try it before you sign up" onboarding idea disappears with it. **EXCLUDED (with dropped idea)**

## MCP specifics

- MCP **resources**: three `refinery://` corpus resources (developer breaking-changes, B2B pricing, municipal rules) — `routes/mcp.ts`. **COVERED (FR-030)**
- MCP **prompts**: `check_sdk_upgrade` prompt template with typed arguments — `routes/mcp.ts`. FR-030 names prompts; the idea of shipping guided prompt templates per vertical exists only in the prototype. **COVERED (thin)**
- **Dynamic per-schema tool provisioning** `refinery_custom_<slug>` on schema save ("live MCP tool in 60 seconds") — `routes/mcp.ts`, `docs/notebooklm_episode3_schema_studio.md`. **COVERED (FR-042)**
- MCP pinned to protocolVersion `2024-11-05`, unauthenticated, unmetered, lists every tenant's schemas — `routes/mcp.ts`. **COVERED** as FR-031/032/F6 prototype gaps.

## Billing, monetization & metering

- **Agent-token minting mechanics** — `routes/billing.ts`: anonymous callers self-mint `ref_agent_*` with 50 free trial credits; callers presenting an active paid key mint up to 50,000; response returns `isTrialTier`, price-per-query, and ready-to-paste auth headers. PRD FR-062/064 model tokens as guardian-provisioned against a funded wallet — free anonymous agent credits, parent-key-derived allowance tiers, and guardian-less self-service minting are unaddressed. **GAP**
- **402 discovery headers**: `X-Refinery-Price-Per-Query`, `X-Refinery-Protocol`, `X-Refinery-Agent-Token-Endpoint` plus body-level `agentTokenEndpoint`/`checkoutUrl` — a machine-navigable purchase path — `apps/worker/src/index.ts`. **COVERED (FR-062)**
- **`X-402-Payment: micro_…` header scheme** documented in Studio help and landing copy — `App.tsx:3540`, `LandingPage.tsx:712`. **Was EXCLUDED/deferred; now launch scope per Match-Apify decision.**
- **Creator-set per-query pricing** on marketplace listings — `migrations/0007`, `routes/marketplace.ts`. FR-081 fixes the split but never grants creators pricing control. **GAP**
- **Marketplace curation**: `is_featured` flag and total-queries leaderboard ordering — `migrations/0007`, `routes/marketplace.ts`, `App.tsx:2596+`. **GAP**
- `creator_payouts` table, `payout_method` default `STRIPE_CONNECT`, PENDING status — `migrations/0007`. **COVERED (FR-082)**
- **Non-query entitlement dimensions**: the marketing tier ladder gates on custom-schema counts (Pro = 5 schemas, Team = 15) and names a different price ladder than the DB catalog — `docs/hermes_agent_master_briefing.md` vs `migrations/0010`. PRD FR-061 commits the DB ladder; quotas are query-count only, with no schema/seat/workspace entitlement axis. **GAP (minor)**
- **Operator-granted credits**: console can top up any agent wallet and rewrite any human user's plan/quota — `routes/management.ts`. FR-071 lists view/suspend/revoke/kill-switch only; comps and manual quota grants are unmentioned. **GAP (minor)**
- Founder-editable plan catalog in D1 + public `/api/v1/billing/plans` — **COVERED (FR-061/074)**
- Stripe webhook HMAC verification with replay tolerance — **COVERED (FR-066/NFR-024)**

## Corpus, pipeline & change intelligence

- `refinery_sources` registry with per-source `cron_schedule`, `enabled`, `last_refined_at` — **COVERED (FR-010/011)**
- **Per-job accounting**: `refinery_jobs` with `status`, `error_message`, `tokens_used`, `duration_ms` — `migrations/0001`. NFR-050 requires cost tracking; per-job token accounting as a customer-visible or reconciliation artifact isn't specified. **Partial GAP**
- **Per-entity `confidence_score`** (0.96–0.99, currently hardcoded per route) — `migrations/0001`, `routes/dev.ts` etc. PRD carries validation status + provenance (FR-002/003) but no confidence/quality-score concept. **GAP**
- **Source-connector ingestion**: GitHub Releases API daemon idea — `docs/ROADMAP_AND_COMPETITORS.md`. FR-013/OQ-4 assume generic URL crawling; API-based source connectors are a distinct ingestion mode. **GAP (minor)**
- **Chat-native alerting**: Discord / Slack / Telegram webhook targets and a console "send test event" button — `docs/ROADMAP_AND_COMPETITORS.md`, `routes/management.ts`. FR-022 specifies generic signed webhooks; chat destinations and test-delivery affordance absent. **GAP**
- **Pipeline-scoped `webhook_url`** (per-pipeline notification target) — `migrations/0004`. Not in the FR-022 subscription model. **GAP (minor)**
- Domain-aware diff heuristics incl. price-increase asymmetry — **COVERED (FR-021)**
- **Severity vocabulary mismatch**: entity diffs use CRITICAL/MAJOR/MINOR/**INFORMATIONAL** (`lib/differ.ts`) while per-item breaking changes use CRITICAL/**HIGH/MEDIUM/LOW** (`packages/schema/src/index.ts`). FR-021 commits to CRITICAL/MAJOR/MINOR only. **GAP (minor)**
- AST-level dev diffs as marketed mechanism — **COVERED** (FR-021 note + Phase 3)

## Search & vector

- Vectorize + bge-base embeddings; embed-text recipe; topK; post-query domain filter — **COVERED (FR-034)** at capability level.
- **Result-shape contract**: two separate buckets (`vectorSemanticMatches`, `directMatches`), no fused ranking — `routes/search.ts`. **GAP (minor, spec-level)**
- KV hot cache 24h TTL — **COVERED** (NFR-001/012 posture)

## Studio & product experience

- **In-product Help Center**, 7 sections, 1-click MCP config copy for **Cursor / Claude Desktop / Windsurf**, copy-cURL, copy-SDK snippets — `App.tsx:363,799,3206+`. No FR for onboarding, help, or client-config generation. **GAP**
- **Playground tab** — paste URL + instruction, latency counter, token-savings framing — `App.tsx:2962`. FR-014 covers on-demand refinement; playground as activation surface unspecified. **Partial GAP**
- Interactive schema tester — **COVERED (FR-041)**
- **Live "Code & Protocol Preview"** pane rendering generated MCP tool JSON — `App.tsx:2332`. **GAP (minor DX)**
- **RBAC matrix**: OWNER / BUILDER / MEMBER / VIEWER with per-capability rights — `App.tsx:2578`, `docs/notebooklm_episode4_tenant_workspaces.md:117-129`. FR-052 says "owner, member at minimum". **Partial GAP**
- **Public/private schema visibility** (`is_public`) + clone-a-blueprint flow — `migrations/0006`, `routes/schemas.ts`. **GAP**
- **Visual diff time-travel** version browsing in Studio — `App.tsx:851`. **Partial GAP**
- **Landing-page experience**: particle canvas, rotating metric strip, animated before/after demo — `LandingPage.tsx`. No PRD coverage of marketing-site experience. **GAP (qualitative → addendum)**
- 13-tab Studio incl. `marketing` tab — **EXCLUDED**

## Export

- Four formats — **COVERED (FR-090)**
- **Diffs exported as migration-training examples** — `routes/export.ts`. Distinct dataset product. **GAP (minor)**
- Download mode + 500-row cap; ungated in prototype vs entitlement-gated in PRD — **Partial GAP / COVERED-as-gap**

## Packages & distribution

- **`@data-refinery/integrations`**: LangChain loader + agent tools, LlamaIndex reader, shared `DataRefineryClient`, promoted in Studio — `packages/integrations/*`, `App.tsx:3134-3162`. Framework-native SDKs neither included nor excluded. **GAP (highest-impact)**
- Browser extension is working MV3 code — **EXCLUDED/deferred (FR-100)**, note: built, not net-new.
- CLI with defined UX (`npx refinery check stripe-node --target=15.0.0`) — **EXCLUDED/deferred (FR-101)**
- Verification scripts — **COVERED** (Phase 0 exit gate)
- Hardcoded production base URL in integrations client + extension manifest — **COVERED (implicitly, Phase 0 identity)**

## Governance, legal & trust

- **"No foundation-model training on customer data"** commitment — `docs/notebooklm_episode4_tenant_workspaces.md:175-181`. No PRD counterpart. **GAP (notable trust promise)**
- **Per-template compliance guardrails in extraction prompts**: HIPAA no-PHI, FDA "not medical advice", SEC "not investment advice", Fair Housing — `migrations/0008-0009`, `App.tsx:331-334`. **GAP**
- **Open-core / BUSL-1.1 posture** + build-in-public community loop — `LICENSE`, `docs/LINKEDIN_ARTICLE.md:97-110`. Proprietary decision **COVERS** the flip; open-core-as-distribution is the dropped concept. **GAP (qualitative → addendum, rejected alternative)**
- Crawler identity: spoofed Chrome UA + `DataRefineryBot/1.0`, no robots.txt — **COVERED** (gap NFR-030 closes)
- Prompt-injection fencing + SSRF checks — **COVERED (NFR-021)**
- Hardcoded passcodes, plaintext seeds — **COVERED (FR-070/NFR-022 gaps)**
- Audit tables read-never-written, fake seed rows, defaulted latency — **COVERED (FR-073/NFR-040 gaps)**

## Positioning, claims & brand

- **Token-efficiency value prop**: "85%+ token reduction", "200–600 tokens vs 10k–50k" — README, docs, Studio, landing. **No requirement to measure/surface token savings and no metric.** **GAP**
- Retired claims inventory (sub-20ms, 99.998%, 330 PoPs, "zero hallucination", "100% deterministic", hardcoded stats) — **COVERED (NFR-001/003/010)**
- **Brand voice & naming metaphor**: "Built For Human Eyes / Pristine Machine Fuel" slogan, "machine fuel"/"L2.5 layer" framing, emoji-forward tone — **GAP (qualitative → addendum)**
- **Activation-time promises**: "schema in 60 seconds", "MCP in 1 line of JSON" — **Partial GAP (qualitative DX promise)**
- **Vertical ACV bands** ($12k–$250k/yr) + non-developer ICP pitch hooks — **EXCLUDED (Phase 4) → addendum for GTM depth**
- Distribution assets: Awesome MCP Servers PR, Smithery listing, NotebookLM podcast/video series, LinkedIn article — registries **COVERED** (Phase 1); content engine **Partial GAP → addendum**
- Promotions module, Hermes agent, `sales@freshbeats.ai` CTA — **EXPLICITLY EXCLUDED**
- Enterprise private refineries (dedicated D1/Vectorize in customer's own account; ingesting Jira/intranet) — dedicated tenancy **EXCLUDED (Phase 4)**; customer-supplied private corpora sub-idea **Partial GAP**
- `workspaces.settings_json` per-workspace config surface — **GAP (trivial)**
