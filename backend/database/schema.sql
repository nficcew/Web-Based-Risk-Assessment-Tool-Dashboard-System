-- ============================================================================
-- Risk Assessment Tool Database Schema
-- ISO/IEC 27001:2022 Compliance System
-- For XAMPP MySQL
-- Updated: May 2026 — Asset Category + Attribution Fields
-- ============================================================================

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
-- ASSETS TABLE (Updated — ISO/IEC 27001:2022 Annex A.5.9)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(20),
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('Information','Software','Physical','Services','People','Intangible') NOT NULL,
    value ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    classification ENUM('Public','Internal','Confidential','Restricted') DEFAULT 'Internal',
    status ENUM('Active', 'Inactive', 'Disposed') DEFAULT 'Active',
    owner VARCHAR(255) NOT NULL,
    custodian VARCHAR(255) NULL,
    location VARCHAR(255) NOT NULL,
    retention_period VARCHAR(100) NULL,
    disposal_method VARCHAR(255) NULL,
    review_date DATE NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_value (value),
    INDEX idx_asset_id (asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRIGGER: Auto-generate Asset ID
-- ============================================================================
DROP TRIGGER IF EXISTS generate_asset_id;

DELIMITER $$
CREATE TRIGGER generate_asset_id
BEFORE INSERT ON assets
FOR EACH ROW
BEGIN
    DECLARE prefix VARCHAR(5);
    DECLARE cat_count INT;
    SET prefix = CASE NEW.type
        WHEN 'Information' THEN 'INF'
        WHEN 'Software'    THEN 'SFW'
        WHEN 'Physical'    THEN 'PHY'
        WHEN 'Services'    THEN 'SVC'
        WHEN 'People'      THEN 'PPL'
        WHEN 'Intangible'  THEN 'INT'
        ELSE 'AST'
    END;
    SELECT COUNT(*) INTO cat_count FROM assets WHERE type = NEW.type;
    SET NEW.asset_id = CONCAT(prefix, '-', LPAD(cat_count + 1, 3, '0'));
END$$
DELIMITER ;

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
    current_control TEXT NULL,
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
    likelihood VARCHAR(50),
    impact VARCHAR(50),
    risk_score INT,
    asset_value DECIMAL(15, 2),
    exposure_factor DECIMAL(5, 2),
    aro DECIMAL(10, 2),
    sle DECIMAL(15, 2),
    ale DECIMAL(15, 2),
    vulnerability_score DECIMAL(5, 2),
    cost_of_control DECIMAL(15, 2),
    ale_before DECIMAL(15, 2),
    ale_after DECIMAL(15, 2),
    value_of_control DECIMAL(15, 2),
    control_effectiveness INT,
    residual_risk DECIMAL(10, 2),
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
-- AUDIT LOG TABLE
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
-- VIEWS
-- ============================================================================
CREATE OR REPLACE VIEW user_statistics AS
SELECT u.id, u.full_name, u.email, u.organization,
    COUNT(DISTINCT a.id) as total_assets,
    COUNT(DISTINCT t.id) as total_threats,
    COUNT(DISTINCT ra.id) as total_assessments
FROM users u
LEFT JOIN assets a ON u.id = a.user_id
LEFT JOIN threats t ON u.id = t.user_id
LEFT JOIN risk_assessments ra ON u.id = ra.user_id
GROUP BY u.id;

CREATE OR REPLACE VIEW risk_summary AS
SELECT u.id as user_id, u.full_name,
    COUNT(t.id) as total_risks,
    SUM(CASE WHEN t.risk_level = 'Critical' THEN 1 ELSE 0 END) as critical_risks,
    SUM(CASE WHEN t.risk_level = 'High' THEN 1 ELSE 0 END) as high_risks,
    SUM(CASE WHEN t.risk_level = 'Medium' THEN 1 ELSE 0 END) as medium_risks,
    SUM(CASE WHEN t.risk_level = 'Low' THEN 1 ELSE 0 END) as low_risks
FROM users u
LEFT JOIN threats t ON u.id = t.user_id
GROUP BY u.id;