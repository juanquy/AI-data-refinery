---
title: Edge-Case Review — AI Data Refinery PRD (§3 FRs, §4 NFRs)
type: review-edge-cases
reviewed: prd.md (status: draft, 2026-08-29)
date: 2026-08-29
---

# Edge-Case Hunt — Functional Requirements Review

Scope: undefined states, race conditions, and abuse scenarios the FR text does not answer, prioritized on money and trust paths. Each finding: the scenario, why the current FR text is silent, and the smallest spec addition that would close it. Pure implementation detail (retry intervals, storage, crypto rails mechanics) is excluded. Tags reflect **product risk**, not likelihood.

Finding IDs are stable for cross-reference (EC-###).

---

## 1. HTTP 402 & Agent Payments (FR-062, FR-063, FR-064)

### EC-101 — Paid query, failed extraction: no refund/billing-on-failure policy anywhere `HIGH`
**Scenario:** An agent pays $0.005 (either mode) and the refinement fails — source 404s, AI provider is down (NFR-012 says "extraction requests fail explicitly"), or strict validation fails and the artifact is flagged invalid (FR-002).
**Gap:** No FR says whether a failed or flagged-invalid extraction is billable. FR-065 meters "every billable query" without defining billable. FR-002 makes invalid results honest, but an agent that *paid* for a flagged-invalid result has no defined recourse. In account-less mode there is not even an account to credit.
**Smallest addition:** One sentence in F7 defining the billable event (e.g., "a query is billable only when it returns a 2xx response; strict-validation-failed extractions are billable/non-billable [decide]; provider-outage failures are never billable, and prepaid-wallet debits for non-billable queries are auto-reversed"). Explicitly state the account-less rule (no-charge-on-failure, since no refund path exists).

### EC-102 — Account-less caller retries a paid query whose response was lost `HIGH`
**Scenario:** x402 payment settles, extraction runs, but the response is lost (network timeout, client crash). The agent has no account, no token, no history. It retries.
**Gap:** FR-062 defines the purchase path but not replay. Result: either the agent pays twice for one answer (double-charge — a trust killer for the strategic-bet customer class) or the platform eats duplicate work. Nothing defines a payment-receipt-scoped retry.
**Smallest addition:** FR-062 gains: "an account-less payment functions as an idempotent receipt — re-presenting the same payment proof within a defined window returns the same response without a second charge."

### EC-103 — Wallet exhaustion mid-burst: concurrent overdraw race `HIGH`
**Scenario:** An agent fleet fires 200 concurrent requests against a wallet holding funds for 150. Each request passes a balance check before any debit lands.
**Gap:** FR-062 covers the *unfunded request* (402) but not concurrency semantics: can a wallet go negative, which requests in the burst get 402, and is the outcome deterministic? "A top-up without a charge is a defect" (FR-063) has no mirror: "a serve without a covering debit" is undefined.
**Smallest addition:** FR-064/065 gains: "wallet debits are atomic with admission; a wallet never serves below zero (or: may overdraw up to one query's price, guardian never billed for overdraw beyond X); excess concurrent requests receive 402."

### EC-104 — Kill-switch semantics: in-flight requests and reversibility `HIGH`
**Scenario:** Guardian hits the kill-switch (FR-064 "immediate") while 50 requests are in flight and a scheduled pipeline attributed to that token is mid-run. Later the guardian wants the agent back.
**Gap:** FR-064 says revocation is immediate but doesn't say whether in-flight requests complete (and bill) or abort (and refund), whether MCP OAuth access tokens already issued are honored until expiry, or whether the kill is reversible (re-enable same token) versus terminal (mint a new `ref_agent_…`, breaking every configured client). "Immediate" is a promise the PRD makes to guardians without defining what it means at the boundary.
**Smallest addition:** FR-064 gains two sentences: (a) "in-flight requests at kill time [complete-and-bill | abort-without-charge — decide]; no *new* request is admitted after the kill, including with previously issued OAuth tokens"; (b) "kill-switch is a reversible suspend; permanent revocation is a separate action."

### EC-105 — Double-charge in relationship mode: client retries and server fallback `MEDIUM`
**Scenario:** A wallet-funded request times out client-side and the agent retries; or the primary model fails and the fallback runs (FR-004).
**Gap:** No FR grants request idempotency, so a retry is two debits for one intended query. FR-004's fallback is invisible to billing: is a fallback-path extraction (two inference passes) still one billable query at one price?
**Smallest addition:** F7 gains: "requests accept a client idempotency key honored for a defined window (one debit per key)"; FR-004 gains: "a fallback-path extraction bills as a single query."

### EC-106 — Price quoted in the 402 vs price at payment time `MEDIUM`
**Scenario:** The 402 quotes $0.005; the founder edits the price via FR-074 (live, no deployment) or a marketplace creator changes their listing price (FR-083) between quote and payment.
**Gap:** FR-062's "machine-readable price headers" have no validity window; a machine that paid the quoted price can be refused or silently charged differently.
**Smallest addition:** FR-062 gains: "a quoted price is honored for a defined validity window; a payment matching an unexpired quote is always accepted at that price."

### EC-107 — Partial payment and overpayment in account-less mode `MEDIUM`
**Scenario:** The x402 payment arrives short of the quoted price (fees, rounding) or in excess.
**Gap:** FR-062 assumes exact payment. Underpayment handling (reject and refund? absorb?) and overpayment (keep? credit to nothing — there's no account) are undefined; unclaimed remainders are real money the ledger must classify.
**Smallest addition:** FR-062 gains: "underpayments are rejected with a machine-readable shortfall response; overpayment remainder handling is [decide: refunded via the rail | recognized as breakage revenue] and appears distinctly in the ledger (FR-065)."

### EC-108 — Spend limit: no period, no relationship to balance `MEDIUM`
**Scenario:** A guardian sets a "spend limit" (FR-064). The agent hits it. Is it per-day, per-month, lifetime? Does hitting it 402 (implying "pay more") or hard-reject (guardian said stop)?
**Gap:** FR-064 names the control but not its unit of time or its error semantics — and a 402 on a *limit* breach would invite the agent to route around its own guardian via account-less mode (see EC-110).
**Smallest addition:** FR-064 gains: "spend limits are defined per [period — decide]; a limit-breached request is refused with a distinct machine-readable reason (not a purchase invitation)."

### EC-109 — Guardian wallet withdrawal and abandoned balances `MEDIUM`
**Scenario:** A guardian kills an agent, or a company churns, leaving $400 in a prepaid wallet.
**Gap:** FR-063 covers money in; nothing covers money out. Whether unspent balances are refundable, expiring, or held indefinitely is a PM/legal decision (prepaid-balance obligations), not implementation.
**Smallest addition:** F7 gains one sentence: "unspent wallet balances are [refundable on request via original rail | non-refundable, stated at top-up — decide]; the policy appears in ToS."

### EC-110 — Account-less mode as a bypass of guardian governance `MEDIUM`
**Scenario:** A killed or spend-capped agent simply switches to account-less x402 and keeps buying. FR-064 itself notes account-less requests "carry no standing access to govern."
**Gap:** The PRD presents kill-switch as the guardian's safety story while shipping a second door with no lock. This may be acceptable (the guardian controls the agent's funds, not the platform), but it is currently an unstated consequence, not a decision.
**Smallest addition:** A sentence in FR-064 acknowledging the boundary: "the kill-switch governs relationship-mode tokens only; account-less payments are outside guardian control by design" — so the sales/docs story matches reality.

### EC-111 — One price for cached reads and fresh extractions `MEDIUM`
**Scenario:** An agent's query is served from the pre-indexed corpus (cache hit, near-zero cost) vs triggering on-demand inference (NFR-002, seconds and real cost). Both cost the agent $0.005?
**Gap:** NFR-050 requires the *cost model* to distinguish cached vs on-demand, but FR-061/062 quote a single per-query price and the 402 must quote *before* knowing whether the query will hit cache. Whether pricing is flat or two-tier changes the 402 contract, the marketplace share (see EC-404), and unit economics.
**Smallest addition:** FR-061 gains: "per-query pricing is [flat across cached/fresh | tiered: cached read $X, on-demand refinement $Y — decide]; the 402 quotes the worst-case price for the requested operation."

---

## 2. Metering Ledger, Quotas & Free Tier (FR-060, FR-065, FR-032)

### EC-201 — Over-quota *paid subscriber* behavior is undefined `HIGH`
**Scenario:** A PRO workspace runs its 10,001st query mid-month, mid-pipeline.
**Gap:** FR-062 defines over-quota behavior for *agents* (402 → purchase path). For human subscription plans no FR says whether overage hard-stops (breaking scheduled pipelines and webhooks a customer *depends* on — §5 calls dependency the stickiness signal), soft-bills at the per-query rate, or requires an upgrade. This is the single most common money-path state the product will hit and it's unspecified.
**Smallest addition:** FR-061 gains: "on plan-quota exhaustion, [decide: requests are refused with upgrade path | overage bills at the agent per-query rate, cap configurable by the workspace | scheduled pipelines continue but interactive queries block]." Also state whether the workspace is warned before the boundary.

### EC-202 — Quota period definition and clock skew `MEDIUM`
**Scenario:** "Monthly query quota" (FR-060) — calendar month or billing anniversary? A query lands at 23:59:59.900 by the edge node's clock and 00:00:00.100 by the ledger's; which month does it meter into, and does reconciliation (FR-065) then flag a mismatch?
**Gap:** FR-060/065 never define the quota window or the authoritative timestamp; reconciliation "ledger ↔ charges match" (Phase 0 gate) is untestable without one.
**Smallest addition:** FR-065 gains: "quota periods are [calendar-month UTC | billing-cycle-aligned — decide]; the ledger's recorded timestamp is the single authoritative clock for quota and reconciliation."

### EC-203 — The boundary-crossing request and concurrent boundary races `MEDIUM`
**Scenario:** Free tier has 1 query left; 10 concurrent requests arrive. Or a single request is admitted at quota-1 and completes at quota+0.
**Gap:** FR-060 gives a number, not admission semantics: hard or soft boundary, and whether concurrent admission may overshoot (paralleling EC-103 for quotas). Also undefined: does a strict-validation-failed extraction consume quota (mirror of EC-101 for the free tier)?
**Smallest addition:** FR-060 gains: "quota admission is atomic; overshoot tolerance is at most [0 | N] queries; failed/flagged extractions [do | do not] consume quota — same rule as billability (EC-101)."

### EC-204 — Billable unit over MCP is undefined `MEDIUM`
**Scenario:** One MCP tool call internally performs a search plus three refinements; an MCP *resource read* streams corpus data; a *prompt* retrieval embeds refined content.
**Gap:** FR-032 says MCP calls are metered "identically to REST calls," but MCP tools/resources/prompts (FR-030) don't map 1:1 to REST queries. If resource reads are free, the metering FR-032 exists to protect is bypassable through the resource surface — the exact prototype defect in different clothes.
**Smallest addition:** FR-032 gains: "the billable unit is defined per MCP primitive: each tool call meters as [its constituent queries | one query]; resource reads and prompt retrievals that serve corpus data meter as cached reads."

### EC-205 — Reconciliation mismatch: detection exists, disposition doesn't `MEDIUM`
**Scenario:** Nightly reconciliation finds 300 metered queries with no covering charge (or the reverse).
**Gap:** FR-065 requires the ledger to reconcile; the Phase 0 gate requires it to "run clean." Neither says what happens in production when it doesn't: who eats the discrepancy, is the customer notified, is service suspended, is there a materiality threshold? Courtesy credits (FR-071) are handled ("visibly distinct") but genuine mismatches are not.
**Smallest addition:** FR-065 gains: "reconciliation discrepancies are alerted to operators, classified (courtesy, defect, fraud), and resolved in the customer's favor below a defined threshold; discrepancy events are audit-logged (FR-073)."

### EC-206 — Self-serve usage freshness vs machine pacing `LOW`
**Scenario:** An agent paces its spend by polling its own usage endpoint (FR-065); the endpoint lags minutes behind and the agent overruns its budget.
**Gap:** No freshness contract on usage data that machines are expected to steer by.
**Smallest addition:** FR-065 gains: "usage reads state their data freshness; headroom-critical values (remaining quota/balance) are served within a defined staleness bound."

### EC-207 — Free quota and funded wallet on the same identity: drain order `LOW`
**Scenario:** A key has remaining free-tier quota *and* an associated funded wallet (OQ-3 leaves agent free credits open). Which is consumed first?
**Gap:** Undefined; drain order changes what customers are charged and what the funnel metrics (first 402-paid query, §5) actually measure.
**Smallest addition:** One sentence: "free quota always drains before paid balance."

---

## 3. Stripe Subscription Lifecycle (FR-061, FR-066)

### EC-301 — Failed renewal: cliff-edge revocation vs grace, and what keeps running `HIGH`
**Scenario:** A PRO card fails on renewal. The workspace has live scheduled pipelines (FR-011), webhook subscriptions, tracked entities refreshing, and agent wallets.
**Gap:** FR-066 says "revocation on subscription end" — but a failed renewal is not a clean end. Undefined: grace/dunning window before revocation; whether scheduled refreshes (which cost the platform inference money) continue during it; whether webhooks keep firing; and what state resources land in (paused-recoverable vs deleted). A customer whose breaking-change alerts silently stopped during a card hiccup is a trust incident on the core promise.
**Smallest addition:** FR-066 gains: "failed renewals enter a defined grace state: interactive access [continues | degrades to free tier], scheduled pipelines [pause | continue] and webhook alerting about the account itself always fires; after the grace window, resources pause recoverably for N days before deletion."

### EC-302 — Chargeback/dispute clawback across wallets and creator payouts `HIGH`
**Scenario:** A customer disputes a $500 wallet top-up after the agent has spent $460 of it — of which $200 was marketplace queries whose creators were already paid 80% live (FR-082).
**Gap:** No FR mentions disputes at all. Spent-balance clawback (negative wallet? workspace suspension?), and whether creator shares funded by a disputed charge are clawed back from creators (Stripe Connect reversals) or absorbed by the platform, are pure PM/finance decisions with direct fraud exposure: top-up → burn queries through your own marketplace listing → dispute → keep the 80% (see EC-405).
**Smallest addition:** F7 gains: "a disputed charge suspends the funded wallet/workspace pending resolution and is audit-logged; creator shares attributable to disputed funds are [withheld via a payout holdback period of N days | reversed via Connect — decide]." The holdback period is the one lever that closes the fraud loop.

### EC-303 — Downgrade with over-quota usage and undefined tier resource limits `MEDIUM`
**Scenario:** ENTERPRISE (100k) downgrades to PRO (10k) on day 20 having used 60k queries; or downgrades to Free while owning 40 schemas, 12 pipelines, and 6 webhook subscriptions.
**Gap:** FR-061 defines tiers *only* by query count. Undefined: when a downgrade takes effect (immediate vs cycle end), what happens to already-consumed usage above the new quota, and — more fundamentally — whether tiers bound anything besides queries (pipelines, tracked entities, schemas, seats, export volume). If they don't, that's a decision worth stating; if they do, downgrade must define what happens to over-limit resources.
**Smallest addition:** FR-061 gains: "downgrades apply at cycle end; each tier's limits are enumerated (queries plus [resource dimensions — decide]); resources exceeding the new tier's limits are paused, never deleted, with owner notification."

### EC-304 — Plan catalog edits vs existing subscribers `MEDIUM`
**Scenario:** The founder edits PRO's price or quota via FR-074, or deletes a plan that has active subscribers.
**Gap:** FR-061 makes plans founder-editable configuration but never says whether edits apply to existing subscribers (repricing mid-relationship), only new signups (grandfathering), or with notice. Deleting an in-use plan is an undefined state.
**Smallest addition:** FR-061/074 gains: "plan edits affect new subscriptions only unless a migration is explicitly executed with N-day notice; a plan with active subscribers cannot be deleted, only retired from sale."

### EC-305 — Subscription lapse vs independently funded agent wallets `MEDIUM`
**Scenario:** The human subscription that owns a workspace ends (FR-066 revocation), but the workspace's agent wallets still hold prepaid money and its `ref_agent_…` tokens are configured in running fleets.
**Gap:** FR-050 puts wallets inside workspaces; FR-066 revokes on subscription end. Do funded agents die with the subscription (prepaid money now unusable — see EC-109) or does agent pay-per-query survive as a subscription-independent relationship? The two-customer-class story (§2) implies independence; the tenancy model implies coupling. Unresolved contradiction.
**Smallest addition:** One sentence in F7: "agent wallets and pay-per-query access are [independent of | coupled to] the workspace's subscription state — decide; if coupled, lapse triggers the wallet-balance policy (EC-109)."

---

## 4. Marketplace & Creator Payouts (F9)

### EC-401 — Creator deletes or unpublishes a listing others depend on `HIGH`
**Scenario:** A creator deletes a schema (FR-040 grants delete) that 200 workspaces have installed — with live pipelines, MCP tools (FR-042), and webhook subscriptions built on it.
**Gap:** F9 covers browse/install/price/payout but says nothing about the listing lifecycle after install. Does deletion break dependents immediately, orphan them on a frozen snapshot, or is deletion blocked while dependents exist? Same question for the platform removing a listing (moderation — see EC-406).
**Smallest addition:** F9 gains: "installed listings are consumed as versioned snapshots; creator deletion delists (no new installs) but never breaks existing installs; installers are notified the listing is retired."

### EC-402 — Install vs clone: two acquisition paths, one revenue question `MEDIUM`
**Scenario:** FR-080 lets customers *install* a listing (creator earns 80% per query); FR-043 lets any workspace *clone and customize* a public blueprint. A user clones a paid creator's public schema, tweaks a field, and queries the clone forever.
**Gap:** The PRD never relates the two mechanisms. If cloning is free and cloning a listing is possible, the revenue share is trivially bypassable; if paid listings can't be public blueprints, that constraint is unstated.
**Smallest addition:** FR-043/080 gains: "a schema is either a public blueprint (free to clone, no revenue share) or a priced marketplace listing (install-only, no clone) — a creator chooses one; derivatives of a paid listing cannot be re-published."

### EC-403 — Creator price change mid-relationship `MEDIUM`
**Scenario:** A creator triples their per-query price (FR-083) on a listing that agents query inside automated pipelines that never look at prices.
**Gap:** FR-083 grants repricing within bounds but no notice, cap-per-change, or re-consent semantics. Relationship-mode agents with wallets would silently drain 3x faster; the 402 quote only protects account-less callers per-request (EC-106).
**Smallest addition:** FR-083 gains: "price increases take effect after N days' notice to installers; installed workspaces are notified and can pin a max-price guard that refuses queries above it."

### EC-404 — Revenue attribution for cached vs fresh queries against a listing `HIGH`
**Scenario:** 10,000 agents query a popular creator's tracked entity; 9,900 hits are served from cache. Does the creator earn 80% of 10,000 queries or 100?
**Gap:** FR-081 says "accounted per query," but the platform's whole architecture (pre-indexed corpus, FR-010) makes cached serving the dominant path, and EC-111 leaves cached pricing itself open. The answer determines whether the marketplace can ever be margin-positive and what creators are actually promised. This is the marketplace's core economic sentence and it's missing.
**Smallest addition:** FR-081 gains: "the 80/20 share applies to [all billable queries against the listing, cached or fresh | fresh refinements only, cached reads at a reduced share of X% — decide], stated in creator-facing terms."

### EC-405 — Creator self-dealing: ranking farming and free-tier-funded shares `HIGH`
**Scenario:** (a) A creator scripts free-tier signups to query their own listing, climbing the FR-084 query-count leaderboard and earning featured placement. (b) A creator's paid listing is queried by free-tier keys: the platform collected $0 but FR-081 accrues the creator 80% of a per-query price — a direct money pump when combined with live payouts (FR-082) and the dispute loop (EC-302).
**Gap:** F9 has no notion of qualifying queries. §5 tracks free-tier abuse as a counter-metric but no FR excludes non-revenue or self-originated queries from ranking or revenue share.
**Smallest addition:** FR-081/084 gains: "revenue share accrues only on queries the platform actually collected revenue for; queries from the creator's own workspaces/keys count for neither revenue share nor ranking; ranking uses revenue-qualified queries."

### EC-406 — Listing moderation and compliance takedown `MEDIUM`
**Scenario:** A creator publishes a listing whose schema/prompt targets login-gated content, personal data, or strips the compliance guardrails FR-012 mandates for its domain — and 50 workspaces install it before anyone notices.
**Gap:** F9 has curation (featured, ranking) but no review, reporting, or removal process, and NFR-030/032's prohibitions bind *customers*' usage, not *listings'* content. Removal of an installed listing loops back to EC-401.
**Smallest addition:** F9 gains: "listings pass a publication check against the platform's content rules (NFR-030/032); a takedown path exists; removed listings follow the retirement semantics of EC-401 with installers notified of the reason."

### EC-407 — Stripe Connect account suspended, deauthorized, or onboarding-incomplete `MEDIUM`
**Scenario:** A creator's Connect account is restricted by Stripe (KYC failure, risk) while their listings keep earning; or a creator never completes onboarding but publishes anyway.
**Gap:** FR-082 commits to live payouts but not the degraded states: do listings stay live and accrue (liability building with no payout destination), get delisted, or pause? Is completed Connect onboarding a precondition of publishing a *priced* listing?
**Smallest addition:** FR-082 gains: "a payable Connect account is a precondition for publishing a priced listing; if a creator's account becomes non-payable, accrual continues for N days (visible in their ledger) then the listing pauses from sale until resolved."

---

## 5. Workspaces & Tenancy (F6, FR-043)

### EC-501 — Workspace deletion: money, public artifacts, and dependents `HIGH`
**Scenario:** An OWNER deletes a workspace that holds funded agent wallets, published marketplace listings with installers, public blueprints others cloned, public badges (FR-023) embedded in third-party READMEs, and exports already delivered.
**Gap:** No FR defines workspace deletion at all. Every asset class in FR-050's list needs a disposition, and two of them are *other people's* dependencies (listings, badges) and one is *money* (wallets).
**Smallest addition:** F6 gains a deletion clause: "workspace deletion requires wallet balances resolved per the balance policy (EC-109), marketplace listings retired per EC-401, badges serve a tombstone state, and data is recoverable for N days before purge; deletion is audit-logged."

### EC-502 — Member removal mid-session: what dies with the member `MEDIUM`
**Scenario:** A BUILDER is removed while holding an active Studio session, personal API keys, MCP OAuth tokens, and being the creator of pipelines/webhooks/agent tokens the workspace runs on.
**Gap:** FR-050/052 enforce roles server-side but never say whether keys and tokens are member-owned (die with removal — production breaks) or workspace-owned (survive — the removed member may still hold secrets). OAuth token revocation latency on removal is a fail-closed question FR-051 doesn't reach.
**Smallest addition:** F6 gains: "API keys, agent tokens, pipelines, and webhooks are workspace-owned and survive member removal; credentials *held personally* by the removed member (sessions, OAuth grants, personal keys) are revoked at removal, effective within a defined bound."

### EC-503 — Guardian identity vs workspace membership `MEDIUM`
**Scenario:** The guardian who funds and kill-switches an agent (§2, FR-064) leaves the company; their membership is removed (EC-502).
**Gap:** The PRD never says whether "guardian" is a workspace role, a specific member, or the workspace itself. If the guardian is a person and that person is gone, who holds the kill-switch and the funding relationship? If it's the workspace, FR-064's per-agent governance story needs restating.
**Smallest addition:** F6/F7 gains: "guardianship is a workspace-held responsibility exercised by members with the [OWNER/BUILDER — decide] capability; removal of any individual never orphans an agent's kill-switch."

### EC-504 — Cloned blueprint vs upstream changes: snapshot or linked? `MEDIUM`
**Scenario:** A workspace clones a public blueprint (FR-043); the source schema then changes — or FR-012 requires the platform to keep vertical templates' *compliance guardrails* "current." Do existing clones get the update?
**Gap:** "Clone and customize" implies a snapshot; "kept current" implies propagation — for compliance language (HIPAA/FDA/SEC copy) a stale clone is a liability the PRD created and didn't resolve. Also undefined: cloning a blueprint that is later unpublished or whose workspace is deleted (EC-501).
**Smallest addition:** FR-043 gains: "clones are independent snapshots; upstream changes never auto-propagate, but clones record their source blueprint+version, and platform-template compliance updates generate an update notice to clone owners [with one-click re-sync — decide]."

### EC-505 — Global change feed vs tenant boundaries `HIGH`
**Scenario:** FR-024's authenticated "cross-corpus stream of recent diffs" — does it include diffs of entities tracked under *private* workspace schemas?
**Gap:** "Global" and F6's tenancy are in direct tension. If the feed spans all tenants, private tracked-source activity (which URLs a competitor's workspace watches, and what changed) leaks; if it's public-corpus-only, that scoping sentence doesn't exist. FR-051's fail-closed guarantee can't be tested against an endpoint whose intended scope is unstated.
**Smallest addition:** FR-024 gains: "the global feed contains only platform-corpus (public/template) entities; workspace-private entities appear only in a workspace-scoped feed."

