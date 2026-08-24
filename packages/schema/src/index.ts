import { z } from "zod";

// ==========================================
// 1. DOMAIN 1: DEVELOPER API & BREAKING CHANGES
// ==========================================
export const BreakingChangeItemSchema = z.object({
  symbolName: z.string().describe("Function, class, parameter, or API endpoint name affected"),
  type: z.enum(["DEPRECATION", "REMOVAL", "SIGNATURE_CHANGE", "BEHAVIOR_CHANGE", "CONFIG_CHANGE"]),
  description: z.string().describe("Detailed description of what changed and why"),
  migrationGuide: z.string().describe("Step-by-step instructions on how to migrate code"),
  beforeCodeSnippet: z.string().optional().describe("Example code showing previous usage"),
  afterCodeSnippet: z.string().optional().describe("Example code showing modern replacement"),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("HIGH")
});

export const DeveloperReleaseSchema = z.object({
  packageOrServiceName: z.string().describe("e.g. stripe-node, nextjs, react, @cloudflare/workers-types"),
  ecosystem: z.enum(["NPM", "PYPI", "CRATES", "GO", "MAVEN", "REST_API", "GRAPHQL", "OTHER"]),
  version: z.string().describe("e.g. 15.0.0, 2024-06-01"),
  releaseDate: z.string().optional().describe("ISO date string or release date string"),
  summary: z.string().describe("High-level executive summary of this release/update"),
  hasBreakingChanges: z.boolean(),
  breakingChanges: z.array(BreakingChangeItemSchema).default([]),
  deprecations: z.array(z.string()).default([]),
  newFeatures: z.array(z.string()).default([]),
  bugFixes: z.array(z.string()).default([]),
  compatibility: z.object({
    minNodeVersion: z.string().optional(),
    supportedRuntimes: z.array(z.string()).default([]),
    peerDependencies: z.record(z.string()).optional()
  }).optional(),
  sourceUrl: z.string().url().optional()
});

export type BreakingChangeItem = z.infer<typeof BreakingChangeItemSchema>;
export type DeveloperRelease = z.infer<typeof DeveloperReleaseSchema>;


// ==========================================
// 2. DOMAIN 2: B2B PRICING & FEATURE MATRICES
// ==========================================
export const PricingTierSchema = z.object({
  name: z.string().describe("Tier name, e.g. Free, Starter, Pro, Enterprise"),
  monthlyPrice: z.number().nullable().describe("Monthly price in USD, null if custom/free"),
  annualPricePerMonth: z.number().nullable().describe("Monthly equivalent when billed annually in USD"),
  pricingModel: z.enum(["FLAT_FEE", "PER_SEAT", "USAGE_BASED", "TIERED", "HYBRID", "CUSTOM"]),
  currency: z.string().default("USD"),
  includedLimits: z.record(z.union([z.string(), z.number(), z.boolean()])).describe("Key limits (e.g. tokens: 1000000, seats: 5, bandwidthGB: 50)"),
  overageRates: z.record(z.string()).optional().describe("Cost per unit beyond limit, e.g. '$0.002 per 1k tokens'"),
  targetAudience: z.string().optional().describe("Intended user tier e.g. 'Early stage startups'"),
  features: z.array(z.string()).describe("List of verified features available on this tier"),
  hiddenConditions: z.array(z.string()).default([]).describe("Notable caveats, min seats, annual commit requirements, etc.")
});

export const B2BPricingMatrixSchema = z.object({
  companyOrProductName: z.string().describe("e.g. DataDog, OpenAI, Supabase, Linear"),
  category: z.string().describe("e.g. Observability, AI Gateway, Relational Database, Project Management"),
  officialPricingUrl: z.string().url().optional(),
  lastUpdated: z.string().optional(),
  tiers: z.array(PricingTierSchema).min(1),
  freeTierAvailable: z.boolean(),
  freeTrialDays: z.number().nullable().optional(),
  enterpriseContactRequired: z.boolean().default(false),
  estimatedEntryCostMonthly: z.number().nullable().describe("Lowest monthly cost to get started with paid tier"),
  summary: z.string().describe("Executive analysis of pricing strategy and value for AI/business buyers")
});

export type PricingTier = z.infer<typeof PricingTierSchema>;
export type B2BPricingMatrix = z.infer<typeof B2BPricingMatrixSchema>;


// ==========================================
// 3. DOMAIN 3: REGULATORY & COMPLIANCE
// ==========================================
export const ComplianceRequirementSchema = z.object({
  title: z.string().describe("Name of the requirement, rule, or permit"),
  category: z.enum(["PERMIT", "TAX", "ZONING", "ENVIRONMENTAL", "DATA_PRIVACY", "LABOR", "GRANT_ELIGIBILITY", "OTHER"]),
  mandatory: z.boolean().default(true),
  applicableTo: z.array(z.string()).describe("Business types / activities subject to this rule"),
  filingDeadline: z.string().optional().describe("Specific date, frequency, or triggering event"),
  estimatedCostOrFee: z.string().optional().describe("Filing fee, permit fee, or grant value"),
  penaltyForNonCompliance: z.string().optional().describe("Fines, stop-work orders, or legal penalties"),
  stepByStepAction: z.array(z.string()).describe("Steps required to comply or apply")
});

