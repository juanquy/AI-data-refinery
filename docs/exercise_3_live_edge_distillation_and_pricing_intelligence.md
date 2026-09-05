# Exercise 3: On-Demand Edge Distillation & B2B Pricing Intelligence

## 🎯 Objective
Instruct **Agent Beta (FinOps & Market Analyst)** to evaluate enterprise SaaS pricing structures and perform live, on-demand edge distillation of an external unstructured web page using Cloudflare Workers AI.

---

## 🤖 Agent Role
* **Agent**: `Agent_Beta_Analyst`
* **Token**: `<AGENT_BETA_TOKEN>` (from Exercise 1)

---

## 📋 Step 1: Query Pre-Indexed SaaS Pricing Matrix

Agent Beta inspects normalized pricing models, tiers, and overage limits for Datadog:

```bash
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <AGENT_BETA_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 20,
    "method": "tools/call",
    "params": {
      "name": "refinery_b2b_pricing_matrix",
      "arguments": {
        "companyOrProduct": "datadog"
      }
    }
  }'
```

### Verification Criteria:
* Returns structured pricing data.
* Verify tiers array contains `Free`, `Pro`, and `Enterprise`.
* Verify unit pricing metrics (e.g., `$15/host/mo`, retention periods, overage rates).

---

## 📋 Step 2: Trigger Live Edge Distillation on Unstructured Web Content

Agent Beta directs Workers AI (Llama 3.3-70B on the Cloudflare global network) to fetch, parse, and distill live web data into deterministic JSON:

```bash
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <AGENT_BETA_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 21,
    "method": "tools/call",
    "params": {
      "name": "refinery_refine_custom_url",
      "arguments": {
        "url": "https://news.ycombinator.com",
        "instructionPrompt": "Extract the top trending technology and AI headlines, key companies mentioned, and market themes"
      }
    }
  }'
```

*(Alternatively via direct REST):*
```bash
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/api/v1/custom/refine \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <AGENT_BETA_TOKEN>" \
  -d '{
    "url": "https://news.ycombinator.com",
    "prompt": "Extract the top trending tech stories and companies"
  }'
```

### Verification Criteria for Agent Beta:
* Validate that response contains valid JSON conforming to the schema:
  * `title`: string
  * `summary`: string
  * `extractedAttributes`: structured key-value pairs
  * `insights`: array of distilled points
* Note the execution speed (typically under 2 seconds for a full page fetch + LLM distillation at the edge).

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open **`https://drefinery.freshbeats.ai`** → **Management / Founder Console**.
2. Look at **"Refined Entities by Domain"**:
   * ✅ The **`custom`** domain entity count has incremented by `1`.
3. Check the **"14-Day Ingestion & Query Volume"** chart:
   * ✅ Today's date displays the newly ingested entity volume.
4. Check **"Autonomous AI Agent Fleets & Wallets"**:
   * Locate `Agent_Beta_Analyst`.
   * ✅ **Current Usage** has incremented from `0` to `2` (e.g., `2 / 50`).
