/**
 * Database Seed Script
 * Creates the default admin user with a properly hashed password.
 * Run this ONCE after setting up the database:
 *   node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');

const ADMIN_EMAIL = 'admin@riskassessment.com';
const ADMIN_PASSWORD = 'Admin@123';

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Check if admin already exists
    const [existing] = await promisePool.query(
      'SELECT id FROM users WHERE email = ?',
      [ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      console.log(`⚠️  Admin user (${ADMIN_EMAIL}) already exists. Skipping.`);
      process.exit(0);
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Insert admin user
    const [result] = await promisePool.query(
      'INSERT INTO users (full_name, email, password, organization, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      ['System Administrator', ADMIN_EMAIL, hashedPassword, 'Risk Assessment System', 'admin', true]
    );

    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('═══════════════════════════════════════');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
