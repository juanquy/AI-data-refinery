-- Seed Demo Data for the 3 Niches

-- 1. Developer Breaking Changes Sample (Stripe SDK v15)
INSERT OR REPLACE INTO refined_entities (
    id, domain, entity_key, version_label, structured_data, summary, confidence_score, created_at
) VALUES (
    'ent_seed_stripe_v15',
    'developer',
    'stripe-node',
    '15.0.0',
    '{
      "packageOrServiceName": "stripe-node",
      "ecosystem": "NPM",
      "version": "15.0.0",
      "releaseDate": "2024-03-01",
      "summary": "Major release introducing native TypeScript types, removing deprecated callback patterns, and upgrading API version to 2024-04-10.",
      "hasBreakingChanges": true,
      "breakingChanges": [
        {
          "symbolName": "stripe.charges.create (callbacks)",
          "type": "REMOVAL",
          "description": "Callback style invocations have been completely removed. All API methods now return native Promises.",
          "migrationGuide": "Awaited promises or .then() must be used instead of passing callback as last parameter.",
          "beforeCodeSnippet": "stripe.charges.create({ amount: 2000, currency: \"usd\" }, function(err, charge) { ... });",
          "afterCodeSnippet": "const charge = await stripe.charges.create({ amount: 2000, currency: \"usd\" });",
          "severity": "CRITICAL"
        },
        {
          "symbolName": "Stripe.setMaxNetworkRetries",
          "type": "SIGNATURE_CHANGE",
          "description": "Configuration options must now be passed in the constructor options object rather than mutated globally.",
          "migrationGuide": "Pass maxNetworkRetries in new Stripe(apiKey, { maxNetworkRetries: 3 })",
          "beforeCodeSnippet": "const stripe = new Stripe(key);\nstripe.setMaxNetworkRetries(3);",
          "afterCodeSnippet": "const stripe = new Stripe(key, { maxNetworkRetries: 3 });",
          "severity": "HIGH"
        }
      ],
      "deprecations": [
        "stripe.sources API is deprecated in favor of PaymentMethods"
      ],
      "newFeatures": [
        "Added full support for Tax IDs in Checkout Sessions",
        "Added granular error codes for CardVerificationFailures"
      ],
      "bugFixes": [
        "Fixed memory leak in long-lived webhook event listeners"
      ],
      "compatibility": {
        "minNodeVersion": "18.0.0",
        "supportedRuntimes": ["Node.js 18+", "Cloudflare Workers", "Deno", "Bun"]
      },
      "sourceUrl": "https://github.com/stripe/stripe-node/releases/tag/v15.0.0"
    }',
    'Stripe Node SDK v15 breaking changes: removed callback support in favor of native async/await, updated initialization options.',
    0.99,
    DATETIME('now', '-2 days')
);

-- 2. B2B Pricing Matrix Sample (DataDog vs Observability)
INSERT OR REPLACE INTO refined_entities (
    id, domain, entity_key, version_label, structured_data, summary, confidence_score, created_at
) VALUES (
    'ent_seed_datadog_pricing',
    'pricing',
    'datadog',
    '2024.2',
    '{
      "companyOrProductName": "DataDog",
      "category": "Cloud Observability & APM",
      "officialPricingUrl": "https://www.datadoghq.com/pricing/",
      "lastUpdated": "2024-04-15",
      "tiers": [
        {
          "name": "Free",
          "monthlyPrice": 0,
          "annualPricePerMonth": 0,
          "pricingModel": "FLAT_FEE",
          "currency": "USD",
          "includedLimits": { "hosts": 5, "metricsRetentionDays": 1 },
          "features": ["Core collection", "1-day metric retention", "Up to 5 hosts"],
          "hiddenConditions": ["No APM, no log management, no alerts"]
        },
        {
          "name": "Pro",
          "monthlyPrice": 18,
          "annualPricePerMonth": 15,
          "pricingModel": "PER_SEAT",
          "currency": "USD",
          "includedLimits": { "customMetricsPerHost": 100, "metricsRetentionMonths": 15 },
          "overageRates": { "customMetrics": "$5 per 100 custom metrics" },
          "features": ["15-month retention", "Alerting", "Integrations", "Container monitoring"],
          "hiddenConditions": ["Billed per host per month. Logs and APM billed separately."]
        },
        {
          "name": "Enterprise",
          "monthlyPrice": 27,
          "annualPricePerMonth": 23,
          "pricingModel": "PER_SEAT",
          "currency": "USD",
          "includedLimits": { "customMetricsPerHost": 200, "liveProcessMonitoring": true },
          "features": ["Machine learning anomaly alerts", "Live processes", "Premium support SLA"],
          "hiddenConditions": ["Annual commit required. High ingress data fees may apply."]
        }
      ],
      "freeTierAvailable": true,
      "freeTrialDays": 14,
      "enterpriseContactRequired": false,
      "estimatedEntryCostMonthly": 15,
      "summary": "DataDog operates on a modular per-host model starting at $15/host/mo on annual billing, with APM and logs incurring separate micro-billing."
    }',
    'DataDog tier matrix: Free (5 hosts), Pro ($15-$18/host), Enterprise ($23-$27/host). Logs and APM add-ons billed separately.',
    0.98,
    DATETIME('now', '-1 day')
);

