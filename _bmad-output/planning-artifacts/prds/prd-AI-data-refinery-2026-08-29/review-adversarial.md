---
title: Adversarial Review — Universal Data Refinery PRD
reviewed: prd.md, addendum.md (grounding: research-landscape.md, reconcile-repo.md, reconcile-research.md)
date: 2026-08-29
stance: hostile-but-fair senior PM / investor
---

# Adversarial Review

## Verdict

This PRD is unusually honest about its prototype's fabrications — and then commits a subtler version of the same sin at the planning level. Its signature move, repeated at least five times, is to convert a hard problem into a metric, a monthly meeting, or a phase label, and then treat the act of *naming* the risk as having *mitigated* it. The three load-bearing failures: the unit economics contradict the document's own research citations and its own NFR-050; the launch scope is irreconcilable with both a two-person team and the document's own competitive-urgency argument; and several commitments contradict each other verbatim (guardian invariant vs. account-less mode; "not a launch bet" vs. launch-gating implementation; placeholder prices vs. Phase 1 paid launch). None of these are fatal to the product idea. All of them are fatal to this document's claim to be a coherent plan.

Findings below are ordered by severity. Founder decisions with acknowledged trade-offs (proprietary licensing, quality-gated launch as a *choice*, horizontal platform) are not re-litigated; where a "decision" marker appears but its stated rationale fails or its trade-off is unacknowledged, it is fair game.

---

## CRITICAL

### C1. The agent-pricing math does not close — and the PRD's own citations prove it

**Location:** §1 Vision ("$0.005"), FR-061, FR-062, NFR-002, NFR-050; research-landscape.md §1.

**Attack:** The PRD commits — in the Vision, in FR-061's "committed tier structure," and in FR-062's machine-readable 402 price headers — to $0.005 per agent query. The same document establishes, via NFR-002, that on-demand refinement is a 5–15 second fetch-plus-LLM-extraction job over pages its own marketing describes as 10k–50k tokens of raw input. At any plausible 2026 inference price, one such extraction costs $0.01–$0.10 in model tokens alone — before fetch infrastructure, fallback-model retries (FR-004), and JSON-repair loops (FR-001). Your own research digest hands the prosecution its exhibit: Exa charges $7/1k ($0.007/query) for *cached index reads*, and Bright Data charges ~$1.5/1k for *raw unblocking with no extraction at all*. This PRD proposes $5/1k for the full job. NFR-050 then declares "agent pay-per-query pricing must not sell on-demand inference below cost" — a requirement that is *already violated by FR-061 as written*. Two requirements in the same document cannot both be true. It gets worse: ENTERPRISE at $299/100k is $0.003/query, and nothing anywhere — not FR-060, not FR-061, not FR-065 — distinguishes cached reads from on-demand refines in *quota consumption or price*, only in the internal "cost model." A customer who buys ENTERPRISE and runs 100k universal refines (FR-014 explicitly permits any URL, any time) costs you $1,000–$10,000 against $299 of revenue. The §5 counter-metric "cost per query vs. price" will faithfully *measure* the bleeding. Measurement is not a tourniquet. Finally, FR-061 manages to call the same numbers "committed" and "[PLACEHOLDER]" in consecutive sentences — so the document does not even know whether its central price is a decision or a guess.

**Fix:** Split the price axis now, in the PRD, not in architecture: cached-corpus reads and on-demand refines are different products with different prices (or on-demand consumes quota at a multiplier). Make NFR-050 enforceable by requiring per-plan on-demand caps or metered overage, not just cost *tracking*. Resolve the committed-vs-placeholder contradiction in FR-061 by picking one. Re-anchor the agent price against Exa/Bright Data/Firecrawl before it appears in a single 402 header.

### C2. Launch scope is a Series-A roadmap assigned to two people — and the document's own urgency logic condemns it

**Location:** §3 (F1–F10, F12, F13 all launch), §6 Phase 0 exit gate ("Every launch-scope FR (F1–F10) implemented and verified"), §2 "Named risk," §6 standing market checkpoint.

