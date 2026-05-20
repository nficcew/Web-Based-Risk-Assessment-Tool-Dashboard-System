-- Seed threats + assessments for admin (user_id=1), and assets/threats/assessments for hanep (user_id=2)
-- Assets 13-17 already exist for user_id=1

-- ============================================================
-- THREATS for admin (user_id=1) referencing assets 13-17
-- ============================================================
INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level) VALUES
(1, 13, 'E-Commerce Web Platform', 'Cross-Site Scripting (XSS)', 'Stored XSS in the product review field could allow attackers to inject malicious scripts executed in other users'' browsers, stealing session cookies and hijacking accounts.', 'User-generated content is rendered without output encoding in the product review template. No Content Security Policy header is configured.', 'High', 'High', 'High'),
(1, 14, 'Customer Orders Database', 'Database Credential Leakage via Source Code', 'Hardcoded database connection strings found in a public GitHub repository could allow any attacker to connect directly to the production RDS instance and export all 2.1M customer records.', 'A developer accidentally pushed the .env file containing production DB credentials to a public GitHub repo in Jan 2024. Credentials were rotated but the commit history still contains them.', 'Medium', 'Critical', 'Critical'),
(1, 13, 'E-Commerce Web Platform', 'API Rate Limit Bypass — Account Takeover', 'The login API endpoint has no rate limiting or CAPTCHA. Automated credential stuffing attacks can test thousands of username/password combinations per minute.', 'No IP-based rate limiting on /api/auth/login. Account lockout activates only after 20 failed attempts — too high to prevent fast automated attacks.', 'High', 'High', 'High'),
(1, 15, 'Employee Laptops', 'Unencrypted Laptop — Physical Data Theft', 'A lost or stolen MacBook without FileVault enabled would expose locally cached customer data, business documents, and stored credentials to the finder or thief.', 'MDM compliance reports show FileVault is not enforced on 8 of 47 devices. These devices last checked in more than 30 days ago.', 'Low', 'High', 'Medium'),
(1, 16, 'Admin Control Panel', 'Broken Access Control — Privilege Escalation', 'A junior support agent retains admin-level Django permissions granted during a busy period. This account can process refunds above the authorised threshold and access financial reports.', 'No automated permission review process exists. Django admin role assignments are managed manually with no expiry enforcement or regular audit.', 'Medium', 'High', 'High'),
(1, 14, 'Customer Orders Database', 'SQL Injection via Admin Search Filter', 'The order search feature passes unsanitised user input into a raw SQL query, allowing an attacker to read or modify any database record.', 'Django ORM is bypassed in the order search to support complex sort logic; raw cursor.execute() is used without parameterised queries.', 'High', 'Critical', 'Critical');

-- ============================================================
-- ASSESSMENTS for admin (user_id=1)
-- ============================================================
INSERT INTO risk_assessments (user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score, risk_level, calculation, notes) VALUES
(1, 'qualitative', 'Customer Orders Database', 'Database Credential Leakage via Source Code', 'Medium', 'Critical', 14, 'Critical',
 '{"method":"5x5 ISO 27005 matrix","likelihoodScore":3,"impactScore":5,"matrixScore":14}',
 'CRITICAL — Immediate action required. Rotate all production DB credentials and AWS IAM keys. Enable GitHub secret scanning. Verify no secrets present in any branch history. Target remediation: 24 hours.');

INSERT INTO risk_assessments (user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score, asset_value, exposure_factor, aro, sle, ale, risk_level, calculation, notes) VALUES
(1, 'quantitative', 'E-Commerce Web Platform', 'API Rate Limit Bypass — Account Takeover', NULL, NULL, NULL, 950000, 0.40, 1.5, 380000, 570000, 'High',
 '{"assetValue":950000,"exposureFactor":0.40,"aro":1.5,"sle":380000,"ale":570000}',
 'Estimated ALE of AUD $570K based on average account takeover incident cost. Implement IP rate limiting (max 5 req/min) and CAPTCHA on login API. Target remediation: 7 days.');

INSERT INTO risk_assessments (user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score, risk_level, calculation, notes) VALUES
(1, 'qualitative', 'Admin Control Panel', 'Broken Access Control — Privilege Escalation', 'Medium', 'High', 10, 'High',
 '{"method":"5x5 ISO 27005 matrix","likelihoodScore":3,"impactScore":4,"matrixScore":10}',
 'HIGH — Conduct immediate permission audit across all staff with admin panel access. Implement quarterly access reviews. Enforce least-privilege via Django permission groups. Target: 14 days.');

-- ============================================================
-- ASSETS for hanep (user_id=2)
-- ============================================================
INSERT INTO assets (user_id, name, type, value, owner, location, description) VALUES
(2, 'E-Commerce Web Platform', 'System', 'Critical', 'Engineering', 'AWS ap-southeast-1', 'React + Node.js customer-facing e-commerce portal serving 180,000 monthly active users with integrated Stripe payment processing.'),
(2, 'Customer Orders Database', 'Data', 'Critical', 'IT Operations', 'AWS RDS ap-southeast-1', 'PostgreSQL 15 database storing 2.1M customer order records, payment tokens, and shipping addresses. PCI DSS scope.'),
(2, 'Employee Laptops', 'Hardware', 'Medium', 'IT Support', 'Head Office — Melbourne', '47 MacBook Pro M3 laptops issued to all permanent staff running macOS 14. Managed via Jamf MDM.'),
(2, 'Admin Control Panel', 'System', 'High', 'Engineering', 'AWS ap-southeast-1', 'Internal Django-based admin console for order management, refunds, and customer support. Accessible to 12 internal staff.'),
(2, 'Corporate Email (Google Workspace)', 'System', 'Medium', 'IT Operations', 'Cloud (Google)', '47 Google Workspace Business Standard seats handling all corporate email, calendar, and Drive collaboration.');

