# Backend Setup Guide - MySQL with XAMPP

## 📋 Complete Setup Instructions for Backend with User Management

This guide will help you set up the backend API with MySQL database using XAMPP.

---

## 🎯 What's New

Your Risk Assessment Tool now has:
- ✅ **Real User Registration & Login**
- ✅ **MySQL Database** (using XAMPP)
- ✅ **Role-Based Access Control** (Admin / User roles)
- ✅ **JWT Token Authentication**
- ✅ **Secure Password Hashing**
- ✅ **Data Persistence** (all data saved in database)
- ✅ **Multi-user Support**
- ✅ **Audit Logging**

---

## 📦 Prerequisites

Before starting, make sure you have:

1. **Node.js** (v16+) - Already installed
2. **XAMPP** - For MySQL database
3. **Web Browser** - Chrome, Firefox, etc.

---

## 🚀 Step-by-Step Installation

### STEP 1: Install XAMPP

1. **Download XAMPP**:
   - Go to: https://www.apachefriends.org/
   - Download for Windows
   - Install to: `C:\xampp`

2. **Start XAMPP**:
   - Open XAMPP Control Panel
   - Click **Start** next to **MySQL**
   - MySQL should turn green (running)
   - **Note**: You don't need Apache for backend-only

### STEP 2: Create Database

1. **Open phpMyAdmin**:
   - In browser, go to: `http://localhost/phpmyadmin`
   - Or click **Admin** next to MySQL in XAMPP

2. **Run Database Script**:
   - Click "SQL" tab at the top
   - Open file: `backend/database/schema.sql`
   - Copy ALL contents
   - Paste into the SQL window
   - Click **Go** button
   - You should see success messages

3. **Verify Database Created**:
   - Click "Databases" tab
   - You should see: `risk_assessment_db`
   - Click on it to see tables:
     - users
     - assets
     - threats
     - risk_assessments
     - audit_log

### STEP 3: Install Backend Dependencies

Open Command Prompt or Terminal:

```bash
# Navigate to backend folder
cd "c:\Users\hanep\Documents\kerja\web-based Risk Assessment Tool Dashboard System\backend"

# Install all packages
npm install
```

This installs:
- express (web server)
- mysql2 (database connection)
- bcryptjs (password hashing)
- jsonwebtoken (authentication tokens)
- cors (allow frontend to connect)
- dotenv (environment variables)

### STEP 4: Configure Environment

The `.env` file is already configured for XAMPP defaults:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=risk_assessment_db
DB_PORT=3306
JWT_SECRET=risk_assessment_secret_key_2024_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

**If your XAMPP has a MySQL password**, edit `.env` file:
```
DB_PASSWORD=your_password_here
```

### STEP 5: Start Backend Server

```bash
# Make sure you're in backend folder
cd backend

# Start server
npm start
```

**Expected Output**:
```
✅ MySQL Database connected successfully
📊 Database: risk_assessment_db

═══════════════════════════════════════════════════════
🚀 Risk Assessment API Server Running
═══════════════════════════════════════════════════════
📡 Server:    http://localhost:5000
🔗 API:       http://localhost:5000/api
💚 Health:    http://localhost:5000/api/health
...
```

### STEP 6: Test Backend API

**Option 1: Use Browser**
- Open: `http://localhost:5000/api/health`
- Should see: `{"success":true,"message":"Risk Assessment API is running"}`

**Option 2: Use Postman or Thunder Client**
- Test the endpoints listed below

---

## 🔐 Default User Accounts

The database comes with a default admin account:

**Admin Account**:
- Email: `admin@riskassessment.com`
- Password: `admin123`
- Role: Admin

**Test User Account**:
- Email: `john@example.com`
- Password: `admin123`
- Role: User

**⚠️ IMPORTANT**: Change the admin password after first login!

---

## 📡 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |

### Asset Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/assets` | Get all assets | Yes |
| GET | `/api/assets/:id` | Get single asset | Yes |
| POST | `/api/assets` | Create asset | Yes |
| PUT | `/api/assets/:id` | Update asset | Yes |
| DELETE | `/api/assets/:id` | Delete asset | Yes |
| GET | `/api/assets/stats` | Get statistics | Yes |

### Threat Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/threats` | Get all threats | Yes |
| POST | `/api/threats` | Create threat | Yes |
| PUT | `/api/threats/:id` | Update threat | Yes |
| DELETE | `/api/threats/:id` | Delete threat | Yes |
| GET | `/api/threats/stats` | Get statistics | Yes |

---

## 🧪 Testing the API