### EC-506 — Public badges for private entities `MEDIUM`
**Scenario:** FR-023 makes badges public per tracked entity; NFR-020 lists badges as a deliberately public surface. A private workspace tracks a sensitive internal source — its badge URL, if guessable or shared, leaks the entity's existence, version label, and change severity to anyone.
**Gap:** No FR says whether badges exist for every entity or only opted-in/public ones.
**Smallest addition:** FR-023 gains: "badges are opt-in per entity (default off for workspace-private entities); enabling one is an explicit publish action, audit-logged."

### EC-507 — Sole OWNER loss `LOW`
**Scenario:** The only OWNER's account is deleted or unrecoverable; the workspace retains billing, members, and running pipelines but nobody can exercise OWNER capabilities (FR-052: billing, invites).
**Gap:** The role matrix defines capabilities, not continuity.
**Smallest addition:** FR-052 gains: "a workspace must always have ≥1 OWNER; removing the last OWNER requires transfer, with an operator-assisted recovery path (FR-071, audit-logged)."

---

## 6. Corpus & Change Intelligence (F2, F3)

### EC-601 — Diff computed against a failed/invalid extraction `HIGH`
**Scenario:** Refresh N fails strict validation (FR-002, flagged); refresh N+1 succeeds. FR-021 diffs "consecutive versions": diffing N+1 against invalid N produces a phantom CRITICAL (everything "changed back"), which fans out to webhooks (FR-022), flips badges (FR-023), and lands in the global feed — false alarms on the product's core trust surface.
**Gap:** FR-020/021 never say whether a flagged-invalid extraction becomes a version at all, and if so whether it participates in diffing.
**Smallest addition:** FR-021 gains: "diffs are computed between consecutive *valid* versions; flagged-invalid extractions are recorded (provenance, FR-003) but excluded from the diff chain and never trigger change events."