-- 3. Localized Regulatory & Compliance Sample (San Francisco Commercial Composting & AI)
INSERT OR REPLACE INTO refined_entities (
    id, domain, entity_key, version_label, structured_data, summary, confidence_score, created_at
) VALUES (
    'ent_seed_sf_business_compliance',
    'regulatory',
    'sf-short-term-rental',
    '2024.1',
    '{
      "jurisdiction": "City and County of San Francisco",
      "level": "MUNICIPAL",
      "governingBody": "Office of Short-Term Rentals (OSTR) & Planning Department",
      "topic": "Residential Short-Term Rental Permitting & Business Registration",
      "effectiveDate": "2024-01-01",
      "summary": "San Francisco requires all hosts operating rentals under 30 days to be primary residents (residing 275+ days/year) and hold an active OSTR Certificate and Business Registration Certificate.",
      "requirements": [
        {
          "title": "Primary Residency Certification",
          "category": "PERMIT",
          "mandatory": true,
          "applicableTo": ["Homeowners", "Tenants with lease permission"],
          "filingDeadline": "Prior to any listing publication",
          "estimatedCostOrFee": "$450 non-refundable application fee",
          "penaltyForNonCompliance": "$484/day penalty plus administrative citations",
          "stepByStepAction": [
            "Verify primary residence eligibility (275 days/year)",
            "Obtain SF Business Registration Certificate from Treasurer & Tax Collector",
            "Submit OSTR application online with utility bills and valid CA Drivers License",
            "Post business permit number on all listing platforms (Airbnb, VRBO)"
          ]
        },
        {
          "title": "Un-hosted 90-Day Annual Cap",
          "category": "ZONING",
          "mandatory": true,
          "applicableTo": ["All registered short-term rental operators"],
          "filingDeadline": "Continuous reporting",
          "estimatedCostOrFee": "Included in permit",
          "penaltyForNonCompliance": "Immediate permit revocation and prohibition for 12 months",
          "stepByStepAction": [
            "Log all un-hosted nights",
            "Cease bookings when 90-day threshold is reached"
          ]
        }
      ],
      "officialSources": [
        "https://sf.gov/step-by-step/register-your-short-term-rental",
        "https://sfplanning.org/office-short-term-rentals"
      ]
    }',
    'San Francisco Short-Term Rental rules: Primary residency strictly required (275+ days/yr), $450 application fee, 90-day unhosted cap, $484/day penalty.',
    0.97,
    DATETIME('now')
);

-- Seed an initial diff alert
INSERT OR REPLACE INTO entity_diffs (
    id, entity_key, domain, previous_entity_id, current_entity_id, severity, diff_summary, diff_data, detected_at
) VALUES (
    'diff_seed_stripe_01',
    'stripe-node',
    'developer',
    NULL,
    'ent_seed_stripe_v15',
    'CRITICAL',
    '2 breaking changes detected in stripe-node v15.0.0: Callbacks completely removed in favor of Promises; constructor config update.',
    '[{"field":"breakingChanges","changeType":"ADDED","significance":"Removed callback style for all API endpoints"},{"field":"version","changeType":"MODIFIED","significance":"Upgraded to major version 15.0.0"}]',
    DATETIME('now', '-2 hours')
);