### Test Registration (Postman/Thunder Client)

**POST** `http://localhost:5000/api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "organization": "Test Company"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 3,
      "fullName": "Test User",
      "email": "test@example.com",
      "organization": "Test Company",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test Login

**POST** `http://localhost:5000/api/auth/login`

**Body** (JSON):
```json
{
  "email": "admin@riskassessment.com",
  "password": "admin123"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "fullName": "System Administrator",
      "email": "admin@riskassessment.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** - you'll need it for other requests!

### Test Protected Route

**GET** `http://localhost:5000/api/auth/me`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

---

## 🔧 Updating the Frontend

The frontend needs to be updated to use the backend API. Here's what changes:

### Before (Mock Data):
- Data stored in component state
- Lost on page refresh
- No real authentication
- Single user

### After (Real Backend):
- Data stored in MySQL database
- Persists across sessions
- Real JWT authentication
- Multiple users with roles

---

## 📂 Backend Folder Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── assetController.js   # Asset CRUD
│   └── threatController.js  # Threat CRUD
├── middleware/
│   └── auth.js              # JWT verification & RBAC
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── assetRoutes.js       # Asset endpoints
│   └── threatRoutes.js      # Threat endpoints
├── utils/
│   └── generateToken.js     # JWT token generator
├── database/
│   └── schema.sql           # Database schema
├── .env                     # Configuration
├── .env.example             # Config template
├── package.json             # Dependencies
└── server.js                # Main server file
```

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: Secure, expiring tokens (7 days)
3. **Role-Based Access**: Admin vs User permissions
4. **SQL Injection Protection**: Parameterized queries
5. **CORS**: Controlled cross-origin requests
6. **Audit Logging**: All actions tracked

---

## 🐛 Troubleshooting

### Error: "MySQL Connection Error"

**Solution**:
1. Check XAMPP MySQL is running (green in control panel)
2. Verify database exists: `risk_assessment_db`
3. Check `.env` file settings
4. Test in phpMyAdmin: `http://localhost/phpmyadmin`

### Error: "Database not found"

**Solution**:
1. Open phpMyAdmin
2. Run `schema.sql` script again
3. Refresh databases list

### Error: "Port 5000 already in use"

**Solution**:
Change port in `.env`:
```
PORT=5001
```

Then restart server.

### Error: "npm install" fails

**Solution**:
```bash
npm cache clean --force
npm install
```

### Backend won't start

**Solution**:
1. Check Node.js is installed: `node --version`
2. Make sure you're in `backend` folder
3. Check all dependencies installed
4. Look at error message for clues

---

## 📊 Database Tables Explained

### `users` Table
Stores user accounts with:
- Encrypted passwords
- Role (admin/user)
- Organization info
- Login history

### `assets` Table
Stores organizational assets with:
- Link to user who created it
- Asset details (name, type, value)
- Owner and location

### `threats` Table
Stores identified threats with:
- Link to asset and user
- Threat description
- Vulnerability details
- Auto-calculated risk level

### `risk_assessments` Table
Stores risk calculations with:
- Three assessment types
- All calculation inputs
- Results and formulas

### `audit_log` Table
Tracks all user actions for:
- Security auditing
- Compliance reporting
- Activity monitoring

---

## 🔄 Development vs Production

### Development (Current Setup)
- Uses simple JWT secret
- Detailed error messages
- CORS allows localhost
- No HTTPS required

### Production (Future)
- Strong JWT secret
- Generic error messages
- CORS allows specific domain
- HTTPS required
- Environment variables secure

---

## 📈 Next Steps

After backend is running:

1. ✅ **Test all API endpoints** (use Postman)
2. ✅ **Update frontend** to use real API
3. ✅ **Test registration flow**
4. ✅ **Test login flow**
5. ✅ **Test CRUD operations**
6. ✅ **Test role-based access**

---

## 💡 Quick Reference

**Start Backend**:
```bash
cd backend
npm start
```

**Start Frontend** (separate terminal):
```bash
npm run dev
```

**Access Points**:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- phpMyAdmin: `http://localhost/phpmyadmin`

**Stop Servers**:
- Press `Ctrl + C` in each terminal

---

## 📞 Support Checklist

If something doesn't work:

- [ ] XAMPP MySQL is running (green)
- [ ] Database created (`risk_assessment_db` exists)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend server running (port 5000)
- [ ] `.env` file configured correctly
- [ ] Can access health endpoint
- [ ] Frontend updated to use API

---

**Backend setup complete! Your Risk Assessment Tool now has real user management with MySQL database.** 🎉
