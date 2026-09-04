---
name: AI Data Refinery Studio
status: final
sources:
  - {planning_artifacts}/prds/prd-AI-data-refinery-2026-08-29/prd.md
  - {planning_artifacts}/architecture/architecture-AI-data-refinery-2026-08-29/ARCHITECTURE-SPINE.md
  - {project-root}/_bmad-output/specs/spec-AI-data-refinery/SPEC.md
updated: 2026-09-04
---

# AI Data Refinery Studio — Experience Spine

> **Canonical behavioral contract.** Companion to `DESIGN.md`. Defines information architecture, behavioral states, interaction primitives, microcopy, accessibility baselines, and named-protagonist journeys for the human-facing Refinery Studio.

---

## Foundation

* **Primary Surface**: Dense, widescreen-first desktop web application (`1440px`–`1920px` optimized, responsive down to tablet/mobile drawers). Built on **React 18 + Tailwind CSS + Lucide Icons**, transitioning cleanly to routed views via `react-router 7` and server-state caching via `TanStack Query`.
* **Design Reference**: Strict visual identity adherence to `DESIGN.md`. Dark-first palette (`#060913`), Cloudflare Orange (`#f48120`), and active edge CSS keyframe animations (`pulseGlow`, `shimmer`, `laserSweep`).
* **Tenancy & Workspace Isolation**: Every session binds to a scoped tenant workspace (`workspace_id`). Multi-tenant switching available in the global top bar without page reload. The 4-tier role matrix (`OWNER`, `BUILDER`, `MEMBER`, `VIEWER`) governs action button visibility (e.g., Viewers cannot delete pipelines or trigger paid live scrapes).

---

## Information Architecture

The Studio is organized into an always-accessible global header, a horizontal domain switcher, and dedicated workspace panels:

| Surface / Route | Reached From | Primary Purpose | Role Access |
|---|---|---|---|
| **Diffs & Pipelines** (`/diffs`) | Top Nav / `g d` | Real-time AST semantic diff stream; versioned entity inspector; scheduled cron status | All |
| **Dev Breaking Changes** (`/dev`) | Top Nav / `g b` | SDK & API breaking change feed with Before/After code snippets and migration rules | All |
| **SaaS Pricing Models** (`/pricing`) | Top Nav / `g p` | Multi-tier SaaS pricing matrices, feature matrix comparisons, and plan diffs | All |
| **Regulatory & Compliance** (`/regulatory`) | Top Nav / `g r` | Tracked regulatory filings (SEC, FDA, EU AI Act) with clause-level diff analysis | All |
| **Schema Studio** (`/schemas`) | Top Nav / `g s` | Visual no-code schema builder, raw Zod/JSON-Schema editor, live test runner, MCP tool publishing | Builder+ |
| **Marketplace** (`/marketplace`) | Top Nav / `g m` | Community and verified schema blueprints, 1-click clone, creator 80/20 revenue stats | All |
| **Fine-Tuning Export** (`/export`) | Top Nav / `g e` | Corpus slice export engine (OpenAI JSONL, Llama3, Alpaca, RAG Vector chunks) | Member+ |
| **URL Playground** (`/playground`) | Top Nav / `g u` | On-demand edge extraction, live schema validation, token economics calculator | All |
| **MCP Hub** (`/mcp`) | Top Nav / `g c` | Interactive MCP JSON-RPC 2.0 tool tester, 1-click Cursor/Claude Code config generator | All |
| **Documentation & Help** (`/help`) | Top Nav / `g h` | Video guides, architecture walkthroughs, TypeScript SDK snippets, API documentation | All |
| **Agent Wallets & Billing** (`/billing`) | Top Nav / `g w` | Stripe subscription tiers, prepaid agent wallets, x402 micropayment ledger | Owner / Admin |
| **Founder Console** (`/management`) | Top Nav (Passcode) | Platform operations, cron dispatch, KV cache purging, real telemetry, dynamic pricing editor | Founder / Admin |

---

## Voice and Tone

The interface speaks to senior AI engineers, data platform architects, and autonomous agent builders.

