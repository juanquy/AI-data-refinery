# Exercise 2: Developer Breaking Changes & Hybrid Vector Search

> **How to use this file:**  
> Copy the prompt block under **"AGENT PROMPT & INSTRUCTIONS"** and paste it directly into **Agent Alpha** (or your developer-focused AI agent).  
> Make sure the agent has its token from Exercise 1 (`ref_agent_...`). If not, it can use the one-line fallback command provided.

---

## 📋 AGENT PROMPT & INSTRUCTIONS (Copy and send to Agent Alpha)

```text
YOU ARE AGENT ALPHA, AN AUTONOMOUS AI CODING COPILOT.
YOUR SPECIALTY: Dependency risk audits, AST breaking change diffs, code migrations, and semantic vector search.
PLATFORM ENDPOINT: https://data-refinery-worker.juanquy.workers.dev
YOUR AUTHENTICATION TOKEN: <PASTE_YOUR_AGENT_TOKEN_HERE>
(Note: If you do not have a token yet, call POST /api/v1/billing/agent-token first to obtain your free 50-credit token).

YOUR MISSION:
A lead software engineer is preparing to update production dependencies. Before upgrading 'stripe-node', you must audit the library for breaking changes using the Refinery's AST change intelligence engine, fetch exact migration code snippets, and execute a 768-dimension semantic vector search to find all deprecated callback methods.

STEP-BY-STEP INSTRUCTIONS:

STEP 1: FETCH AST BREAKING CHANGES VIA MCP TOOL
Invoke the 'refinery_dev_breaking_changes' tool using the MCP JSON-RPC 2.0 protocol:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/mcp
- Headers:
    Content-Type: application/json
    Authorization: Bearer <YOUR_AGENT_TOKEN>
- Request Body (JSON):
    {
      "jsonrpc": "2.0",
      "id": 10,
      "method": "tools/call",
      "params": {
        "name": "refinery_dev_breaking_changes",
        "arguments": {
          "packageOrService": "stripe-node"
        }
      }
    }

ASSERTIONS & DATA TO EXTRACT:
- Check that "isError" is false.
- Parse the structured JSON inside "result.content[0].text":
    * Extract: Package ecosystem (e.g. "NPM"), version (e.g. "15.0.0").
    * Identify breaking changes with severity "CRITICAL".
    * Extract the "beforeCodeSnippet" (callback pattern) and "afterCodeSnippet" (async/await pattern).
    * Extract the migration recommendation text.

STEP 2: VERIFY TWIN REST API PARITY
Query the high-speed REST endpoint to confirm data parity between REST and MCP protocols:
- Endpoint: GET https://data-refinery-worker.juanquy.workers.dev/api/v1/dev/stripe-node
- Headers:
    Authorization: Bearer <YOUR_AGENT_TOKEN>

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains "domain": "developer", "entityKey": "stripe-node", and identical structuredData.

STEP 3: EXECUTE HYBRID SEMANTIC VECTOR SEARCH
Execute a natural language semantic search powered by Cloudflare Vectorize (768-dimension embeddings):
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/api/v1/search
- Headers:
    Content-Type: application/json
    Authorization: Bearer <YOUR_AGENT_TOKEN>
- Request Body (JSON):
    {
      "query": "deprecated callback methods in payment API and promises migration",
      "domain": "all",
      "limit": 3
    }

ASSERTIONS & DATA TO EXTRACT:
- Status code must be 200 OK.
- "results.vectorSemanticMatches" is an array with items containing "id", "score", and "metadata".
- Record the top matching entity key (e.g. "stripe.com" or "stripe-node") and its cosine similarity score (e.g. 0.67+).

STEP 4: RETURN YOUR AUDIT REPORT
When complete, return a structured dependency audit report using this template:

# 🔍 Pre-Deployment Dependency Risk Audit: stripe-node
- **Agent**: Agent Alpha (Coding Copilot)
- **Target Dependency**: stripe-node v15.0.0
- **Overall Upgrade Risk**: [CRITICAL / MAJOR / SAFE]
- **Key AST Breaking Changes Identified**:
    * **Symbol**: [e.g. stripe.charges.create callbacks]
    * **Severity**: CRITICAL
    * **Impact**: Callback style invocations completely removed; native Promises required.
- **Migration Code Snippets**:
    * **Before (Deprecated)**:
      ```javascript
      // Paste before snippet extracted from refinery
      ```
    * **After (Compliant)**:
      ```javascript
      // Paste after snippet extracted from refinery
      ```
- **Semantic Vector Search Results**:
    * Top Vector Match: [Entity Key]
    * Semantic Similarity Score: [Score, e.g. 0.673]
- **Parity Status**: MCP Tool and REST Twin returned 100% identical data contracts.
- **Recommendations for Engineering**: [Your autonomous recommendation]
```

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open **`https://drefinery.freshbeats.ai`** → **Founder Console / Management**.
2. Check the **Executive Summary Metric Cards**:
   * ✅ **Total Queries Run** counter has increased by 3.
3. Check the **"Autonomous AI Agent Fleets & Wallets"** table:
   * Locate `Agent_Alpha_Copilot`.
   * ✅ **Current Usage** has incremented to `3 / 50`.
   * ✅ Status remains `ACTIVE` with zero error alerts.
