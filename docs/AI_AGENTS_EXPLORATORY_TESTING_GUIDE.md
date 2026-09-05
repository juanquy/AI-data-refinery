# 🤖 Multi-Agent Exploratory Testing Master Guide
### Universal Data Refinery (Production Environment)

This master guide contains **4 ready-to-run exercise files** for testing the Universal Data Refinery with **two simulated autonomous AI agents** on the **Free Forever Tier**.

Each exercise file contains a **self-contained copy-paste prompt block** that you can paste directly into any AI agent (Claude, ChatGPT, Cursor, Devin, AutoGPT, or a terminal agent). The prompt instructs the agent step-by-step on what endpoints to call, what data to extract, and how to format its report back to you.

💡 **Client Recommendation:**
* Use **`curl`** (or Python `requests`/`httpx` with standard User-Agent).
* Note that raw sandboxed Python `urllib` can trigger a Cloudflare 403 WAF block on the edge `/mcp` route due to missing default headers. Use `curl` for guaranteed pass.
* **Parallel Fleet Matching:** When running multiple exercises in parallel, always match the agent's name to its specific token in the Founder Console (`https://drefinery.freshbeats.ai/management`).

---

## 👥 How to Assign Your 2 Agents

| Agent | Persona & Identity | Best Model / System | Assigned Exercises |
|---|---|---|---|
| **Agent 1 (Alpha)** | `Agent_Alpha_Copilot` (`alpha.copilot@autonomous.ai`) | Coding-focused agent (Cursor, Claude Code, ChatGPT) | **Exercise 1, 2, 4** |
| **Agent 2 (Beta)** | `Agent_Beta_Analyst` (`beta.analyst@autonomous.ai`) | Analysis & research-focused agent (Claude, Gemini, ChatGPT) | **Exercise 1, 3, 4** |

---

## 📚 The 4 Exercise Files (With Copy-Paste Prompts)

### 1. [`exercise_1_agent_onboarding_and_mcp_discovery.md`](./exercise_1_agent_onboarding_and_mcp_discovery.md)
* **What to do:** Open this file, copy the prompt block under **"AGENT PROMPT & INSTRUCTIONS"**, and send it to **Agent 1** (and optionally Agent 2).
* **What the agent does:** Calls `/api/v1/billing/agent-token` to self-provision a free token with 50 credits, runs MCP `tools/list` to index all 13+ tools, and outputs a catalog report.
* **Founder Console verification:** Open `https://drefinery.freshbeats.ai/management` (Passcode: `Refinery#Founder2026!`). Both agents appear in the **Agent Fleets & Wallets** table with allowance `50` and usage `0`.

---

### 2. [`exercise_2_dev_breaking_changes_and_vector_search.md`](./exercise_2_dev_breaking_changes_and_vector_search.md)
* **What to do:** Copy the prompt block and send it to **Agent Alpha**.
* **What the agent does:** Audits `stripe-node` for AST breaking changes via MCP, extracts Before/After migration snippets, and runs a 768-dimension semantic vector search (`POST /api/v1/search`) for deprecated callback methods.
* **Founder Console verification:** In the console, **Total Queries Run** increases, and Agent Alpha's wallet usage updates to `3 / 50`.

---

### 3. [`exercise_3_live_edge_distillation_and_pricing_intelligence.md`](./exercise_3_live_edge_distillation_and_pricing_intelligence.md)
* **What to do:** Copy the prompt block and send it to **Agent Beta**.
* **What the agent does:** Queries Datadog pricing matrices via MCP, and triggers live on-demand edge distillation on Hacker News (`https://news.ycombinator.com`) using Workers AI (Llama 3.3-70B).
* **Founder Console verification:** In the console, **Refined Entities by Domain** shows the `custom` count increased by 1, and Agent Beta's wallet usage updates to `2 / 50`.

---

### 4. [`exercise_4_semantic_diff_monitoring_and_governance.md`](./exercise_4_semantic_diff_monitoring_and_governance.md)
* **What to do:** Copy the prompt block and send it to either or both agents.
* **What the agent does:** Streams real-time AST semantic diffs, intentionally tests an invalid token to verify that the refinery returns standard `HTTP 402 Payment Required` headers (`X-Refinery-Price-Per-Query: $0.005 USD`), and verifies wallet balance.
* **Founder Console interaction:** You test clicking the green `[+500 Credits]` button or red `[Kill]` emergency switch in the Founder Console. The agent re-queries and confirms the change in real-time.

---

## 🎛️ Founder Console Quick Access
* **URL**: [https://drefinery.freshbeats.ai](https://drefinery.freshbeats.ai)
* **Navigation Tab**: Click **Management / Founder Console**
* **Passcode**: `Refinery#Founder2026!` (or fallback `founder`)
* **Live Worker API Base**: `https://data-refinery-worker.juanquy.workers.dev`