### EC-602 — Severity flapping and noisy sources `MEDIUM`
**Scenario:** A tracked source personalizes per-request, A/B tests, or oscillates — every refresh yields a MAJOR/CRITICAL diff; subscribers get a webhook storm and learn to ignore the product's severity signal (alert fatigue is the death of a change-intelligence product).
**Gap:** FR-021 defines the scale but no notion of repeat/flapping suppression, and FR-022 fans out every diff unconditionally.
**Smallest addition:** F3 gains: "repeated equivalent diffs on the same entity within a window are deduplicated/rolled up rather than re-fired; entities with sustained flapping are flagged to their owner as unstable sources." (Threshold values are implementation; the *existence* of suppression is product.)

### EC-603 — Permanently dead source: no end state `MEDIUM`
**Scenario:** A tracked source 404s forever, or its domain lapses. FR-011 retries and surfaces failures — indefinitely?
**Gap:** No retirement state exists: whether the entity keeps consuming refresh attempts, whether the last-good version keeps serving (NFR-011/012 imply yes, with staleness), whether the badge shows "dead," and whether a dead entity in a *paid marketplace listing* keeps earning (ties EC-404).
**Smallest addition:** F2 gains: "after sustained fetch failure an entity enters a visible DEFUNCT state: last valid version serves flagged as such, refreshes stop, badge and API responses state it, subscribers are notified once, and defunct entities are excluded from 'live coverage' counts (FR-013 honesty)."

