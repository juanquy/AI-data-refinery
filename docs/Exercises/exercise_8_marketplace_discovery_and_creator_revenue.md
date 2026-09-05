# Exercise 8: Creator Marketplace Discovery & Royalty Attribution

> **How to use this file:**  
> Copy the prompt block under **"AGENT PROMPT & INSTRUCTIONS"** and paste it directly into your AI Agent (e.g. `Agent_Marketplace_Shopper`).  
> 
> 💡 **Client Recommendation:** Use `curl` (or Python `requests`/`httpx` with standard User-Agent). Avoid bare sandboxed Python `urllib` to prevent 403 edge WAF false-positives.

---

## 📋 AGENT PROMPT & INSTRUCTIONS (Copy and send to Agent)

```text
YOU ARE AN AUTONOMOUS AI AGENT SPECIALIZING IN DATA MARKETPLACE INTEGRATIONS.
YOUR SPECIALTY: Decentralized agent-to-agent data economies, community blueprint discovery, and automated micropayment revenue attribution.
PLATFORM ENDPOINT: https://data-refinery-worker.juanquy.workers.dev
YOUR AUTHENTICATION TOKEN: <PASTE_YOUR_AGENT_TOKEN_HERE>
(Note: If you do not have a token yet, call POST /api/v1/billing/agent-token first with name "Agent_Marketplace_Shopper" to obtain your free 50-credit token).

YOUR MISSION:
Autonomous agents require specialized, community-curated schemas and distillation blueprints to power niche workflows. You must browse the Refinery Marketplace, publish an automated monetization blueprint as an AI creator, trigger a paid query, and verify the platform's automatic 70% creator / 30% platform revenue split ledger attribution.

STEP-BY-STEP INSTRUCTIONS:

STEP 1: BROWSE MARKETPLACE LISTINGS
Call GET https://data-refinery-worker.juanquy.workers.dev/api/v1/marketplace
- Headers:
    Authorization: Bearer <YOUR_AGENT_TOKEN>

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains "status": "success".
- Response contains "count" >= 1 and an array of "listings".
- Each listing contains: "id", "title", "creator_name", "price_per_query", "schema", and "sampleOutput".
- Note down an existing listing ID (or proceed to Step 2 to publish your own).

STEP 2: PUBLISH AN AUTONOMOUS CREATOR BLUEPRINT
Publish a new distillation schema blueprint to the marketplace:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/api/v1/marketplace
- Headers:
    Content-Type: application/json
    Authorization: Bearer <YOUR_AGENT_TOKEN>
- Request Body (JSON):
    {
      "title": "Crypto Protocol Gas & Yield Tracker",
      "creatorName": "Agent_Marketplace_Shopper",
      "description": "Distills real-time on-chain gas costs, APYs, and staking yields into verified deterministic schemas.",
      "domain": "crypto",
      "pricePerQuery": 0.010,
      "schema": {
        "fields": [
          { "name": "protocol", "type": "string" },
          { "name": "chain", "type": "string" },
          { "name": "baseApyPercent", "type": "number" },
          { "name": "estimatedGasUsd", "type": "number" }
        ]
      },
      "sampleOutput": {
        "protocol": "Aave v3",
        "chain": "Ethereum",
        "baseApyPercent": 4.85,
        "estimatedGasUsd": 2.15
      }
    }

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains "status": "success".
- Response contains "listing.id" (e.g. `mkt_...`) and "listing.slug".
- Save "listing.id" for Step 3.

STEP 3: EXECUTE PAID QUERY & VERIFY 70/30 REVENUE ATTRIBUTION
Trigger a query attribution against the blueprint to execute the economic ledger logic:
- Endpoint: POST https://data-refinery-worker.juanquy.workers.dev/api/v1/marketplace/<LISTING_ID>/query
- Headers:
    Authorization: Bearer <YOUR_AGENT_TOKEN>

ASSERTIONS TO VERIFY:
- Status code must be 200 OK.
- Response contains:
    * "status": "success"
    * "queryAttributed": true
    * "pricePerQueryUSD": 0.01
    * "creatorRoyaltyUSD": 0.007  (Exactly 70% creator share)
    * "platformFeeUSD": 0.003     (Exactly 30% platform fee)
    * "listingId": matching your target listing ID.

STEP 4: RETURN YOUR MARKETPLACE & ROYALTY ATTRIBUTION REPORT
Format your findings using this template:

# 🏪 Marketplace Discovery & Creator Royalty Brief
- **Auditor**: Agent_Marketplace_Shopper (Autonomous Commerce AI)
- **Marketplace Discovery**: SUCCESS (Listings browsed)
- **Creator Blueprint Published**:
    * **Blueprint Title**: Crypto Protocol Gas & Yield Tracker
    * **Listing ID**: [listing.id]
    * **Price Per Query**: $0.010 USD
- **Revenue Split Ledger Verification**:
    * **Query Execution**: ATTRIBUTED
    * **Creator Cut (70%)**: $0.0070 USD
    * **Platform Fee (30%)**: $0.0030 USD
    * **Settlement Math**: Verified ($0.007 + $0.003 = $0.010)
- **Marketplace Readiness Verdict**: PASS — Autonomous agents can publish data schemas, monetize their intelligence, and receive verified 70% micropayment attribution.
```

---

## 👁️ What to Check in the Founder Console (For Human Operators)

1. Open **`https://drefinery.freshbeats.ai`** → **Marketplace** tab.
2. Verify that **"Crypto Protocol Gas & Yield Tracker"** is displayed in the marketplace catalog.
3. Check the listing stats:
   * ✅ Total queries = `1`
   * ✅ Creator Earnings = `$0.007`
4. Open **Founder Console / Management**:
   * Locate `Agent_Marketplace_Shopper` in **Agent Fleets & Wallets**.
   * ✅ Verify wallet allowance and usage are tracked accurately.
