# Update Log — Risk Assessment Tool Dashboard

**Last Updated: April 19, 2026**

---

## Summary

Below is a full list of everything that was added, fixed, or improved in this project. All changes were made to make the system fully functional, connected to a real database, and ready to use.

---

## New Features

### 1. Forgot Password / Reset Password

- The **"Forgot password?"** link on the login page now works
- User enters their email → system generates a secure reset link
- The reset link is shown on screen (can be copied or opened directly)
- User sets a new password on the reset page
- Reset links expire after **1 hour** for security
- All reset activity is recorded in the audit log

### 2. Dashboard — Empty State / Onboarding

- When a new user logs in with no data, the dashboard now shows a **welcome screen** instead of a blank page with all zeros
- The welcome screen guides the user through 3 steps: Add Assets → Add Threats → Run Assessment
- Each step card is clickable and takes the user directly to the right page

### 3. Dashboard — Real Charts

- The **"Threats by Asset"** bar chart now shows real data from the database (previously it showed fake hardcoded numbers)
- The **"Risk Distribution"** pie chart also uses real threat data
- Recent threats table now loads from the database and shows the 5 most recent entries

### 4. Demo Data (Fake Company Data)

- Added realistic fake data for a fictional company called **Meridian Financial Group**
- Includes 3 demo user accounts, 12 assets, 15 threats, and 6 risk assessments
- Also added demo data for the admin account and any registered user (based on a fintech e-commerce company scenario)

### 5. Forgot Password Page (`/forgot-password`)

- Brand new page — did not exist before
- Clean UI matching the rest of the login/register design

### 6. Reset Password Page (`/reset-password`)

- Brand new page — did not exist before
- Shows success/error states with clear messages
- Validates passwords match and meet minimum length

---

## Bug Fixes

### 7. Dashboard Showing All Zeros

- Fixed: dashboard stats (total assets, threats, risk levels) were not loading for regular users
- Root cause: demo data was only assigned to specific accounts, not the logged-in user's account

### 8. Cards Touching / No Gap Between Stat Cards

- Fixed: the stat cards on the Asset Management, Threat Management, and Reports pages had no visible spacing between them
- Added proper gaps and a subtle border so each card is clearly separated

### 9. Frontend Loading / Hanging

- Fixed: the Vite development server (frontend) had a hung process that caused the page to not load
- Server was restarted and verified working

### 10. Bar Chart Using Fake Data

- Fixed: the "Risks by Category" bar chart on the dashboard was hardcoded with made-up numbers
- Replaced with real data computed from the user's actual threats

---

## Backend / Database Changes

### 11. Forgot/Reset Password API Endpoints

- Added `POST /api/auth/forgot-password` — generates reset token, saves to database
- Added `POST /api/auth/reset-password` — validates token, updates password, clears token
- Added `reset_token` and `reset_token_expires` columns to the users table in the database

### 12. Password Library Replaced

- The original password hashing library (`argon2`) was incompatible with the current version of Node.js on this machine
- Replaced with `bcryptjs` which works correctly — all login and registration still works the same

### 13. All API Routes Connected

- Asset Management — create, edit, delete, search all connected to database
- Threat Management — same as above
- Risk Assessment — save and view assessment history connected to database
- Reports — fetches real threats and assessments, exports CSV
- Dashboard — all stat cards pull from real database queries

### 14. Admin Dashboard

- Admin accounts see extra stats: total users, all system assets, all threats across all users
- Regular users only see their own data

---

## Design / UI Improvements

### 15. Spacing & Layout

- Increased padding on the main content area so pages feel less cramped
- Cards have more padding and rounded corners
- Grid gaps between cards increased so the layout breathes more

### 16. Loading Screen

- Added a loading screen that shows while the app is starting up (instead of a blank white page)

---

## Login Accounts

| Name                 | Email                     | Password   | Role  |
| -------------------- | ------------------------- | ---------- | ----- |
| System Administrator | admin@riskassessment.com  | Admin@123  | Admin |
| Sarah Chen (Demo)    | sarah.chen@meridianfg.com | Demo@2024! | User  |
| James Okonkwo (Demo) | j.okonkwo@meridianfg.com  | Demo@2024! | User  |
| Maria Santos (Demo)  | m.santos@meridianfg.com   | Demo@2024! | User  |

---

## Pages in the System

| Page                        | URL                | Description                                |
| --------------------------- | ------------------ | ------------------------------------------ |
| Login                       | `/login`           | Sign in to the system                      |
| Register                    | `/register`        | Create a new account                       |
| **Forgot Password** _(new)_ | `/forgot-password` | Request a password reset link              |
| **Reset Password** _(new)_  | `/reset-password`  | Set a new password using the reset link    |
| Dashboard                   | `/dashboard`       | Overview of risk posture with charts       |
| Asset Management            | `/assets`          | Add, edit, delete assets                   |
| Threat Management           | `/threats`         | Add, edit, delete threats                  |
| Risk Assessment             | `/assessment`      | Run qualitative or quantitative assessment |
| Reports                     | `/reports`         | View risk register, export CSV             |
| User Management             | `/users`           | Admin only — manage all users              |
| Profile                     | `/profile`         | Edit your name, email, password            |
