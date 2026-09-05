# Exercise 1: Autonomous Agent Onboarding & MCP Protocol Handshake

## 🎯 Objective
Simulate two autonomous AI agents arriving at the Universal Data Refinery for the first time. They will autonomously provision free-tier developer credentials, inspect the live Model Context Protocol (MCP) server capabilities, and verify their presence in the Founder Console.

---

## 🤖 Agent Profiles
* **Agent 1 (Alpha)**: `Agent_Alpha_Copilot` (`alpha.copilot@autonomous.ai`) — Developer coding copilot persona.
* **Agent 2 (Beta)**: `Agent_Beta_Analyst` (`beta.analyst@autonomous.ai`) — Market intelligence and FinOps analyst persona.

---

## 📋 Step 1: Agent Alpha Provisions Free-Tier Token

Agent Alpha sends a request to the edge billing engine to obtain an autonomous agent micro-token with 50 free exploratory credits:

```bash
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/agent-token \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "Agent_Alpha_Copilot",
    "agentOwner": "alpha.copilot@autonomous.ai"
  }'
```

### Expected Agent Alpha Response:
```json
{
  "status": "success",
  "agentName": "Agent_Alpha_Copilot",
  "agentToken": "ref_agent_<32_char_hex>",
  "plan": "AGENT_MICRO",
  "queriesAllowance": 50,
  "pricePerQuery": "$0.005 USD",
  "protocol": "HTTP-402-Pay-Per-Query",
  "isTrialTier": true
}
```
*(Agent Alpha stores this `agentToken` for subsequent queries.)*

---

## 📋 Step 2: Agent Beta Provisions Free-Tier Token

Agent Beta sends its own credential generation request:

```bash
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/agent-token \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "Agent_Beta_Analyst",
    "agentOwner": "beta.analyst@autonomous.ai"
  }'
```

### Expected Agent Beta Response:
```json
{
  "status": "success",
  "agentName": "Agent_Beta_Analyst",
  "agentToken": "ref_agent_<32_char_hex>",
  "plan": "AGENT_MICRO",
  "queriesAllowance": 50,
  "pricePerQuery": "$0.005 USD",
  "protocol": "HTTP-402-Pay-Per-Query",
  "isTrialTier": true
}
```

---

## 📋 Step 3: Agent Alpha Performs MCP Tools Discovery

Agent Alpha performs the official Model Context Protocol (MCP) JSON-RPC 2.0 handshake to discover the available tool suite:

```bash
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <AGENT_ALPHA_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Verification Criteria for Agent Alpha:
* Check that response contains `jsonrpc: "2.0"` and `result.tools`.
* Verify at least **13 tools** are returned, including:
  * `refinery_dev_breaking_changes`
  * `refinery_b2b_pricing_matrix`
  * `refinery_regulatory_compliance`
  * `refinery_semantic_search`
  * `refinery_refine_custom_url`

---

## 📋 Step 4: Agent Beta Discovers MCP Resources & Prompts

Agent Beta inspects live queryable resources and prompt templates on the MCP server:

```bash
# Discover live resources
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <AGENT_BETA_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "resources/list"
  }'
```

```bash
# Discover prompt templates
curl -s -X POST https://data-refinery-worker.juanquy.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <AGENT_BETA_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "prompts/list"
  }'
```

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open the live studio at **`https://drefinery.freshbeats.ai`**.
2. Click the **Management / Founder Console** tab on the navigation bar.
3. Enter the Founder Passcode: `Refinery#Founder2026!` (or `founder`).
4. Scroll to **"Autonomous AI Agent Fleets & Wallets"**:
   * ✅ **Agent_Alpha_Copilot** is listed with an allowance of `50`, status `ACTIVE`, and usage `0`.
   * ✅ **Agent_Beta_Analyst** is listed with an allowance of `50`, status `ACTIVE`, and usage `0`.
   * ✅ Both tokens are securely masked (e.g., `ref_agent_a1b2...9f01`).
