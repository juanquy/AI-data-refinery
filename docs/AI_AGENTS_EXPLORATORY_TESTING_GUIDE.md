# 🤖 Multi-Agent Exploratory Testing Master Guide
### Universal Data Refinery (Production Environment)

This master guide contains **8 ready-to-run exercise files** for testing the Universal Data Refinery with autonomous AI agents on the **Free Forever Tier**.

Each exercise file contains a **self-contained copy-paste prompt block** that you can paste directly into any AI agent (Claude, ChatGPT, Cursor, Devin, AutoGPT, Hermes, or a terminal agent). The prompt instructs the agent step-by-step on what endpoints to call, what assertions to verify, and how to format its structured report back to you.

💡 **Client & Execution Best Practices:**
* Use **`curl`** (or Python `requests`/`httpx` with standard User-Agent).
* Note that raw sandboxed Python `urllib` can trigger a Cloudflare 403 WAF block on the edge `/mcp` route due to missing default headers. Use `curl` for guaranteed pass.
* **Parallel Fleet Matching:** When running multiple exercises in parallel, always match the agent's name to its specific token in the Founder Console (`https://drefinery.freshbeats.ai/management`).

---

## 👥 Fleet Assignment Matrix (Recommended Agents)

| Agent | Persona & Identity | Best Model / System | Assigned Exercises | Focus Capabilities |
|---|---|---|---|---|
| **Agent 1** | `Agent_Alpha_Copilot` (`alpha.copilot@autonomous.ai`) | Coding Agent (Cursor, Claude Code, ChatGPT) | **Exercise 1, 2** | MCP Discovery, AST Breaking Changes, Vector Search |
| **Agent 2** | `Agent_Beta_Pricing` (`beta.pricing@autonomous.ai`) | Financial / SaaS Agent (Claude, Gemini, ChatGPT) | **Exercise 3, 4** | Pricing Matrix, Sub-2s Edge Distillation, Token Governance |
| **Agent 3** | `Agent_Regulatory_Auditor` (`regulatory.auditor@autonomous.ai`) | Legal / Municipal Agent (Claude, ChatGPT) | **Exercise 5** | Municipal Ordinances, STR Zoning, Permits, Penalties |
| **Agent 4** | `Agent_Schema_Architect` (`schema.architect@autonomous.ai`) | Data Modeling Agent (Cursor, Claude Code) | **Exercise 6** | Custom Visual Schemas, Dynamic Edge MCP Tool Compilation |
| **Agent 5** | `Agent_MLOps_Engineer` (`mlops.engineer@autonomous.ai`) | MLOps / Dataset Agent (Terminal, Python, Claude) | **Exercise 7** | OpenAI JSONL, Llama 3, Alpaca, RAG Chunks, Streaming |
| **Agent 6** | `Agent_Marketplace_Shopper` (`marketplace.shopper@autonomous.ai`) | Autonomous Commerce Agent (ChatGPT, Claude) | **Exercise 8** | Marketplace Blueprints, Query Attribution, 70/30 Creator Royalty |

*(Note: You can run these using 1 agent sequentially, 2–4 agents in pairs, or up to 8 parallel agents.)*

---

## 📚 The 8 Complete Pre-Launch Exercises

### 1. [`exercise_1_agent_onboarding_and_mcp_discovery.md`](./exercise_1_agent_onboarding_and_mcp_discovery.md)
* **Core Focus:** Autonomous self-provisioning, trial wallet initialization, and MCP catalog discovery.
* **What the agent does:** Calls `POST /api/v1/billing/agent-token` to self-provision a free token with 50 credits, runs MCP `tools/list` to index all 13+ tools, and outputs a catalog report.
* **Founder Console verification:** Open `https://drefinery.freshbeats.ai/management` (Passcode: `Refinery#Founder2026!`). Agent appears in **Agent Fleets & Wallets** table with allowance `50` and usage `0`.

---

### 2. [`exercise_2_dev_breaking_changes_and_vector_search.md`](./exercise_2_dev_breaking_changes_and_vector_search.md)
* **Core Focus:** AST migration intelligence, breaking change severity detection, and 768d semantic vector search.
* **What the agent does:** Audits `stripe-node` for AST breaking changes via MCP, extracts Before/After migration snippets, and runs a 768-dimension semantic vector search (`POST /api/v1/search`) for deprecated callback methods.
* **Founder Console verification:** In the console, **Total Queries Run** increases, and the agent's wallet usage updates to `3 / 50`.