### EC-604 — robots.txt begins disallowing a tracked source `MEDIUM`
**Scenario:** A source the corpus has tracked for months adds a disallow (or a takedown arrives per NFR-030).
**Gap:** NFR-030 honors robots.txt for crawling, but the mid-life transition is undefined: refreshes must stop, but is the *already-collected* version history retained and served, or does the disallow/takedown reach backward? Diff-derived training data already exported by customers (FR-090) can't be recalled — is that scope stated in the takedown policy?
**Smallest addition:** NFR-030 gains: "a new disallow halts future fetches (entity → DEFUNCT per EC-603) but does not by itself purge history; the takedown process defines what an accepted takedown purges (versions, diffs, search index) and states that previously delivered exports are outside recall — reflected in ToS."

### EC-605 — Sample-data verticals leaking into live surfaces `MEDIUM`
**Scenario:** FR-013's five sample-data verticals: can a customer subscribe webhooks to a sample entity, see it in the global feed, embed its badge, or export it as training data (FR-090)? Each would emit fabricated change events from data the PRD's own honesty layer says must be "clearly labeled sample."
**Gap:** FR-013 governs labeling, not behavior — nothing prevents sample entities from participating in the change/event machinery as if live.
**Smallest addition:** FR-013 gains: "sample entities never emit change events, never appear in the global feed or badges, and are excluded from export; the sample label travels in API responses, not just UI."

