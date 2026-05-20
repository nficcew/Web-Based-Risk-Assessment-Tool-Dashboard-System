================================================================================
                    BACKEND API - QUICK REFERENCE
================================================================================

This is the backend API server for the Risk Assessment Tool.

QUICK START:
------------
1. Install XAMPP and start MySQL
2. Create database: run database/schema.sql in phpMyAdmin
3. npm install
4. npm start

Server will run on: http://localhost:5000

CONFIGURATION:
--------------
Edit .env file to change settings:
  - PORT (default: 5000)
  - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
  - JWT_SECRET
  - FRONTEND_URL

DATABASE:
---------
Database Name: risk_assessment_db
Tables:
  - users (user accounts)
  - assets (organizational assets)
  - threats (identified threats)
  - risk_assessments (risk calculations)
  - audit_log (activity tracking)

API ENDPOINTS:
--------------
All endpoints: http://localhost:5000/api/...

Auth (public):
  POST /auth/register
  POST /auth/login

Auth (protected):
  GET  /auth/me
  PUT  /auth/profile
  PUT  /auth/change-password

Assets (protected):
  GET    /assets
  POST   /assets
  GET    /assets/:id
  PUT    /assets/:id
  DELETE /assets/:id
  GET    /assets/stats

Threats (protected):
  GET    /threats
  POST   /threats
  PUT    /threats/:id
  DELETE /threats/:id
  GET    /threats/stats

TESTING:
--------
Health check: http://localhost:5000/api/health

Test with:
  - Postman
  - Thunder Client
  - Curl
  - Frontend application

DEFAULT ACCOUNTS:
-----------------
Admin: admin@riskassessment.com / admin123
User:  john@example.com / admin123

FOLDER STRUCTURE:
-----------------
config/     - Database configuration
controllers/- Business logic
middleware/ - Authentication & authorization
routes/     - API endpoints
utils/      - Helper functions
database/   - SQL schema

SECURITY:
---------
- Passwords hashed with bcrypt
- JWT token authentication
- Role-based access control
- SQL injection protection
- CORS enabled

TROUBLESHOOTING:
----------------
Can't connect to MySQL?
  - Start XAMPP MySQL service
  - Check database exists
  - Verify .env settings

Port already in use?
  - Change PORT in .env
  - Kill process on port 5000

Dependencies not installing?
  - Delete node_modules
  - Run: npm cache clean --force
  - Run: npm install

================================================================================
