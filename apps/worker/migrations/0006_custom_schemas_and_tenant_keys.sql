-- Migration: 0006_custom_schemas_and_tenant_keys.sql
-- Custom Visual Schema Builder & Enterprise Workspace Tables

CREATE TABLE IF NOT EXISTS custom_schemas (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL DEFAULT 'ws_global_refinery',
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  fields_json TEXT NOT NULL,
  custom_system_prompt TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_audit_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_resource TEXT,
  details_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Enterprise Custom Schemas
INSERT OR IGNORE INTO custom_schemas (id, workspace_id, name, slug, description, fields_json, custom_system_prompt, is_public)
VALUES 
(
  'schema_real_estate_001',
  'ws_global_refinery',
  'Real Estate & Zoning Permit Intelligence',
  'real-estate-zoning',
  'Extracts property zoning categories, building square footage, permit approval status, and construction costs.',
  '[{"name":"propertyAddress","type":"string","description":"Full street address of the property","required":true},{"name":"zoningClassification","type":"string","description":"Commercial, Residential, or Mixed-Use zoning code","required":true},{"name":"estimatedProjectCost","type":"number","description":"Estimated construction or permit cost in USD","required":false},{"name":"permitStatus","type":"string","description":"Status: APPROVED, PENDING, or DENIED","required":true},{"name":"keyViolationsOrNotes","type":"array","description":"List of zoning notes or compliance remarks","required":false}]',
  'Extract accurate property zoning classifications, permit numbers, approval dates, and estimated construction valuation.',
  1
),
(
  'schema_biotech_trials_002',
  'ws_global_refinery',
  'Biotech & Clinical Trial Protocols',
  'clinical-trials',
  'Extracts clinical trial phases, target molecular biomarkers, primary endpoints, and enrollment criteria.',
  '[{"name":"trialId","type":"string","description":"NCT Identifier or Protocol ID","required":true},{"name":"drugCandidate","type":"string","description":"Compound or therapeutic molecule name","required":true},{"name":"phase","type":"string","description":"Phase I, Phase II, Phase III, or Phase IV","required":true},{"name":"primaryEndpoints","type":"array","description":"Primary clinical outcome metrics","required":true},{"name":"patientEnrollmentTarget","type":"number","description":"Total target cohort sample size","required":false}]',
  'Extract verified clinical trial parameters, therapeutic targets, biomarker inclusion criteria, and trial phase.',
  1
);
