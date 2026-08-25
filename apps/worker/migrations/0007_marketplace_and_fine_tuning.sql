-- Migration: 0007_marketplace_and_fine_tuning.sql
-- Creator Marketplace, Revenue Share, and Dataset Export Metadata

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY,
  creator_user_id TEXT NOT NULL DEFAULT 'usr_founder_001',
  creator_name TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL DEFAULT 'custom',
  description TEXT NOT NULL,
  schema_json TEXT NOT NULL,
  sample_output_json TEXT,
  price_per_query REAL NOT NULL DEFAULT 0.005,
  total_queries INTEGER NOT NULL DEFAULT 0,
  earnings_usd REAL NOT NULL DEFAULT 0.0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creator_payouts (
  id TEXT PRIMARY KEY,
  creator_user_id TEXT NOT NULL,
  amount_usd REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  payout_method TEXT DEFAULT 'STRIPE_CONNECT',
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Featured Community Marketplace Listings
INSERT OR IGNORE INTO marketplace_listings (id, creator_user_id, creator_name, title, slug, domain, description, schema_json, sample_output_json, price_per_query, total_queries, earnings_usd, is_featured)
VALUES
(
  'mkt_sec_10k_001',
  'usr_founder_001',
  'QuantResearch Labs',
  'SEC 10-K Financial Disclosures & Risk Factors',
  'sec-10k-disclosures',
  'financial',
  'Extracts GAAP vs Non-GAAP operating margins, debt maturities, forward guidance, and highlighted Risk Factors from SEC EDGAR filings.',
  '{"fields":[{"name":"ticker","type":"string","required":true},{"name":"fiscalYear","type":"string","required":true},{"name":"totalRevenueUSD","type":"number","required":true},{"name":"operatingMarginPercent","type":"number","required":true},{"name":"criticalRiskFactors","type":"array","required":true}]}',
  '{"ticker":"NVDA","fiscalYear":"FY2025","totalRevenueUSD":96300000000,"operatingMarginPercent":64.9,"criticalRiskFactors":["Export control regulations","Supply chain wafer allocation constraints"]}',
  0.01,
  1420,
  9.94,
  1
),
(
  'mkt_fda_drug_002',
  'usr_founder_001',
  'BioInformatics Pro',
  'FDA Drug & Biologics Approvals Tracker',
  'fda-drug-approvals',
  'medical',
  'Extracts active chemical ingredients, therapeutic indications, black box warnings, NDA approval numbers, and patent exclusivity dates.',
  '{"fields":[{"name":"drugBrandName","type":"string","required":true},{"name":"activeIngredient","type":"string","required":true},{"name":"approvalDate","type":"string","required":true},{"name":"blackBoxWarnings","type":"array","required":false},{"name":"patentExpirationDate","type":"string","required":true}]}',
  '{"drugBrandName":"Keytruda","activeIngredient":"Pembrolizumab","approvalDate":"2014-09-04","blackBoxWarnings":[],"patentExpirationDate":"2028-11-05"}',
  0.008,
  3105,
  17.38,
  1
),
(
  'mkt_ai_regulation_003',
  'usr_founder_001',
  'Policy & Tech Group',
  'EU AI Act & Global Regulatory Compliance Checklists',
  'global-ai-regulations',
  'regulatory',
  'Extracts AI risk tier classifications (Prohibited, High Risk, General Purpose), mandated watermarking obligations, and fine structures.',
  '{"fields":[{"name":"regulatoryBody","type":"string","required":true},{"name":"riskTier","type":"string","required":true},{"name":"complianceDeadline","type":"string","required":true},{"name":"mandatoryRequirements","type":"array","required":true},{"name":"maximumFineUSD","type":"number","required":false}]}',
  '{"regulatoryBody":"European Union (EU AI Act)","riskTier":"High-Risk Healthcare AI","complianceDeadline":"2026-08-02","mandatoryRequirements":["Conformity assessment audit","Quality management system logging"],"maximumFineUSD":38000000}',
  0.005,
  890,
  3.11,
  1
);