---

### 3. [`exercise_3_live_edge_distillation_and_pricing_intelligence.md`](./exercise_3_live_edge_distillation_and_pricing_intelligence.md)
* **Core Focus:** B2B SaaS pricing matrices and sub-2s edge distillation using Cloudflare Workers AI (Llama 3.3-70B).
* **What the agent does:** Queries Datadog pricing matrices via MCP, and triggers live on-demand edge distillation on Hacker News (`https://news.ycombinator.com`) using Workers AI.
* **Founder Console verification:** In the console, **Refined Entities by Domain** shows the `custom` count increased by 1, and the agent's wallet usage updates to `2 / 50`.

---

### 4. [`exercise_4_semantic_diff_monitoring_and_governance.md`](./exercise_4_semantic_diff_monitoring_and_governance.md)
* **Core Focus:** Real-time semantic diff streaming, HTTP 402 protocol compliance, manual credit top-up, and emergency kill-switch.
* **What the agent does:** Streams real-time AST semantic diffs, intentionally tests an invalid token to verify standard `HTTP 402 Payment Required` headers (`X-Refinery-Price-Per-Query: $0.005 USD`), and validates balance.
* **Founder Console interaction:** Test clicking the green `[+500 Credits]` button or red `[Kill]` emergency switch in the Founder Console. The agent re-queries and confirms the change in real-time.

---

### 5. [`exercise_5_regulatory_and_municipal_compliance.md`](./exercise_5_regulatory_and_municipal_compliance.md)
* **Core Focus:** Local municipal ordinances, short-term rental permits, zoning bylaws, filing fees, and non-compliance fines.
* **What the agent does:** Queries municipal short-term rental regulations in San Francisco via MCP `refinery_regulatory_compliance` and REST twin `GET /api/v1/regulatory`, verifying required permits, filing fees, and fine structures.
* **Founder Console verification:** Confirm `regulatory` entities in D1 and agent wallet usage incremented.

---

### 6. [`exercise_6_dynamic_schema_studio_and_custom_mcp_tool.md`](./exercise_6_dynamic_schema_studio_and_custom_mcp_tool.md)
* **Core Focus:** Bespoke enterprise schema design, dynamic MCP tool compilation at the Cloudflare edge, and custom entity distillation.
* **What the agent does:** Calls `POST /api/v1/schemas` to publish an "FDA Biotech Drug Approval" schema with 5 fields, verifies that the edge refinery dynamically compiles and registers a new MCP Tool (`refinery_custom_fda_biotech_drug_approval`), and distills live structured data.
* **Founder Console verification:** Custom schema appears in Schema Studio and `custom` refined entity count increments.

---

### 7. [`exercise_7_llm_fine_tuning_dataset_export.md`](./exercise_7_llm_fine_tuning_dataset_export.md)
* **Core Focus:** Post-training dataset engineering, multi-format synthesis (OpenAI JSONL, Llama 3, Alpaca, RAG Chunks), and streaming file downloads.
* **What the agent does:** Calls `GET /api/v1/export/fine-tuning` across multiple format filters, verifies `messages` array schemas for OpenAI fine-tuning, tests Llama 3 and Alpaca mappings, and tests streaming `.jsonl` attachment download.
* **Founder Console verification:** API queries tracked and verified against the agent's wallet.

---

### 8. [`exercise_8_marketplace_discovery_and_creator_revenue.md`](./exercise_8_marketplace_discovery_and_creator_revenue.md)
* **Core Focus:** Decentralized AI creator economy, community blueprint publishing, and automated 70/30 micropayment revenue attribution.
* **What the agent does:** Explores marketplace listings via `GET /api/v1/marketplace`, publishes a new "Crypto Protocol Gas & Yield Tracker" blueprint, triggers a query via `POST /api/v1/marketplace/:id/query`, and asserts 70% creator royalty and 30% platform fee attribution.
* **Founder Console verification:** Marketplace tab displays the newly published blueprint with updated query count and accumulated creator earnings.

---

## 🎛️ Founder Console Quick Access
* **URL**: [https://drefinery.freshbeats.ai](https://drefinery.freshbeats.ai)
* **Navigation Tab**: Click **Management / Founder Console**
* **Passcode**: `Refinery#Founder2026!` (or fallback `founder`)
* **Live Worker API Base**: `https://data-refinery-worker.juanquy.workers.dev`
