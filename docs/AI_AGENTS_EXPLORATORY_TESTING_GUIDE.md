# 🤖 Multi-Agent Exploratory Testing Master Guide
### Universal Data Refinery (Production Environment)

This suite contains 4 real-world live exercises designed to be executed by **two simulated autonomous AI agents** on the **Free Forever Tier**. The goal is exploratory end-to-end verification of edge inference, MCP tool discovery, vector search, and live telemetry in the **Founder Console**.

---

## 👥 Assigned Agent Personas

| Agent | Identity | Role & Specialty | Assigned Exercises |
|---|---|---|---|
| **Agent Alpha** | `Agent_Alpha_Copilot` (`alpha.copilot@autonomous.ai`) | **Autonomous Coding Copilot**: SDK deprecations, AST breaking changes, MCP tools, and semantic vector search. | Exercise 1, 2, 4 |
| **Agent Beta** | `Agent_Beta_Analyst` (`beta.analyst@autonomous.ai`) | **Market Intelligence & FinOps Analyst**: SaaS pricing models, on-demand edge distillation of unstructured URLs. | Exercise 1, 3, 4 |

---

## 📚 Exercise Index

1. **[Exercise 1: Autonomous Agent Onboarding & MCP Protocol Handshake](./exercise_1_agent_onboarding_and_mcp_discovery.md)**
   * Both agents autonomously provision free-tier tokens (50 query allowance).
   * Agent Alpha executes MCP `tools/list` discovery across 13+ tools.
   * Agent Beta queries MCP `resources/list` and `prompts/list`.
   * *Console Verification*: Both agent identities appear in the Founder Console Agent Fleet table.

2. **[Exercise 2: Developer Breaking Changes & Hybrid Vector Search](./exercise_2_dev_breaking_changes_and_vector_search.md)**
   * Agent Alpha investigates AST breaking changes in `stripe-node`.
   * Queries REST twin endpoint `/api/v1/dev/stripe-node`.
   * Executes 768-dimension hybrid semantic vector search (`POST /api/v1/search`).
   * *Console Verification*: Total query counter increments; Agent Alpha wallet usage increases (`3 / 50`).

3. **[Exercise 3: On-Demand Edge Distillation & B2B Pricing Intelligence](./exercise_3_live_edge_distillation_and_pricing_intelligence.md)**
   * Agent Beta queries normalized SaaS pricing matrix for Datadog.
   * Agent Beta triggers live Workers AI distillation on an unstructured URL (`news.ycombinator.com`).
   * *Console Verification*: Custom entity count increments in D1; Agent Beta wallet usage updates.

4. **[Exercise 4: Semantic Diff Monitoring & Autonomous Fleet Governance](./exercise_4_semantic_diff_monitoring_and_governance.md)**
   * Both agents poll the real-time AST semantic diff stream (`/api/v1/diffs`).
   * Tests machine-to-machine `HTTP 402 Payment Required` protocol with an invalid token.
   * Founder tests live credit top-up (`+500 Credits`) and Emergency Kill-Switch directly from the UI.
   * *Console Verification*: Instant allowance update and immediate token revocation enforcement.

---

## 🎛️ Live Founder Console Quick Reference

* **Studio URL**: [https://drefinery.freshbeats.ai](https://drefinery.freshbeats.ai)
* **Founder Console Tab**: Click **Founder Console / Management** on the top navigation bar.
* **Passcode**: `Refinery#Founder2026!` (or fallback `founder`).
* **Live Worker Base**: `https://data-refinery-worker.juanquy.workers.dev`