-- ============================================================
-- THREATS for hanep (user_id=2)  -- uses dynamic IDs via subquery
-- ============================================================
INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level)
SELECT 2, id, 'E-Commerce Web Platform', 'Cross-Site Scripting (XSS)',
  'Stored XSS in the product review field could allow attackers to inject malicious scripts executed in other users'' browsers, stealing session cookies and hijacking accounts.',
  'User-generated content is rendered without output encoding in the product review template. No Content Security Policy header is configured.',
  'High', 'High', 'High'
FROM assets WHERE user_id=2 AND name='E-Commerce Web Platform' LIMIT 1;

INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level)
SELECT 2, id, 'Customer Orders Database', 'Database Credential Leakage via Source Code',
  'Hardcoded database connection strings found in a public GitHub repository could allow any attacker to connect directly to the production RDS instance and export all 2.1M customer records.',
  'A developer accidentally pushed the .env file containing production DB credentials to a public GitHub repo in Jan 2024. Credentials were rotated but the commit history still contains them.',
  'Medium', 'Critical', 'Critical'
FROM assets WHERE user_id=2 AND name='Customer Orders Database' LIMIT 1;

INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level)
SELECT 2, id, 'E-Commerce Web Platform', 'API Rate Limit Bypass — Account Takeover',
  'The login API endpoint has no rate limiting or CAPTCHA. Automated credential stuffing attacks can test thousands of username/password combinations per minute.',
  'No IP-based rate limiting on /api/auth/login. Account lockout activates only after 20 failed attempts — too high to prevent fast automated attacks.',
  'High', 'High', 'High'
FROM assets WHERE user_id=2 AND name='E-Commerce Web Platform' LIMIT 1;

INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level)
SELECT 2, id, 'Employee Laptops', 'Unencrypted Laptop — Physical Data Theft',
  'A lost or stolen MacBook without FileVault enabled would expose locally cached customer data, business documents, and stored credentials to the finder or thief.',
  'MDM compliance reports show FileVault is not enforced on 8 of 47 devices. These devices last checked in more than 30 days ago.',
  'Low', 'High', 'Medium'
FROM assets WHERE user_id=2 AND name='Employee Laptops' LIMIT 1;

INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level)
SELECT 2, id, 'Admin Control Panel', 'Broken Access Control — Privilege Escalation',
  'A junior support agent retains admin-level Django permissions granted during a busy period. This account can process refunds above the authorised threshold and access financial reports.',
  'No automated permission review process exists. Django admin role assignments are managed manually with no expiry enforcement or regular audit.',
  'Medium', 'High', 'High'
FROM assets WHERE user_id=2 AND name='Admin Control Panel' LIMIT 1;

INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level)
SELECT 2, id, 'Customer Orders Database', 'SQL Injection via Admin Search Filter',
  'The order search feature passes unsanitised user input into a raw SQL query, allowing an attacker to read or modify any database record.',
  'Django ORM is bypassed in the order search to support complex sort logic; raw cursor.execute() is used without parameterised queries.',
  'High', 'Critical', 'Critical'
FROM assets WHERE user_id=2 AND name='Customer Orders Database' LIMIT 1;

-- ============================================================
-- ASSESSMENTS for hanep (user_id=2)
-- ============================================================
INSERT INTO risk_assessments (user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score, risk_level, calculation, notes) VALUES
(2, 'qualitative', 'Customer Orders Database', 'Database Credential Leakage via Source Code', 'Medium', 'Critical', 14, 'Critical',
 '{"method":"5x5 ISO 27005 matrix","likelihoodScore":3,"impactScore":5,"matrixScore":14}',
 'CRITICAL — Immediate action required. Rotate all production DB credentials and AWS IAM keys. Enable GitHub secret scanning. Verify no secrets present in any branch history. Target remediation: 24 hours.');

INSERT INTO risk_assessments (user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score, asset_value, exposure_factor, aro, sle, ale, risk_level, calculation, notes) VALUES
(2, 'quantitative', 'E-Commerce Web Platform', 'API Rate Limit Bypass — Account Takeover', NULL, NULL, NULL, 950000, 0.40, 1.5, 380000, 570000, 'High',
 '{"assetValue":950000,"exposureFactor":0.40,"aro":1.5,"sle":380000,"ale":570000}',
 'Estimated ALE of AUD $570K based on average account takeover incident cost. Implement IP rate limiting (max 5 req/min) and CAPTCHA on login API. Target remediation: 7 days.');

INSERT INTO risk_assessments (user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score, risk_level, calculation, notes) VALUES
(2, 'qualitative', 'Admin Control Panel', 'Broken Access Control — Privilege Escalation', 'Medium', 'High', 10, 'High',
 '{"method":"5x5 ISO 27005 matrix","likelihoodScore":3,"impactScore":4,"matrixScore":10}',
 'HIGH — Conduct immediate permission audit across all staff with admin panel access. Implement quarterly access reviews. Enforce least-privilege via Django permission groups. Target: 14 days.');
