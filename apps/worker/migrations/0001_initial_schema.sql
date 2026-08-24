-- Universal Data Refinery - D1 SQL Schema

CREATE TABLE IF NOT EXISTS refinery_sources (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL, -- 'developer', 'pricing', 'regulatory', 'custom'
    name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    cron_schedule TEXT DEFAULT '0 */6 * * *',
    enabled INTEGER DEFAULT 1,
    last_refined_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refined_entities (
    id TEXT PRIMARY KEY,
    source_id TEXT,
    domain TEXT NOT NULL,
    entity_key TEXT NOT NULL, -- e.g., 'stripe-node', 'datadog-pro', 'sf-short-term-rental'
    version_label TEXT,
    structured_data TEXT NOT NULL, -- JSON payload matching Zod schema
    summary TEXT,
    confidence_score REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(source_id) REFERENCES refinery_sources(id)
);

CREATE INDEX IF NOT EXISTS idx_entities_domain_key ON refined_entities(domain, entity_key);
CREATE INDEX IF NOT EXISTS idx_entities_created_at ON refined_entities(created_at DESC);

CREATE TABLE IF NOT EXISTS entity_diffs (
    id TEXT PRIMARY KEY,
    entity_key TEXT NOT NULL,
    domain TEXT NOT NULL,
    previous_entity_id TEXT,
    current_entity_id TEXT,
    severity TEXT NOT NULL, -- 'CRITICAL', 'MAJOR', 'MINOR', 'INFORMATIONAL'
    diff_summary TEXT NOT NULL,
    diff_data TEXT NOT NULL, -- JSON array of changes
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diffs_domain_key ON entity_diffs(domain, entity_key);
CREATE INDEX IF NOT EXISTS idx_diffs_detected_at ON entity_diffs(detected_at DESC);

CREATE TABLE IF NOT EXISTS refinery_jobs (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    source_url TEXT NOT NULL,
    status TEXT NOT NULL, -- 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'
    error_message TEXT,
    tokens_used INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);
