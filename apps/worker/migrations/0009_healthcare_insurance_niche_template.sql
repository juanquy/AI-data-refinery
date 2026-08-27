-- Migration: 0009_healthcare_insurance_niche_template.sql
-- Seed the Healthcare & Health Insurance Clinical Policy & Prior-Auth Template

INSERT OR REPLACE INTO custom_schemas (id, workspace_id, name, slug, description, fields_json, custom_system_prompt, is_public)
VALUES 
(
  'schema_health_insurance_prior_auth_006',
  'ws_global_refinery',
  'Health Plan Clinical Policies & Prior-Auth Criteria',
  'health-insurance-clinical-policy',
  'Extracts CPT procedure codes, mandatory conservative therapy weeks, required preceding treatments, drug formulary tiers, and immediate approval red flags for health plan claims AI agents.',
  '[{"name":"cptProcedureOrHcpcsCode","type":"string","description":"CPT or HCPCS code (e.g. 72148, 99214, J9355)","required":true},{"name":"procedureOrDrugName","type":"string","description":"Name of medical procedure, surgery, or specialty drug","required":true},{"name":"priorConservativeTherapyWeeks","type":"number","description":"Number of weeks of conservative therapy required (e.g. 6)","required":false},{"name":"requiredPrecedingTreatments","type":"array","description":"Mandatory prior treatments (e.g. Physical Therapy, NSAIDs)","required":true},{"name":"immediateApprovalRedFlags","type":"array","description":"Emergency conditions granting instant prior-auth bypass","required":false},{"name":"mandatoryPhysicianSpecialties","type":"array","description":"Approved ordering specialist doctor types","required":true},{"name":"drugFormularyTier","type":"string","description":"Tier 1 Generic, Tier 2 Preferred, Tier 3 Specialty, or Non-Formulary","required":false},{"name":"expeditedTurnaroundHours","type":"number","description":"CMS mandated turnaround deadline in hours (e.g. 72)","required":true}]',
  'Extract procedure CPT codes, mandatory prior conservative therapies, required clinical documentation, drug formulary tiers, and immediate approval red flags for health insurance prior authorization.',
  1
);