| Surface / Event | Do (Refinery Voice) | Don't (Consumer Noise) |
|---|---|---|
| **Live Extraction Success** | "Extracted in 38ms · Conforms to Zod schema · 87% token reduction." | "Awesome! Your page was scraped successfully! 🎉" |
| **Schema Conformance Error** | "Quarantined: Payload missing required field `pricing.tiers[0].annual_rate`. Entity saved as invalid." | "Oops! Something went wrong with your extraction." |
| **HTTP 402 / Quota** | "Agent wallet balance exhausted ($0.00). Top up with Stripe or pass x402 payment token." | "You're out of credits! Upgrade to Pro now!" |
| **AST Diff Detection** | "CRITICAL: `stripe.charges.create` callback pattern removed. Native Promise signature required." | "New changes detected in Stripe Node SDK." |
| **Empty State** | "No tracked pipelines in this workspace. Create your first scheduled pipeline or refine a URL." | "Nothing here yet! Start your journey!" |

---

## Component Patterns

### 1. Unified Playground Cockpit
* **Behavior**:
  * User inputs target URL. If an auto-detected schema exists (e.g., Stripe, Datadog), Studio auto-selects the schema.
  * User clicks "Refine at Edge" (or hits `⌘Enter` / `Ctrl+Enter`).
  * Real-time progress ticker transitions across states: `Resolving DNS` → `Executing Edge Fetch (0ms)` → `Workers AI Structured Inference` → `Zod Validation`.
  * Right panel displays formatted syntax-highlighted JSON with tabbed metrics: Token Savings, Inference Cost, Measured Latency.
  * Persistent "Copy JSON" and "Save to Workspace Corpus" buttons.

### 2. Time-Travel AST Diff Inspector
* **Behavior**:
  * Top slider allows scrubbing through historical snapshots `v(1)` to `v(N)`.
  * Selecting any two snapshots renders a dual-pane diff viewer with line numbers and syntax highlighting.
  * AST parser flags additions in green, modifications in amber, and deletions in red.
  * Side drawer details the semantic reasoning: *Why was this classified as CRITICAL?* (e.g., "Function signature removed without deprecation period").

### 3. Visual Schema Studio
* **Behavior**:
  * Dual-mode editing: Visual Tree Builder (no-code) ↔ Raw JSON Schema / Zod Editor. Changes in one instantly reflect in the other with zero latency.
  * "Test with URL" drawer executes a sandboxed test without saving or billing.
  * "Publish as MCP Tool" triggers a modal confirming tool name, description, and workspace scoping. Upon confirmation, the tool is immediately active in `/mcp/tools/list`.

### 4. Agent Wallet Governance
* **Behavior**:
  * Displays prepaid balance in USD down to micro-cents (`$42.5000 USD`).
  * Live-streaming transaction ticker showing each query deduction (`-$0.0050` for cached corpus read; `-$0.0200` for on-demand edge refinement).
  * "Emergency Kill-Switch": Single-click red action button that immediately revokes all agent tokens and stops outbound calls without deleting data.

---

## State Patterns

| State | Visual Treatment | Interactive Behavior |
|---|---|---|
| **Initial / Cold Load** | Shimmer skeleton cards (`animate-shimmer`) matching exact data table geometries. | Search and filters disabled until workspace context resolves. |
| **Active Extraction** | Laser sweep line (`animate-laser`) over input card; pulsing edge orange badge (`animate-pulse-glow`). | "Refine" button switches to "Refining at Edge..." with elapsed millisecond counter. |
| **Validation Quarantine** | Rose border (`#ef4444`); amber warning badge with error path locator. | Payload viewable with failing lines highlighted; export to production corpus blocked. |
| **Empty State** | Centered icon with muted slate text (`#64748b`), clear 1-sentence prompt, and single primary action button. | Keyboard shortcut hint displayed (`Press 'N' to create`). |
| **HTTP 402 Payment Required** | Modal banner with exact unpaid query count and 1-click Stripe top-up or x402 token input. | Reads from cached demo corpus remain allowed; live crawls paused until funded. |

---

## Interaction Primitives

* **Global Keyboard Shortcuts**:
  * `⌘K` / `Ctrl+K`: Global command palette (navigate to any surface, search schemas, find entities).
  * `⌘Enter` / `Ctrl+Enter`: Execute active action (Refine URL in Playground, Test Schema in Studio).
  * `g d`: Navigate to Diffs.
  * `g s`: Navigate to Schema Studio.
  * `g c`: Navigate to MCP Hub.
  * `Esc`: Close open modal, cancel drawer, or clear filter search.
* **1-Click Copy**:
  * Every code block, cURL command, JSON preview, and MCP tool config snippet includes an explicit copy icon button that flashes green with a checkmark for `1.5s`.
* **Synchronized Diff Scrolling**:
  * Dual-pane diff viewers synchronize vertical scrolling between `before` and `after` panes.

---

## Accessibility Floor

