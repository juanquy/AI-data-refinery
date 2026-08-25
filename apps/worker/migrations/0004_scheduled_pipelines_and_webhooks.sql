-- Migration: 0004_scheduled_pipelines_and_webhooks.sql
-- Adds scheduled automated pipelines, webhook subscriptions, and real-time usage metrics

CREATE TABLE IF NOT EXISTS scheduled_pipelines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'custom',
  frequency_hours INTEGER NOT NULL DEFAULT 12,
  custom_prompt TEXT,
  webhook_url TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  last_run_at DATETIME,
  next_run_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id TEXT PRIMARY KEY,
  webhook_url TEXT NOT NULL,
  event_types TEXT NOT NULL DEFAULT 'CRITICAL_DIFF',
  target_entities TEXT NOT NULL DEFAULT 'ALL',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_usage_metrics (
  id TEXT PRIMARY KEY,
  api_key_id TEXT,
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 200,
  latency_ms INTEGER NOT NULL DEFAULT 18,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial demo pipelines & usage data
INSERT OR IGNORE INTO scheduled_pipelines (id, name, target_url, domain, frequency_hours, status, last_run_at, next_run_at)
VALUES 
  ('pipe-stripe-releases', 'Stripe Node SDK Releases', 'https://github.com/stripe/stripe-node/releases', 'developer', 6, 'ACTIVE', datetime('now', '-2 hours'), datetime('now', '+4 hours')),
  ('pipe-datadog-pricing', 'DataDog Cloud Pricing Matrix', 'https://www.datadoghq.com/pricing/', 'pricing', 12, 'ACTIVE', datetime('now', '-5 hours'), datetime('now', '+7 hours')),
  ('pipe-sf-rental-permits', 'San Francisco Short-Term Rental Portal', 'https://sf.gov/short-term-rentals', 'regulatory', 24, 'ACTIVE', datetime('now', '-10 hours'), datetime('now', '+14 hours'));
