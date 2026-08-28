-- Migration: 0010_pricing_plans_and_agent_audit.sql
-- Dynamic Pricing Configuration, Human Customer Governance, and Agent Audit Logs

-- 1. Dynamic Pricing Plans Table
CREATE TABLE IF NOT EXISTS pricing_plans (
    id TEXT PRIMARY KEY, -- 'PRO', 'ENTERPRISE', 'AGENT_MICRO'
    name TEXT NOT NULL,
    price_usd REAL NOT NULL,
    billing_interval TEXT NOT NULL DEFAULT 'month', -- 'month', 'query'
    included_queries INTEGER NOT NULL,
    stripe_price_id TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Pricing Configurations
INSERT OR REPLACE INTO pricing_plans (id, name, price_usd, billing_interval, included_queries, stripe_price_id, description)
VALUES 
('PRO', 'Data Refinery Pro', 49.00, 'month', 10000, 'price_1U7oWJ2aItc9d3fFL5KoOsLv', 'Full access for AI startups, agent developers, and production apps with 10k queries/mo.'),
('ENTERPRISE', 'Enterprise PaaS', 299.00, 'month', 100000, NULL, 'Dedicated private edge zones with 100k queries/mo and custom SLAs.'),
('AGENT_MICRO', 'Autonomous Agent Wallet', 0.005, 'query', 1, NULL, 'HTTP 402 micro-billing rate per query for autonomous agent fleets.');

-- 2. Agent Execution and Audit Logs
CREATE TABLE IF NOT EXISTS agent_audit_logs (
    id TEXT PRIMARY KEY,
    agent_token TEXT NOT NULL,
    agent_name TEXT,
    user_email TEXT,
    endpoint TEXT NOT NULL,
    entity_symbol TEXT,
    latency_ms INTEGER DEFAULT 16,
    status_code INTEGER DEFAULT 200,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_agent_token ON agent_audit_logs(agent_token);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON agent_audit_logs(created_at);

-- Seed initial audit log telemetry
INSERT OR IGNORE INTO agent_audit_logs (id, agent_token, agent_name, user_email, endpoint, entity_symbol, latency_ms, status_code, created_at)
VALUES 
('log_001', 'ref_agent_hermes_growth', 'Hermes-Growth-Bot', 'juanquy@freshbeats.ai', 'mcp:refinery_dev_breaking_changes', 'stripe-node', 14, 200, DATETIME('now', '-10 minutes')),
('log_002', 'ref_agent_prior_auth_88', 'Hospital-PriorAuth-Bot', 'lead_dr@healthcorp.com', 'mcp:refinery_custom_health_insurance_clinical_policy', 'UnitedHealthcare-PA-88', 18, 200, DATETIME('now', '-25 minutes')),
('log_003', 'rf_live_founder_master', 'Lead Founder Dev Session', 'founder@freshbeats.ai', 'rest:/api/v1/entities/developer/stripe-node/diff', 'stripe-node', 16, 200, DATETIME('now', '-1 hour')),
('log_004', 'ref_agent_zoning_parser', 'ZoningPermitAgent', 'developer@realestate.ai', 'mcp:refinery_custom_real_estate_zoning', 'Austin-Permit-Z9', 15, 200, DATETIME('now', '-2 hours'));
