-- ============================================================================
-- Risk Assessment Tool Database Schema
-- ISO/IEC 27001:2022 Compliance System
-- For XAMPP MySQL
-- ============================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS risk_assessment_db;
USE risk_assessment_db;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    reset_token VARCHAR(64) NULL,
    reset_token_expires DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('System', 'Data', 'Hardware') NOT NULL,
    value ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    owner VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_value (value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- THREATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS threats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    threat_name VARCHAR(255) NOT NULL,
    threat_description TEXT NOT NULL,
    vulnerability TEXT NOT NULL,
    likelihood ENUM('Very Low', 'Low', 'Medium', 'High', 'Very High') NOT NULL,
    impact ENUM('Very Low', 'Low', 'Medium', 'High', 'Critical') NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_asset_id (asset_id),
    INDEX idx_risk_level (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RISK ASSESSMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    assessment_type ENUM('qualitative', 'quantitative', 'hybrid') NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    threat_name VARCHAR(255) NOT NULL,

    -- Qualitative fields
    likelihood VARCHAR(50),
    impact VARCHAR(50),
    risk_score INT,

    -- Quantitative fields
    asset_value DECIMAL(15, 2),
    exposure_factor DECIMAL(5, 2),
    aro DECIMAL(10, 2),
    sle DECIMAL(15, 2),
    ale DECIMAL(15, 2),

    -- Hybrid fields
    control_effectiveness INT,
    residual_risk DECIMAL(10, 2),

    -- Common fields
    risk_level VARCHAR(50) NOT NULL,
    calculation TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_assessment_type (assessment_type),
    INDEX idx_risk_level (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUDIT LOG TABLE (for tracking user actions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DEFAULT ADMIN USER
-- ============================================================================
-- The admin user must be created via the seed script, NOT hardcoded here,
-- because the application uses Argon2id password hashing.
--
-- After running this schema, run the seed script once:
--   cd backend && node scripts/seed.js
--
-- Default credentials created by the seed script:
--   Email:    admin@riskassessment.com
--   Password: Admin@123  (change after first login!)
-- ============================================================================

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View: User Statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT
    u.id,
    u.full_name,
    u.email,
    u.organization,
    COUNT(DISTINCT a.id) as total_assets,
    COUNT(DISTINCT t.id) as total_threats,
    COUNT(DISTINCT ra.id) as total_assessments
FROM users u
LEFT JOIN assets a ON u.id = a.user_id
LEFT JOIN threats t ON u.id = t.user_id
LEFT JOIN risk_assessments ra ON u.id = ra.user_id
GROUP BY u.id;

-- View: Risk Summary by User
CREATE OR REPLACE VIEW risk_summary AS
SELECT
    u.id as user_id,
    u.full_name,
    COUNT(t.id) as total_risks,
    SUM(CASE WHEN t.risk_level = 'Critical' THEN 1 ELSE 0 END) as critical_risks,
    SUM(CASE WHEN t.risk_level = 'High' THEN 1 ELSE 0 END) as high_risks,
    SUM(CASE WHEN t.risk_level = 'Medium' THEN 1 ELSE 0 END) as medium_risks,
    SUM(CASE WHEN t.risk_level = 'Low' THEN 1 ELSE 0 END) as low_risks
FROM users u
LEFT JOIN threats t ON u.id = t.user_id
GROUP BY u.id;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Already created in table definitions above

-- ============================================================================
-- DATABASE SCHEMA COMPLETE
-- ============================================================================

-- To use this:
-- 1. Start XAMPP and run MySQL
-- 2. Open phpMyAdmin (http://localhost/phpmyadmin)
-- 3. Click "SQL" tab
-- 4. Copy and paste this entire file
-- 5. Click "Go" to execute
--
-- Or use command line:
-- mysql -u root -p < schema.sql