export const RegulatoryComplianceSchema = z.object({
  jurisdiction: z.string().describe("e.g. City of San Francisco, State of California, EU, US Federal"),
  level: z.enum(["MUNICIPAL", "COUNTY", "STATE", "FEDERAL", "INTERNATIONAL"]),
  governingBody: z.string().describe("e.g. Department of Building Inspection, SEC, OSHA, FTC"),
  topic: z.string().describe("e.g. AI Governance, Short-Term Rental Permitting, Small Business Energy Grants"),
  effectiveDate: z.string().optional(),
  summary: z.string().describe("High-level summary of regulatory requirements and business impact"),
  requirements: z.array(ComplianceRequirementSchema).default([]),
  officialSources: z.array(z.string().url()).default([])
});

export type ComplianceRequirement = z.infer<typeof ComplianceRequirementSchema>;
export type RegulatoryCompliance = z.infer<typeof RegulatoryComplianceSchema>;


// ==========================================
// 4. GENERALIZED CUSTOM REFINEMENT SCHEMA
// ==========================================
export const CustomRefinementRequestSchema = z.object({
  sourceUrl: z.string().url().describe("The URL to fetch, scrape, and refine"),
  domainName: z.string().default("custom").describe("Domain category identifier"),
  instructionPrompt: z.string().describe("Specific instructions for the AI on what data to extract and structure"),
  targetSchemaJson: z.record(z.any()).optional().describe("Optional JSON Schema object to guide strict output formatting"),
  webhookUrl: z.string().url().optional().describe("Optional webhook to notify when refinement finishes")
});

export const CustomRefinedOutputSchema = z.object({
  sourceUrl: z.string().url(),
  domainName: z.string(),
  extractedData: z.record(z.any()),
  confidenceScore: z.number().min(0).max(1),
  summary: z.string(),
  entitiesFound: z.array(z.string()).default([]),
  extractedAt: z.string()
});

export type CustomRefinementRequest = z.infer<typeof CustomRefinementRequestSchema>;
export type CustomRefinedOutput = z.infer<typeof CustomRefinedOutputSchema>;


// ==========================================
// 5. SEMANTIC DIFFING & AUDIT SCHEMA
// ==========================================
export const EntityDiffSchema = z.object({
  id: z.string(),
  entityKey: z.string(),
  domain: z.enum(["developer", "pricing", "regulatory", "custom"]),
  previousVersion: z.string().optional(),
  currentVersion: z.string().optional(),
  severity: z.enum(["CRITICAL", "MAJOR", "MINOR", "INFORMATIONAL"]),
  diffSummary: z.string(),
  changes: z.array(z.object({
    field: z.string(),
    changeType: z.enum(["ADDED", "REMOVED", "MODIFIED", "UNCHANGED"]),
    oldValue: z.any().optional(),
    newValue: z.any().optional(),
    significance: z.string()
  })),
  detectedAt: z.string()
});

export type EntityDiff = z.infer<typeof EntityDiffSchema>;


// ==========================================
// 6. MCP PROTOCOL TOOL DEFINITIONS
// ==========================================
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: "refinery_dev_breaking_changes",
    description: "Query refined developer changelogs, API deprecations, breaking changes, and migration code diffs for packages/APIs.",
    inputSchema: {
      type: "object",
      properties: {
        packageOrService: { type: "string", description: "Name of package or API (e.g., 'stripe-node', 'nextjs', 'openai')" },
        targetVersion: { type: "string", description: "Target version or version range (optional)" },
        breakingOnly: { type: "boolean", description: "If true, only returns breaking change entries" }
      },
      required: ["packageOrService"]
    }
  },
  {
    name: "refinery_b2b_pricing_matrix",
    description: "Lookup verified, structured pricing tiers, feature checklists, token costs, and overage rates for B2B SaaS/AI tools.",
    inputSchema: {
      type: "object",
      properties: {
        companyOrProduct: { type: "string", description: "Name of product or company (e.g. 'DataDog', 'OpenAI', 'Supabase')" },
        category: { type: "string", description: "Filter by category (e.g., 'Observability', 'AI Gateway', 'Vector DB')" }
      }
    }
  },
  {
    name: "refinery_regulatory_compliance",
    description: "Check municipal, state, and federal regulatory rules, required permits, compliance deadlines, and grant requirements.",
    inputSchema: {
      type: "object",
      properties: {
        jurisdiction: { type: "string", description: "Location or jurisdiction (e.g., 'San Francisco', 'California', 'Federal')" },
        topic: { type: "string", description: "Topic or keyword (e.g. 'Short-term rentals', 'AI disclosure', 'Commercial composting')" }
      }
    }
  },
  {
    name: "refinery_semantic_search",
    description: "Perform edge vector semantic search across all refined knowledge databases.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language query or question" },
        domain: { type: "string", enum: ["all", "developer", "pricing", "regulatory", "custom"], default: "all" },
        topK: { type: "number", default: 5 }
      },
      required: ["query"]
    }
  },
  {
    name: "refinery_refine_custom_url",
    description: "Ingest any arbitrary URL on the fly, clean the HTML/document, run Workers AI structured extraction, and return verified JSON.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Target webpage or document URL" },
        instructionPrompt: { type: "string", description: "Instructions on what exact data to extract into JSON" }
      },
      required: ["url", "instructionPrompt"]
    }
  }
];
