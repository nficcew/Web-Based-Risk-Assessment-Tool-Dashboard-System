# Page-by-Page Visual Preview

This document provides a visual description of each page in the Risk Assessment Tool Dashboard.

---

## 1. Login Page

### Visual Layout

```
╔══════════════════════════════════════════════════════════════╗
║                  [Gradient Background]                        ║
║                                                               ║
║              ┌─────────────────────────────┐                 ║
║              │                             │                 ║
║              │      ┌─────────────┐       │                 ║
║              │      │   🛡️ Shield  │       │ (80px circle)  ║
║              │      └─────────────┘       │                 ║
║              │                             │                 ║
║              │  Risk Assessment Tool       │                 ║
║              │  ISO/IEC 27001:2022        │                 ║
║              │                             │                 ║
║              │  📧 [Email Address____]     │                 ║
║              │                             │                 ║
║              │  🔒 [Password_______] 👁    │                 ║
║              │                             │                 ║
║              │  ☑ Remember me  Forgot?     │                 ║
║              │                             │                 ║
║              │  [     Sign In     ]        │ (Blue button)  ║
║              │                             │                 ║
║              │  Don't have account?        │                 ║
║              │  Register here              │                 ║
║              │                             │                 ║
║              │  🛡️ Secure authentication   │                 ║
║              └─────────────────────────────┘                 ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝
```

