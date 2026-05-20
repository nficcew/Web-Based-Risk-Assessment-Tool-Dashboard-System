-- ============================================================================
-- Migration: Add password reset columns to users table
-- Run this if you imported schema.sql BEFORE April 19, 2026
--
-- How to run:
--   Windows (XAMPP):  Open phpMyAdmin → select risk_assessment_db → SQL tab → paste and run
--   Mac/Linux:        mysql -u root risk_assessment_db < backend/database/migrate_add_reset_token.sql
-- ============================================================================

USE risk_assessment_db;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL;

SELECT 'Migration complete. reset_token columns added.' AS status;
