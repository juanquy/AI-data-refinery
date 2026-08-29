---
title: Security Review — Architecture Spine (reviewer gate)
lens: security (architecture altitude)
target: _bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/ARCHITECTURE-SPINE.md
context: .memlog.md, code-sweep.md, prd-AI-data-refinery-2026-08-29
date: 2026-08-29
verdict: "Security skeleton is right (single fetch boundary, owner-scoped repos, append-only ledger, admin-as-role) — but the spine pins WHAT must hold without pinning the enforcement points where money and tenancy race: scope provenance, debit atomicity, payment replay, and webhook egress are open classes that independent builders will ship wrong."
counts: { critical: 3, high: 5, medium: 6, low: 1 }
---

# Security Review — ARCHITECTURE-SPINE.md

**Scope rule applied:** this is an architecture review. A finding is reported only where the spine's current text leaves a *class* of security decision open that independent feature builders will resolve wrong or inconsistently. Fixes are proposed at spine altitude: an AD sentence, a convention row, or a Deferred entry with a revisit condition — never feature detail.

## What the spine already gets right (no findings)

- One policed fetch boundary with SSRF/robots/fencing and no second path (AD-14) — the correct structural answer to the prototype's drift.
- Owner scope as a mandatory repository parameter (AD-6) — the right *shape*; findings below are about who mints the scope and the read surfaces that don't fit two classes.
- Append-only `usage_events`/`audit_events`, single write path, compensating events never edits (AD-11).
- Admin as a role on user accounts, never derived from plan/key/passcode (AD-7) — kills three prototype flaws at once.
- Both-direction webhook signing, delivery records, DLQ, visible `paused` state (AD-4).
- Strict LLM-output validation with quarantine, no synthesized fallback (AD-9).
- Secrets only via bindings/`wrangler secret`; no literals (AD-13). Hashed keys, `Bearer`-only transport, one 402 shape (AD-7 + conventions).

---

## CRITICAL — exploitable class of flaw builders will ship

### S-1 (CRITICAL) — Owner scope provenance is unpinned: the repository API can still be misused with a client-supplied workspace ID

**Gap.** AD-6 makes every repository method *take* a scope, but nothing says where the scope may *come from*. The prototype's shipped tenant-isolation bug was exactly this: `GET /api/v1/schemas?workspaceId=X` trusted an unauthenticated query param (code-sweep §6, PRD FR-050 "Prototype gap: client-supplied `workspaceId` trusted"). Under the current rule, `repo.getSchema(body.workspaceId, id)` type-checks, satisfies "takes an owner scope parameter," and is a cross-tenant read. Every feature builder handling a route that mentions a workspace will face this choice and some will resolve it wrong — the rule is only structurally enforceable if the scope value itself cannot be constructed from request input.

**Spine text that leaves it open (AD-6):**
> "Every repository method takes an owner scope parameter — there is no unscoped read API to call."

**Suggested fix — append to AD-6:**
> The owner scope is a value only `core/tenancy` can construct (a branded `OwnerScope` type with no public constructor), derived at the entry boundary from the authenticated principal — session, key, agent token, or x402 proof. A workspace identifier arriving in a request body, query string, or MCP tool argument is never a scope source; at most it is cross-checked against the principal's resolved scope and mismatches are `TENANT_` errors. Feature code that assembles a scope from request data is a defect.

### S-2 (CRITICAL) — Wallet debit has no atomicity/concurrency discipline: check-then-append double-spend on concurrent agent calls

**Gap.** AD-11 correctly makes balances/quotas *reads* of the append-only ledger — but a read-then-append sequence is a textbook race. An agent (the paying customer here is a *machine* that naturally issues concurrent requests) with 1 query of balance fires 100 parallel calls: all pass the balance read, all run, all append billable rows, wallet goes deep negative. Nothing in the spine names the primitive that makes overdraft impossible; D1 `batch()` (AD-12) is atomic *within one request* but check and append live in different requests unless the spine says otherwise. Every builder touching quota, wallet, or 402 will invent their own check-then-write. There is also no reserve/settle story for the expensive path: AD-11 bills only on delivered results, so the debit must be *held* before the costly extraction and settled/released after — that discipline is currently nowhere.

