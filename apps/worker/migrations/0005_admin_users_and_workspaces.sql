-- Migration: 0005_admin_users_and_workspaces.sql
-- Core User & Admin RBAC Management for Phase 3 Multi-Tenancy

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'FOUNDER',
  passcode_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_user_id TEXT,
  plan TEXT NOT NULL DEFAULT 'ENTERPRISE',
  settings_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (workspace_id, user_id)
);

-- Seed Primary Master Founder Account
INSERT OR IGNORE INTO admin_users (id, email, display_name, role, passcode_hash, status)
VALUES (
  'usr_founder_001',
  'founder@freshbeats.ai',
  'Lead Founder',
  'FOUNDER',
  'Refinery#Founder2026!',
  'ACTIVE'
);

-- Seed Default Master Workspace
INSERT OR IGNORE INTO workspaces (id, name, owner_user_id, plan)
VALUES (
  'ws_global_refinery',
  'Primary Refinery Workspace',
  'usr_founder_001',
  'ENTERPRISE'
);
