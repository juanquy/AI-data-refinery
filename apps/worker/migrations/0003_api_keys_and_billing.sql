-- API Keys and Billing Subscriptions Schema

CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key_value TEXT UNIQUE NOT NULL, -- e.g., 'rf_live_...' or 'rf_test_...'
    user_email TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL DEFAULT 'PRO', -- 'FREE', 'PRO', 'ENTERPRISE'
    monthly_quota INTEGER DEFAULT 10000,
    current_usage INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED', 'EXPIRED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_api_keys_value ON api_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys(user_email);

CREATE TABLE IF NOT EXISTS billing_logs (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    stripe_customer_id TEXT,
    payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
