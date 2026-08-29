---
title: PRD Addendum — Universal Data Refinery
status: companion to prd.md
updated: 2026-08-29
---

# Addendum

This addendum holds depth that belongs downstream (marketing, UX, architecture, Phase 4 GTM) rather than in the PRD's main narrative. Sources: the prototype repository and its docs; reconciliation reports (`reconcile-repo.md`, `reconcile-research.md`).

## Brand voice & metaphor (for the naming/website workstream, OQ-1)

The prototype has a strong, coherent voice worth carrying into whatever the commercial brand becomes:

- **Founding slogan**: *"The World Wide Web Was Built For Human Eyes. We Refine It Into Pristine Machine Fuel."*
- **Core metaphor family**: refinery / machine fuel / distillation — messy crude web in, pristine validated fuel out. Docs extend it to "the L2.5 Machine Fuel & Intelligence Layer of the internet."
- **Tone in docs and UI**: high-energy, emoji-forward, developer-swagger. Keeping or retiring it when the commercial brand is designed should be a *decision*, not an accident of rewriting.
- **Activation-time promises used as marketing hooks**: "build a schema in 60 seconds," "connect MCP in 1 line of JSON," "learn it in 30 seconds." Usable only if the DX FRs (F12) actually deliver them.

## Landing-page experience (for UX)

The prototype landing page (`apps/web/src/LandingPage.tsx`) implements a 60-FPS particle/lattice canvas, a rotating metric strip, and an animated raw-HTML→JSON before/after demo. The before/after demo is the strongest storytelling asset — it shows the product's entire value in one animation. Note: the metric strip currently rotates fabricated numbers; under NFR-003 it must show measured ones or nothing.

## Content & distribution assets (for launch marketing)

The prototype era produced reusable distribution assets: a NotebookLM podcast/video briefing series (`docs/notebooklm_*.md`, `docs/Universal_Data_Refinery.mp4`), a LinkedIn launch article draft (`docs/LINKEDIN_ARTICLE.md`), and a plan for Awesome-MCP-Servers/Smithery listings. A content engine was part of the original GTM thinking; the PRD's Phase 1 covers registry listings and badge embeds (FR-023) only — content marketing is a launch-marketing decision outside the PRD.

## Vertical ACV bands & ICP pitch hooks (for Phase 4 GTM)

From `docs/hermes_agent_master_briefing.md` — the founders' original enterprise value hypotheses, parked with the Phase 4 deferral:

| Template | Claimed ACV band | ICP |
|---|---|---|
| Health Plan Clinical Policies & Prior-Auth | $50k–250k/yr | Health plans, TPAs, InsurTech |
| BioPharma FDA & Patent Cliffs | $50k–150k/yr | Pharma competitive intelligence |
| Municipal Zoning / STR | $36k–120k/yr | PropTech, STR investors |
| SEC 10-K Risk Factors | $30k–90k/yr | Fintech, research (NB: most contested vertical — Daloopa, AlphaSense) |
| B2B SaaS Pricing | $24k–100k/yr | FinOps, procurement bots |
| Dev SDK / AST Migration | $12k–60k/yr | Dev-tool companies, platform teams |

These are hypotheses, not validated pricing. Research (`research-landscape.md` §4) names health-payer policy and municipal zoning as the open agent-native wedges, with CMS-0057 (2026–27) as a tailwind for the former.

## Rejected alternative: open-core / build-in-public

The prototype was BUSL-1.1 with a public repo used as a trust asset and community-feedback loop ("what niches should we refine next?"). The founders decided on **fully proprietary** (all rights reserved, Virgee LLC). What is knowingly given up: source-visibility as a trust signal for the developer audience, the community feedback loop, and open-core as a distribution channel. If developer trust proves hard to earn closed-source, this trade-off is the place to revisit.

## Prototype mechanics worth preserving (for architecture)

Not spec — but the prototype contains worked-out mechanics the architecture phase should evaluate rather than reinvent:

- **402 discovery headers**: `X-Refinery-Price-Per-Query`, `X-Refinery-Protocol`, `X-Refinery-Agent-Token-Endpoint` + body `agentTokenEndpoint`/`checkoutUrl` — a machine-navigable purchase path (`apps/worker/src/index.ts`).
- **Per-job accounting fields**: `refinery_jobs.tokens_used`, `duration_ms`, `error_message` (`migrations/0001`) — the raw material for NFR-050 unit economics and FR-005 token savings.
- **KV hot-cache recipe**: `refinery:<domain>:<key>:latest`, 24h TTL (`lib/db.ts`).
- **Embedding recipe**: entityKey + summary + first 500 chars of JSON, truncated to 1000 chars, bge-base-en-v1.5 (`lib/vector.ts`).
- **Prompt-injection fencing** (`<untrusted_web_content>` + defensive directive) and SSRF allow/deny lists (`lib/extractor.ts`) — explicitly preserve.
- **RSS 2.0 change feed** (`routes/promotions.ts`) — lived in the excluded promotions module but is a change-distribution rail (Zapier/IFTTT consumers); candidate future addition to F3.
- **Search result shape**: prototype returns separate `vectorSemanticMatches` and `directMatches` buckets, no fused ranking (`routes/search.ts`) — FR-034 leaves ranking to architecture.
- **Per-workspace `settings_json`** config surface (`migrations/0005`).
- **Export mechanics**: download mode with Content-Disposition, 500-row cap (`routes/export.ts`).
- **Hardcoded production URL**: `data-refinery-worker.juanquy.workers.dev` baked into `packages/integrations` and the extension manifest — must be re-pointed in the Phase 0 identity workstream.
