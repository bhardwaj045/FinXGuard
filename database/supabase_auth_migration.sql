-- ============================================================================
-- FinXGuard - Supabase Authentication Database Migration
-- ============================================================================
-- Description:
--   Migrates application users schema to support Supabase Auth identities.
--   Preserves all existing PostgreSQL profile data, business records,
--   transactions, feedback, and authorization roles.
-- ============================================================================

-- 1. Ensure app_users table exists
CREATE TABLE IF NOT EXISTS app_users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(100),
    role VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    supabase_user_id VARCHAR(128)
);

-- 2. Add supabase_user_id column to existing app_users if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_users' AND column_name = 'supabase_user_id'
    ) THEN
        ALTER TABLE app_users ADD COLUMN supabase_user_id VARCHAR(128);
    END IF;
END $$;

-- 3. Create unique index for Supabase identity lookup
CREATE UNIQUE INDEX IF NOT EXISTS ux_app_users_supabase_user_id
ON app_users (supabase_user_id);

-- 4. Make password_hash nullable (Supabase owns credentials and password checks)
DO $$
BEGIN
    ALTER TABLE app_users ALTER COLUMN password_hash DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        -- Column may already be nullable
        NULL;
END $$;

-- 5. Admin Registration Concurrency Guard
CREATE TABLE IF NOT EXISTS admin_registration_guard (
    id INTEGER PRIMARY KEY
);

INSERT INTO admin_registration_guard (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Deprecation Notes & Cleanup for Legacy Auth Tables:
-- ============================================================================
-- The following legacy authentication tables are no longer used by the application:
--   - auth_sessions (replaced by Supabase JWT bearer tokens)
--   - registration_email_verifications (replaced by Supabase Auth email confirmation)
--
-- To archive or drop legacy tables in production after ensuring all active
-- client sessions have migrated to Supabase, run:
--
--   DROP TABLE IF EXISTS registration_email_verifications;
--   DROP TABLE IF EXISTS auth_sessions;
-- ============================================================================
