# Exercise 4: Semantic Diff Monitoring & Autonomous Fleet Governance

> **How to use this file:**  
> Copy the prompt block under **"AGENT PROMPT & INSTRUCTIONS"** and paste it directly into your agent (Agent Alpha or Agent Beta).  
> This exercise validates real-time AST diff streaming, tests the HTTP 402 micropayment error protocol, and coordinates with you as the human operator in the Founder Console.

---

## 📋 AGENT PROMPT & INSTRUCTIONS (Copy and send to Agent)

```text
YOU ARE AN AUTONOMOUS AI AGENT CONDUCTING A PLATFORM GOVERNANCE & RESILIENCE DRILL.
PLATFORM ENDPOINT: https://data-refinery-worker.juanquy.workers.dev
YOUR AUTHENTICATION TOKEN: <PASTE_YOUR_AGENT_TOKEN_HERE>

YOUR MISSION:
You must stream the real-time AST semantic diff feed, validate that the Refinery strictly enforces the machine-to-machine HTTP 402 Autonomous Payment Protocol when tokens are invalid or exhausted, and participate in a live founder governance drill (wallet top-up verification and emergency kill-switch enforcement).

STEP-BY-STEP INSTRUCTIONS:

STEP 1: POLL REAL-TIME AST SEMANTIC DIFF STREAM
Query the global diff and alerts feed to check for recent dependency shifts and schema mutations:
- Endpoint: GET https://data-refinery-worker.juanquy.workers.dev/api/v1/diffs?limit=5
- Headers:
    Authorization: Bearer <YOUR_AGENT_TOKEN>

ASSERTIONS & DATA TO EXTRACT:
- Verify status is "success" and an array of "diffs" is returned.
- Extract at least one diff record:
    * "entityKey": (e.g. stripe-node, datadog-api)
    * "severity": (e.g. "CRITICAL", "MAJOR", or "MINOR")
    * "diffSummary": delta explanation
    * "detectedAt": timestamp

STEP 2: VALIDATE THE HTTP 402 AUTONOMOUS PAYMENT PROTOCOL
Autonomous agents must gracefully handle HTTP 402 Payment Required status. Test that the Refinery correctly halts unauthenticated or exhausted calls and provides machine-readable payment instructions:
- Endpoint: GET https://data-refinery-worker.juanquy.workers.dev/api/v1/dev/stripe-node
- Headers:
    Authorization: Bearer ref_agent_invalid_token_9999

ASSERTIONS TO VERIFY (CRITICAL):
- Status code must be exactly 402 (Payment Required).
- Response headers must include:
    * "X-Refinery-Price-Per-Query": "$0.005 USD"
    * "X-Refinery-Protocol": "HTTP-402-Autonomous-Agent"
    * "X-Refinery-Agent-Token-Endpoint": "https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/agent-token"
- Response body contains "agentTokenEndpoint" and clear payment instructions.

STEP 3: VERIFY CURRENT WALLET BALANCE
Inspect your active wallet quota and ledger usage:
- Endpoint: GET https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/verify-key
- Headers:
    Authorization: Bearer <YOUR_AGENT_TOKEN>

ASSERTIONS TO EXTRACT:
- Record your "monthlyQuota" (allowance) and "currentUsage".
- Status must be "ACTIVE".

STEP 4: LIVE HUMAN OPERATOR DRILL (COORDINATE WITH USER)
Inform the human operator: "Please go to the Founder Console at https://drefinery.freshbeats.ai and test either the [+500 Credits] Top-Up button or the red [Kill] Emergency Switch on my agent token."
- If the operator clicked [+500 Credits]: Re-query Step 3 and confirm that your "monthlyQuota" increased by 500.
- If the operator clicked [Kill]: Send another query to /api/v1/dev/stripe-node and confirm that the Refinery immediately halts your access with HTTP 402 / Revoked.

STEP 5: RETURN YOUR GOVERNANCE REPORT
Format your findings using this template:

# 🛡️ Autonomous Fleet Governance & Resilience Report
- **Agent Name**: [Your agent name]
- **AST Diff Stream Status**:
    * Total Active Diffs Sampled: [Count]
    * Latest Diff: [Entity Key] - [Severity Rating] - [Summary]
- **HTTP 402 Protocol Verification**:
    * Result: PASS (Server returned HTTP 402)
    * X-Refinery-Price-Per-Query Header: [e.g. $0.005 USD]
    * X-Refinery-Protocol Header: [e.g. HTTP-402-Autonomous-Agent]
    * Machine-to-Machine Recovery Endpoint: Verified
- **Wallet & Quota Telemetry**:
    * Initial Allowance: [e.g. 50]
    * Current Queries Consumed: [e.g. 4]
    * Post-Operator Allowance: [Updated quota after top-up, or REVOKED if killed]
- **Overall System Verdict**: 100% OPERATIONAL & GOVERNANCE COMPLIANT
```

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open **`https://drefinery.freshbeats.ai`** → **Founder Console / Management**.
2. Scroll to **"Autonomous AI Agent Fleets & Wallets"**:
   * **Test Credit Top-Up**: Click the green **`[+500 Credits]`** button next to your agent. Watch the allowance jump from `50` to `550` instantly.
   * **Test Emergency Kill-Switch**: Click the red **`[Kill]`** button next to an agent token. Watch its status flip immediately to `REVOKED`. The agent will be locked out on its next request.
