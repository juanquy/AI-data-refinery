import test from "node:test";
import assert from "node:assert/strict";
import {
  DeveloperReleaseSchema,
  B2BPricingMatrixSchema,
  RegulatoryComplianceSchema,
  MCP_TOOLS
} from "@data-refinery/schema";

test("DeveloperReleaseSchema validates valid release", () => {
  const sample = {
    packageOrServiceName: "nextjs",
    ecosystem: "NPM",
    version: "15.0.0",
    summary: "React 19 support and async request headers",
    hasBreakingChanges: true,
    breakingChanges: [
      {
        symbolName: "cookies()",
        type: "SIGNATURE_CHANGE",
        description: "cookies() is now an async function",
        migrationGuide: "await cookies()",
        severity: "HIGH"
      }
    ]
  };

  const result = DeveloperReleaseSchema.safeParse(sample);
  assert.ok(result.success);
});

test("B2BPricingMatrixSchema validates valid pricing matrix", () => {
  const sample = {
    companyOrProductName: "Supabase",
    category: "BaaS & Postgres",
    tiers: [
      {
        name: "Free",
        monthlyPrice: 0,
        annualPricePerMonth: 0,
        pricingModel: "FLAT_FEE",
        currency: "USD",
        includedLimits: { projects: 2, dbSizeMB: 500 },
        features: ["500MB database", "50,000 monthly active users"]
      }
    ],
    freeTierAvailable: true,
    enterpriseContactRequired: false,
    estimatedEntryCostMonthly: 25,
    summary: "Generous free tier with $25/mo Pro upgrade"
  };

  const result = B2BPricingMatrixSchema.safeParse(sample);
  assert.ok(result.success);
});

test("RegulatoryComplianceSchema validates compliance rule", () => {
  const sample = {
    jurisdiction: "City of Austin",
    level: "MUNICIPAL",
    governingBody: "Austin Code Department",
    topic: "Short Term Rental Licensing",
    summary: "Operating licenses required for Type 1, 2, and 3 STRs",
    requirements: [
      {
        title: "Operating License Application",
        category: "PERMIT",
        mandatory: true,
        applicableTo: ["Property Owners"],
        filingDeadline: "Annual renewal",
        estimatedCostOrFee: "$733",
        stepByStepAction: ["Submit application", "Provide certificate of occupancy"]
      }
    ]
  };

  const result = RegulatoryComplianceSchema.safeParse(sample);
  assert.ok(result.success);
});

test("MCP tools definitions are registered and non-empty", () => {
  assert.ok(MCP_TOOLS.length >= 5);
  const toolNames = MCP_TOOLS.map(t => t.name);
  assert.ok(toolNames.includes("refinery_dev_breaking_changes"));
  assert.ok(toolNames.includes("refinery_b2b_pricing_matrix"));
  assert.ok(toolNames.includes("refinery_regulatory_compliance"));
  assert.ok(toolNames.includes("refinery_semantic_search"));
  assert.ok(toolNames.includes("refinery_refine_custom_url"));
});
