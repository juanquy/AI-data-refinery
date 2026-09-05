# Exercise 2: Developer Breaking Changes & Hybrid Vector Search

## 🎯 Objective
Instruct **Agent Alpha (Coding Copilot)** to simulate a pre-deployment dependency audit. The agent will query the AST breaking change intelligence feed and execute semantic vector searches against Cloudflare Vectorize to find migration guides for deprecated APIs.

---

## 🤖 Agent Role
* **Agent**: `Agent_Alpha_Copilot`
* **Token**: `<AGENT_ALPHA_TOKEN>` (from Exercise 1)

---

## 📋 Step 1: Query AST Breaking Changes via MCP Tool

Agent Alpha invokes the `refinery_dev_breaking_changes` tool via MCP JSON-RPC 2.0 to inspect breaking changes in `stripe-node`:

```bash
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <AGENT_ALPHA_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 10,
    "method": "tools/call",
    "params": {
      "name": "refinery_dev_breaking_changes",
      "arguments": {
        "packageOrService": "stripe-node"
      }
    }
  }'
```

### Verification Criteria for Agent Alpha:
* Check that `isError` is `false`.
* Extract the structured `result.content[0].text` JSON:
  * Ecosystem: `NPM`
  * Version: `15.0.0`
  * Breaking changes array includes: `stripe.charges.create (callbacks)` marked with severity `CRITICAL`.
  * Verify presence of `beforeCodeSnippet` and `afterCodeSnippet`.

---

## 📋 Step 2: Query the Direct REST Intelligence Endpoint

Agent Alpha verifies the identical entity through the high-speed REST twin endpoint:

```bash
curl -s -X GET https://data-refinery-worker.juanquy.workers.dev/api/v1/dev/stripe-node \
  -H "Authorization: Bearer <AGENT_ALPHA_TOKEN>"
```

### Verification Criteria:
* Returns HTTP `200 OK`.
* Verify JSON contains `domain: "developer"`, `entityKey: "stripe-node"`, and `version: "15.0.0"`.

---

## 📋 Step 3: Execute Hybrid Semantic Vector Search

Agent Alpha needs to find all API breaking changes related to payment migrations using natural language. It sends a hybrid vector search request powered by Cloudflare Vectorize (768-dimension embeddings):

```bash
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/api/v1/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <AGENT_ALPHA_TOKEN>" \
  -d '{
    "query": "deprecated callback methods in payment API and promises migration",
    "domain": "all",
    "limit": 3
  }'
```

### Verification Criteria:
* Returns HTTP `200 OK`.
* Check `results.vectorSemanticMatches`:
  * Returns matches with cosine similarity scores (e.g., `score > 0.65`).
  * Validates that `stripe.com` or `stripe-node` is identified as a top semantic match.

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open **`https://drefinery.freshbeats.ai`** → **Management / Founder Console**.
2. Check the **Executive Summary Metric Cards**:
   * ✅ **Total Queries Run** has incremented.
   * ✅ **Average Edge Latency** shows sub-50ms performance.
3. Check **"Autonomous AI Agent Fleets & Wallets"**:
   * Locate `Agent_Alpha_Copilot`.
   * ✅ **Current Usage** has incremented from `0` to `2` (or `3`), displaying `2 / 50` or `3 / 50`.
   * ✅ **Allowance** remains at `50`.
   * ✅ Status remains `ACTIVE`.
