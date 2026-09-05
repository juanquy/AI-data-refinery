# Exercise 1: Autonomous Agent Onboarding & MCP Protocol Handshake

> **How to use this file:**  
> Copy the prompt block under **"AGENT PROMPT & INSTRUCTIONS"** and paste it directly into your AI Agent (ChatGPT, Claude, Cursor, Devin, AutoGPT, or custom agent).  
> The agent will execute the exercise autonomously, self-provision credentials, discover MCP tools, and report back to you.
> 
> 💡 **Client Recommendation:** Use `curl` (or Python `requests`/`httpx` with standard User-Agent). Note that raw sandboxed Python `urllib` can trigger a 403 WAF block on the edge `/mcp` route. Use `curl` for 100% reliable execution.

---

## 📋 AGENT PROMPT & INSTRUCTIONS (Copy and send to Agent)

```text
YOU ARE AN AUTONOMOUS AI AGENT ONBOARDING TO THE UNIVERSAL DATA REFINERY.
YOUR PERSONA: Agent_Alpha_Copilot (or Agent_Beta_Analyst)
YOUR ASSIGNED EMAIL: alpha.copilot@autonomous.ai (or beta.analyst@autonomous.ai)
PLATFORM ENDPOINT: https://data-refinery-worker.juanquy.workers.dev

YOUR MISSION:
Self-provision your free-tier developer credentials, verify your 50 free exploratory credits on the Free Forever tier, perform an MCP protocol discovery handshake to index all available tools and resources, and return an executive onboarding report.

STEP-BY-STEP INSTRUCTIONS:

STEP 1: SELF-PROVISION FREE-TIER CREDENTIALS
Execute an HTTP POST request to the refinery billing endpoint:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/agent-token
- Headers:
    Content-Type: application/json
- Request Body (JSON):
    {
      "agentName": "Agent_Alpha_Copilot",
      "agentOwner": "alpha.copilot@autonomous.ai"
    }

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains "agentToken" starting with "ref_agent_".
- "plan" must be "AGENT_MICRO".
- "queriesAllowance" must be 50.
- "isTrialTier" must be true.
ACTION: Store the "agentToken" securely. You will use it as your Bearer token for all future requests:
Authorization: Bearer <agentToken>

STEP 2: INITIALIZE THE MODEL CONTEXT PROTOCOL (MCP)
Send a JSON-RPC 2.0 initialize request to the MCP edge router:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/mcp
- Headers:
    Content-Type: application/json
    Authorization: Bearer <agentToken>
- Request Body (JSON):
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "initialize",
      "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": { "tools": {} },
        "clientInfo": { "name": "Agent_Alpha_Copilot", "version": "1.0.0" }
      }
    }

ASSERTIONS TO VERIFY:
- Response contains "serverInfo.name" ("universal-data-refinery") and version "1.0.0".

STEP 3: DISCOVER ALL MCP TOOLS (tools/list)
Send a tools/list request to index all active refinery tools:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/mcp
- Headers:
    Content-Type: application/json
    Authorization: Bearer <agentToken>
- Request Body (JSON):
    {
      "jsonrpc": "2.0",
      "id": 2,
      "method": "tools/list"
    }

ASSERTIONS TO VERIFY:
- Result contains an array of tools.
- Verify that at least 13 tools are returned.
- Confirm presence of core tools:
    * refinery_dev_breaking_changes
    * refinery_b2b_pricing_matrix
    * refinery_regulatory_compliance
    * refinery_semantic_search
    * refinery_refine_custom_url

STEP 4: DISCOVER MCP RESOURCES & PROMPTS
Fetch available resources and prompts:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/mcp
- Request 4A: method "resources/list" (ID: 3)
- Request 4B: method "prompts/list" (ID: 4)

ASSERTIONS TO VERIFY:
- Resources list includes URIs: "refinery://developer/breaking-changes" and "refinery://pricing/b2b-matrix".
- Prompts list includes "check_sdk_upgrade".

STEP 5: RETURN YOUR ONBOARDING REPORT
When complete, format your response back to the human operator using this exact template:

# 🚀 Agent Onboarding & MCP Discovery Report
- **Agent Name**: [Your agent name]
- **Assigned Token**: [Masked token, e.g. ref_agent_1234...abcd]
- **Tier & Allowance**: Free Trial Tier (50 query credits, $0.005/query)
- **MCP Protocol Handshake**: [PASS / FAIL]
- **Discovered Tool Count**: [Number of tools found, e.g. 13+]
- **Discovered Tools List**:
    1. [Tool Name] - [Brief Description]
    2. ...
- **Discovered Resources**: [List resources found]
- **Readiness Status**: READY FOR EXERCISE 2 & 3
```

---

## 👁️ What to Check in the Founder Console (For Human Operators)

After your agent runs the prompt:
1. Open the production studio at **`https://drefinery.freshbeats.ai`**.
2. Click the **Founder Console / Management** tab.
3. Enter Founder Passcode: `Refinery#Founder2026!` (or fallback `founder`).
4. Scroll to the **"Autonomous AI Agent Fleets & Wallets"** section:
   * ✅ Verify your agent's identity (`Agent_Alpha_Copilot` or `Agent_Beta_Analyst`) appears in the fleet table.
   * ✅ Verify its allowance shows `50` and current usage shows `0`.
   * ✅ Status displays `ACTIVE` with a green indicator.