**Spine text that leaves it open (AD-11 + Money convention):**
> "Quotas, 402 responses, Stripe invoicing, x402 settlement, and marketplace attribution are all *reads* of this ledger."
> "Ledger, pricing config, wallets: integer **micro-USD** …"

**Suggested fix — append to AD-11:**
> Debits are atomic conditional writes, never check-then-write: `core/metering` owns one reserve→settle/release discipline in which the balance/quota predicate and the ledger append commit in a single D1 `batch()` (conditional-update style: the decrement succeeds only if the predicate row still satisfies it; a failed predicate is a 402). Priced work reserves before the expensive step, settles on delivery, releases (auto-credit event) on failure. Overdraft and quota overshoot must be impossible by construction under concurrent requests — a balance kept correct only by request serialization or a pre-read is a defect.

### S-3 (CRITICAL) — Payment proofs and payment webhooks are not pinned single-use: x402 replay and Stripe redelivery double-credit

**Gap.** For anonymous calls, "payment proof is the credential" (AD-7) and the ledger attributes by "x402 payment reference" (AD-11) — but nothing says a reference is single-use. A replayed x402 proof is then N queries for one micropayment. Symmetrically, Stripe *retries* webhook deliveries by design; AD-4 pins signature verification but not idempotency, so a redelivered `checkout.session.completed` credits a wallet twice. Both are money-creation bugs on an append-only ledger that has no natural dedupe — builders on each rail will decide idempotency independently.

**Spine text that leaves it open (AD-7, AD-11, AD-4):**
> "**drive-by x402 agent** (payment proof is the credential; no account)"
> "attributed by principal (workspace/key/agent-token, or x402 payment reference for anonymous calls)"
> "inbound Stripe webhooks are signature-verified in `adapters/stripe` before any core call"

**Suggested fix — append to AD-11 (money-event idempotency):**
> External payment evidence is single-use and idempotent at the ledger: `usage_events` enforces a uniqueness constraint on the x402 payment reference, and Stripe webhook processing is idempotent by Stripe event id (a unique-keyed processing record) — a replayed proof or redelivered event changes nothing and grants nothing. The 402 flow treats a reused reference as unpaid.

---

## HIGH — inconsistent security decisions guaranteed

### S-4 (HIGH) — Webhook delivery targets escape AD-14: registered URLs are attacker-controlled and no rule polices that egress

**Gap.** AD-14 governs "every server-side fetch of external content" — the *ingest* direction. Outbound webhook deliveries go through `refinery-webhooks` (AD-4), a different code path POSTing to customer-registered URLs, and no spine text applies SSRF policy to them. The code sweep flagged this exact asymmetry in the prototype ("no SSRF check on the registered URL — contrast: inbound fetch targets *are* SSRF-checked"). Attacker-controlled targets turn the platform into an internal-network prober / blind-POST relay, and signed deliveries to an attacker-chosen URL are also a signing-oracle. Builders will assume AD-14 "covers fetch" and ship the queue consumer unpoliced.

**Spine text that leaves it open (AD-14, AD-4):**
> "Every server-side fetch of external content goes through the single fetch port (one adapter)."
> "Outbound webhooks go exclusively through `refinery-webhooks` with per-delivery records, bounded retries, and a DLQ; every outbound delivery is signed with the subscription's secret …"