**Attack:** Count what "launch" requires: an extraction pipeline with strict validation and provenance; a live self-refreshing corpus running unattended for 14 days; versioned semantic diffs with severity rules; signed, filtered, fan-out webhooks to HTTPS *and* Slack, Discord, Telegram with test-event affordances; an OAuth 2.1-compliant MCP server with RFC 9728/8707; hybrid vector+lexical search; a no-code schema builder with live-URL testing and MCP tool preview; four-role RBAC enforced server-side across three surfaces with automated cross-tenant tests; Stripe subscriptions, prepaid agent wallets, guardian kill-switches, account-less x402, a reconciling metering ledger; an ops console with real telemetry and audit streams; a two-sided marketplace with creator-set pricing, curation, and live Stripe Connect payouts with tax handling; fine-tuning export in four formats; three published npm packages; and a full onboarding layer with instrumented funnels. That is 12–18 months of work for a funded team, positioned as the *pre-launch* phase for two founders — while the same document warns that "every competitor is one feature from parity," installs a monthly market checkpoint precisely because Phase 0 is open-ended, and its research notes the sector consolidating under nine-figure capital (Parallel $100M, Nimble $47M, Tavily and Jina acquired). The document's competitive logic demands a minimal launch; its scope decisions maximize time-to-launch. "AI-assisted development" is the only bridge over this gap, and the sole evidence offered for that velocity is a prototype the same PRD catalogs as unmetered, unaudited, and decorated with fabricated numbers. A plan whose feasibility rests entirely on an unquantified productivity multiplier is not a plan; it is a hope with section numbers.

**Fix:** Define a genuinely minimal launch gate — plausibly F1–F4 + F6 + free tier + subscriptions + F12 — and move marketplace, payouts, x402, export, and the integration packages to committed fast-follows. Alternatively, keep the scope and *say what it costs*: attach a founder-estimated effort budget per workstream so the scope-vs-speed trade-off is visible instead of implied away.

### C3. A live-payout marketplace for a product with zero users is launch-blocking infrastructure for nobody

**Location:** F9 (FR-080–084, esp. FR-082), §6 Phase 0 workstream 2, Phase 1; OQ-7.

**Attack:** FR-082 commits to Stripe Connect onboarding, tax handling, and live transfers *at launch* — for a marketplace with zero creators, zero buyers, and zero listings. The stated rationale, "Match-Apify decision — competitive parity with the 80% incumbent norm," does not survive inspection: Apify's payout terms matter because Apify has a decade-old creator ecosystem to defend; you are not competing with Apify for creators on day one — you have no creators, and payout parity acquires none. The binding constraint on marketplace supply is distribution, which this PRD admits is unsolved ("listing alone is not a strategy"). Meanwhile the feature carries real costs the PRD never mentions: Connect KYC and onboarding flows, 1099/DAC7 tax reporting for a two-person LLC, payout reconciliation, and a self-dealing fraud surface (a creator lists a schema, farms queries from free-tier accounts, and collects 80% of — what, exactly? The PRD never says whether free-tier or quota-consumed queries generate creator revenue share). Worse, FR-083's creator-set per-query prices are never reconciled with the rest of billing: what happens when a PRO subscriber queries a listing priced at $0.02 — quota? overage? Which number goes in the FR-062 402 header that FR-061 fixed at $0.005? Three pricing systems, zero integration story. And because the Phase 0 exit gate requires every F1–F10 FR verified, this unpopulated marketplace *blocks the launch* of everything that matters. The Launch Definition proudly refuses to gate launch on a first paying customer, then gates it on payout rails for customers who don't exist.

**Fix:** Ship marketplace browse/install at launch if you must (it delivers the six templates); make revenue share *accrual-only* until a creator threshold is met (e.g., first 10 external creators or first $500 accrued), and move Connect/tax to that trigger. Specify the interaction matrix: creator price × subscription quota × agent price × free tier, including whether unpaid queries accrue share. Kill the "Match-Apify" rationale or restate it honestly as "we want the launch story."

---

## HIGH

### H1. "Not a launch bet" that gates the launch

