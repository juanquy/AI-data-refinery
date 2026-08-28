-- Migration: 0008_top5_high_value_niche_templates.sql
-- Seed the Top 5 High-Value Niche Enterprise Templates into custom_schemas

INSERT OR REPLACE INTO custom_schemas (id, workspace_id, name, slug, description, fields_json, custom_system_prompt, is_public)
VALUES 
(
  'schema_ast_code_migration_001',
  'ws_global_refinery',
  'Developer SDK Breaking Changes & AST Migration',
  'dev-sdk-breaking-changes',
  'Extracts deprecated functions, removed parameters, breaking signature shifts, and exact before/after code migration snippets for AI coding agents.',
  '[{"name":"packageOrServiceName","type":"string","description":"e.g. stripe-node, nextjs, react, @cloudflare/workers-types","required":true},{"name":"version","type":"string","description":"Version number e.g. 15.0.0 or 2026.1","required":true},{"name":"hasBreakingChanges","type":"boolean","description":"True if release contains breaking changes","required":true},{"name":"affectedSymbols","type":"array","description":"List of deprecated or removed functions, classes, and methods","required":true},{"name":"migrationCodeBefore","type":"string","description":"Original legacy code snippet prior to upgrade","required":false},{"name":"migrationCodeAfter","type":"string","description":"Updated modern code snippet compliant with new release","required":false},{"name":"severityLevel","type":"string","description":"CRITICAL, HIGH, MEDIUM, or LOW","required":true}]',
  'Extract affected symbols, deprecated function names, breaking signatures, and exact before/after code migration snippets from public API documentation and open-source changelogs.',
  1
),
(
  'schema_b2b_pricing_matrix_002',
  'ws_global_refinery',
  'B2B SaaS Dynamic Pricing & Quota Matrix',
  'b2b-saas-pricing-matrix',
  'Extracts normalized monthly/annual costs, seat limits, included token/bandwidth quotas, and hidden overage terms across SaaS vendors.',
  '[{"name":"productName","type":"string","description":"Name of vendor product (e.g. Supabase, Datadog, OpenAI)","required":true},{"name":"planTier","type":"string","description":"e.g. Starter, Pro, Team, Enterprise","required":true},{"name":"monthlyPriceUSD","type":"number","description":"Base monthly recurring price in USD","required":true},{"name":"annualPriceUSD","type":"number","description":"Annual billed rate per month in USD","required":false},{"name":"includedTokenQuota","type":"number","description":"Monthly included compute/token quota","required":false},{"name":"overageRatePerUnit","type":"number","description":"Overage fee per million tokens or per GB","required":false},{"name":"hiddenContractCaveats","type":"array","description":"Seat minimums, annual commitments, and fine print","required":false}]',
  'Extract normalized monthly/annual pricing, seat minimums, included usage/token quotas, and hidden overage terms from public vendor pricing pages and rate cards. Exclude speculative or non-public estimates.',
  1
),
(
  'schema_municipal_zoning_str_003',
  'ws_global_refinery',
  'Municipal Zoning, STR & Permit Compliance',
  'municipal-zoning-compliance',
  'Extracts city zoning classifications, short-term rental permits, mandatory inspection checklists, and penalty fine structures.',
  '[{"name":"jurisdictionCity","type":"string","description":"City or municipality name (e.g. San Francisco, Austin)","required":true},{"name":"zoningCode","type":"string","description":"Zoning code (e.g. R-1, C-3, Mixed-Use Commercial)","required":true},{"name":"shortTermRentalAllowed","type":"boolean","description":"Whether short-term rentals (Airbnb) are legal","required":true},{"name":"permitFeeUSD","type":"number","description":"Filing and application fee in USD","required":false},{"name":"mandatoryInspections","type":"array","description":"Required structural, fire, and health safety inspections","required":true},{"name":"maximumPenaltyFineUSD","type":"number","description":"Maximum violation penalty fine amount","required":false}]',
  'Extract municipal zoning classifications, short-term rental permit laws, mandatory compliance checklists, and penalty fine structures from official municipal codes. Adhere strictly to Fair Housing Act nondiscrimination principles.',
  1
),
(
  'schema_fda_drug_patent_004',
  'ws_global_refinery',
  'BioPharma FDA Trials & Patent Exclusivity Cliffs',
  'biopharma-fda-patent-cliffs',
  'Extracts active chemical ingredients, FDA 510(k)/NDA approvals, clinical trial phases, black-box warnings, and patent exclusivity expiration dates.',
  '[{"name":"drugBrandName","type":"string","description":"Commercial brand name of therapeutic drug","required":true},{"name":"activeCompound","type":"string","description":"Chemical or biologic active pharmaceutical ingredient (API)","required":true},{"name":"fdaApprovalStatus","type":"string","description":"APPROVED, FAST_TRACK, PHASE_III, or UNDER_REVIEW","required":true},{"name":"therapeuticIndication","type":"string","description":"Target disease or medical condition","required":true},{"name":"patentExclusivityExpiration","type":"string","description":"Date or year when patent cliff occurs (e.g. 2028-11)","required":true},{"name":"blackBoxWarnings","type":"array","description":"FDA safety warnings and contraindications","required":false}]',
  'Extract active pharmaceutical ingredients, FDA approval status, clinical trial phases, black box warnings, and patent exclusivity expiration dates from public FDA registries and ClinicalTrials.gov. For informational and research intelligence only; not clinical medical advice.',
  1
),
(
  'schema_sec_10k_risk_005',
  'ws_global_refinery',
  'SEC 10-K Disclosures & Risk Factor Intelligence',
  'sec-10k-risk-factors',
  'Extracts GAAP vs Non-GAAP operating metrics, total debt maturities, forward guidance statements, and highlighted corporate risk factors from SEC filings.',
  '[{"name":"tickerSymbol","type":"string","description":"Stock ticker symbol (e.g. NVDA, MSFT, AAPL)","required":true},{"name":"fiscalPeriod","type":"string","description":"e.g. FY2025, Q3-2026","required":true},{"name":"totalRevenueUSD","type":"number","description":"Total GAAP revenue in USD","required":true},{"name":"gaapOperatingMarginPercent","type":"number","description":"GAAP operating margin percentage","required":false},{"name":"totalDebtMaturityUSD","type":"number","description":"Total long-term debt maturing in USD","required":false},{"name":"criticalRiskFactors","type":"array","description":"Primary macroeconomic and technological risk factors","required":true},{"name":"forwardGuidanceSummary","type":"string","description":"Executive forward guidance summary","required":false}]',
  'Extract GAAP vs Non-GAAP operating metrics, total debt maturities, forward guidance statements, and highlighted corporate risk factors from official SEC EDGAR filings. For research intelligence only; does not constitute investment advice.',
  1
);
