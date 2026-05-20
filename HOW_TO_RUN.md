# How to Run the Risk Assessment Tool

> **Important:** This system uses **Homebrew MySQL** (not XAMPP).  
> XAMPP is not required. All commands run in Terminal.

---

## Requirements

| Tool    | Version            | Install                          |
| ------- | ------------------ | -------------------------------- |
| Node.js | v18+               | [nodejs.org](https://nodejs.org) |
| MySQL   | v8+                | `brew install mysql`             |
| npm     | included with Node | —                                |

---

## Step 1 — Start MySQL

```bash
brew services start mysql
```

To check it is running:

```bash
brew services list
```

You should see `mysql` listed as **started**.

---

## Step 2 — Create the Database & Import Schema

Run the following two commands one at a time:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS risk_assessment_db;"
```

```bash
mysql -u root risk_assessment_db < backend/database/schema.sql
```

Both commands should complete with no error output.

---

## Step 3 — Install Dependencies

**Backend:**

```bash
cd backend
npm install
cd ..
```

**Frontend:**

```bash
npm install
```

---

## Step 4 — Seed the Database

This creates the admin account and demo data.

**Create the admin user:**

```bash
cd backend
node scripts/seed.js
```

**Add demo company data (Meridian Financial Group):**

```bash
node scripts/seedData.js
cd ..
```

You only need to run these once. Running them again will skip already-existing records.

---

## Step 5 — Start the Backend Server

Open a terminal window and run:

```bash
cd backend
node server.js
```

You should see:

```
Server running on port 5000
MySQL Connected
```

Leave this terminal open and running.

---

## Step 6 — Start the Frontend

Open a **second** terminal window and run:

```bash
npm run dev
```

You should see:

```
VITE ready in 141 ms
➜  Local:   http://localhost:5173/
```

---

## Step 7 — Open in Browser

Go to: **http://localhost:5173**

---

## Login Accounts

### Admin Account

| Field    | Value                                    |
| -------- | ---------------------------------------- |
| Email    | `admin@riskassessment.com`               |
| Password | `Admin@123`                              |
| Role     | Admin (can see all users & system stats) |

---

### Demo Accounts (pre-loaded data)

These accounts come with assets, threats, and risk assessments already loaded.

| Name          | Email                       | Password     |
| ------------- | --------------------------- | ------------ |
| Sarah Chen    | `sarah.chen@meridianfg.com` | `Demo@2024!` |
| James Okonkwo | `j.okonkwo@meridianfg.com`  | `Demo@2024!` |
| Maria Santos  | `m.santos@meridianfg.com`   | `Demo@2024!` |

---

### Your Own Account

You can register a new account at **http://localhost:5173/register**

---

## Stopping the Servers

Press **Ctrl + C** in each terminal window to stop the backend and frontend servers.

To stop MySQL:

```bash
brew services stop mysql
```

---

## Troubleshooting

**Port already in use (5000 or 5173):**

```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

Then start the servers again.

**MySQL connection refused:**

```bash
brew services restart mysql
```

**`node_modules` missing / install errors:**

```bash
# In the root folder
npm install

# In the backend folder
cd backend && npm install
```