**Location:** §2 ("Whether unknown third-party agent fleets will discover and pay for the API autonomously is an open question, not a launch bet"), FR-062(b), §6 Phase 0 workstream 2, OQ-6.

**Attack:** The account-less x402 path's only possible customers are anonymous third-party agents — precisely the population §2 declares "an open question, not a launch bet." Yet Phase 0 workstream 2 makes that path a launch-blocking commitment. You cannot simultaneously not-bet on a market and refuse to launch until you've built for it. The PRD's own research sizes global agent-to-tool payment volume under $50K/day *across the entire industry*, and its own adoption hypothesis (developers adopt personally → companies pay via subscriptions and operator-governed fleets) routes around the account-less rail entirely. Note also the pricing self-own: at $0.005/query, the agent-native rate is *more expensive* than PRO ($0.0049) and far above ENTERPRISE ($0.003), so any agent operator with real volume rationally abandons the differentiating rail for an ordinary subscription — the strategic bet is priced to be deserted by its own success cases.

**Fix:** Demote account-less x402 to Phase 3 (where "additional agent rails" already live), or keep it at launch and honestly reclassify it as a marketing/positioning expense with a capped build budget. Reconcile the agent price against subscription per-query rates or state the convenience premium as deliberate.

### H2. The free tier's abuse problem is named as a metric and mitigated by nothing

