# Exercise 4: Semantic Diff Monitoring & Autonomous Fleet Governance

## 🎯 Objective
Conduct a coordinated fleet governance drill with both agents. The agents will stream real-time AST semantic diffs, validate the machine-to-machine HTTP 402 micropayment protocol, and demonstrate founder controls (wallet credit top-up and emergency kill-switch).

---

## 🤖 Agent Roles
* **Agent 1**: `Agent_Alpha_Copilot` (`<AGENT_ALPHA_TOKEN>`)
* **Agent 2**: `Agent_Beta_Analyst` (`<AGENT_BETA_TOKEN>`)

---

## 📋 Step 1: Poll the Global AST Semantic Diff Stream

Both agents poll the edge diff engine to check for recent high-severity breaking changes and model shifts:

```bash
curl -s -X GET "https://data-refinery-worker.juanquy.workers.dev/api/v1/diffs?limit=5" \
  -H "Authorization: Bearer <AGENT_ALPHA_TOKEN>"
```

### Verification Criteria:
* Verify response includes `status: "success"` and an array of `diffs`.
* Each diff record includes:
  * `entityKey`: identifier (e.g. `stripe-node`, `datadog-api`)
  * `severity`: `CRITICAL`, `MAJOR`, `MINOR`, or `INFORMATIONAL`
  * `diffSummary`: human- and machine-readable delta explanation
  * `detectedAt`: ISO timestamp

---

## 📋 Step 2: Validate the HTTP 402 Autonomous Payment Protocol

Autonomous agents must be able to handle HTTP 402 Payment Required status gracefully. Agent Alpha simulates an unfunded or unauthenticated query to verify that the refinery returns machine-readable pricing headers:

```bash
curl -i -s -X GET https://data-refinery-worker.juanquy.workers.dev/api/v1/dev/stripe-node \
  -H "Authorization: Bearer ref_agent_invalid_token_9999"
```

### Expected Response Headers & Status:
* **HTTP Status**: `402 Payment Required`
* **Response Headers**:
  * `X-Refinery-Price-Per-Query: $0.005 USD`
  * `X-Refinery-Protocol: HTTP-402-Autonomous-Agent`
  * `X-Refinery-Agent-Token-Endpoint: https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/agent-token`
* **Response JSON Body**:
  ```json
  {
    "error": "Invalid or inactive API Key",
    "status": 402,
    "message": "Payment Required. Obtain an Autonomous Agent Token at /api/v1/billing/agent-token...",
    "agentTokenEndpoint": "https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/agent-token"
  }
  ```

---

## 📋 Step 3: Founder Wallet Top-Up Drill (Console Interaction)

The human operator tests granting additional credits to an active agent fleet from the Founder Console:

1. In **`https://drefinery.freshbeats.ai`** → **Founder Console**, scroll to **"Autonomous AI Agent Fleets & Wallets"**.
2. Locate **`Agent_Alpha_Copilot`**.
3. Click the **`[+500 Credits]`** green top-up button.
4. The allowance immediately increases from `50` to `550`.

### Agent Alpha Verifies Updated Balance:
Agent Alpha queries the key verification endpoint to confirm the allowance boost:

```bash
curl -s -X GET "https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/verify-key" \
  -H "Authorization: Bearer <AGENT_ALPHA_TOKEN>"
```

* Verify response displays:
  * `monthlyQuota: 550`
  * `status: "ACTIVE"`
  * `plan: "AGENT_MICRO"`

---

## 📋 Step 4: Emergency Kill-Switch Drill (Console Interaction)

The human operator tests instantly shutting down a rogue or misbehaving agent without taking down the platform:

1. In the Founder Console, locate **`Agent_Beta_Analyst`** (or a temporary test agent).
2. Click the red **`[Kill]`** button.
3. The console updates status to `REVOKED`.

### Agent Beta Verifies Access Termination:
Agent Beta immediately attempts another query:

```bash
curl -i -s -X GET https://data-refinery-worker.juanquy.workers.dev/api/v1/pricing/datadog \
  -H "Authorization: Bearer <AGENT_BETA_TOKEN>"
```

* Verify that the refinery blocks the query immediately with `HTTP 402 Payment Required` or `401 Unauthorized`.
* Demonstrates complete guardian kill-switch compliance (SPEC Capability CAP-7 / CAP-8).