### EC-606 — Source restructure vs content change `LOW`
**Scenario:** A tracked page is redesigned or moved behind a redirect; extraction still succeeds but every field's value shifts shape. The semantic diff reads as a maximal CRITICAL change when nothing factual changed.
**Gap:** FR-021's severity scale rates *what changed*, with no distinct signal for "the source itself transformed" — the one case where the diff is least trustworthy.
**Smallest addition:** FR-021 gains: "a diff whose source hash/structure change exceeds a defined bound is emitted as a distinct 'source-restructured' event type rather than a content severity."

### EC-607 — Version history retention unbounded `LOW`
**Scenario:** FR-020 makes all history queryable; a busy entity refreshed hourly accrues ~9k versions/year, on every tier including free.
**Gap:** No retention policy per tier — this is a tier-differentiation decision (EC-303), not storage trivia.
**Smallest addition:** FR-020 gains: "version-history retention depth is a per-tier entitlement [values — pricing exercise]."

---

## 7. Webhooks (FR-022)

### EC-701 — Endpoint dead for days: give-up, disable, and replay `HIGH`
**Scenario:** A customer's endpoint is down for four days (deploy accident). FR-022 says deliveries "are retried on failure" — forever? Meanwhile CRITICAL breaking-change events accumulate.
**Gap:** No terminal state (auto-disable after sustained failure, owner notification through a channel that isn't the dead endpoint), and no replay: when the endpoint returns, are the missed events gone? For a product whose stickiness metric is "someone depends on the alerts," silent permanent loss of alerts is a churn event.
**Smallest addition:** FR-022 gains: "sustained delivery failure transitions a subscription to a visible FAILING→DISABLED state with owner notification out-of-band; events remain queryable and re-deliverable for a defined window after re-enable (at-least-once, no silent loss)."

### EC-702 — Delivery ordering and duplication contract `LOW`
**Scenario:** Retried event v41 lands after fresh event v42; or a retry duplicates a delivery.
**Gap:** FR-022 implies retries (hence possible duplicates and reordering) but never states the contract consumers must code against.
**Smallest addition:** FR-022 gains: "delivery is at-least-once and unordered; every event carries entity id + version sequence so consumers can deduplicate and order."

### EC-703 — Filter matching zero (silent) then many (storm) `MEDIUM`
**Scenario:** (a) A subscription's entity filter matches nothing — perhaps because the entity went DEFUNCT (EC-603) or was renamed — and the customer believes they're covered while receiving silence. (b) A broad filter matches an entire vertical the moment its corpus first indexes or mass-refreshes: thousands of events in minutes to one endpoint.
**Gap:** FR-022's send-test-event proves the pipe, not the filter; nothing warns on zero-match, and fan-out to "all matching subscriptions" has no aggregation/burst posture. Also unstated: whether deliveries are metered/billable at all (FR-065 meters "queries") — unlimited free fan-out is an abuse surface (use webhooks as a free push infrastructure).
**Smallest addition:** FR-022 gains: "Studio surfaces each subscription's current match count (zero-match warned); bulk/mass-refresh events may be delivered as a digest; webhook deliveries are [free within plan limits | metered — decide] with a per-subscription burst cap."

### EC-704 — Chat-native target credential death `LOW`
**Scenario:** The Slack app is uninstalled or the Telegram channel deleted; deliveries fail with auth errors, not timeouts.
**Gap:** Same end-state gap as EC-701, plus a re-auth path a generic HTTPS retry policy can't express.
**Smallest addition:** Fold into EC-701's FAILING→DISABLED state with cause-specific owner guidance ("reconnect Slack").

---

## 8. Cross-Cutting

### EC-801 — "Free-tier keys satisfy auth at zero cost" vs anonymous machine signups `MEDIUM`
**Scenario:** FR-031 lets free-tier keys clear MCP auth; FR-060 grants a key at signup; §5 counter-metrics expect free-tier abuse. A fleet scripting thousands of signups gets a free, authenticated, metered-at-zero corpus firehose — and OQ-3 explicitly hasn't decided whether agents get free credits at all.
**Gap:** No FR states what gates signup (human verification? payment method on file?) — the free tier's abuse boundary is entirely undefined while being the top of the activation funnel.
**Smallest addition:** FR-060 gains: "free-tier signup requires [verified human email + anti-automation measure — decide]; per-identity and per-origin issuance limits exist; agents acquire access only via the two paid modes unless OQ-3 resolves otherwise."

### EC-802 — MCP tool-per-schema at scale: collisions and list bloat `LOW`
**Scenario:** FR-030/042 provision one MCP tool per published schema; a workspace with 80 schemas plus 20 installed marketplace listings presents a 100-tool list to every client, with name collisions between a user's "pricing" schema and an installed "pricing" listing.
**Gap:** Naming/namespacing and any cap are unstated; collisions are an undefined state at publish time.
**Smallest addition:** FR-042 gains: "tool names are namespaced deterministically (workspace/listing prefix); publish fails closed on collision with a rename prompt."

### EC-803 — Export metering unit (FR-090) `LOW`
**Scenario:** A workspace exports its full corpus slice as JSONL weekly. Is an export one "query," thousands, or unmetered-but-entitlement-gated?
**Gap:** FR-090 gates by entitlements but the entitlement dimension (count? rows? bytes?) is undefined, leaving a bulk-egress path outside the FR-065 ledger.
**Smallest addition:** FR-090 gains: "exports meter as [N queries per M records | a per-tier export allowance — decide] and appear in the ledger."

---

## Tally

| Area | High | Medium | Low | Total |
|---|---|---|---|---|
| 402 & agent payments | 4 | 6 | 0 | 10 |
| Metering, quotas & free tier | 1 | 4 | 2 | 7 |
| Stripe lifecycle | 2 | 3 | 0 | 5 |
| Marketplace | 3 | 4 | 0 | 7 |
| Tenancy | 2 | 4 | 1 | 7 |
| Corpus & change intelligence | 1 | 4 | 2 | 7 |
| Webhooks | 1 | 1 | 2 | 4 |
| Cross-cutting | 0 | 1 | 2 | 3 |
| **Total** | **14** | **27** | **9** | **50** |

### The five decisions to make first

1. **Define the billable event and failure/refund policy (EC-101)** — every other money finding hangs off it.
2. **Over-quota behavior for paid subscribers (EC-201)** — the most common undefined state the product will hit.
3. **Cached-vs-fresh pricing and marketplace attribution (EC-111 + EC-404)** — determines unit economics and what creators are promised.
4. **Payout holdback vs live-from-launch payouts (EC-302 + EC-405)** — the current text ships a working fraud pump.
5. **Diff chain excludes invalid versions + webhook terminal states (EC-601 + EC-701)** — the two findings that protect the core trust promise (severity-rated alerts people depend on).