**Location:** FR-060, FR-112, §2 ("A free tier or sandbox is required"), §5 counter-metrics ("free-tier abuse rate"), OQ-3 ("set generous, tighten with data"); reconcile-repo.md (prototype's 20/hr/IP limit — dropped).

**Attack:** Every free-tier query can be an on-demand refinement (FR-014, FR-112's playground) — real fetch plus real inference, real dollars out the door. The PRD contains *no* abuse-control requirement anywhere: no rate limits, no signup verification, no per-IP caps, no disposable-email policy, no anomaly-triggered throttling. The prototype at least had a 20/hour/IP limit; the PRD dropped it without replacement. What remains is a counter-metric — "free-tier abuse rate and anomalous automated signups" — which is a plan to *watch* the arbitrage, and OQ-3's "set generous, tighten with data," which for a product with per-query marginal inference cost means "bleed until the dashboard says stop." Scripted signups turn FR-060 into a free inference API the day it goes public.

**Fix:** Add an FR: per-key and per-IP rate limits, verified-email signup, on-demand-refine caps within the free quota, and automated throttle/suspend on anomaly. Set the free quota with the on-demand/cached split from C1's fix, and make abuse controls part of the Phase 0 exit gate alongside quota enforcement.

### H3. Paid plans launch in Phase 1 with prices the document calls placeholders; the pricing exercise is scheduled for Phase 2

**Location:** FR-061 ("Dollar amounts are [PLACEHOLDER — pricing exercise pending]"), §6 Phase 1 ("paid plans... live"), §6 Phase 2 ("Conclude the pricing exercise and replace the placeholder numbers"), OQ-2.

**Attack:** Sequencing contradiction, verbatim: Phase 1 puts paid plans in front of real customers; Phase 2 — the first ninety days *after* going public — concludes the exercise that determines what those plans should cost. So you will charge real money at numbers your own PRD disclaims as placeholders, then face repricing, grandfathering, and anchoring costs against your earliest and most evangelical users. Either the placeholders are secretly real (then stop calling them placeholders and defend them — see C1) or the pricing exercise belongs in Phase 0, where the billing workstream is already building the plan catalog.

**Fix:** Move the pricing exercise into Phase 0's billing workstream as a gate item; Phase 2's job becomes *validating* prices with data, not discovering them. Mark launch prices "introductory, subject to change" in the plan catalog if you want calibration room.

### H4. The north star and the Phase 2→3 gate are unfalsifiable by construction

**Location:** §5 ("usage trends incrementally upward... rather than flat-lining. Absolute targets are deliberately not set... Numeric targets are calibrated after the first 30 days of real data"), §6 Phase 2 gate.

**Attack:** "Week-over-week growth with no floor" is a bar that noise clears: two workspaces becoming three is incremental upward trend. Setting numeric targets *after* seeing 30 days of data guarantees targets the data can meet — that is not calibration, it is curve-fitting the success criteria to the outcome. The Phase 2→3 gate ("usage trending incrementally upward") is therefore a gate essentially any live product passes, which means Phase 3 investment (SOC 2, extension, CLI, AST diffs) is effectively unconditional while dressed as earned. The PRD visibly understands vanity-metric failure — the bailout counter-metric is genuinely good — but exempts its own top-line verdict from the same discipline.

**Fix:** Pre-commit falsifiable floors before launch, however humble: e.g., "≥N activated workspaces with a second-session by day 90, bailout rate under X%, at least one dependency signal (pipeline or webhook) per M active workspaces." Write down, now, what result would mean *stop or pivot*. A verdict you cannot fail is not a verdict.

### H5. "Every agent is governed by a guardian" is false under the PRD's own launch scope — and the account-less mode has no abuse story

**Location:** §2 Customer Classes ("Every agent is governed by a guardian"), FR-062(b), FR-064, NFR-020, NFR-030.

**Attack:** §2 states guardianship as an invariant; FR-062(b) ships agents with "no signup at all" and FR-064 concedes their only control "is the payment itself." Payment controls *spend*; it controls nothing about *behavior*. An account-less caller can drive on-demand fetches of arbitrary URLs (FR-014) with zero identity, zero terms acceptance, and zero kill-switch. NFR-020's "every customer-facing endpoint requires authentication" is either violated by this mode or quietly redefined so that a half-cent payment counts as authentication — the PRD never says which. NFR-030's protections lean on "the terms of service forbid customers from targeting login-gated content or personal data" — unenforceable against a counterparty with no account bound to any terms. The riskiest access mode in the product carries the weakest controls, and the governance narrative that opens §2 pretends the mode doesn't exist.

**Fix:** Rewrite §2 honestly: guardianship governs *relationship-mode* agents; account-less mode is a distinct, higher-risk surface. Add requirements for it: per-request URL policy enforcement (SSRF list plus a public-content policy applied server-side, not via ToS), tighter rate/spend ceilings, and an explicit statement of how NFR-020 classifies payment-as-auth.

### H6. The market checkpoint's trigger condition was already satisfied before Phase 0 began

**Location:** §6 standing market checkpoint ("A named trigger event — a competitor shipping severity-rated diffs or a pre-indexed vertical corpus — forces an explicit scope-vs-speed decision"), §1 Why Now, research-landscape.md §1.

**Attack:** The trigger names "a competitor shipping... a pre-indexed vertical corpus." Context7 — cited by this same PRD in §1 — *is* a free pre-indexed corpus in the launch vertical, shipping today. Exa and Diffbot ship pre-indexed corpora generally. By the checkpoint's own wording, the trigger fired on day zero, which means the "explicit scope-vs-speed decision" it forces is due immediately — and the PRD, having built the tripwire, steps over it without noticing. Either the trigger is mis-specified (it presumably means the *combination*, or severity-rated diffs specifically) or the safeguard is decorative. As written, the sole mitigation for an open-ended Phase 0 is a monthly meeting whose alarm is already ringing and whose output is "a decision" with no pre-committed de-scope options. A risk answered by scheduling a conversation about it is a risk unanswered.

**Fix:** Respecify the trigger precisely (e.g., "a competitor ships severity-rated, schema-validated diffs over a pre-indexed corpus with agent billing — any three of the four"), and pre-commit the response: a ranked de-scope list (start with C3's marketplace and H1's x402) that the checkpoint activates, rather than an unstructured deliberation.

### H7. At launch, the moat is at its weakest exactly where the fight is: heuristic diffs vs. a free incumbent in the only live vertical

**Location:** §1 Why Now, FR-013, FR-021 (prototype note; AST diffs deferred), §6 Phase 3.

**Attack:** The PRD concedes differentiation in the launch vertical "rests entirely on the validated, versioned, severity-rated half of the combination" — against Context7, which is free. It then concedes (FR-021) that severity rating ships as *field-level heuristics*, with the genuinely defensible mechanism (AST-level diffs) deferred to Phase 3. So the launch proposition to the launch persona is: pay us (or burn free quota) for heuristic change-severity on library docs that Context7 serves free without it. The offered mitigation — "public claims must match the shipped mechanism" — is honesty, not defense; it makes the weak position *accurately described*, not stronger. Nothing in the PRD argues why heuristic severity on the dev vertical is enough to beat free, and the §5 metrics that would detect failure (MCP connection rate, bailout) arrive only after the full C2-sized scope has been built.

**Fix:** Either pull AST-level diffs (or one narrow, demonstrably superior diff mechanism for the top-N SDKs of OQ-4) into launch scope and pay for it by cutting C3/H1, or write the explicit case for why versioning + webhooks + badges beats free-without-severity for this persona — with the specific Context7 displacement argument the positioning section currently gestures at.

### H8. The legal shield says "structured facts, not republication"; a launch feature exports the corpus as RAG chunks

**Location:** NFR-031, FR-090, NFR-030.

**Attack:** NFR-031 stakes the product's data-rights posture on serving "structured facts with provenance, not wholesale republication of source content." FR-090 then ships, at launch, workspace exports of corpus slices in "RAG-chunk formats" — which is passages of source-derived content, packaged for redistribution, in bulk, as training/retrieval data. That is not a structured fact; it is the thing the shield says you don't do, productized. The respectful-crawler policy (NFR-030) governs *acquisition* and is silent on *redistribution*; the takedown process removes a source from the corpus but the PRD says nothing about already-exported slices. In the exact period when scraped-content training data is the industry's hottest litigation surface, the PRD's own features contradict its own stated legal posture, and no counsel review is required anywhere before launch.

**Fix:** Constrain FR-090: exports limited to schema-validated structured records and diff-derived examples (the genuinely novel dataset); gate RAG-chunk export of source-derived text behind a rights review or per-source licensing flags. Add a legal-review item to the Phase 0 identity/legal workstream covering export and badge surfaces, and extend the takedown policy to address exported data.

---

## MEDIUM

### M1. The token-savings claim is "measured" against a strawman baseline

**Location:** FR-005, §5 corpus health ("Aggregate token savings delivered — the measured version of the product's core value claim").

**Attack:** FR-005 defines token economics as "raw source size versus refined output tokens." Nobody feeds raw 2–5MB HTML to an LLM; the realistic alternative is Firecrawl/Jina Markdown, already 10–20× smaller than raw HTML. Measuring savings against raw HTML manufactures a spectacular number by choosing the worst comparator — the honesty layer (NFR-003) ensures the number is *measured*, but a rigorously measured answer to a rigged question is still marketing arithmetic. The prototype's "85%+ token reduction" will be laundered into legitimacy through a denominator no buyer actually experiences.

**Fix:** Report both baselines: vs. raw HTML and vs. scraper-Markdown of the same page. Publish the second one. If it's still impressive, you have a claim; if not, you learned something before your customers did.

### M2. "Independent verification" that is neither independent nor defined

**Location:** §6 preamble ("gates therefore lean deliberately on independent verification"), Phase 0 exit gate ("Security review passed; zero known critical or high defects"; "ledger ↔ charges match over a sustained test period").

**Attack:** The gates "lean on independent verification — automated tests, security review" — but the automated tests are written by the same AI-assisted builders whose self-assessment the gates exist to distrust, and "security review passed" names no reviewer, no scope, no methodology. Two founders reviewing AI-generated code with the same AI is a mirror, not an audit. "Zero known critical or high defects" is gameable by not looking. And the gate's precision is selectively applied: the corpus gets "14 consecutive days," while billing reconciliation gets an undefined "sustained test period" — the money path is held to the vaguer standard.

**Fix:** Define "independent": an external security review (even a fixed-scope pentest) for the auth/tenancy/billing surfaces, a named duration for the reconciliation window, and adversarial test cases (tenant isolation, quota bypass, 402 replay) specified independently of the implementation.

### M3. The prototype's word is trusted exactly where it is most dangerous

**Location:** NFR-021 ("Prototype: implemented — preserve"), FR-001 ("Prototype: implemented"), contrasted with FR-006, FR-072, FR-073 (documented fabrications); §2 (external claims get re-verified).

**Attack:** The PRD documents that this codebase hardcoded confidence scores, fabricated latency and uptime constants, and read audit tables it never wrote — and then marks its SSRF and prompt-injection defenses "implemented — preserve" on the codebase's own say-so. A codebase that fabricated its metrics has forfeited the presumption that its security code does what it claims. The PRD even establishes the right principle for *external* claims ("re-verified before it appears in launch copy") and declines to apply it internally where the stakes are higher.

**Fix:** Add to Phase 0 trust workstream: every "Prototype: implemented — preserve" item gets adversarial verification (SSRF bypass attempts, injection payload suite) before the label is honored. Symmetry with the honesty workstream costs one sentence.

### M4. The respectful-crawler policy covers the minority of fetches

**Location:** NFR-030 ("**corpus crawling** honors robots.txt..."), FR-014, FR-112.

**Attack:** NFR-030's robots.txt/rate-limit/identifiable-UA commitments are scoped, by its own wording, to *corpus crawling*. The universal on-demand mode (FR-014) — the product's headline capability and, via the playground, its activation surface — is customer-directed fetching of arbitrary URLs, and it sits outside the policy's stated scope. The remaining controls for that traffic are the ToS (unenforceable on account-less callers, per H5) and a takedown process that operates after the fact. The "respectful crawler" posture is thus true for the traffic you initiate and silent for the traffic customers initiate, which is where the reputational and legal exposure actually lives.

**Fix:** State the on-demand fetch policy explicitly: same identifiable UA, per-domain rate ceilings across all customers, robots.txt behavior for on-demand fetches (honor, or honor-with-disclosure), and server-side blocklists that don't depend on ToS goodwill.

### M5. The metric designated to judge distribution cannot be computed as specified

**Location:** §5 ("Discovery funnel: signups attributable to MCP registries and badge embeds"), §5 preamble ("All metrics below come from the platform's own telemetry"), §6 Phase 1.

**Attack:** MCP registry discovery does not pass attribution: a developer finds the server on Glama or Smithery, pastes a JSON config, and connects — no referrer, no UTM, no platform-side signal distinguishing that signup from any other. Badge embeds attribute only via referer headers on badge *renders*, not signups. So the one metric assigned to answer "does Phase 1 distribution work in a 10k+-server field" is largely unmeasurable under §5's own telemetry-only rule. The PRD's defense against "listing is not a strategy" is a gauge that will read zero regardless of the truth.

**Fix:** Specify the attribution mechanism: registry-specific signup links/codes where registries permit, a "how did you find us" prompt at signup (accepting it's hand-entered — amend §5's purity rule for this one metric), and badge-referrer capture tied to subsequent signup sessions.

### M6. Six regulated-domain compliance texts, "kept current," with no owner and no review process

**Location:** FR-012 ("compliance guardrails... carried from the prototype and kept current"), commit history ("review and fortify all niche templates with regulatory standards").

**Attack:** The templates embed HIPAA, FDA, SEC, and Fair Housing language — written by an AI IDE, "fortified" by an AI commit, and now required to be "kept current" by a two-person dev team with no named owner, no review cadence, and no legal counsel anywhere in the plan. Regulatory disclaimer copy that is wrong or stale is worse than none: it evidences awareness of the obligation while failing it. The PRD treats legal text as a content asset with the same maintenance model as a schema template.

**Fix:** Name an owner and a review trigger (per-phase, or on regulatory change) in FR-012; add one-time counsel review of the four compliance texts to the Phase 0 identity/legal workstream, which already exists and already covers ToS.

### M7. x402 settlement is a treasury, accounting, and AML problem the PRD treats as a checkbox

**Location:** FR-062, FR-063 ("rails: Stripe; x402"), FR-065 (ledger reconciliation), FR-082 (Connect payouts).

**Attack:** x402 settles predominantly in stablecoins. Accepting per-request crypto micropayments as a two-person LLC raises questions the PRD never asks: custody of received funds, conversion to fiat, money-transmission/AML exposure, tax characterization — and mechanically, how the FR-065 ledger reconciles half-cent on-chain receipts against a Stripe-denominated books, then feeds 80% shares out through Stripe Connect. "Tax handling" appears exactly once, for creator payouts. The facilitator model (Coinbase/Cloudflare) may absorb much of this — but the PRD doesn't say so, doesn't name a facilitator, and doesn't put the question anywhere, not even in OQ-8, which is about *additional* rails.

**Fix:** Add an open question: x402 settlement design — facilitator, custody, fiat conversion, AML posture, and ledger treatment — owned by the co-founders, revisit during Phase 0 billing workstream, with a named fallback (relationship-mode-only launch) if the answer is expensive.

---

## LOW

### L1. An "ENTERPRISE" tier that disclaims everything enterprise buyers require

**Location:** FR-061, NFR-010, NFR-032, NFR-035, §6 Phases 3–4.

**Attack:** The $299 tier is named ENTERPRISE while the PRD elsewhere carefully disclaims contractual SLAs, SOC 2, BAAs, and data residency until Phases 3–4. It's a quota tier wearing a procurement label — harmless until the first actual enterprise reads the name, asks for the security questionnaire, and finds NFR-035's "known non-offering" notice. The name invites exactly the conversation the scope commitments defer.

**Fix:** Rename it (SCALE, TEAM, GROWTH) and reserve ENTERPRISE for the Phase 4 offering that can survive procurement.

### L2. The NFRs prescribe implementation in a document that forbids itself from doing so

**Location:** §3 preamble ("implementation choices belong to the architecture document"), NFR-051 ("edge/serverless primitives").

**Attack:** NFR-051 mandates edge/serverless — a platform choice, not a requirement. The requirement is "scales horizontally without customer-visible capacity planning"; the primitive is the architecture document's call, by this PRD's own rule two pages earlier.

**Fix:** Strip NFR-051 to the capability; let architecture pick the primitive (it will pick the same one — the prototype is Workers — but by its own authority).

### L3. "Error-free" is a promise the exit gate itself doesn't make

**Location:** §1 Launch Definition ("functionally ready and error-free"), §6 exit gate ("zero known critical or high defects").

**Attack:** The vision promises error-free; the gate — correctly — promises only "zero *known* critical/high defects," which is a different and achievable standard. The stronger word will be quoted back at you by the first user who hits a medium-severity bug on day two of an honesty-branded product.

**Fix:** Align the Launch Definition's wording to the gate's actual standard.

### L4. "OAuth 2.1 resource server" and "free-tier keys satisfy auth" are quietly in tension

**Location:** FR-031.

**Attack:** The MCP 2026-07-28 spec's authorization model means tokens issued via OAuth flows against an authorization server with resource indicators — not static API keys pasted into a config file. FR-031 asserts full spec compliance and, in the same sentence, that free-tier *keys* satisfy auth. Both can be true (keys exchanged for tokens; keys as long-lived bearer tokens with PRM metadata) but the PRD doesn't say which, and the launch persona's IDEs care about the difference: real OAuth adds a consent-flow friction that fights the "minutes, not a sales call" activation promise.

**Fix:** One sentence resolving the model: OAuth flow for spec-compliant clients, static keys as an explicitly non-compliant convenience path — and note the activation-friction trade-off in F12.

### L5. Three published packages are a permanent maintenance tail nobody budgeted

**Location:** FR-120–122, §6 Phase 1.

**Attack:** Publishing a TypeScript SDK, a LangChain package, and a LlamaIndex reader to npm creates three forever-obligations tracking two fast-churning frameworks — for the same two people running the corpus, the billing stack, and the marketplace. "Launch work is rebranding, hardening, and publishing" prices the first release and ignores every release after it.

**Fix:** Launch the core SDK; ship the framework integrations as documented recipes or examples until usage justifies package-hood, or state the maintenance commitment explicitly.

---

## Counts

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 8 |
| Medium | 7 |
| Low | 5 |
| **Total** | **23** |
