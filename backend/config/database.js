const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'risk_assessment_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

const initializeDatabase = async () => {
  try {
    await promisePool.query(`CREATE TABLE IF NOT EXISTS users (id int(11) NOT NULL AUTO_INCREMENT, full_name varchar(255) NOT NULL, email varchar(255) NOT NULL, password varchar(255) NOT NULL, organization varchar(255) NOT NULL DEFAULT '', role enum('admin','user') DEFAULT 'user', is_active tinyint(1) DEFAULT 1, created_at timestamp NOT NULL DEFAULT current_timestamp(), updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), last_login timestamp NULL DEFAULT NULL, reset_token varchar(64) DEFAULT NULL, reset_token_expires datetime DEFAULT NULL, PRIMARY KEY (id), UNIQUE KEY email (email)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS assets (id int(11) NOT NULL AUTO_INCREMENT, asset_id varchar(20) DEFAULT NULL, user_id int(11) NOT NULL, name varchar(255) NOT NULL, type enum('Information','Software','Physical','Services','People','Intangible') NOT NULL, value enum('Low','Medium','High','Critical') NOT NULL, owner varchar(255) NOT NULL, custodian varchar(255) DEFAULT NULL, classification enum('Public','Internal','Confidential','Restricted') DEFAULT 'Internal', status enum('Active','Inactive','Disposed') DEFAULT 'Active', retention_period varchar(100) DEFAULT NULL, disposal_method varchar(255) DEFAULT NULL, review_date date DEFAULT NULL, location varchar(255) NOT NULL, description text DEFAULT NULL, created_at timestamp NOT NULL DEFAULT current_timestamp(), updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (id), KEY idx_user_id (user_id), CONSTRAINT assets_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS threats (id int(11) NOT NULL AUTO_INCREMENT, user_id int(11) NOT NULL, asset_id int(11) NOT NULL, asset_name varchar(255) NOT NULL, threat_name varchar(255) NOT NULL, threat_description text NOT NULL, vulnerability text NOT NULL, current_control text DEFAULT NULL, proposed_control text DEFAULT NULL, likelihood enum('Very Low','Low','Medium','High','Very High') NOT NULL, impact enum('Very Low','Low','Medium','High','Critical') NOT NULL, risk_level varchar(50) NOT NULL, created_at timestamp NOT NULL DEFAULT current_timestamp(), updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (id), KEY idx_user_id (user_id), KEY idx_asset_id (asset_id), CONSTRAINT threats_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE, CONSTRAINT threats_ibfk_2 FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS risk_assessments (id int(11) NOT NULL AUTO_INCREMENT, user_id int(11) NOT NULL, assessment_type enum('qualitative','quantitative','hybrid') NOT NULL, asset_name varchar(255) NOT NULL, threat_name varchar(255) NOT NULL, likelihood varchar(50) DEFAULT NULL, impact varchar(50) DEFAULT NULL, risk_score int(11) DEFAULT NULL, asset_value decimal(15,2) DEFAULT NULL, exposure_factor decimal(5,2) DEFAULT NULL, aro decimal(10,2) DEFAULT NULL, sle decimal(15,2) DEFAULT NULL, ale decimal(15,2) DEFAULT NULL, control_effectiveness int(11) DEFAULT NULL, residual_risk decimal(10,2) DEFAULT NULL, vulnerability_score decimal(5,2) DEFAULT NULL, cost_of_control decimal(15,2) DEFAULT NULL, ale_before decimal(15,2) DEFAULT NULL, ale_after decimal(15,2) DEFAULT NULL, value_of_control decimal(15,2) DEFAULT NULL, risk_level varchar(50) NOT NULL, calculation text DEFAULT NULL, notes text DEFAULT NULL, created_at timestamp NOT NULL DEFAULT current_timestamp(), updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (id), KEY idx_user_id (user_id), CONSTRAINT risk_assessments_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS audit_log (id int(11) NOT NULL AUTO_INCREMENT, user_id int(11) DEFAULT NULL, action varchar(100) NOT NULL, table_name varchar(50) DEFAULT NULL, record_id int(11) DEFAULT NULL, details text DEFAULT NULL, ip_address varchar(45) DEFAULT NULL, user_agent text DEFAULT NULL, created_at timestamp NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (id), KEY idx_user_id (user_id), CONSTRAINT audit_log_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await promisePool.query(`DROP TRIGGER IF EXISTS generate_asset_id`);

    await promisePool.query(`CREATE TRIGGER generate_asset_id BEFORE INSERT ON assets FOR EACH ROW BEGIN DECLARE prefix VARCHAR(5); DECLARE cat_count INT; SET prefix = CASE NEW.type WHEN 'Information' THEN 'INF' WHEN 'Software' THEN 'SFW' WHEN 'Physical' THEN 'PHY' WHEN 'Services' THEN 'SVC' WHEN 'People' THEN 'PPL' WHEN 'Intangible' THEN 'INT' ELSE 'AST' END; SELECT COUNT(*) INTO cat_count FROM assets WHERE type = NEW.type; SET NEW.asset_id = CONCAT(prefix, '-', LPAD(cat_count + 1, 3, '0')); END`);

    await promisePool.query(`INSERT IGNORE INTO users (id, full_name, email, password, organization, role, is_active) VALUES (1, 'System Administrator', 'admin@riskassessment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Risk Assessment System', 'admin', 1)`);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};

const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    connection.release();
    await initializeDatabase();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    console.error('💡 Make sure MySQL is running!');
    return false;
  }
};

module.exports = { pool, promisePool, testConnection };