**Color Scheme**:
- Background: Gradient (Dark Blue → Light Blue)
- Card: White with shadow
- Primary Button: Blue (#4a90e2)
- Text: Dark gray

---

## 2. Register Page

### Visual Layout

```
╔══════════════════════════════════════════════════════════════╗
║                  [Gradient Background]                        ║
║                                                               ║
║              ┌─────────────────────────────┐                 ║
║              │      🛡️ Shield Icon          │                 ║
║              │  Create Account             │                 ║
║              │  Get started with risk...   │                 ║
║              │                             │                 ║
║              │  👤 [Full Name_______]       │                 ║
║              │  📧 [Email__________]        │                 ║
║              │  🏢 [Organization____]       │                 ║
║              │  🔒 [Password_______] 👁     │                 ║
║              │  🔒 [Confirm Pass___] 👁     │                 ║
║              │                             │                 ║
║              │  ☑ I agree to Terms...      │                 ║
║              │                             │                 ║
║              │  [  Create Account  ]       │                 ║
║              │                             │                 ║
║              │  Already have account?      │                 ║
║              │  Sign in here              │                 ║
║              └─────────────────────────────┘                 ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 3. Dashboard (Main Overview)

### Visual Layout

```
╔══════════════════════════════════════════════════════════════════════════╗
║ [≡] ISO/IEC 27001:2022 Compliance                       👤 Admin User   ║
╠══════════════════════════════════════════════════════════════════════════╣
║ [Sidebar]  Risk Assessment Dashboard                                     ║
║           Real-time overview of your cybersecurity risk posture          ║
║ 📊 Dashboard                                                             ║
║ 💾 Assets  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐║
║ ⚠️  Threats │ 💾          │ │ ⚠️          │ │ 📈          │ │ 🛡️      │║
║ 🧮 Assessment│  48        │ │  50        │ │  67/100    │ │  78%   │║
║ 📄 Reports  │Total Assets│ │Total Risks │ │Risk Score  │ │Compliance│║
║            │ +4 this mo  │ │+3 unresolved│ │Moderate    │ │ISO 27001│║
║            └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘║
║                                                                          ║
║  ┌──────────────────────────────┐ ┌──────────────────────────────┐    ║
║  │ Risk Distribution            │ │ Risks by Category            │    ║
║  │                              │ │                              │    ║
║  │     [Pie Chart]              │ │    [Stacked Bar Chart]       │    ║
║  │  Critical: 3                 │ │  Technical [▓▓▓▓▓▓▓▓▓▓▓]     │    ║
║  │  High: 8                     │ │  Operational [▓▓▓▓▓▓]        │    ║
║  │  Medium: 15                  │ │  Physical [▓▓▓▓▓]            │    ║
║  │  Low: 24                     │ │  Human [▓▓▓▓]                │    ║
║  └──────────────────────────────┘ └──────────────────────────────┘    ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ Risk Heat Map - Likelihood × Impact                            │   ║
║  │                                                                 │   ║
║  │         Very Low   Low    Medium   High    Very High           │   ║
║  │ V.High    [M]     [M]     [H]      [C]      [C]               │   ║
║  │ High      [L]     [M]     [M]      [H]      [C]               │   ║
║  │ Medium    [L]     [L]     [M]      [M]      [H]               │   ║
║  │ Low       [L]     [L]     [L]      [M]      [M]               │   ║
║  │ V.Low     [L]     [L]     [L]      [L]      [M]               │   ║
║  │                                                                 │   ║
║  │ Legend: [L] Low  [M] Medium  [H] High  [C] Critical           │   ║
║  └────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ Recent Risk Identifications                                     │   ║
║  ├──────────┬──────────┬────────────┬──────────┬──────────────────┤   ║
║  │Risk Name │Severity  │Asset       │Date      │Action            │   ║
║  ├──────────┼──────────┼────────────┼──────────┼──────────────────┤   ║
║  │SQL Inject│[HIGH]    │Web App     │2024-01-03│[View Details]    │   ║
║  │Weak Pass │[MEDIUM]  │User Accts  │2024-01-03│[View Details]    │   ║
║  │Unpatched │[CRITICAL]│Prod Server │2024-01-02│[View Details]    │   ║
║  └──────────┴──────────┴────────────┴──────────┴──────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Key Features**:
- 4 stat cards with gradient icons
- 2 interactive charts (Pie + Bar)
- Full-width heat map with color coding
- Recent risks table with badges

---

## 4. Asset Management Page

### Visual Layout

```
╔══════════════════════════════════════════════════════════════════════════╗
║ [≡] ISO/IEC 27001:2022 Compliance                       👤 Admin User   ║
╠══════════════════════════════════════════════════════════════════════════╣
║ [Sidebar]  💾 Asset Management              [+ Add New Asset]           ║
║           Manage and track organizational information assets             ║
║ 📊 Dashboard                                                             ║
║ 💾 Assets  ┌──────────────────────────────────────────────────────┐    ║
║ ⚠️  Threats │ 🔍 [Search assets...] [Filter: All ▼] [Export]       │    ║
║ 🧮 Assessment└──────────────────────────────────────────────────────┘    ║
║ 📄 Reports                                                               ║
║            ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            ║
║            │Total    │ │Critical │ │High     │ │Asset    │            ║
║            │Assets   │ │Assets   │ │Value    │ │Types    │            ║
║            │   48    │ │   5     │ │   8     │ │   3     │            ║
║            └─────────┘ └─────────┘ └─────────┘ └─────────┘            ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ Asset Inventory                                                 │   ║
║  ├────────────┬──────┬────────┬────────┬────────┬─────────┬───────┤   ║
║  │Asset Name  │Type  │Value   │Owner   │Location│Descrip. │Actions│   ║
║  ├────────────┼──────┼────────┼────────┼────────┼─────────┼───────┤   ║
║  │Web App Srv │System│[HIGH]  │IT Dept │Data Ctr│Prod web │✏️ 🗑️  │   ║
║  │Customer DB │Data  │[CRIT]  │DBA Team│Cloud   │Customer │✏️ 🗑️  │   ║
║  │Laptops     │Hard. │[MED]   │HR      │Office  │Employee │✏️ 🗑️  │   ║
║  │Backup Srv  │System│[HIGH]  │IT Dept │Data Ctr│Backup   │✏️ 🗑️  │   ║
║  └────────────┴──────┴────────┴────────┴────────┴─────────┴───────┘   ║
╚══════════════════════════════════════════════════════════════════════════╝

ADD/EDIT MODAL:
┌─────────────────────────────────────┐
│ Add New Asset                    ✕  │
├─────────────────────────────────────┤
│ Asset Name *                        │
│ [________________________]          │
│                                     │
│ Asset Type *    Asset Value *       │
│ [System ▼]      [Medium ▼]          │
│                                     │
│ Owner *         Location *          │
│ [________]      [________]          │
│                                     │
│ Description                         │
│ [________________________]          │
│ [________________________]          │
│                                     │
├─────────────────────────────────────┤
│              [Cancel] [Add Asset]   │
└─────────────────────────────────────┘
```

**Key Features**:
- Search and filter bar
- Mini stat cards
- Full CRUD table with actions
- Modal form for add/edit
- Badge indicators for values

---

## 5. Threat & Vulnerability Management

### Visual Layout

```
╔══════════════════════════════════════════════════════════════════════════╗
║ ⚠️ Threats & Vulnerabilities                   [+ Add New Threat]       ║
║   Identify and manage potential threats and vulnerabilities              ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────┐      ║
║  │ 🔍 [Search threats...] [Asset: All ▼]                        │      ║
║  └──────────────────────────────────────────────────────────────┘      ║
║                                                                          ║
║  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                      ║
║  │Total    │ │Critical │ │High     │ │Affected │                      ║
║  │Threats  │ │Risk     │ │Risk     │ │Assets   │                      ║
║  │   6     │ │   2     │ │   3     │ │   6     │                      ║
║  └─────────┘ └─────────┘ └─────────┘ └─────────┘                      ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ Threat Register                                                 │   ║
║  ├──────────┬───────────┬──────────┬──────┬──────┬──────┬────────┤   ║
║  │Asset     │Threat     │Vulnerab. │Likel.│Impact│Risk  │Actions │   ║
║  ├──────────┼───────────┼──────────┼──────┼──────┼──────┼────────┤   ║
║  │Web App   │SQL Inject │Unsaniti- │[HIGH]│[HIGH]│[HIGH]│✏️ 🗑️   │   ║
║  │          │Attack     │zed input │      │      │      │        │   ║
║  │Customer  │Data Breach│Weak      │[MED] │[CRIT]│[CRIT]│✏️ 🗑️   │   ║
║  │DB        │           │encryption│      │      │      │        │   ║
║  └──────────┴───────────┴──────────┴──────┴──────┴──────┴────────┘   ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ 🛡️ Risk Assessment Guide                                       │   ║
║  ├──────────────────────────┬──────────────────────────────────────┤  ║
║  │ Likelihood Levels        │ Impact Levels                        │  ║
║  │ • Very Low: Unlikely     │ • Very Low: Negligible               │  ║
║  │ • Low: Unlikely          │ • Low: Minor impact                  │  ║
║  │ • Medium: Possible       │ • Medium: Moderate impact            │  ║
║  │ • High: Likely           │ • High: Significant impact           │  ║
║  │ • Very High: Certain     │ • Critical: Catastrophic impact      │  ║
║  └──────────────────────────┴──────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Key Features**:
- Threat search and filtering
- Statistics cards
- Comprehensive threat table
- Auto-calculated risk levels
- Built-in assessment guide

---

## 6. Risk Assessment Calculator

### Visual Layout

```
╔══════════════════════════════════════════════════════════════════════════╗
║ 🧮 Risk Assessment Calculator                                           ║
║   Calculate cybersecurity risks using different methodologies            ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ Select Assessment Method                                        │   ║
║  ├────────────────────────────────────────────────────────────────┤   ║
║  │  ┌──────────┐   ┌──────────┐   ┌──────────┐                   │   ║
║  │  │   ⚠️      │   │   🧮      │   │   ✓      │                   │   ║
║  │  │Qualitative│   │Quantitative│   │ Hybrid   │                   │   ║
║  │  │Risk = L×I │   │ALE = SLE×ARO│   │Combined  │  [ACTIVE]        │   ║
║  │  │Descriptive│   │Financial   │   │Both      │                   │   ║
║  │  └──────────┘   └──────────┘   └──────────┘                   │   ║
║  └────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌────────────────────────────┐ ┌────────────────────────────┐        ║
║  │ ℹ️ Risk Assessment Form    │ │ 📈 Risk Assessment Result  │        ║
║  │                             │ │                             │        ║
║  │ Asset Name *                │ │   Web Application Server    │        ║
║  │ [Web Application Server]    │ │   SQL Injection Attack      │        ║
║  │                             │ │                             │        ║
║  │ Threat Name *               │ │   ┌───────────────────┐    │        ║
║  │ [SQL Injection Attack]      │ │   │   Risk Level      │    │        ║
║  │                             │ │   │                   │    │        ║
║  │ Likelihood *                │ │   │      HIGH         │    │        ║
║  │ [High ▼]                    │ │   └───────────────────┘    │        ║
║  │                             │ │   (Red background)          │        ║
║  │ Impact *                    │ │                             │        ║
║  │ [High ▼]                    │ │   Likelihood: High          │        ║
║  │                             │ │   Impact: High              │        ║
║  │ [🧮 Calculate Risk]         │ │   Risk Score: 16 / 25       │        ║
║  │ [Reset Form]                │ │                             │        ║
║  │                             │ │   Calculation:              │        ║
║  │                             │ │   4 (L) × 4 (I) = 16        │        ║
║  │                             │ │                             │        ║
║  │                             │ │   [Save Assessment]         │        ║
║  └────────────────────────────┘ └────────────────────────────┘        ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ ℹ️ Assessment Methodology Information                          │   ║
║  ├──────────────┬──────────────────┬──────────────────────────────┤  ║
║  │ Qualitative  │ Quantitative     │ Hybrid                       │  ║
║  │ Uses scales  │ Uses financial   │ Combines both approaches     │  ║
║  │ ✓ Simple     │ ✓ Financial est. │ ✓ Balanced                   │  ║
║  └──────────────┴──────────────────┴──────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Key Features**:
- 3 method selection cards
- Dynamic form based on method
- Real-time calculation
- Detailed result display
- Formula visualization
- Methodology guide

---

## 7. Reports Page

### Visual Layout

```
╔══════════════════════════════════════════════════════════════════════════╗
║ 📄 Risk Assessment Reports              [🖨️ Print] [⬇️ Generate PDF]    ║
║   Comprehensive risk register and reporting                              ║
║                                                                          ║
║  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                      ║
║  │Total    │ │Open     │ │In       │ │Mitigated│                      ║
║  │Risks    │ │Risks    │ │Progress │ │         │                      ║
║  │  8      │ │  4      │ │  2      │ │  1      │                      ║
║  │C:2 H:3  │ │(Red)    │ │(Orange) │ │(Green)  │                      ║
║  └─────────┘ └─────────┘ └─────────┘ └─────────┘                      ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ 📈 Top 5 Highest Risks                                         │   ║
║  ├─────────┬─────────┬─────────┬─────────┬─────────┐              │   ║
║  │ #1      │ #2      │ #3      │ #4      │ #5      │              │   ║
║  │ Data    │ Unpatched│SQL     │ DDoS    │ Phishing│              │   ║
║  │ Breach  │ Server  │ Inject │ Attack  │ Attack  │              │   ║
║  │[CRIT]   │[CRIT]   │[HIGH]  │[HIGH]   │[MED]    │              │   ║
║  └─────────┴─────────┴─────────┴─────────┴─────────┘              │   ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────┐     ║
║  │ [Risk: All ▼] [Date: All Time ▼]  Showing 8 of 8 risks       │     ║
║  └──────────────────────────────────────────────────────────────┘     ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ 📋 Complete Risk Register                                      │   ║
║  ├─────┬──────┬────────┬─────┬─────┬──────┬──────┬──────┬────────┤  ║
║  │ID   │Asset │Threat  │Risk │Like.│Impact│Status│Owner │Date    │  ║
║  ├─────┼──────┼────────┼─────┼─────┼──────┼──────┼──────┼────────┤  ║
║  │R-001│Web   │SQL Inj │[HI] │[HI] │[HI]  │Open  │IT Sec│Jan 03  │  ║
║  │R-002│DB    │Breach  │[CR] │[MED]│[CR]  │InProg│DBA   │Jan 03  │  ║
║  │R-003│Laptop│Malware │[MED]│[HI] │[MED] │Open  │IT    │Jan 03  │  ║
║  └─────┴──────┴────────┴─────┴─────┴──────┴──────┴──────┴────────┘  ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │ 📄 Executive Summary                                           │   ║
║  │                                                                 │   ║
║  │ Risk Assessment Overview                                        │   ║
║  │ This report provides comprehensive analysis as of Jan 2024...   │   ║
║  │                                                                 │   ║
║  │ Key Findings                                                    │   ║
║  │ • 2 Critical Risks: Require immediate executive attention       │   ║
║  │ • 3 High Risks: Should be addressed this quarter               │   ║
║  │ • 2 Medium Risks: Require monitoring                           │   ║
║  │                                                                 │   ║
║  │ Recommendations                                                 │   ║
║  │ 1. Prioritize critical and high-risk items                     │   ║
║  │ 2. Allocate budget for security controls                       │   ║
║  │ 3. Establish regular risk review cycles                        │   ║
║  │                                                                 │   ║
║  │ Report Generated: Jan 5, 2024                                  │   ║
║  │ Standard: ISO/IEC 27001:2022                                   │   ║
║  └────────────────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Key Features**:
- Summary statistics cards
- Top 5 risks visualization
- Filterable risk register
- Complete risk data table
- Professional executive summary
- Print and PDF export options

---

## Color Reference

### Badge Colors (Quick Reference)

**Risk Levels**:
- 🔴 Critical: Dark red background, white text
- 🟠 High: Red/orange background, dark text
- 🟡 Medium: Yellow background, dark text
- 🟢 Low: Green background, white text

**Status Indicators**:
- Open: Red tint
- In Progress: Orange tint
- Mitigated: Green tint
- Accepted: Blue tint

### Icon Library

All icons from **Lucide React**:
- 🛡️ Shield - Security, protection
- 📊 LayoutDashboard - Dashboard view
- 💾 Database - Assets
- ⚠️ AlertTriangle - Threats, warnings
- 🧮 Calculator - Risk assessment
- 📄 FileText - Reports
- ✏️ Edit2 - Edit action
- 🗑️ Trash2 - Delete action
- 🔍 Search - Search function
- 📈 TrendingUp - Analytics
- ✓ CheckCircle - Success, completion
- ℹ️ Info - Information
- 📧 Mail - Email
- 🔒 Lock - Password
- 👤 User - User profile
- 🏢 Building - Organization

---

## Responsive Behavior

### Desktop (> 1024px)
- Full sidebar (260px wide)
- 4-column grids
- Side-by-side layouts
- Full table visibility

### Tablet (768-1024px)
- Visible sidebar
- 2-column grids
- Maintained functionality
- Horizontal scroll on tables

### Mobile (< 768px)
- Collapsible sidebar
- 1-column grids
- Stacked layouts
- Full-width buttons
- Touch-optimized targets

---

**This visual guide provides a comprehensive overview of the UI design and layout structure for all pages in the Risk Assessment Tool Dashboard.**
