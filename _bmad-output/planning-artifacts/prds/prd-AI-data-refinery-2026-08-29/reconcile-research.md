# Input reconciliation — research-landscape.md vs prd.md (2026-08-29)

## Absorbed

| Research point | Where in PRD |
|---|---|
| §1 Every major web-data player ships MCP; severity-rated diffs + vertical pre-indexed corpora remains open | Why Now; Positioning |
| §2 MCP spec 2026-07-28 standardizes OAuth 2.1 for servers | Why Now; FR-031; NFR-020 |
| §2 Registry landscape (official registry, Glama, Smithery, PulseMCP) | Phase 1 distribution |
| §3 x402 real infrastructure, Linux Foundation governance, Apify precedent | Why Now |
| §4 Incumbents sell dashboards/APIs to humans, not agent-native feeds | Positioning §2; FR-012 |
| §4 Health-payer + zoning as open agent-native wedges; CMS-0057 2026–27 tailwind | Phase 4 |
| §5 AI-specific audit evidence: model versioning, inference logging | FR-003; NFR-042; NFR-041 |
| §5 Queryable audit trails; RBAC | FR-073; FR-050/052; NFR-023 |
| §1 Firecrawl-class extraction latency anchor | NFR-002 |

## Consciously parked

| Research point | PRD disposition |
|---|---|
| §3 x402 as a payment rail | Phase 3 evaluation; FR-063; OQ-8 |
| §4/§5 Regulated verticals + HIPAA/BAA | Phase 4 conditional; NFR-032; Out-of-scope |
| §5 SOC 2 as prerequisite for regulated-vertical sales | NFR-032; §2 scope commitment |
| §1 Competitor pricing anchors | OQ-2 pricing exercise |
| §1 Deeper diff mechanisms (AST-level) | FR-021 caveat + Phase 3 |

## GAPs

- **G1 — Context7 contests the launch vertical, free.** Upstash's free pre-indexed library-docs corpus over MCP targets exactly the launch persona. PRD never names it. FR-013's differentiation must rest on versioning + severity-rated diffs; positioning must handle Context7 explicitly.
- **G2 — Problem statement overstates competitor deficiencies.** "Scrapers do not detect semantic changes... do not integrate natively into MCP" is refuted by Firecrawl Monitor and universal MCP shipping — and contradicted by the PRD's own Why Now. Narrow to the true claim: no schema validation, no severity rating, no versioned corpus.
- **G3 — SOC 2 Type II is table stakes for ANY procurement,** but PRD gates it behind Phase 4's growth gate while selling an ENTERPRISE tier at launch and betting on a dev→company-pays path. Circular.
- **G4 — Agent-payment market size omitted.** <5% of MCP servers earn revenue; <$50K/day agent-to-tool volume; research verdict "subscriptions as the revenue base." Vision elevates dual billing to "defining trait" without this temper.
- **G5 — Apify pays creators 80% (vs PRD 70/30) with live payouts.** Marketplace supply-side priced against a better-paying incumbent; PRD never registers it.
- **G6 — Account-less agent payment exists (Apify via x402/Skyfire); PRD requires token + funded wallet + guardian.** PRD's agent friction is worse than the precedent it cites; partly answers OQ-6 by design, not market.
- **G7 — FR-031 omits RFC 8707 Resource Indicators** (spec requires both RFC 9728 and RFC 8707).
- **G8 — Data residency options absent** (2026 regulated-buyer expectation) — add to Phase 4 or record as known non-offering.
- **G9 — Drift monitoring absent** from NFR-042's AI-evidence set.
- **G10 — Alternative agent rails unconsidered:** Stripe Machine Payments Protocol (rides the committed Stripe rail), Moesif, Skyfire, card-rail family. OQ-8 should widen from "x402?" to "which agent rail(s)?"
- **G11 — Consolidation/capital influx timing pressure unacknowledged** (Tavily→Nebius, Jina→Elastic, Parallel $100M, Nimble $47M). Open-ended Phase 0 has a competitive cost; no re-evaluation trigger named.
- **G12 — Apify rental pricing retires Oct 2026** — marketplace monetization norms shifting toward pay-per-event; bears on FR-081/082 design.
- **G13 — SEC 10-K template is the most contested vertical** (Daloopa agent-native since 2025; AlphaSense agentic). Should not be marketing-forward among the six templates.
- **G14 — Registry listing ≠ distribution strategy** in a 10k–37k server field; no in-registry differentiation plan or distribution counter-metric.
- **G15 — Free-tier quota lacks competitive anchors** (Bright Data MCP: 5k free req/mo; Context7 free) — OQ-3 should carry anchors like OQ-2 does.
- **G16 — Combination-only moat fragility unrecorded:** each element of the four-part positioning claim has a strong owner; every competitor is one feature from parity.
- **G17 — Adjacent change-detection category unmapped** (Visualping, Fluxguard) — the category buyers search first.
- **G18 — Research source-confidence caveats not carried into public-claim handling** (Tavily/Nebius, MCP-monetization figures, x402 volume are secondary/vendor-reported) — launch copy must re-verify.
