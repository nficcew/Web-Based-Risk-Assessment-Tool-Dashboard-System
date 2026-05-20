/**
 * Demo Data Seed Script — Meridian Financial Group
 * Populates the database with realistic sample data.
 * Run ONCE after the admin seed:
 *   node scripts/seedData.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');

const seed = async () => {
  console.log('🌱 Seeding demo data for Meridian Financial Group...\n');

  // Idempotency check — skip if demo users already exist
  const [existing] = await promisePool.query(
    "SELECT COUNT(*) AS cnt FROM users WHERE email LIKE '%@meridianfg.com'"
  );
  if (existing[0].cnt > 0) {
    console.log('⚠️  Demo data already exists. Skipping.');
    console.log('   To reseed: DELETE FROM users WHERE email LIKE "%@meridianfg.com"\n');
    process.exit(0);
  }

  const demoPassword = await bcrypt.hash('Demo@2024!', 12);

  // ─── USERS ────────────────────────────────────────────────────────────────
  console.log('👤  Creating users...');
  const usersToInsert = [
    ['Sarah Chen',     'sarah.chen@meridianfg.com', demoPassword, 'Meridian Financial Group', 'user'],
    ['James Okonkwo',  'j.okonkwo@meridianfg.com',  demoPassword, 'Meridian Financial Group', 'user'],
    ['Maria Santos',   'm.santos@meridianfg.com',    demoPassword, 'Meridian Financial Group', 'user'],
  ];

  const userIds = {};
  for (const [fullName, email, password, org, role] of usersToInsert) {
    const [r] = await promisePool.query(
      'INSERT INTO users (full_name, email, password, organization, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [fullName, email, password, org, role]
    );
    userIds[email] = r.insertId;
  }
  const sarah = userIds['sarah.chen@meridianfg.com'];
  const james = userIds['j.okonkwo@meridianfg.com'];
  const maria = userIds['m.santos@meridianfg.com'];

  // ─── ASSETS ───────────────────────────────────────────────────────────────
  console.log('🖥️   Creating assets...');
  // Columns: user_id, name, type, value, owner, location, description
  // type ENUM: 'System' | 'Data' | 'Hardware'
  // value ENUM: 'Low' | 'Medium' | 'High' | 'Critical'
  const assetsToInsert = [
    // Sarah — IT Security Manager
    [sarah, 'Core Banking Application',    'System',   'Critical', 'IT Security',      'Data Centre — Rack A12',      'Primary customer-facing banking platform. Handles all retail transactions, account management, and loan origination for 2.4 million customers.'],
    [sarah, 'Customer Data Warehouse',     'Data',     'Critical', 'IT Security',      'Data Centre — Rack B04',      'Central repository for 2.4 million customer records including PII, financial history, and KYC documentation. Subject to APRA CPS 234 compliance.'],
    [sarah, 'Payment Gateway Integration', 'System',   'Critical', 'Finance & IT',     'Cloud (AWS ap-southeast-1)',   'Third-party payment processing bridge to Visa / Mastercard networks. Processes ~$18.5M in daily transaction volume.'],
    [sarah, 'Email Security Gateway',      'System',   'High',     'IT Security',      'Data Centre — DMZ',           'Proofpoint-based gateway filtering inbound and outbound corporate email across 850 staff mailboxes. Enforces DLP and anti-phishing policies.'],
    [sarah, 'Web Application Firewall',    'System',   'High',     'IT Security',      'Cloud (Cloudflare)',           'Cloudflare WAF protecting all public-facing web properties including internet banking portal and corporate website.'],
    // James — Risk & Compliance Analyst
    [james, 'Employee Workstation Fleet',  'Hardware', 'Medium',   'IT Support',       'All Offices (HQ + 3 Branch)', '340 Dell Latitude 5540 laptops running Windows 11 Pro across HQ and three branch offices in Melbourne, Brisbane, and Perth.'],
    [james, 'HR Information System',       'System',   'High',     'Human Resources',  'Cloud (Azure AUS East)',       'Workday HRIS managing employee records, payroll, performance reviews, and onboarding/offboarding workflows for all permanent and contract staff.'],
    [james, 'Finance File Server',         'Data',     'High',     'Finance',          'Data Centre — Rack C02',      'Dedicated NAS (NetApp FAS2750) storing audited financial reports, board papers, contracts, and regulatory filings. Retention policy: 7 years.'],
    // Maria — Systems Administrator
    [maria, 'Core Network Router',         'Hardware', 'Critical', 'IT Infrastructure','Data Centre — Rack A01',      'Cisco ASR 1001-X handling inter-VLAN routing, WAN uplinks (MPLS + internet), and BGP peering. Backbone of the corporate network.'],
    [maria, 'Backup & DR Server',          'System',   'High',     'IT Infrastructure','DR Site — Canberra',          'Veeam Backup & Replication 12 infrastructure with 30-day retention, 3-2-1 strategy, and hourly replication to off-site DR facility.'],
    [maria, 'VPN Gateway',                 'Hardware', 'High',     'IT Infrastructure','Data Centre — DMZ',           'Palo Alto PA-3220 running GlobalProtect VPN, serving 420 remote and hybrid workers. Authenticates via Azure AD SAML SSO.'],
    [maria, 'Development & Staging Server','System',   'Medium',   'Engineering',      'Data Centre — Dev Rack',      'Shared Ubuntu 22.04 LTS server hosting staging environments and Jenkins CI/CD pipelines for three internal applications.'],
  ];

  const assetIds = [];
  for (const row of assetsToInsert) {
    const [r] = await promisePool.query(
      'INSERT INTO assets (user_id, name, type, value, owner, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      row
    );
    assetIds.push(r.insertId);
  }
  // Named indices for clarity
  const [
    aCoreBank, aDataWarehouse, aPayGateway, aEmailGw, aWAF,
    aWorkstations, aHRIS, aFinanceServer,
    aCoreRouter, aBackupDR, aVPN, aDevServer
  ] = assetIds;

  // ─── THREATS ──────────────────────────────────────────────────────────────
  console.log('⚠️   Creating threats...');
  // Columns: user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level
  const threatsToInsert = [
    [
      sarah, aCoreBank, 'Core Banking Application',
      'SQL Injection Attack',
      'An attacker could craft malicious SQL payloads through the loan application form to bypass authentication, enumerate customer records, or drop critical tables. Proof-of-concept exists on public exploit databases.',
      'Pre-compiled SQL queries not used in the loan origination module. Input validation relies on client-side JavaScript only, which can be bypassed.',
      'High', 'Critical', 'Critical'
    ],
    [
      sarah, aDataWarehouse, 'Customer Data Warehouse',
      'Unauthorised Bulk Data Exfiltration',
      'A compromised privileged database account or malicious insider could use undocumented ETL scripts to bulk-export the entire 2.4 million customer PII dataset to an external location, triggering APRA notification obligations.',
      'Three DBA accounts have unrestricted SELECT permissions on all tables. No data-loss-prevention controls are monitoring ETL pipeline outputs.',
      'Medium', 'Critical', 'Critical'
    ],
    [
      sarah, aPayGateway, 'Payment Gateway Integration',
      'TLS Downgrade / Man-in-the-Middle',
      'An attacker positioned on the network path between the banking platform and payment processor could downgrade the TLS session to an older protocol, enabling decryption of transaction data and potential manipulation of payment instructions.',
      'The legacy integration endpoint still accepts TLS 1.1. Certificate pinning is not enforced on the client-side library, and HSTS is not set.',
      'Low', 'Critical', 'High'
    ],
    [
      sarah, aEmailGw, 'Email Security Gateway',
      'Spear-Phishing — Executive Impersonation',
      'Highly targeted phishing emails impersonating the CFO or RBA officials could deceive finance staff into initiating fraudulent wire transfers (BEC fraud) or disclosing multi-factor authentication tokens.',
      "DMARC policy is set to 'p=none' (monitoring only — not enforced). Staff phishing simulation click-through rate is 18%, above the 8% industry benchmark.",
      'High', 'High', 'High'
    ],
    [
      sarah, aWAF, 'Web Application Firewall',
      'Layer-7 DDoS Flood Attack',
      'A volumetric HTTP/S flood targeting the internet banking portal could saturate the WAF\'s processing capacity, causing extended service unavailability during peak banking hours and triggering APRA breach notification.',
      'Current WAF rate-limit thresholds are set above recommended levels following a false-positive incident in Q3 2025. Automatic scrubbing-centre failover has not been re-enabled.',
      'Medium', 'High', 'High'
    ],
    [
      james, aWorkstations, 'Employee Workstation Fleet',
      'Ransomware via Malicious Email Attachment',
      'A phishing email with a weaponised Office macro could deploy ransomware on an endpoint. Without proper network segmentation, lateral movement via SMB could encrypt shared drives across all branch offices simultaneously.',
      'Antivirus definition updates lag by 48–72 hours on ~15% of the fleet due to a WSUS misconfiguration. USB auto-run is not disabled via Group Policy.',
      'High', 'High', 'High'
    ],
    [
      james, aHRIS, 'HR Information System',
      'Credential Stuffing — Workday Portal',
      'Automated credential stuffing using leaked email/password combinations from third-party breaches (Have I Been Pwned dataset) could grant attackers access to payroll records, bank account details, and employee personal information.',
      'The Workday tenant does not enforce MFA for manager-level SSO sessions. The account lockout threshold is set at 10 failed attempts — well above recommended 5.',
      'High', 'Medium', 'High'
    ],
    [
      james, aFinanceServer, 'Finance File Server',
      'Insider Threat — Sensitive Document Theft',
      'A disgruntled or departing finance employee with existing NAS access could copy board papers, merger documents, or unreleased earnings reports to personal USB storage or a personal cloud account before offboarding.',
      'No DLP solution is monitoring large-volume file transfers from the NAS. The offboarding checklist has a 48-hour lag before NAS access is revoked, creating a window of exposure.',
      'Low', 'High', 'Medium'
    ],
    [
      maria, aCoreRouter, 'Core Network Router',
      'SNMP Community String Exploitation',
      'SNMP v2c with the default "public" read/write community string is active on all branch routers. An attacker with network access could enumerate the full network topology, extract ARP tables, and inject malicious routing updates.',
      'SNMP v2c is still in use (should be v3 with authentication). Default community strings have not been rotated since the 2021 infrastructure refresh.',
      'Medium', 'High', 'High'
    ],
    [
      maria, aBackupDR, 'Backup & DR Server',
      'Ransomware Targeting Backup Infrastructure',
      'Modern ransomware operators (e.g., LockBit, BlackCat) specifically target backup systems in the first stage of an attack to eliminate recovery options, maximising ransom leverage and prolonging business disruption.',
      'The backup network VLAN is not fully isolated from the production environment. Administrative credentials for the Veeam console are shared with production VMware vCenter, creating a single point of credential compromise.',
      'Medium', 'Critical', 'Critical'
    ],
    [
      maria, aVPN, 'VPN Gateway',
      'Password Spray — Remote Access Portal',
      'Automated low-and-slow password spraying across the GlobalProtect login portal using common passwords (e.g., Season+Year patterns) could compromise remote access accounts, bypassing perimeter controls entirely.',
      'Geo-blocking is not enabled for VPN authentication. Impossible-travel detection is not configured. High-privilege accounts are not restricted to corporate IP ranges.',
      'High', 'High', 'High'
    ],
    [
      maria, aDevServer, 'Development & Staging Server',
      'Production Data Exposure in Dev Environment',
      'Developers periodically copy unmasked production database snapshots to the development server for realistic load testing, exposing live customer PII in an environment with weaker access controls and no audit logging.',
      'No formal data-masking or tokenisation process exists for production-to-dev data migration. The dev server lacks encryption at rest, and developer SSH keys are not rotated on staff departure.',
      'Medium', 'Medium', 'Medium'
    ],
    [
      sarah, aCoreBank, 'Core Banking Application',
      'Zero-Day in Banking Framework (Apache Struts)',
      'An undisclosed critical vulnerability in the underlying Java web framework could be weaponised before a vendor patch is available, potentially allowing unauthenticated remote code execution and full system compromise.',
      'The banking application depends on Apache Struts 2.5.33, which has reached extended support. No RASP (Runtime Application Self-Protection) agent is deployed to detect exploitation attempts.',
      'Low', 'Critical', 'High'
    ],
    [
      james, aHRIS, 'HR Information System',
      'Privilege Escalation via Role Misconfiguration',
      'Following the 2023 Workday platform upgrade, a role matrix audit was never completed. An internal assessment identified 47 users with unintended access to restricted payroll and executive compensation modules.',
      'Workday role permissions have not been reviewed since the 2023 version upgrade introduced new module-level permission objects. Segregation of duties controls are not enforced across conflicting financial roles.',
      'Medium', 'High', 'High'
    ],
    [
      sarah, aDataWarehouse, 'Customer Data Warehouse',
      'Unpatched Critical CVE — Database Engine',
      'CVE-2025-21497 (CVSS 9.8) in the current database engine version has a public proof-of-concept exploit enabling unauthenticated remote code execution via a crafted network packet on port 3306.',
      'The database engine is three minor versions behind the current release. Emergency patching requires a 4-hour maintenance window, which is only scheduled quarterly — the next window is 6 weeks away.',
      'High', 'Critical', 'Critical'
    ],
  ];

  for (const row of threatsToInsert) {
    await promisePool.query(
      'INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description, vulnerability, likelihood, impact, risk_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      row
    );
  }

  // ─── RISK ASSESSMENTS ─────────────────────────────────────────────────────
  console.log('📊  Creating risk assessments...');
  // Columns: user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score,
  //          asset_value, exposure_factor, aro, sle, ale, control_effectiveness, residual_risk,
  //          risk_level, calculation, notes

  const assessmentsToInsert = [
    // Qualitative — SQL Injection
    [
      sarah, 'qualitative', 'Core Banking Application', 'SQL Injection Attack',
      'High', 'Critical', 15,
      null, null, null, null, null, null, null,
      'Critical',
      JSON.stringify({ method: '5×5 ISO 27005 matrix', likelihoodScore: 4, impactScore: 5, matrixScore: 15 }),
      'CRITICAL — Immediate remediation required. Migrate all raw SQL queries in loan origination module to parameterised statements (PDO/PreparedStatement). Engage external penetration testing firm. Target remediation: 14 days.'
    ],
    // Quantitative — Data Exfiltration
    [
      sarah, 'quantitative', 'Customer Data Warehouse', 'Unauthorised Bulk Data Exfiltration',
      null, null, null,
      3800000.00, 0.65, 1.00, 2470000.00, 2470000.00, null, null,
      'Critical',
      JSON.stringify({ assetValue: 3800000, exposureFactor: 0.65, aro: 1, sle: 2470000, ale: 2470000, basis: 'APRA CPS 234 regulatory fines + breach notification costs + customer remediation at AUD $1.58/record avg' }),
      'ALE of AUD $2.47M based on APRA regulatory fines, breach notification obligations under Privacy Act 1988 (2022 amendments), and estimated customer remediation costs. Immediate DLP controls and privileged access review required.'
    ],
    // Hybrid — Ransomware on Backups
    [
      maria, 'hybrid', 'Backup & DR Server', 'Ransomware Targeting Backup Infrastructure',
      'Medium', 'Critical', 12,
      2100000.00, 0.80, 0.40, 1680000.00, 672000.00, 35, 436800.00,
      'Critical',
      JSON.stringify({ qualScore: 12, assetValue: 2100000, exposureFactor: 0.80, aro: 0.4, sle: 1680000, ale: 672000, controlEffectiveness: 35, residualRisk: 436800 }),
      'Estimated ALE of AUD $672K before controls, reducing to AUD $436K after current controls (35% effectiveness). Priority: full VLAN isolation of backup network and deployment of Veeam immutable backup targets (hardened repository). Target: 30 days.'
    ],
    // Qualitative — Password Spray on VPN
    [
      maria, 'qualitative', 'VPN Gateway', 'Password Spray — Remote Access Portal',
      'High', 'High', 12,
      null, null, null, null, null, null, null,
      'High',
      JSON.stringify({ method: '5×5 ISO 27005 matrix', likelihoodScore: 4, impactScore: 4, matrixScore: 12 }),
      'HIGH — Enable MFA for 100% of VPN users within 30 days. Configure geo-blocking for authentication requests outside Australia. Reduce account lockout threshold from 10 to 5 failed attempts. Restrict high-privilege accounts to approved IP ranges.'
    ],
    // Hybrid — Spear Phishing
    [
      sarah, 'hybrid', 'Email Security Gateway', 'Spear-Phishing — Executive Impersonation',
      'High', 'High', 12,
      950000.00, 0.45, 0.60, 427500.00, 256500.00, 25, 192375.00,
      'High',
      JSON.stringify({ qualScore: 12, assetValue: 950000, exposureFactor: 0.45, aro: 0.6, sle: 427500, ale: 256500, controlEffectiveness: 25, residualRisk: 192375 }),
      "Estimated ALE of AUD $256.5K based on average BEC fraud loss for organisations of similar size. Current controls (Proofpoint) provide ~25% reduction. Immediate actions: enforce DMARC 'p=reject', schedule mandatory phishing simulation training for all finance and C-suite staff."
    ],
    // Quantitative — Unpatched CVE
    [
      sarah, 'quantitative', 'Customer Data Warehouse', 'Unpatched Critical CVE — Database Engine',
      null, null, null,
      3800000.00, 0.90, 2.00, 3420000.00, 6840000.00, null, null,
      'Critical',
      JSON.stringify({ assetValue: 3800000, exposureFactor: 0.90, aro: 2, sle: 3420000, ale: 6840000, cve: 'CVE-2025-21497', cvss: 9.8, basis: 'High ARO due to active public exploit; full data warehouse compromise assumed at 90% EF' }),
      'CRITICAL — ARO set to 2 reflecting active exploitation in the wild. Emergency patching approved outside normal maintenance window. Engage DBA team and vendor support immediately. Target patch deployment: 72 hours.'
    ],
  ];

  for (const row of assessmentsToInsert) {
    await promisePool.query(
      `INSERT INTO risk_assessments
       (user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score,
        asset_value, exposure_factor, aro, sle, ale, control_effectiveness, residual_risk,
        risk_level, calculation, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row
    );
  }

  // ─── AUDIT LOG ────────────────────────────────────────────────────────────
  // Seed a few audit log entries so the admin audit log doesn't look empty
  const auditEntries = [
    [sarah, 'ASSET_CREATE', 'assets', null, 'Bulk asset import from IT asset register (Q1 2026 review)'],
    [james, 'THREAT_CREATE', 'threats', null, 'Annual threat landscape review — ISO 27001 clause 6.1.2'],
    [maria, 'ASSET_CREATE', 'assets', null, 'Infrastructure audit — added network and server assets'],
    [sarah, 'ASSESSMENT_CREATE', 'risk_assessments', null, 'Q1 2026 formal risk assessment commenced'],
    [james, 'USER_LOGIN', null, null, 'User logged in from 203.16.42.18 (Melbourne Office)'],
    [maria, 'USER_LOGIN', null, null, 'User logged in from 10.0.1.45 (VPN — Canberra DR site)'],
  ];

  for (const [userId, action, tableName, recordId, details] of auditEntries) {
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, tableName, recordId, details]
    );
  }

  console.log('\n✅  Demo data seeded successfully!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Company:  Meridian Financial Group');
  console.log('───────────────────────────────────────────────────────');
  console.log('  Demo Users (password: Demo@2024!):');
  console.log('    sarah.chen@meridianfg.com  — IT Security Manager');
  console.log('    j.okonkwo@meridianfg.com   — Risk & Compliance Analyst');
  console.log('    m.santos@meridianfg.com    — Systems Administrator');
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Assets:       ${assetsToInsert.length}`);
  console.log(`  Threats:      ${threatsToInsert.length}`);
  console.log(`  Assessments:  ${assessmentsToInsert.length}`);
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(0);
};

seed().catch(err => {
  console.error('\n❌  Seed error:', err.message);
  process.exit(1);
});