**Suggested fix — one sentence in AD-4 (or AD-14's scope line):**
> Webhook delivery targets are attacker-controlled URLs: they pass the same SSRF allow/deny policy as the fetch port — validated at subscription time and re-validated at each delivery (post-resolution, so DNS rebinding doesn't bypass it), private/link-local ranges refused, off-policy redirects not followed. `refinery-webhooks` enforces this itself; AD-14's egress policy governs *all* outbound requests to non-vendor URLs, both fetches and deliveries.

### S-5 (HIGH) — Legitimate cross-tenant reads have no structural home: marketplace grants, the ops console, and multi-corpus search each force builders to bypass AD-6 by hand

**Gap.** AD-6's two classes (platform / one workspace) cannot express three reads the product requires: (a) **marketplace** — workspace B reading workspace A's listed data; the only way to build it today is "check entitlement, then call the repository with A's scope," i.e., every builder hand-rolls the bypass AD-6 exists to prevent; (b) **ops console** — FR-071/the map row require admin reads across all tenants, directly colliding with "there is no unscoped read API to call," so admin routes will grow raw scope-forging or ad-hoc SQL; (c) **search** — a query spanning platform corpus + own workspace (+ purchased data) needs a scope *union*, and if repositories accept arbitrary scope sets the isolation property quietly dies. Three surfaces, three independent improvisations guaranteed.

**Spine text that leaves it open (AD-6, map):**
> "it becomes readable to others only through an explicit marketplace listing"
> "Every repository method takes an owner scope parameter — there is no unscoped read API to call."
> "Operations console + audit stream | `entry/http` admin routes over core (admin role per AD-7)"

**Suggested fix — append to AD-6:**
> Exactly three derived read scopes exist beyond a principal's own workspace, all minted in core and never assembled in feature code: (1) `platform`; (2) a marketplace **grant scope** minted by `core/marketplace` after its entitlement check — exposing only the listed projection, never the owner workspace's raw scope; (3) an **admin scope** mintable only for an admin-role session, every mint appending an `audit_events` row. Scope unions (search, export) are limited to platform + own + granted, composed by `core/tenancy`. No fourth kind exists.

### S-6 (HIGH) — Revocation and kill-switch latency undefined: AD-12's "hot cache" invites caching authorization state that FR-064 requires to die instantly

**Gap.** FR-064 makes the guardian kill-switch "effective immediately for new requests; nothing is billed to a revoked token after the kill." The spine never says where credential/role state may live: AD-12 blesses KV as hot cache and D1 reads cost latency, so some builders will cache key lookups, session-embed roles, or pass credentials into Workflow params — each choice giving revocation a different (unbounded) propagation delay, and role/membership changes surviving in stale session claims (session-fixation-adjacent privilege persistence across the Better Auth fence). This is the definition of "inconsistent security decisions guaranteed."

**Spine text that leaves it open (AD-7, AD-12):**
> "**agent token** (workspace-bound, draws a wallet, guardian kill-switch)"
> "KV (hot cache) and Vectorize (embeddings) are **derived, rebuildable projections** …"

**Suggested fix — append to AD-7:**
> Authorization state — key validity, agent-token kill state, membership role, admin role — is read from D1 on every request; it is never cached in KV, never embedded in session or token claims (sessions carry identity only), and never carried by a queue message or Workflow past its issuing step (long-running runs re-check at step boundaries). Revocation and the kill-switch therefore bind at the next request with no propagation machinery. Better Auth sessions rotate on login and on any privilege change.

### S-7 (HIGH) — Prompt-injection taint stops at fetch time: stored content re-entering LLM calls is unfenced, and nothing forbids LLM output from steering fetches or downstream surfaces

**Gap.** AD-14 fences content "before any LLM call" *at fetch time*, and AD-9 confines output to the validated schema — good. But the blast radius is still open in three ways builders will each answer differently: (a) **second-order injection** — raw snapshots and refined values read back from storage (diff/severity reasoning, marketplace listing copy, summaries) re-enter LLM calls with the fetch-time fence long gone; (b) **output steering input** — nothing says extracted values (e.g., a URL field) may never become a subsequent fetch target or source-connector seed, which would let injected content direct the crawler; (c) **stored XSS via public projections** — badge SVGs render extracted version labels (FR-023) and Studio renders extracted fields; injected markup in schema-valid *string values* becomes script in a public GitHub-embedded badge. AD-9's schema gate validates shape, not intent — the values are still attacker-authored.

**Spine text that leaves it open (AD-14, AD-9):**
> "Fetched content is always fenced as untrusted (`<untrusted_web_content>` wrapper + defensive directive) before any LLM call — no unfenced path exists."
> "extraction output must pass the target schema or the run **fails**"

**Suggested fix — append to AD-14:**
> Untrusted origin is a persistent taint, not a fetch-time property: content that ever entered through the fetch port — raw snapshots and refined values read back from storage included — is re-fenced on every later LLM call (diff, summarization, listing copy). LLM output never chooses a fetch target, tool, or write: its only effect is the current run's schema-validated entity row; fetch targets come exclusively from operator configuration and the corpus source registry. Downstream, refined values are inert data — escaped in badge SVG, Studio, and exports, never interpreted as markup or instructions.

### S-8 (HIGH) — MCP OAuth tokens have no audience/workspace binding rule, and MCP tool authorization parity with REST is only implied

**Gap.** AD-7 names OAuth 2.1 for user-delegated MCP but pins nothing about token audience (accepting tokens minted for other resources = the MCP-spec confused-deputy/token-passthrough problem the 2025-06+ spec added resource indicators to close) or about which workspace a delegated token acts in when the user belongs to several — each MCP tool builder will pick a default. The map row's "AD-8-equivalent tool schemas" is informal: tool arguments are inbound input that AD-9's "route boundary" wording doesn't clearly cover, and nothing states a tool call must resolve to the same `core/tenancy` decision as its REST twin — the prototype's unauthenticated-MCP hole was exactly a second surface with weaker rules.

**Spine text that leaves it open (AD-7, map):**
> "MCP: OAuth 2.1 (Agents SDK) for user-delegated connections, API key or x402 for direct agent calls."
> "MCP surface | `entry/mcp` (Agents SDK) | AD-7, AD-8-equivalent tool schemas, AD-11"

**Suggested fix — append to AD-7:**
> MCP OAuth 2.1 tokens are audience-bound to this server (resource indicators; tokens minted for any other audience are rejected — no token passthrough) and scoped to exactly one workspace fixed at consent. Every MCP tool argument is Zod-validated per AD-9, and every tool call resolves through the same `core/tenancy` authorization as its REST equivalent — a tool may never grant what its REST counterpart would deny.

---

## MEDIUM — should be pinned

### S-9 (MEDIUM) — Credential-at-rest conventions unpinned: hash algorithm unstated, agent tokens not even said to be hashed, webhook secrets unstorable-as-written, no rotation posture

**Gap.** AD-7 says API keys are "hashed at rest" — with no algorithm, builders split between bcrypt (wrong for 256-bit random tokens; burns Worker CPU per request) and unsalted SHA-256 (right). Agent tokens get no hashing clause at all in AD-7's text. Webhook signing secrets *cannot* be hashed (they must be recoverable to sign) — without a rule, they land plaintext in D1. Nothing anywhere covers rotation (keys, webhook secrets) or show-once semantics.

**Spine text that leaves it open (AD-7):**
> "**workspace API key** (hashed at rest, workspace-bound, scoped), **agent token** (workspace-bound, draws a wallet, guardian kill-switch)"

**Suggested fix — new Consistency Conventions row `Credentials at rest`:**
> API keys and agent tokens: ≥256-bit random, shown once at creation, stored as SHA-256 digests (they are high-entropy — no KDF), compared in constant time, identifiable by prefix. Webhook signing secrets: recoverable by necessity, stored encrypted with a platform secret, rotatable per subscription with an overlap window. Rotation everywhere = issue-new + revoke-old, never in-place mutation.

### S-10 (MEDIUM) — Admin role hardening: no MFA requirement, no grant/bootstrap rule, no machine-credential exclusion — two founder accounts are the whole platform

**Gap.** Admin-as-role fixes the prototype, but with exactly two founders, one phished Better Auth session is total platform compromise (all tenants readable via the ops console, wallets creditable). The spine doesn't require a second factor on admin accounts, doesn't say who may grant/revoke the role (an env flag or seed migration would recreate the hardcoded-passcode pattern in new clothes), and doesn't exclude API keys/agent tokens/MCP tokens from admin surfaces. Break-glass for a locked-out-founders scenario is unaddressed (acceptable operationally, but should be a named runbook, not improvised prod-DB surgery).

**Spine text that leaves it open (AD-7):**
> "Platform admin is a `role` on specific user accounts — never inferred from plan, key type, or passcode; management surfaces require it."

**Suggested fix — append to AD-7:**
> Admin-role accounts require a second factor before the role activates. The role is granted or revoked only by an existing admin, both actions appending `audit_events`; bootstrapping the first admin is a documented operational runbook executed against the database, never a code path, seed migration, or env flag. Admin surfaces accept Studio sessions only — no API key, agent token, or MCP token reaches them.

### S-11 (MEDIUM) — R2 raw/quarantined snapshots: no owner scope in the key convention, no retention bound, and the opt-out registry governs fetching but not what's already stored

**Gap.** AD-6 names KV keys and Vectorize metadata as scope carriers — R2 is conspicuously absent, and there is no R2 key convention row, so snapshot keys will ship unscoped. Crawled pages will contain incidental PII regardless of the ToS (NFR-030/032 forbid *targeting* it, not its existence), and quarantined snapshots are by definition un-validated raw content — yet nothing bounds their retention or names who may read them. The takedown/opt-out registry only says "a listed source is never fetched" (AD-14): copies fetched before the opt-out persist and keep serving derived rows indefinitely, which guts the takedown promise.

**Spine text that leaves it open (AD-6, AD-14, AD-12):**
> "KV keys embed the owner scope; Vectorize metadata carries it and queries filter on it server-side."
> "the takedown/opt-out registry (a D1 table; a listed source is never fetched)"

**Suggested fix — one sentence in AD-12 plus a Deferred entry:**
> AD-12 add: R2 object keys embed the owner scope exactly as KV keys do; raw and quarantined snapshots are tenant resources (or `platform` for corpus crawls) readable only through their owning scope or the audited admin scope, and carry bounded retention enforced by R2 lifecycle rules. A takedown/opt-out registration also purges stored raw snapshots for that source and stops serving its derived rows — the registry governs storage, not only fetching.
> Deferred add: **Raw-snapshot retention length + deletion-request workflow** (crawled pages contain incidental personal data whatever the ToS says) — revisit before marketplace exposure of any corpus or first EU-sourced takedown, whichever is first.

### S-12 (MEDIUM) — audit_events integrity: an admin's trail is erasable at the layer below the append-only rule

**Gap.** "Append-only, written by core services alone" holds inside the application — but the accounts being audited (two founders) also hold raw D1 access (`wrangler d1 execute`), so the audit record is erasable by exactly the principals it audits. For a company whose stated driver is "proper engineering and audit," in-D1-only audit is a known gap worth naming now with a cheap revisit condition, plus one sentence closing the in-app half completely.

**Spine text that leaves it open (AD-11):**
> "append-only `audit_events` rows in D1 written by core services alone"

**Suggested fix — one sentence in AD-11 plus a Deferred entry:**
> AD-11 add: No code path — the admin role included — updates or deletes a `usage_events` or `audit_events` row; the repositories expose no such method.
> Deferred add: **Audit tamper-evidence beyond D1** (periodic export to R2 with object lock, or hash-chained events) — today raw D1 access can silently rewrite the trail; revisit at SOC 2 readiness mapping (already deferred) or the first enterprise contract, whichever is first.

### S-13 (MEDIUM) — Anonymous x402 refinement output has no owner under the two-class rule

**Gap.** AD-6 says every row is `platform` or one `workspace_id`. A drive-by x402 agent (no account, no workspace) can pay for an on-demand refinement — its output row fits neither class. Builders will resolve this by inventing a pseudo-workspace, or worse, storing it at `platform` scope (leaking one anonymous caller's paid result into the public corpus, and letting anonymous callers *write* the corpus — an injection-adjacent poisoning vector).

**Spine text that leaves it open (AD-6):**
> "Every stored row belongs to exactly one class: **platform corpus** (owner = `platform`) or **tenant resource** (owner = one `workspace_id` — mandatory column)."

**Suggested fix — append to AD-6:**
> Anonymous x402 principals never hold a workspace scope: they read at `platform` scope, and an anonymous on-demand refinement is delivered in-response and persisted only as its run, ledger, and quarantine records — never as a tenant resource and never written into the platform corpus.

### S-14 (MEDIUM) — Compensating-event authority unpinned: who may write a refund/credit/chargeback row

**Gap.** AD-11 defines compensating event types but not their authority sources. Without a rule, a builder can wire a customer-facing "request credit" endpoint straight to a credit event — a free-money surface. Only three origins are legitimate, and they are already implied elsewhere; one sentence makes them exclusive.

**Spine text that leaves it open (AD-11):**
> "Refunds, credits, chargebacks, and operator courtesy grants are explicit compensating event types — rows are never edited or deleted."

**Suggested fix — append to AD-11:**
> Compensating events originate from exactly three authorities: a signature-verified Stripe event (refund/chargeback), the failed-run auto-credit inside `core/metering`, or an admin-role action that also appends its `audit_events` row. No customer-facing endpoint writes one.

---

## LOW — note

### S-15 (LOW) — Public badge namespace as an existence oracle for tenant entities

AD-6 already requires owner opt-in for tenant-entity badges. Remaining note: the badge route's *negative* behavior is unpinned — if a non-opted or nonexistent entity returns distinguishable responses (404 vs 403 vs empty SVG), the public badge URL space becomes an unauthenticated probe for which schemas/entities a tenant tracks. One clause when the badge feature is built: non-opted and nonexistent entities are indistinguishable (same status, same body). Spine text: "a badge on a tenant-owned entity exists only where the owning workspace has explicitly enabled that public projection, never by default" (AD-6) — sufficient at spine altitude; carry the indistinguishability clause into the feature spec.

---

## Summary of proposed spine edits

| Where | Edit |
| --- | --- |
| AD-6 | + scope provenance / branded `OwnerScope` (S-1); + three derived scopes: grant, admin, unions (S-5); + anonymous x402 ownership (S-13) |
| AD-7 | + auth state from D1 every request, sessions identity-only, rotation on privilege change (S-6); + OAuth audience/workspace binding, MCP↔REST authorization parity (S-8); + admin MFA, grant/bootstrap, sessions-only (S-10) |
| AD-11 | + atomic reserve→settle/release debit discipline (S-2); + payment-evidence idempotency (S-3); + compensating-event authorities (S-14); + no update/delete path on ledger/audit rows (S-12) |
| AD-4 / AD-14 | + webhook targets under the same SSRF egress policy, validated at registration and delivery (S-4) |
| AD-14 | + persistent untrusted taint, LLM output steers nothing, refined values inert downstream (S-7) |
| AD-12 | + R2 keys owner-scoped, snapshot retention/access, takedown purges storage (S-11) |
| Conventions | + `Credentials at rest` row (S-9) |
| Deferred | + raw-snapshot retention/deletion workflow (S-11); + audit tamper-evidence beyond D1 (S-12) |
