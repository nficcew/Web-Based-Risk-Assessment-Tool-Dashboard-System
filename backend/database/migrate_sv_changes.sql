-- ============================================================================
-- Migration: Supervisor Changes - May 2026
-- Run this in phpMyAdmin SQL tab or MySQL command line
-- ============================================================================

USE risk_assessment_db;

-- Change 2: Add current_control column to threats table
-- Describes what security controls are currently in place
ALTER TABLE threats
  ADD COLUMN current_control TEXT NULL AFTER vulnerability;

-- Change 5: Add new quantitative assessment fields to risk_assessments table
ALTER TABLE risk_assessments
  ADD COLUMN vulnerability_score DECIMAL(5,2) NULL AFTER ale,
  ADD COLUMN cost_of_control DECIMAL(15,2) NULL AFTER vulnerability_score,
  ADD COLUMN ale_before DECIMAL(15,2) NULL AFTER cost_of_control,
  ADD COLUMN ale_after DECIMAL(15,2) NULL AFTER ale_before,
  ADD COLUMN value_of_control DECIMAL(15,2) NULL AFTER ale_after;

-- ============================================================================
-- DONE. All changes applied successfully.
-- ============================================================================
