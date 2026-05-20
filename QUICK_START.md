# Quick Start Guide

## Get Your Risk Assessment Dashboard Running in 5 Minutes

### Step 1: Install Dependencies

Open your terminal and navigate to the project folder:

```bash
cd "web-based Risk Assessment Tool Dashboard System"
npm install
```

This will install:
- React 18.2.0
- React Router DOM 6.20.0
- Recharts 2.10.0 (for charts)
- Lucide React 0.294.0 (for icons)
- Vite 5.0 (build tool)

### Step 2: Start Development Server

```bash
npm run dev
```

You should see output like:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

You'll see the **Login Page**.

### Step 4: Log In (Mock Authentication)

- Enter any email (e.g., `admin@example.com`)
- Enter any password (e.g., `password123`)
- Click **Sign In**

You'll be redirected to the **Dashboard**.

---

## Exploring the Application

### 1. Dashboard
- View risk statistics and charts
- See heat map visualization
- Check recent risks

### 2. Asset Management
- Click **"+ Add New Asset"**
- Fill in the form:
  - Asset Name: e.g., "Web Server"
  - Type: System/Data/Hardware
  - Value: Low/Medium/High/Critical
  - Owner: e.g., "IT Department"
  - Location: e.g., "Data Center"
- Click **"Add Asset"**

### 3. Threats & Vulnerabilities
- Click **"+ Add New Threat"**
- Select an asset
- Enter threat details
- Set likelihood and impact
- Watch the risk level calculate automatically
- Click **"Add Threat"**

### 4. Risk Assessment
- Click on one of three methods:
  - **Qualitative**: Quick assessment (Low/Medium/High)
  - **Quantitative**: Financial calculation (ALE)
  - **Hybrid**: Combined approach
- Fill in the form
- Click **"Calculate Risk"**
- View the detailed result

### 5. Reports
- Review the risk register
- See top 5 highest risks
- Read executive summary
- Click **"Generate PDF"** (mock feature)

---

## Building for Production

When you're ready to deploy:

```bash
npm run build
```

This creates a `dist` folder with optimized files.

To preview the production build:

```bash
npm run preview
```

---

## Project Structure Overview

```
src/
├── components/
│   └── Layout.jsx         # Main layout with sidebar
├── pages/
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # Registration page
│   ├── Dashboard.jsx      # Main dashboard
│   ├── AssetManagement.jsx    # Asset CRUD
│   ├── ThreatManagement.jsx   # Threat tracking
│   ├── RiskAssessment.jsx     # Risk calculator
│   └── Reports.jsx        # Risk reports
├── App.jsx                # Main app with routing
├── main.jsx              # Entry point
└── index.css             # Global styles
```

---

## Key Features at a Glance

✅ **Authentication** - Login & Register pages
✅ **Dashboard** - Statistics, charts, heat map
✅ **Asset Management** - CRUD operations
✅ **Threat Management** - Track threats & vulnerabilities
✅ **Risk Assessment** - 3 calculation methods
✅ **Reports** - Risk register & executive summary

---

## Common Issues & Solutions

### Issue: Port 5173 already in use
**Solution**: Use a different port
```bash
npm run dev -- --port 3000
```

### Issue: Blank page after npm run dev
**Solution**:
1. Check browser console for errors
2. Clear browser cache
3. Try: `rm -rf node_modules && npm install`

### Issue: Charts not displaying
**Solution**: Ensure Recharts is installed
```bash
npm install recharts
```

---

## Next Steps

1. **Customize Data**: Edit the mock data in component files
2. **Add Backend**: Integrate with your API
3. **Database**: Connect to PostgreSQL/MongoDB
4. **Authentication**: Implement JWT or OAuth
5. **PDF Export**: Add real PDF generation (jsPDF, html2pdf)

---

## Need Help?

- Read the full [README.md](README.md)
- Check [DESIGN_DOCUMENTATION.md](DESIGN_DOCUMENTATION.md)
- Review component files for inline comments

---

**Happy Risk Assessing! 🛡️**
