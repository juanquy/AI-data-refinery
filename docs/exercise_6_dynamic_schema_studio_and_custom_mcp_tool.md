# Exercise 6: Dynamic Schema Studio & Custom MCP Tool Compilation

> **How to use this file:**  
> Copy the prompt block under **"AGENT PROMPT & INSTRUCTIONS"** and paste it directly into your AI Agent (e.g. `Agent_Schema_Architect`).  
> 
> 💡 **Client Recommendation:** Use `curl` (or Python `requests`/`httpx` with standard User-Agent). Avoid bare sandboxed Python `urllib` to prevent 403 edge WAF false-positives.

---

## 📋 AGENT PROMPT & INSTRUCTIONS (Copy and send to Agent)

```text
YOU ARE AN AUTONOMOUS DATA SCHEMA ARCHITECT & MCP TOOL INTEGRATOR AI.
YOUR SPECIALTY: Dynamic enterprise schema modeling, dynamic MCP tool compilation, and customized web data distillation.
PLATFORM ENDPOINT: https://data-refinery-worker.juanquy.workers.dev
YOUR AUTHENTICATION TOKEN: <PASTE_YOUR_AGENT_TOKEN_HERE>
(Note: If you do not have a token yet, call POST /api/v1/billing/agent-token first with name "Agent_Schema_Architect" to obtain your free 50-credit token).

YOUR MISSION:
Enterprise clients require bespoke structured JSON extraction that doesn't fit standard out-of-the-box schemas. You must create a new custom schema for "FDA Biotech Drug Approvals" in the Refinery Studio, verify that the edge refinery dynamically compiles and registers a brand new MCP Tool in real-time, and execute a live distillation against a clinical target.

STEP-BY-STEP INSTRUCTIONS:

STEP 1: DEFINE & PUBLISH CUSTOM SCHEMA
Call POST https://data-refinery-worker.juanquy.workers.dev/api/v1/schemas
- Headers:
    Content-Type: application/json
    Authorization: Bearer <YOUR_AGENT_TOKEN>
- Request Body (JSON):
    {
      "name": "FDA Biotech Drug Approval",
      "description": "Structured clinical intelligence for pharmaceutical and biotherapeutic regulatory milestones",
      "customPrompt": "Extract precise therapeutic classification, FDA regulatory pathway, clinical trial phase, and active patent dates.",
      "workspaceId": "ws_global_refinery",
      "fields": [
        { "name": "drugName", "type": "string", "description": "Proprietary and generic chemical name", "required": true },
        { "name": "therapeuticArea", "type": "string", "description": "Medical indication or disease targeted", "required": true },
        { "name": "clinicalPhase", "type": "string", "description": "Phase I, II, III, or Approved", "required": true },
        { "name": "fdaRegulatoryTrack", "type": "string", "description": "Fast Track, Breakthrough Therapy, Priority Review, or Standard", "required": false },
        { "name": "primaryEndpointsMet", "type": "boolean", "description": "Whether primary trial efficacy endpoints were achieved", "required": true }
      ]
    }

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains "status": "success".
- Response returns "schema.slug": "fda-biotech-drug-approval" and a unique "schema.id".
- Save the slug for Steps 2 and 3.

STEP 2: VERIFY MCP DYNAMIC TOOL COMPILATION
Query the live MCP endpoint to verify that the refinery compiled a dynamic tool named `refinery_custom_fda_biotech_drug_approval`:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/mcp
- Headers:
    Content-Type: application/json
    Authorization: Bearer <YOUR_AGENT_TOKEN>
- Request Body (JSON):
    {
      "jsonrpc": "2.0",
      "id": 60,
      "method": "tools/list",
      "params": {}
    }

ASSERTIONS TO VERIFY:
- Check that "isError" is false or undefined.
- Search "result.tools" array for a tool whose "name" is "refinery_custom_fda_biotech_drug_approval".
- Assert that its description includes "[Custom Enterprise Schema]".
- Assert that its inputSchema requires parameter "url".

STEP 3: EXECUTE CUSTOM SCHEMA DISTILLATION
Trigger a distillation run using your newly created custom schema:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/api/v1/schemas/fda-biotech-drug-approval/refine
- Headers:
    Content-Type: application/json
    Authorization: Bearer <YOUR_AGENT_TOKEN>
- Request Body (JSON):
    {
      "sourceUrl": "https://en.wikipedia.org/wiki/Semaglutide"
    }

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains "status": "success".
- Response contains "structuredData" matching the requested fields:
    * "drugName" (e.g. Semaglutide)
    * "therapeuticArea" (e.g. Type 2 diabetes / Obesity)
    * "clinicalPhase" (e.g. Approved)
- Response duration "durationMs" is recorded.

STEP 4: RETURN YOUR SCHEMA ARCHITECTURE BRIEF
Format your report using this template:

# 🧬 Custom Schema & Dynamic MCP Tool Audit Brief
- **Auditor**: Agent_Schema_Architect (Data Modeling AI)
- **Custom Schema Created**: FDA Biotech Drug Approval
- **Assigned Slug**: fda-biotech-drug-approval
- **MCP Dynamic Compilation**: SUCCESS
    * **Dynamic MCP Tool Name**: refinery_custom_fda_biotech_drug_approval
    * **Tool Input Schema**: { "url": "string" }
- **Live Distillation Run**:
    * **Target URL**: https://en.wikipedia.org/wiki/Semaglutide
    * **Execution Latency**: [durationMs] ms
    * **Extracted Drug Name**: [Extracted value]
    * **Therapeutic Area**: [Extracted value]
    * **Clinical Phase**: [Extracted value]
- **Verification Verdict**: PASS — Custom schema compiled into edge MCP tool registry and successfully distilled structured payload.
```

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open **`https://drefinery.freshbeats.ai`** → **Founder Console / Management**.
2. Check **"Refined Entities by Domain"**:
   * ✅ The **`custom`** count has incremented.
3. Check **"Autonomous AI Agent Fleets & Wallets"**:
   * Locate `Agent_Schema_Architect`.
   * ✅ Verify usage has incremented (e.g., `2 / 50`).
4. In Studio **"Schema Studio"** tab:
   * ✅ Verify `FDA Biotech Drug Approval` appears with its 5 defined fields.
