import { z } from "zod";
export declare const BreakingChangeItemSchema: z.ZodObject<{
    symbolName: z.ZodString;
    type: z.ZodEnum<["DEPRECATION", "REMOVAL", "SIGNATURE_CHANGE", "BEHAVIOR_CHANGE", "CONFIG_CHANGE"]>;
    description: z.ZodString;
    migrationGuide: z.ZodString;
    beforeCodeSnippet: z.ZodOptional<z.ZodString>;
    afterCodeSnippet: z.ZodOptional<z.ZodString>;
    severity: z.ZodDefault<z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW"]>>;
}, "strip", z.ZodTypeAny, {
    symbolName: string;
    type: "DEPRECATION" | "REMOVAL" | "SIGNATURE_CHANGE" | "BEHAVIOR_CHANGE" | "CONFIG_CHANGE";
    description: string;
    migrationGuide: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    beforeCodeSnippet?: string | undefined;
    afterCodeSnippet?: string | undefined;
}, {
    symbolName: string;
    type: "DEPRECATION" | "REMOVAL" | "SIGNATURE_CHANGE" | "BEHAVIOR_CHANGE" | "CONFIG_CHANGE";
    description: string;
    migrationGuide: string;
    beforeCodeSnippet?: string | undefined;
    afterCodeSnippet?: string | undefined;
    severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | undefined;
}>;
export declare const DeveloperReleaseSchema: z.ZodObject<{
    packageOrServiceName: z.ZodString;
    ecosystem: z.ZodEnum<["NPM", "PYPI", "CRATES", "GO", "MAVEN", "REST_API", "GRAPHQL", "OTHER"]>;
    version: z.ZodString;
    releaseDate: z.ZodOptional<z.ZodString>;
    summary: z.ZodString;
    hasBreakingChanges: z.ZodBoolean;
    breakingChanges: z.ZodDefault<z.ZodArray<z.ZodObject<{
        symbolName: z.ZodString;
        type: z.ZodEnum<["DEPRECATION", "REMOVAL", "SIGNATURE_CHANGE", "BEHAVIOR_CHANGE", "CONFIG_CHANGE"]>;
        description: z.ZodString;
        migrationGuide: z.ZodString;
        beforeCodeSnippet: z.ZodOptional<z.ZodString>;
        afterCodeSnippet: z.ZodOptional<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["CRITICAL", "HIGH", "MEDIUM", "LOW"]>>;
    }, "strip", z.ZodTypeAny, {
        symbolName: string;
        type: "DEPRECATION" | "REMOVAL" | "SIGNATURE_CHANGE" | "BEHAVIOR_CHANGE" | "CONFIG_CHANGE";
        description: string;
        migrationGuide: string;
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        beforeCodeSnippet?: string | undefined;
        afterCodeSnippet?: string | undefined;
    }, {
        symbolName: string;
        type: "DEPRECATION" | "REMOVAL" | "SIGNATURE_CHANGE" | "BEHAVIOR_CHANGE" | "CONFIG_CHANGE";
        description: string;
        migrationGuide: string;
        beforeCodeSnippet?: string | undefined;
        afterCodeSnippet?: string | undefined;
        severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | undefined;
    }>, "many">>;
    deprecations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    newFeatures: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    bugFixes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    compatibility: z.ZodOptional<z.ZodObject<{
        minNodeVersion: z.ZodOptional<z.ZodString>;
        supportedRuntimes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        peerDependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        supportedRuntimes: string[];
        minNodeVersion?: string | undefined;
        peerDependencies?: Record<string, string> | undefined;
    }, {
        minNodeVersion?: string | undefined;
        supportedRuntimes?: string[] | undefined;
        peerDependencies?: Record<string, string> | undefined;
    }>>;
    sourceUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    packageOrServiceName: string;
    ecosystem: "NPM" | "PYPI" | "CRATES" | "GO" | "MAVEN" | "REST_API" | "GRAPHQL" | "OTHER";
    version: string;
    summary: string;
    hasBreakingChanges: boolean;
    breakingChanges: {
        symbolName: string;
        type: "DEPRECATION" | "REMOVAL" | "SIGNATURE_CHANGE" | "BEHAVIOR_CHANGE" | "CONFIG_CHANGE";
        description: string;
        migrationGuide: string;
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        beforeCodeSnippet?: string | undefined;
        afterCodeSnippet?: string | undefined;
    }[];
    deprecations: string[];
    newFeatures: string[];
    bugFixes: string[];
    releaseDate?: string | undefined;
    compatibility?: {
        supportedRuntimes: string[];
        minNodeVersion?: string | undefined;
        peerDependencies?: Record<string, string> | undefined;
    } | undefined;
    sourceUrl?: string | undefined;
}, {
    packageOrServiceName: string;
    ecosystem: "NPM" | "PYPI" | "CRATES" | "GO" | "MAVEN" | "REST_API" | "GRAPHQL" | "OTHER";
    version: string;
    summary: string;
    hasBreakingChanges: boolean;
    releaseDate?: string | undefined;
    breakingChanges?: {
        symbolName: string;
        type: "DEPRECATION" | "REMOVAL" | "SIGNATURE_CHANGE" | "BEHAVIOR_CHANGE" | "CONFIG_CHANGE";
        description: string;
        migrationGuide: string;
        beforeCodeSnippet?: string | undefined;
        afterCodeSnippet?: string | undefined;
        severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | undefined;
    }[] | undefined;
    deprecations?: string[] | undefined;
    newFeatures?: string[] | undefined;
    bugFixes?: string[] | undefined;
    compatibility?: {
        minNodeVersion?: string | undefined;
        supportedRuntimes?: string[] | undefined;
        peerDependencies?: Record<string, string> | undefined;
    } | undefined;
    sourceUrl?: string | undefined;
}>;
export type BreakingChangeItem = z.infer<typeof BreakingChangeItemSchema>;
export type DeveloperRelease = z.infer<typeof DeveloperReleaseSchema>;
export declare const PricingTierSchema: z.ZodObject<{
    name: z.ZodString;
    monthlyPrice: z.ZodNullable<z.ZodNumber>;
    annualPricePerMonth: z.ZodNullable<z.ZodNumber>;
    pricingModel: z.ZodEnum<["FLAT_FEE", "PER_SEAT", "USAGE_BASED", "TIERED", "HYBRID", "CUSTOM"]>;
    currency: z.ZodDefault<z.ZodString>;
    includedLimits: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>;
    overageRates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    targetAudience: z.ZodOptional<z.ZodString>;
    features: z.ZodArray<z.ZodString, "many">;
    hiddenConditions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    monthlyPrice: number | null;
    annualPricePerMonth: number | null;
    pricingModel: "FLAT_FEE" | "PER_SEAT" | "USAGE_BASED" | "TIERED" | "HYBRID" | "CUSTOM";
    currency: string;
    includedLimits: Record<string, string | number | boolean>;
    features: string[];
    hiddenConditions: string[];
    overageRates?: Record<string, string> | undefined;
    targetAudience?: string | undefined;
}, {
    name: string;
    monthlyPrice: number | null;
    annualPricePerMonth: number | null;
    pricingModel: "FLAT_FEE" | "PER_SEAT" | "USAGE_BASED" | "TIERED" | "HYBRID" | "CUSTOM";
    includedLimits: Record<string, string | number | boolean>;
    features: string[];
    currency?: string | undefined;
    overageRates?: Record<string, string> | undefined;
    targetAudience?: string | undefined;
    hiddenConditions?: string[] | undefined;
}>;
export declare const B2BPricingMatrixSchema: z.ZodObject<{
    companyOrProductName: z.ZodString;
    category: z.ZodString;
    officialPricingUrl: z.ZodOptional<z.ZodString>;
    lastUpdated: z.ZodOptional<z.ZodString>;
    tiers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        monthlyPrice: z.ZodNullable<z.ZodNumber>;
        annualPricePerMonth: z.ZodNullable<z.ZodNumber>;
        pricingModel: z.ZodEnum<["FLAT_FEE", "PER_SEAT", "USAGE_BASED", "TIERED", "HYBRID", "CUSTOM"]>;
        currency: z.ZodDefault<z.ZodString>;
        includedLimits: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>;
        overageRates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        targetAudience: z.ZodOptional<z.ZodString>;
        features: z.ZodArray<z.ZodString, "many">;
        hiddenConditions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        monthlyPrice: number | null;
        annualPricePerMonth: number | null;
        pricingModel: "FLAT_FEE" | "PER_SEAT" | "USAGE_BASED" | "TIERED" | "HYBRID" | "CUSTOM";
        currency: string;
        includedLimits: Record<string, string | number | boolean>;
        features: string[];
        hiddenConditions: string[];
        overageRates?: Record<string, string> | undefined;
        targetAudience?: string | undefined;
    }, {
        name: string;
        monthlyPrice: number | null;
        annualPricePerMonth: number | null;
        pricingModel: "FLAT_FEE" | "PER_SEAT" | "USAGE_BASED" | "TIERED" | "HYBRID" | "CUSTOM";
        includedLimits: Record<string, string | number | boolean>;
        features: string[];
        currency?: string | undefined;
        overageRates?: Record<string, string> | undefined;
        targetAudience?: string | undefined;
        hiddenConditions?: string[] | undefined;
    }>, "many">;
    freeTierAvailable: z.ZodBoolean;
    freeTrialDays: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    enterpriseContactRequired: z.ZodDefault<z.ZodBoolean>;
    estimatedEntryCostMonthly: z.ZodNullable<z.ZodNumber>;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    summary: string;
    companyOrProductName: string;
    category: string;
    tiers: {
        name: string;
        monthlyPrice: number | null;
        annualPricePerMonth: number | null;
        pricingModel: "FLAT_FEE" | "PER_SEAT" | "USAGE_BASED" | "TIERED" | "HYBRID" | "CUSTOM";
        currency: string;
        includedLimits: Record<string, string | number | boolean>;
        features: string[];
        hiddenConditions: string[];
        overageRates?: Record<string, string> | undefined;
        targetAudience?: string | undefined;
    }[];
    freeTierAvailable: boolean;
    enterpriseContactRequired: boolean;
    estimatedEntryCostMonthly: number | null;
    officialPricingUrl?: string | undefined;
    lastUpdated?: string | undefined;
    freeTrialDays?: number | null | undefined;
}, {
    summary: string;
    companyOrProductName: string;
    category: string;
    tiers: {
        name: string;
        monthlyPrice: number | null;
        annualPricePerMonth: number | null;
        pricingModel: "FLAT_FEE" | "PER_SEAT" | "USAGE_BASED" | "TIERED" | "HYBRID" | "CUSTOM";
        includedLimits: Record<string, string | number | boolean>;
        features: string[];
        currency?: string | undefined;
        overageRates?: Record<string, string> | undefined;
        targetAudience?: string | undefined;
        hiddenConditions?: string[] | undefined;
    }[];
    freeTierAvailable: boolean;
    estimatedEntryCostMonthly: number | null;
    officialPricingUrl?: string | undefined;
    lastUpdated?: string | undefined;
    freeTrialDays?: number | null | undefined;
    enterpriseContactRequired?: boolean | undefined;
}>;
export type PricingTier = z.infer<typeof PricingTierSchema>;
export type B2BPricingMatrix = z.infer<typeof B2BPricingMatrixSchema>;
export declare const ComplianceRequirementSchema: z.ZodObject<{
    title: z.ZodString;
    category: z.ZodEnum<["PERMIT", "TAX", "ZONING", "ENVIRONMENTAL", "DATA_PRIVACY", "LABOR", "GRANT_ELIGIBILITY", "OTHER"]>;
    mandatory: z.ZodDefault<z.ZodBoolean>;
    applicableTo: z.ZodArray<z.ZodString, "many">;
    filingDeadline: z.ZodOptional<z.ZodString>;
    estimatedCostOrFee: z.ZodOptional<z.ZodString>;
    penaltyForNonCompliance: z.ZodOptional<z.ZodString>;
    stepByStepAction: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    category: "OTHER" | "PERMIT" | "TAX" | "ZONING" | "ENVIRONMENTAL" | "DATA_PRIVACY" | "LABOR" | "GRANT_ELIGIBILITY";
    title: string;
    mandatory: boolean;
    applicableTo: string[];
    stepByStepAction: string[];
    filingDeadline?: string | undefined;
    estimatedCostOrFee?: string | undefined;
    penaltyForNonCompliance?: string | undefined;
}, {
    category: "OTHER" | "PERMIT" | "TAX" | "ZONING" | "ENVIRONMENTAL" | "DATA_PRIVACY" | "LABOR" | "GRANT_ELIGIBILITY";
    title: string;
    applicableTo: string[];
    stepByStepAction: string[];
    mandatory?: boolean | undefined;
    filingDeadline?: string | undefined;
    estimatedCostOrFee?: string | undefined;
    penaltyForNonCompliance?: string | undefined;
}>;
export declare const RegulatoryComplianceSchema: z.ZodObject<{
    jurisdiction: z.ZodString;
    level: z.ZodEnum<["MUNICIPAL", "COUNTY", "STATE", "FEDERAL", "INTERNATIONAL"]>;
    governingBody: z.ZodString;
    topic: z.ZodString;
    effectiveDate: z.ZodOptional<z.ZodString>;
    summary: z.ZodString;
    requirements: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        category: z.ZodEnum<["PERMIT", "TAX", "ZONING", "ENVIRONMENTAL", "DATA_PRIVACY", "LABOR", "GRANT_ELIGIBILITY", "OTHER"]>;
        mandatory: z.ZodDefault<z.ZodBoolean>;
        applicableTo: z.ZodArray<z.ZodString, "many">;
        filingDeadline: z.ZodOptional<z.ZodString>;
        estimatedCostOrFee: z.ZodOptional<z.ZodString>;
        penaltyForNonCompliance: z.ZodOptional<z.ZodString>;
        stepByStepAction: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        category: "OTHER" | "PERMIT" | "TAX" | "ZONING" | "ENVIRONMENTAL" | "DATA_PRIVACY" | "LABOR" | "GRANT_ELIGIBILITY";
        title: string;
        mandatory: boolean;
        applicableTo: string[];
        stepByStepAction: string[];
        filingDeadline?: string | undefined;
        estimatedCostOrFee?: string | undefined;
        penaltyForNonCompliance?: string | undefined;
    }, {
        category: "OTHER" | "PERMIT" | "TAX" | "ZONING" | "ENVIRONMENTAL" | "DATA_PRIVACY" | "LABOR" | "GRANT_ELIGIBILITY";
        title: string;
        applicableTo: string[];
        stepByStepAction: string[];
        mandatory?: boolean | undefined;
        filingDeadline?: string | undefined;
        estimatedCostOrFee?: string | undefined;
        penaltyForNonCompliance?: string | undefined;
    }>, "many">>;
    officialSources: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    summary: string;
    jurisdiction: string;
    level: "MUNICIPAL" | "COUNTY" | "STATE" | "FEDERAL" | "INTERNATIONAL";
    governingBody: string;
    topic: string;
    requirements: {
        category: "OTHER" | "PERMIT" | "TAX" | "ZONING" | "ENVIRONMENTAL" | "DATA_PRIVACY" | "LABOR" | "GRANT_ELIGIBILITY";
        title: string;
        mandatory: boolean;
        applicableTo: string[];
        stepByStepAction: string[];
        filingDeadline?: string | undefined;
        estimatedCostOrFee?: string | undefined;
        penaltyForNonCompliance?: string | undefined;
    }[];
    officialSources: string[];
    effectiveDate?: string | undefined;
}, {
    summary: string;
    jurisdiction: string;
    level: "MUNICIPAL" | "COUNTY" | "STATE" | "FEDERAL" | "INTERNATIONAL";
    governingBody: string;
    topic: string;
    effectiveDate?: string | undefined;
    requirements?: {
        category: "OTHER" | "PERMIT" | "TAX" | "ZONING" | "ENVIRONMENTAL" | "DATA_PRIVACY" | "LABOR" | "GRANT_ELIGIBILITY";
        title: string;
        applicableTo: string[];
        stepByStepAction: string[];
        mandatory?: boolean | undefined;
        filingDeadline?: string | undefined;
        estimatedCostOrFee?: string | undefined;
        penaltyForNonCompliance?: string | undefined;
    }[] | undefined;
    officialSources?: string[] | undefined;
}>;
export type ComplianceRequirement = z.infer<typeof ComplianceRequirementSchema>;
export type RegulatoryCompliance = z.infer<typeof RegulatoryComplianceSchema>;
export declare const CustomRefinementRequestSchema: z.ZodObject<{
    sourceUrl: z.ZodString;
    domainName: z.ZodDefault<z.ZodString>;
    instructionPrompt: z.ZodString;
    targetSchemaJson: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    webhookUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sourceUrl: string;
    domainName: string;
    instructionPrompt: string;
    targetSchemaJson?: Record<string, any> | undefined;
    webhookUrl?: string | undefined;
}, {
    sourceUrl: string;
    instructionPrompt: string;
    domainName?: string | undefined;
    targetSchemaJson?: Record<string, any> | undefined;
    webhookUrl?: string | undefined;
}>;
export declare const CustomRefinedOutputSchema: z.ZodObject<{
    sourceUrl: z.ZodString;
    domainName: z.ZodString;
    extractedData: z.ZodRecord<z.ZodString, z.ZodAny>;
    confidenceScore: z.ZodNumber;
    summary: z.ZodString;
    entitiesFound: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    extractedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    summary: string;
    sourceUrl: string;
    domainName: string;
    extractedData: Record<string, any>;
    confidenceScore: number;
    entitiesFound: string[];
    extractedAt: string;
}, {
    summary: string;
    sourceUrl: string;
    domainName: string;
    extractedData: Record<string, any>;
    confidenceScore: number;
    extractedAt: string;
    entitiesFound?: string[] | undefined;
}>;
export type CustomRefinementRequest = z.infer<typeof CustomRefinementRequestSchema>;
export type CustomRefinedOutput = z.infer<typeof CustomRefinedOutputSchema>;
export declare const EntityDiffSchema: z.ZodObject<{
    id: z.ZodString;
    entityKey: z.ZodString;
    domain: z.ZodEnum<["developer", "pricing", "regulatory", "custom"]>;
    previousVersion: z.ZodOptional<z.ZodString>;
    currentVersion: z.ZodOptional<z.ZodString>;
    severity: z.ZodEnum<["CRITICAL", "MAJOR", "MINOR", "INFORMATIONAL"]>;
    diffSummary: z.ZodString;
    changes: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        changeType: z.ZodEnum<["ADDED", "REMOVED", "MODIFIED", "UNCHANGED"]>;
        oldValue: z.ZodOptional<z.ZodAny>;
        newValue: z.ZodOptional<z.ZodAny>;
        significance: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        field: string;
        changeType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
        significance: string;
        oldValue?: any;
        newValue?: any;
    }, {
        field: string;
        changeType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
        significance: string;
        oldValue?: any;
        newValue?: any;
    }>, "many">;
    detectedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    severity: "CRITICAL" | "MAJOR" | "MINOR" | "INFORMATIONAL";
    id: string;
    entityKey: string;
    domain: "custom" | "developer" | "pricing" | "regulatory";
    diffSummary: string;
    changes: {
        field: string;
        changeType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
        significance: string;
        oldValue?: any;
        newValue?: any;
    }[];
    detectedAt: string;
    previousVersion?: string | undefined;
    currentVersion?: string | undefined;
}, {
    severity: "CRITICAL" | "MAJOR" | "MINOR" | "INFORMATIONAL";
    id: string;
    entityKey: string;
    domain: "custom" | "developer" | "pricing" | "regulatory";
    diffSummary: string;
    changes: {
        field: string;
        changeType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
        significance: string;
        oldValue?: any;
        newValue?: any;
    }[];
    detectedAt: string;
    previousVersion?: string | undefined;
    currentVersion?: string | undefined;
}>;
export type EntityDiff = z.infer<typeof EntityDiffSchema>;
export interface MCPToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
}
export declare const MCP_TOOLS: MCPToolDefinition[];
