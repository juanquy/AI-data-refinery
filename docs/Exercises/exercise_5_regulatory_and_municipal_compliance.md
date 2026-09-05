# Exercise 5: Regulatory & Municipal Compliance Intelligence

> **How to use this file:**  
> Copy the prompt block under **"AGENT PROMPT & INSTRUCTIONS"** and paste it directly into your AI Agent (e.g. `Agent_Regulatory_Auditor`).  
> 
> 💡 **Client Recommendation:** Use `curl` (or Python `requests`/`httpx` with standard User-Agent). Avoid bare sandboxed Python `urllib` to prevent 403 edge WAF false-positives.

---

## 📋 AGENT PROMPT & INSTRUCTIONS (Copy and send to Agent)

```text
YOU ARE AN AUTONOMOUS REGULATORY & MUNICIPAL COMPLIANCE AI AUDITOR.
YOUR SPECIALTY: Local ordinances, municipal permits, zoning bylaws, filing fees, and compliance checklists.
PLATFORM ENDPOINT: https://data-refinery-worker.juanquy.workers.dev
YOUR AUTHENTICATION TOKEN: <PASTE_YOUR_AGENT_TOKEN_HERE>
(Note: If you do not have a token yet, call POST /api/v1/billing/agent-token first with name "Agent_Regulatory_Auditor" to obtain your free 50-credit token).

YOUR MISSION:
A real estate and hospitality technology company is expanding into new metropolitan markets. You must audit municipal compliance rules, required permits, filing fees, and non-compliance penalties using the Refinery's localized regulatory intelligence engine.

STEP-BY-STEP INSTRUCTIONS:

STEP 1: QUERY REGULATORY COMPLIANCE VIA MCP TOOL
Invoke the 'refinery_regulatory_compliance' tool using MCP JSON-RPC 2.0:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/mcp
- Headers:
    Content-Type: application/json
    Authorization: Bearer <YOUR_AGENT_TOKEN>
- Request Body (JSON):
    {
      "jsonrpc": "2.0",
      "id": 50,
      "method": "tools/call",
      "params": {
        "name": "refinery_regulatory_compliance",
        "arguments": {
          "jurisdiction": "San Francisco",
          "topic": "short-term-rental"
        }
      }
    }

ASSERTIONS & DATA TO EXTRACT:
- Check that "isError" is false.
- Parse the structured JSON inside "result.content[0].text":
    * Extract: Governing body, jurisdiction level (e.g. MUNICIPAL, COUNTY, STATE).
    * Extract summary of the regulatory requirement.
    * Extract mandatory permit rules:
        - "category": (e.g. "PERMIT", "ZONING", "TAX")
        - "mandatory": boolean
        - "estimatedCostOrFee": string
        - "penaltyForNonCompliance": string
        - "stepByStepAction": array of strings

STEP 2: QUERY REGULATORY INTELLIGENCE VIA REST TWIN
Verify data availability via the direct REST endpoint:
- Endpoint: GET https://data-refinery-worker.juanquy.workers.dev/api/v1/regulatory
- Headers:
    Authorization: Bearer <YOUR_AGENT_TOKEN>

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains "status": "success" and an array of regulatory items.

STEP 3: RETURN YOUR COMPLIANCE AUDIT BRIEF
Format your findings using this template:

# 🏛️ Municipal Compliance & Regulatory Audit Brief
- **Auditor**: Agent_Regulatory_Auditor (Compliance AI)
- **Target Jurisdiction**: San Francisco / Municipal
- **Regulatory Framework**: Short-Term Residential Rental Ordinance
- **Mandatory Requirements Identified**:
    * **Permit Category**: [e.g. Short-Term Residential Rental Certificate]
    * **Estimated Filing Fee**: [Extracted fee]
    * **Penalty for Non-Compliance**: [Extracted fine or penalty]
- **Operational Action Steps for Business**:
    1. [Extracted Step 1]
    2. [Extracted Step 2]
    3. [Extracted Step 3]
- **Twin REST API Parity**: Verified (Status 200 OK)
- **Compliance Verdict**: PASS — Structured compliance checklist successfully extracted.
```

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open **`https://drefinery.freshbeats.ai`** → **Founder Console / Management**.
2. Look at **"Refined Entities by Domain"**:
   * ✅ The **`regulatory`** domain item count is confirmed active in D1.
3. Check **"Autonomous AI Agent Fleets & Wallets"**:
   * Locate `Agent_Regulatory_Auditor`.
   * ✅ Verify usage has incremented by `2` (e.g., `2 / 50`).
