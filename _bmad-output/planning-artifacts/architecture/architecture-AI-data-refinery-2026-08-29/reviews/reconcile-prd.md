---
title: Reconciliation — PRD vs Architecture Spine
prd: _bmad-output/planning-artifacts/prds/prd-AI-data-refinery-2026-08-29/prd.md (+ addendum.md)
spine: _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/ARCHITECTURE-SPINE.md
date: 2026-08-29
verdict: "Spine is sound — no critical findings. Two high gaps (outbound-fetch boundary policy; durable audit stream) need new AD/seed coverage; nine medium items are wording/seed/convention tweaks."
counts: { critical: 0, high: 2, medium: 9 }
---

# Reconciliation Report — PRD → Architecture Spine

Scope rule applied: a PRD feature is **not** reported merely because the spine doesn't detail it; a Capability→Architecture Map row plus governing ADs counts as coverage. Only structural constraints with no home, contradictions, and dropped quiet-requirement invariants are reported.

## Verified covered (no findings)

| PRD decision | Spine home |
|---|---|
| Two-part billable units (F7 preamble, FR-065) | AD-11 names `cached_read` and `refinement` explicitly; Deferred "Pricing numbers" fixes units + micro-USD |
| Marketplace accrual-at-launch + fraud controls (FR-081/082) | Map row "Marketplace (accrual + fraud controls)"; Deferred "Stripe Connect payouts — ledger accrual (AD-11) is the launch mechanism" |
| Both agent modes + guardian kill-switch (FR-062/064, §2) | AD-7: agent token (wallet, kill-switch) and drive-by x402 as distinct principals |
| Quarantined invalid snapshots never diffed (FR-020, FR-002) | AD-9 (quarantine to R2 + run record, never coerced) + seed `QUARANTINED_SNAPSHOT` separate from `REFINED_ENTITY→ENTITY_DIFF` |
| Measured-numbers-only claims (NFR-001/003, FR-072) | AD-11 final sentence; Telemetry map row |
| 99.9% target + status page (NFR-010/013) | Map row "Telemetry / status page"; target itself is operational, not structural |
| Free tier with monthly quota (FR-060) | Quotas are reads of the AD-11 ledger; free-tier keys are AD-7 workspace API keys |
| Role-free 402 hard stop for humans (FR-067) | Conventions "Auth transport": one 402 shape for humans and agents |
| Per-template guardrails (FR-012) | Deferred row exists (but see M-9 wording) |
| SDK/integrations launch surface (F13) | Map row "SDKs (TS, LangChain, LlamaIndex) → packages/sdk, AD-8" |
| Export formats + entitlement gating (FR-090) | Map row "Fine-tuning export", AD-6/AD-8; format list is feature-altitude |
| Quality-gated launch (§1, §6) | Process, not structure; AD-13 CI gates + Testing convention are the spine's contribution |
| MCP metered identically to REST (FR-032) | AD-11 "every principal type"; MCP map row governed by AD-11 |
| Wallet top-ups move real money (FR-063) | AD-11 single write path + `adapters/stripe`; money convention (micro-USD, no floats) |
| Secrets/URLs purged (NFR-022, addendum hardcoded prod URL) | AD-13 |

---

## 1. Architecture-relevant PRD requirements with NO home

### H-1 (HIGH) — Outbound-fetch boundary policy has no AD, convention, or seed element

**PRD refs:**
- **NFR-030**: "Source acquisition follows a **respectful-crawler policy**: corpus crawling honors robots.txt, fetches with an identifiable user-agent at conservative rate limits, a public takedown/opt-out process exists for source owners…"
- **NFR-021**: "All server-side fetching enforces SSRF protections; all fetched content is treated as untrusted input to the extraction model (prompt-injection hardening). *(Prototype: implemented — preserve.)*"
- **FR-001**: pipeline includes "content sanitization, SSRF/allowlist enforcement, AI extraction hardened against prompt injection in source content".
- **NFR-026**: anonymous traffic carries "the same SSRF/content policies as authenticated traffic".
- Addendum "Prompt mechanics worth preserving": `<untrusted_web_content>` fencing + SSRF allow/deny lists — "explicitly preserve".

