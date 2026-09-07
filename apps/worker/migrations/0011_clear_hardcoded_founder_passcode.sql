-- Migration: 0011_clear_hardcoded_founder_passcode.sql
-- Neutralize legacy plaintext founder passcode seeded in 0005.
-- Founder authentication is now strictly enforced via Worker secret FOUNDER_PASSCODE or active Pro API Key.

UPDATE admin_users
SET passcode_hash = 'DISABLED_USE_FOUNDER_PASSCODE_SECRET'
WHERE passcode_hash = 'Refinery#Founder2026!'
   OR passcode_hash = 'founder'
   OR passcode_hash = 'refinery2026';