* **Contrast**: All text satisfies WCAG AA (minimum 4.5:1 for normal text, 3:1 for large display text and status badges).
* **Focus States**: High-contrast orange/blue focus ring (`2px solid #f48120`, `offset 2px`) on all interactive inputs, tabs, and buttons.
* **Keyboard Navigability**: Every interactive element reachable via `Tab` / `Shift+Tab`. Modals trap focus and release cleanly on `Esc`.
* **Screen Reader Semantics**:
  * Status badges announce severity levels: `<span role="status" aria-label="Severity Critical: Breaking Change">`.
  * Diff snippets include screen-reader announcements for additions and deletions (`aria-label="Removed line 42"`).
* **Reduced Motion**: Respects `@media (prefers-reduced-motion: reduce)` by disabling `pulseGlow`, `shimmer`, and `orbitRotate` animations while maintaining color and contrast clarity.

---

## Key Flows (Named-Protagonist Journeys)

### Journey 1: Dev Lead Elena Wires Claude Code & Validates Breaking Changes
* **Protagonist**: Elena, Principal AI Architect maintaining 20 autonomous coding agents across enterprise repos.
* **Context**: 11:30 PM, production build broke due to an unannounced SDK signature change in an upstream payment dependency.
* **Flow**:
  1. Elena opens Refinery Studio (`drefinery.freshbeats.ai/mcp`) and clicks **"Copy Claude Code Config"**.
  2. Studio copies the JSON-RPC config snippet with her active workspace API key.
  3. She navigates to `/dev` and filters by `stripe-node`.
  4. The **Time-Travel AST Diff** highlights the exact breaking removal in red (`stripe.charges.create` callback dropped in favor of async/await) with the official migration snippet.
  5. *Climax Beat*: Elena clicks "Test with MCP" directly in the Studio; the live MCP server returns the structured breaking change payload to her local IDE in **22ms**. Her agents patch the code automatically before midnight.

### Journey 2: Data Engineer Marcus Builds a Real-Time Pricing Schema
* **Protagonist**: Marcus, Senior Analytics Engineer at a SaaS intelligence firm.
* **Context**: Needs to extract daily pricing tiers from 50 competitors whose web pages change layout monthly.
* **Flow**:
  1. Marcus enters **Schema Studio** (`/schemas`) and clicks **"New Schema Blueprint"**.
  2. He names it `b2b_saas_pricing` and drags in property fields: `product_name (string)`, `billing_period (enum: monthly, annual)`, `tiers (array<object>)`.
  3. The right-hand drawer auto-compiles the TypeScript Zod schema in real time.
  4. He pastes a complex competitor URL into the preview drawer and clicks **"Test on Live URL"**.
  5. *Climax Beat*: The edge Workers AI model extracts all 4 pricing tiers with 100% schema conformance in **450ms**. Marcus clicks **"Publish as MCP Tool"**—the schema is instantly live as `refinery_pricing_b2b_saas` for his company's LLM pipeline.

### Journey 3: Fleet Operator Carlos Governs Agent Wallets & Quotas
* **Protagonist**: Carlos, FinOps Lead managing 150 autonomous customer-support agents.
* **Context**: Wants to enable autonomous web intelligence for his agent fleet without risking runaway scraping costs.
* **Flow**:
  1. Carlos navigates to **Agent Wallets & Billing** (`/billing`).
  2. He creates a dedicated agent pool token `agent_support_fleet_tier1`.
  3. He sets a hard prepaid wallet cap of **$50.00 USD** with an automatic alert threshold at **$10.00 USD**.
  4. In the live ledger, he watches real-time requests process: cached corpus hits cost **$0.005**, on-demand extractions cost **$0.020**.
  5. *Climax Beat*: When an errant infinite loop in a third-party agent tests the endpoint with invalid queries, the Refinery returns clean machine-readable `HTTP 402 Payment Required` headers without crashing or overbilling. Carlos hits the Studio **Emergency Kill-Switch**, stopping the errant agent instantly with zero data loss.

---

## Responsive & Platform

* **Desktop (1440px+)**: Primary operational cockpit. Side-by-side split layouts (Playground, Diff comparisons, Schema Studio preview).
* **Laptop / Standard (1024px–1439px)**: Compact padding (`16px`), horizontal scrollable tab bar, collateral drawers collapse into overlays.
* **Tablet (768px–1023px)**: Left drawer folds into a slide-over sheet. Schema Builder switches to tabbed view (`Visual Editor` \| `Zod Output`).
* **Mobile (<768px)**: Read-only feed and monitoring mode. AST diffs switch to unified inline diff view; full schema editing directs to desktop.