**Gap:** The filter chain names `fetch → sanitize → …` but no AD polices that boundary. SSRF, robots.txt, identifiable UA, per-source rate limits, the opt-out/takedown registry, and untrusted-content fencing are boundary invariants (exactly what a spine fixes — the PRD marks the prototype's implementations "preserve"). Nothing prevents a second, unpoliced fetch path (e.g., FR-041 schema-test-against-live-URL, FR-010 source connectors) from bypassing them — the same class of drift AD-3 exists to prevent for refinement.

**Fix — new AD-14 (suggested text):**
> **AD-14 — Outbound fetch is one policed boundary**
> - **Binds:** refinement, corpus, schema testing, connectors
> - **Prevents:** SSRF via a second fetch path; crawler behavior that breaks the respectful-crawler policy (NFR-030); unfenced source content reaching the extraction model
> - **Rule:** Every server-side fetch of external content goes through the single `fetch` port (one adapter). It enforces: SSRF allow/deny (no private ranges, no redirects out of policy), robots.txt for corpus crawling, an identifiable product user-agent, per-source rate limits, and a check against the takedown/opt-out registry (a D1 table; a listed source is never fetched). Source connectors (e.g., GitHub Releases) are alternate implementations of the same port, subject to the same policy. Fetched content is always fenced as untrusted (`<untrusted_web_content>` + defensive directive) before any LLM call — no unfenced path exists. Applies identically to anonymous x402 traffic (NFR-026).

Also add seed element: `OPT_OUT_SOURCE` (or takedown-registry table) in the ER diagram.

### H-2 (HIGH) — Durable, queryable audit stream has no home; ops console has no map row

**PRD refs:**
- **FR-073**: "An audit stream is actually written and queryable: auth events, billing/wallet events, pipeline runs, admin actions, cross-tenant denials. *(Prototype gap: audit tables read but never written.)*"
- **NFR-041**: "The audit stream (FR-073) is **durable and queryable** — the groundwork for future SOC 2 evidence."
- **FR-051** (cross-tenant denials audit-logged), **FR-052** (role changes audit-logged), **FR-071** (courtesy actions audit-logged and visibly distinct in the ledger), **FR-070/072/074** (operations console).

**Gap:** The spine's only logging statement is the convention "Structured JSON to Workers observability" — ephemeral platform logs, which cannot satisfy "durable and queryable" and are not the FR-073 customer/operator-queryable stream. No AD writes audit rows, no `AUDIT_EVENT` in the seed ER, and the Capability→Architecture Map has **no Operations Console row** at all (FR-070–074 is a whole launch feature family with no mapped home; only FR-074 is grazed by the Deferred pricing row). The Deferred "SOC 2 readiness" row claims "AD-11/AD-13 create the evidence trail" — AD-11 covers only billable events, not auth/admin/denial events, so the claim is currently overstated.

**Fix:**
1. Extend AD-11's pattern (or add one sentence to AD-11): "Audit events (auth, billing/wallet, pipeline runs, admin actions, role changes, cross-tenant denials) follow the same pattern: append-only `audit_events` rows in D1, written by core services alone — Workers observability logs are diagnostics, never the audit record."
2. Add `WORKSPACE ||--o{ AUDIT_EVENT` (nullable workspace for platform-level admin events) to the seed ER.
3. Add map row: `| Operations console + audit stream | entry/http admin routes over core (admin role per AD-7); audit_events in D1 | AD-7, AD-11, AD-13 |`

### M-1 (MEDIUM) — "Billable only on successful delivery" and explicit reversal events absent from AD-11

**PRD refs:** F7 preamble — "A query is billable only when the platform **successfully delivers** the requested result… in relationship mode they are auto-credited to the wallet, in account-less mode the payment is refunded or never settled. A retry of a failed query is a new attempt, not a second charge." **FR-065** — "refunds/credits/chargebacks appear as explicit ledger events." **FR-064** — "nothing is billed to a revoked token after the kill."

**Gap:** AD-11 fixes the ledger's write path but not its two consistency rules: (a) a billable row exists only for a successfully delivered result; (b) reversals are compensating events, never edits (the append-only shape invites this — say it).

**Fix — append to AD-11 rule:** "A billable row is written only on successful delivery; failed extractions produce no billable row (or an explicit auto-credit event where payment already moved). Refunds, credits, chargebacks, and operator courtesy grants are explicit compensating event types in the same ledger — rows are never edited or deleted."

### M-2 (MEDIUM) — Canonical severity vocabulary has no convention row

**PRD ref:** **FR-021** — "one **canonical entity-level scale: CRITICAL / MAJOR / MINOR** … per-item severity … may carry its own finer scale, but the two vocabularies are **defined once and used consistently across API, MCP, badges, and UI**. *(Prototype mixes CRITICAL/MAJOR/MINOR/INFORMATIONAL with CRITICAL/HIGH/MEDIUM/LOW.)*"

**Gap:** This is a consistency convention by the PRD's own wording — the exact class of drift the Consistency Conventions table exists to prevent — and the table has no severity row. AD-3 (one diff filter) fixes computation, not vocabulary reuse across surfaces.

**Fix — add conventions row:** `| Severity | Entity-level: CRITICAL/MAJOR/MINOR. Per-item (within a diff): its own finer scale. Both enums defined once in packages/schema and imported by API, MCP, badges, and Studio — never redeclared. |`

### M-3 (MEDIUM) — Webhook signing (outbound) and Stripe signature verification (inbound) unstated

**PRD refs:** **NFR-024** — "All outbound webhooks are signed; all inbound webhooks (Stripe) are signature-verified." **FR-022** — "are signed, and are retried on failure." **FR-066** — Stripe lifecycle "webhook-driven and signature-verified."

**Gap:** AD-4 fixes delivery mechanics (queue, per-delivery records, retries, DLQ) but not the signing boundary — a security invariant, not feature detail.

**Fix — append to AD-4 rule:** "Every outbound delivery is signed with the subscription's secret (recorded on `WEBHOOK_SUBSCRIPTION`); inbound Stripe webhooks are signature-verified in `adapters/stripe` before any core call."

### M-4 (MEDIUM) — Webhook terminal state is customer-visible + replayable, not just a DLQ

**PRD ref:** **FR-022** — "a persistently failing endpoint moves the subscription to a visible **paused/dead-letter state**, with missed events replayable once the customer revives it — alerts … must never be silently lost."

**Gap:** AD-4's DLQ is queue plumbing; the PRD's rule is a subscription state machine (`active → paused`) plus replay from durable delivery records. Close to feature-altitude, but "never silently lost" is a consistency rule and the DLQ alone doesn't give replay-on-revive.

**Fix — append to AD-4 rule:** "Retry exhaustion transitions the subscription to a visible `paused` state (not merely a DLQ message); `WEBHOOK_DELIVERY` records are the replay source when the customer revives it."

### M-5 (MEDIUM) — Workspace role matrix has no map row and no enforcement-point rule

**PRD refs:** **FR-052** — four-role matrix (OWNER/BUILDER/MEMBER/VIEWER), role changes audit-logged. **FR-050** — roles enforced **server-side** on every path (REST, MCP, Studio).

**Gap:** `core/tenancy` exists in the paradigm and `MEMBERSHIP` in the seed, but no AD or map row names role authorization. AD-6 scopes *data* by owner; AD-7 covers *principals* and platform-admin — neither fixes where the role check lives, so a client-side-only role check (the prototype's failure mode) isn't structurally excluded.

**Fix:** Add map row `| Workspaces, membership & roles | core/tenancy | AD-6, AD-7 |` and one sentence to AD-7: "Workspace authorization = membership role (OWNER/BUILDER/MEMBER/VIEWER) checked in core on every path; Studio gets no role logic of its own (AD-8 pure client)."

---

## 2. Contradictions

### M-6 (MEDIUM) — Seed ER ties USAGE_EVENT to WORKSPACE, but AD-11 requires metering anonymous x402 calls

**PRD refs:** **FR-062** (account-less mode, no signup), **FR-065** (ledger records every billable query with key/agent/workspace attribution). Spine: AD-11 — "written … for every principal type **including anonymous x402 calls**"; seed ER — `WORKSPACE ||--o{ USAGE_EVENT : accrues`.

**Contradiction:** An anonymous x402 call has no workspace; built literally from the seed, drive-by usage either can't be recorded or gets shoehorned into a fake workspace — violating AD-11's own rule and FR-065 attribution.

**Fix:** Change the seed relationship to principal-based attribution: `USAGE_EVENT` carries `principal_type` + `principal_ref` (workspace/key/agent-token nullable; x402 payment reference for anonymous), with `WORKSPACE ||--o{ USAGE_EVENT` marked optional.

### M-7 (MEDIUM) — Deliberately public read surfaces vs AD-6's "there is no unscoped read API to call"

**PRD refs:** **FR-023** — public SVG badges per tracked entity (GitHub-README embed, distribution surface). **FR-033** — "a public corpus-overview endpoint … as a deliberate public surface." **NFR-013** — machine-readable public status document. **NFR-020** — auth everywhere "except deliberately public surfaces (status badges, docs, marketing pages)."

**Contradiction/tension:** AD-6 states every repository read takes an owner scope and no unscoped read exists. Badges and corpus-overview are unauthenticated reads. For platform-corpus entities, `owner = platform` resolves it — but the spine doesn't say so, and for a **tenant-owned** tracked entity a public badge (FR-023 says "per tracked entity") would leak version label + severity, conflicting with AD-6's private-by-default rule. The exposure decision is currently made nowhere.

**Fix — one sentence in AD-6:** "Deliberately public surfaces (badges, corpus overview, status doc — NFR-020's exception list) are reads at explicit `platform` scope; a badge on a *tenant-owned* entity exists only where the owning workspace has explicitly enabled it (an owner-opted public projection), never by default." (Or: restrict launch badges to platform-corpus entities and say so.)

### M-8 (MEDIUM) — AD-1's Cloudflare-exclusivity vs cross-provider model fallback and provider-outage posture

**PRD refs:** **FR-004** — "Extraction supports a primary and fallback model: on primary failure the fallback is attempted." **NFR-012** — "When the AI provider is unavailable, cached corpus data continues to serve … extraction requests fail explicitly."

**Tension:** AD-1: "External services only where Cloudflare has no primitive." Cloudflare *has* an AI primitive (Workers AI), so a literal reading forbids `adapters/ai` from reaching an external LLM (even via AI Gateway) — making FR-004's fallback same-provider-only and useless against exactly the NFR-012 outage scenario, and pre-deciding extraction quality with no stated intent. Not a hard contradiction (the PRD names no provider), but the spine currently decides this by accident.

**Fix — clarifying sentence in AD-1:** "Exception: `adapters/ai` may call external model providers through Cloudflare AI Gateway where extraction quality or FR-004 fallback requires it — model IDs stay env vars per the LLM convention; all other compute/state remains on-platform." (Or explicitly commit to Workers-AI-only and record that FR-004's fallback is a second Workers AI model — either way, decide it on purpose.)

---

## 3. Quiet requirements dropped

### M-9 (MEDIUM) — No-training commitment absent from the LLM convention

**PRD refs:** **NFR-034** — "Customer data and customer-created content are **never used to train foundation models** — the platform's or third parties'. … *(A trust promise the prototype docs already made; the product keeps it.)*" Reinforced by the addendum's trust framing (closed-source trade-off makes stated trust promises load-bearing).

**Gap:** This constrains which model providers/configurations `adapters/ai` may use (no-training terms required — relevant to Workers AI terms and to any AI Gateway provider under M-8) and forbids ever feeding tenant corpora into fine-tuning of platform models. No AD or convention carries it; it is exactly the kind of invariant a later "let's fine-tune on our corpus" idea would trip over.

**Fix — append to the LLM usage convention row:** "Only providers/configurations with contractual no-training terms; customer data and customer-created content never enter any model-training pipeline, ours or a vendor's (NFR-034)."

### M-10 (MEDIUM) — Deferred row misattributes template guardrails to the addendum

**PRD ref:** **FR-012** (prd.md) — templates "embed **compliance guardrails in the extraction prompt and display copy** (HIPAA no-PHI directive, FDA 'not medical advice', SEC 'not investment advice', Fair Housing nondiscrimination)". The addendum carries ACV bands/ICP hooks, *not* the guardrail requirements.

**Gap:** Spine Deferred row reads "Per-vertical template guardrails detail — feature-altitude; **PRD addendum carries requirements**." A downstream reader sent to the addendum won't find them; deferral itself is correct.

**Fix — reword Deferred row:** "Per-vertical template guardrails detail — feature-altitude; **PRD FR-012** carries the requirements (guardrails live in template prompt + display copy)."

### Considered and NOT reported (quiet-requirement sweep)

- **Brand voice / metaphor / activation hooks** (addendum): marketing + DX feature altitude; no structural invariant beyond what F12's map coverage (Studio, AD-8) already holds.
- **Token-savings value prop** (FR-005, addendum): the LLM convention ("every call site records tokens/cost into usage_events metadata") is the structural half; the rest is feature detail.
- **RSS 2.0 change feed** (addendum): explicitly a *candidate future* addition — no Deferred row required.
- **Prototype mechanics list** (KV recipe, embedding recipe, 402 headers, settings_json, export caps): "evaluate rather than reinvent" — advisory, not binding; AD-12/conventions leave room for all of them. (The prompt-fencing/SSRF item is the exception — it is binding via NFR-021 and is covered by H-1.)
- **Staleness timestamp on every response** (NFR-011): response-shape feature detail under the corpus map row.
- **Kill-switch immediacy** (FR-064): AD-7 names the kill-switch; the spine caches nothing auth-related (KV is corpus cache per AD-12), so no structural risk to immediacy.

---

## Summary table

| ID | Sev | PRD refs | Fix shape |
|---|---|---|---|
| H-1 | High | NFR-030, NFR-021, FR-001, NFR-026 | New AD-14 (policed fetch boundary) + opt-out registry seed element |
| H-2 | High | FR-073, NFR-041, FR-051/052/070–074 | AD-11 extension (audit_events), seed entity, ops-console map row |
| M-1 | Medium | F7 preamble, FR-065, FR-064 | AD-11 rule: billable-on-success + compensating events |
| M-2 | Medium | FR-021 | Conventions row: severity enums defined once in packages/schema |
| M-3 | Medium | NFR-024, FR-022, FR-066 | AD-4 rule: outbound signing + inbound Stripe verification |
| M-4 | Medium | FR-022 | AD-4 rule: visible paused state + replay from delivery records |
| M-5 | Medium | FR-050/052 | Map row for tenancy/roles + AD-7 sentence on enforcement point |
| M-6 | Medium | FR-062, FR-065 vs seed ER | USAGE_EVENT attribution by principal, workspace optional |
| M-7 | Medium | FR-023, FR-033, NFR-013/020 vs AD-6 | AD-6 sentence: public surfaces = explicit platform scope / owner-opted projection |
| M-8 | Medium | FR-004, NFR-012 vs AD-1 | AD-1 sentence: decide external-LLM-via-AI-Gateway on purpose |
| M-9 | Medium | NFR-034 | LLM convention: no-training providers only; no tenant data in training |
| M-10 | Medium | FR-012 | Deferred row: cite FR-012, not the addendum |

**Verdict:** No critical findings — the spine's paradigm, boundaries, data ownership, and billing invariants faithfully carry the PRD's decisions. Two high gaps (H-1 fetch-boundary policy, H-2 durable audit stream) each need a real AD/seed home before build; the nine mediums are one-sentence AD edits, one convention row, two map rows, and two seed-diagram touches.
