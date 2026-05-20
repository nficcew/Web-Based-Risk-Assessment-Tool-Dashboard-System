# Design Documentation - Risk Assessment Tool Dashboard

## Table of Contents
1. [Design System](#design-system)
2. [Component Architecture](#component-architecture)
3. [Page Specifications](#page-specifications)
4. [User Flows](#user-flows)
5. [Visual Design Guidelines](#visual-design-guidelines)

---

## Design System

### Color Palette

#### Primary Colors
- **Primary Dark**: `#1a2332` - Sidebar, dark backgrounds
- **Primary Blue**: `#2d3e50` - Secondary dark elements
- **Primary Light**: `#3a4f66` - Hover states

#### Accent Colors
- **Accent Blue**: `#4a90e2` - Primary actions, links, active states
- **Accent Success**: `#27ae60` - Success states, positive indicators
- **Accent Warning**: `#f39c12` - Warnings, medium priority
- **Accent Danger**: `#e74c3c` - Errors, critical alerts

#### Risk-Specific Colors
- **Critical**: `#c0392b` - Highest severity risks
- **High**: `#e74c3c` - High severity risks
- **Medium**: `#f39c12` - Medium severity risks
- **Low**: `#27ae60` - Low severity risks

#### Neutral Colors
- **Gray Scale**: 50, 100, 200, 300, 400, 500, 600, 700, 800
- **White**: `#ffffff` - Primary background
- **Text Primary**: `#212529` - Main text
- **Text Secondary**: `#6c757d` - Supporting text

### Typography

#### Font Family
- Primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen'`
- Monospace: `'Courier New', monospace` (for risk IDs, calculations)

#### Font Sizes
- **Extra Large**: 2.5rem - Hero numbers, statistics
- **Large**: 1.75rem - Page titles
- **Medium**: 1.25rem - Card headers, section titles
- **Base**: 14px - Body text, labels
- **Small**: 13px - Supporting text
- **Extra Small**: 12px - Badges, hints

#### Font Weights
- **Bold**: 700 - Numbers, emphasis
- **Semibold**: 600 - Headings, labels
- **Medium**: 500 - Buttons, links
- **Regular**: 400 - Body text

### Spacing System

Based on 8px grid:
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

### Border Radius
- **Small**: 4px - Inputs, buttons
- **Medium**: 8px - Cards, containers
- **Large**: 12px - Modals, large panels
- **Pill**: 50% - Avatars, circular elements

### Shadows
- **Small**: `0 1px 2px 0 rgba(0,0,0,0.05)` - Subtle elevation
- **Medium**: `0 4px 6px -1px rgba(0,0,0,0.1)` - Cards, dropdowns
- **Large**: `0 10px 15px -3px rgba(0,0,0,0.1)` - Modals, important elements

---

## Component Architecture

### Layout Components

#### 1. Layout (Main Application Container)
**File**: `src/components/Layout.jsx`

**Features**:
- Collapsible sidebar navigation
- Top navigation bar with user info
- Responsive design (mobile/desktop)
- Persistent layout across all pages

**Components**:
- Sidebar with menu items
- Top bar with logo and user profile
- Main content area
- Mobile hamburger menu

**Breakpoints**:
- Desktop: > 768px (expanded sidebar)
- Mobile: ≤ 768px (collapsible sidebar)

### Page Components

#### 1. Authentication Pages

**Login** (`src/pages/Login.jsx`)
- Email input with icon
- Password input with show/hide toggle
- Remember me checkbox
- Forgot password link
- Register redirect link
- Security indicator

**Register** (`src/pages/Register.jsx`)
- Full name input
- Email input
- Organization input
- Password with strength indicator
- Confirm password
- Terms & conditions checkbox
- Login redirect link

**Design Pattern**: Centered card on gradient background

#### 2. Dashboard (`src/pages/Dashboard.jsx`)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Page Header                         │
├─────────────────────────────────────┤
│  [Stat Card] [Stat Card] [Stat Card] │ (4 columns)
├─────────────────────────────────────┤
│  [Pie Chart]     [Bar Chart]        │ (2 columns)
├─────────────────────────────────────┤
│  Risk Heat Map (full width)         │
├─────────────────────────────────────┤
│  Recent Risks Table (full width)    │
└─────────────────────────────────────┘
```

**Stat Cards**:
- Gradient icon background
- Large number display
- Trend indicator
- Hover animation (lift effect)

**Charts**:
- Pie Chart: Risk distribution by severity
- Bar Chart: Stacked risks by category
- Heat Map: Likelihood × Impact matrix
- Color-coded risk levels

**Recent Risks Table**:
- Sortable columns
- Risk level badges
- Action buttons
- Hover effects

#### 3. Asset Management (`src/pages/AssetManagement.jsx`)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Page Header                [+ Add] │
├─────────────────────────────────────┤
│  [Search] [Filter] [Export]         │
├─────────────────────────────────────┤
│  [Mini Stats Cards] × 4             │
├─────────────────────────────────────┤
│  Assets Table (full width)          │
└─────────────────────────────────────┘
```

**CRUD Operations**:
- Add: Modal form with validation
- Edit: Pre-filled modal form
- Delete: Confirmation dialog
- View: Inline table display

**Modal Design**:
- Centered overlay (dark backdrop)
- White card with shadow
- Header with close button
- Form body with groups
- Footer with action buttons

**Table Features**:
- Responsive scrolling
- Badge indicators for value
- Type badges
- Icon action buttons (Edit/Delete)
- Hover row highlighting

#### 4. Threat Management (`src/pages/ThreatManagement.jsx`)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Page Header                [+ Add] │
├─────────────────────────────────────┤
│  [Search] [Asset Filter]            │
├─────────────────────────────────────┤
│  [Mini Stats Cards] × 4             │
├─────────────────────────────────────┤
│  Threats Table (full width)         │
├─────────────────────────────────────┤
│  Risk Assessment Guide              │
└─────────────────────────────────────┘
```

**Threat Form Fields**:
- Asset selection (dropdown)
- Threat name (text)
- Threat description (textarea)
- Vulnerability (textarea)
- Likelihood (dropdown: Very Low → Very High)
- Impact (dropdown: Very Low → Critical)
- Auto-calculated risk level (badge)

**Risk Assessment Guide**:
- Two-column layout
- Likelihood definitions
- Impact definitions
- Reference information

#### 5. Risk Assessment (`src/pages/RiskAssessment.jsx`)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Page Header                         │
├─────────────────────────────────────┤
│  Method Selection Cards × 3         │
│  [Qualitative] [Quantitative] [Hybrid]│
├─────────────────────────────────────┤
│  [Assessment Form] | [Risk Result] │ (2 columns)
├─────────────────────────────────────┤
│  Methodology Information            │
└─────────────────────────────────────┘
```

**Method Selection Cards**:
- Large icons (64px circular)
- Title and formula
- Description
- Active state highlighting
- Click to switch mode

**Qualitative Form**:
- Asset name
- Threat name
- Likelihood dropdown
- Impact dropdown
- Calculate button

**Quantitative Form**:
- Asset name
- Threat name
- Asset value (USD)
- Exposure factor (%)
- ARO (Annual Rate of Occurrence)
- Calculate button

**Hybrid Form**:
- Asset name
- Threat name
- Likelihood dropdown
- Impact dropdown
- Asset value (USD)
- Control effectiveness slider (0-100%)
- Calculate button

**Result Card**:
- Large colored badge (risk level)
- Detailed breakdown
- Calculation formula display
- Save assessment button

#### 6. Reports (`src/pages/Reports.jsx`)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Page Header        [Print] [PDF]   │
├─────────────────────────────────────┤
│  [Summary Cards] × 4                │
├─────────────────────────────────────┤
│  Top 5 Highest Risks                │
├─────────────────────────────────────┤
│  [Risk Level Filter] [Date Filter]  │
├─────────────────────────────────────┤
│  Complete Risk Register Table       │
├─────────────────────────────────────┤
│  Executive Summary                   │
└─────────────────────────────────────┘
```

**Summary Cards**:
- Total risks with breakdown
- Open risks count
- In progress count
- Mitigated count

**Top 5 Risks Cards**:
- Rank badge (#1-5)
- Threat name
- Asset name
- Risk and status badges
- Hover elevation effect

**Risk Register Table**:
- Risk ID (monospace)
- All risk attributes
- Status badges
- Mitigation strategies
- Print-friendly styling

**Executive Summary**:
- Professional formatting
- Numbered sections
- Bullet points
- Recommendations
- Report metadata footer

---

## Page Specifications

### 1. Login Page

**Purpose**: Authenticate users into the system

**Layout**:
- Centered card (440px max-width)
- Gradient background (dark blue to light blue)
- Logo at top (Shield icon, 80px)

**Form Elements**:
- Email input (with Mail icon)
- Password input (with Lock icon + show/hide toggle)
- Remember me checkbox
- Forgot password link
- Sign in button (full width, primary blue)
- Register link below

**Validation**:
- Required fields marked with *
- Email format validation
- Password minimum length

**Mobile Adaptations**:
- Full width on small screens
- Larger touch targets

### 2. Register Page

**Purpose**: Create new user accounts

**Layout**:
- Similar to login (500px max-width)
- More vertical space for additional fields

**Form Elements**:
- Full name (with User icon)
- Email (with Mail icon)
- Organization (with Building icon)
- Password (with Lock icon + toggle)
- Confirm password (with Lock icon + toggle)
- Terms checkbox (required)
- Create account button (full width)
- Login link below

**Validation**:
- All fields required
- Email format
- Password match confirmation
- Terms acceptance

### 3. Dashboard Page

**Purpose**: Overview of risk posture and key metrics

**Sections**:

1. **Header**
   - Title: "Risk Assessment Dashboard"
   - Subtitle: Context description

2. **Statistics Row** (4 cards)
   - Total Assets (blue gradient icon)
   - Total Risks (red gradient icon)
   - Risk Score (orange gradient icon)
   - Compliance % (green gradient icon)

3. **Charts Row** (2 columns)
   - Left: Pie chart (risk distribution)
   - Right: Stacked bar chart (by category)

4. **Heat Map**
   - Full width
   - 5×5 grid (Likelihood vs Impact)
   - Color-coded cells (L/M/H/C)
   - Legend below

5. **Recent Risks Table**
   - Last 5 identified risks
   - Risk level badges
   - View details buttons

### 4. Asset Management Page

**Purpose**: CRUD operations for organizational assets

**Sections**:

1. **Header**
   - Title with icon
   - Add New Asset button (top right)

2. **Filter Bar**
   - Search input (full text search)
   - Type filter dropdown
   - Export button

3. **Mini Statistics** (4 cards)
   - Total assets
   - Critical assets
   - High value assets
   - Asset types count

4. **Assets Table**
   - Columns: Name, Type, Value, Owner, Location, Description, Actions
   - Edit and Delete icon buttons
   - Row hover effects
   - Responsive horizontal scroll

5. **Add/Edit Modal**
   - Overlay backdrop
   - Form fields with validation
   - Cancel and Save buttons

### 5. Threat Management Page

**Purpose**: Document threats and vulnerabilities

**Sections**:

1. **Header**
   - Title with AlertTriangle icon
   - Add New Threat button

2. **Filter Bar**
   - Search threats/vulnerabilities
   - Asset filter dropdown

3. **Statistics** (4 cards)
   - Total threats
   - Critical risk count
   - High risk count
   - Affected assets

4. **Threats Table**
   - Columns: Asset, Threat, Vulnerability, Likelihood, Impact, Risk Level, Actions
   - Multi-line threat descriptions
   - Auto-calculated risk level
   - Edit and Delete actions

5. **Risk Guide**
   - Two columns
   - Likelihood definitions
   - Impact definitions

6. **Add/Edit Modal**
   - Asset dropdown
   - Threat name
   - Descriptions
   - Likelihood/Impact selectors
   - Live risk calculation preview

### 6. Risk Assessment Page

**Purpose**: Calculate risks using three methodologies

**Sections**:

1. **Header**
   - Title with Calculator icon
   - Methodology description

2. **Method Selection** (3 cards)
   - Qualitative (descriptive)
   - Quantitative (financial)
   - Hybrid (combined)
   - Click to activate

3. **Two-Column Layout**:

   **Left: Assessment Form**
   - Asset name input
   - Threat name input
   - Method-specific fields
   - Calculate and Reset buttons

   **Right: Risk Result**
   - Large risk level badge (color-coded)
   - Detailed metrics
   - Calculation formula (code block)
   - Save assessment button
   - Empty state when no calculation

4. **Methodology Info**
   - Three columns
   - Description of each method
   - Use cases
   - Advantages

### 7. Reports Page

**Purpose**: Comprehensive risk reporting and documentation

**Sections**:

1. **Header**
   - Title with FileText icon
   - Print and Generate PDF buttons

2. **Summary Cards** (4 cards)
   - Total risks with breakdown
   - Open risks (red)
   - In progress (orange)
   - Mitigated (green)

3. **Top 5 Risks**
   - 5 columns of cards
   - Rank badges
   - Threat and asset names
   - Risk and status indicators

4. **Filter Bar**
   - Risk level dropdown
   - Date range selector
   - Result count display

5. **Risk Register Table**
   - Complete risk data
   - All attributes
   - Print-friendly design

6. **Executive Summary**
   - Professional report format
   - Key findings
   - Current status
   - Recommendations
   - Report metadata

---

## User Flows

### Flow 1: User Registration & Login

```
Start
  ↓
[Landing Page] → Navigate to Register
  ↓
[Register Page]
  ↓
Fill form (name, email, org, password)
  ↓
Submit → Mock validation
  ↓
[Dashboard] (Auto-login)
```

### Flow 2: Complete Risk Assessment

```
[Login]
  ↓
[Dashboard] → View overview
  ↓
Navigate to [Asset Management]
  ↓
Add Assets (Click + button)
  ↓
Fill asset form → Save
  ↓
Navigate to [Threat Management]
  ↓
Add Threats (Click + button)
  ↓
Select asset, describe threat, set likelihood/impact → Save
  ↓
Navigate to [Risk Assessment]
  ↓
Select method (Qualitative/Quantitative/Hybrid)
  ↓
Fill form with asset/threat data
  ↓
Click Calculate → View risk result
  ↓
Save assessment
  ↓
Navigate to [Reports]
  ↓
Review risk register and generate report
```

### Flow 3: Risk Assessment Workflow

```
[Risk Assessment Page]
  ↓
Choose Method → [Active state highlights card]
  ↓
Enter Asset Name
  ↓
Enter Threat Name
  ↓
── Qualitative ──
│   Select Likelihood
│   Select Impact
│
── Quantitative ──
│   Enter Asset Value
│   Enter Exposure Factor
│   Enter ARO
│
── Hybrid ──
│   Select Likelihood
│   Select Impact
│   Enter Asset Value
│   Adjust Control Slider
  ↓
Click Calculate
  ↓
[Result Card Appears]
  ↓
Review calculated risk
  ↓
View calculation formula
  ↓
Save or Reset
```

---

## Visual Design Guidelines

### Card Design
- White background (`#ffffff`)
- Border radius: 8px
- Shadow: `0 4px 6px -1px rgba(0,0,0,0.1)`
- Padding: 24px
- Margin bottom: 24px

### Button Design

**Primary Button**:
- Background: `#4a90e2`
- Color: White
- Padding: 10px 20px
- Border radius: 4px
- Hover: Darker blue + lift effect

**Secondary Button**:
- Background: Light gray
- Color: Dark gray
- Border: 1px solid gray
- Same dimensions as primary

**Danger Button**:
- Background: `#e74c3c`
- Color: White
- For destructive actions

**Icon Buttons**:
- No background
- Padding: 6px
- Border radius: 4px
- Hover: Light background

### Badge Design

**Risk Level Badges**:
- Padding: 4px 12px
- Border radius: 12px (pill shape)
- Font size: 12px
- Font weight: 600
- Uppercase text
- Letter spacing: 0.5px

**Colors by Level**:
- Critical: `#fadbd8` background, `#c0392b` text
- High: `#fadbd8` background, `#e74c3c` text
- Medium: `#fef5e7` background, `#f39c12` text
- Low: `#d5f4e6` background, `#27ae60` text

### Table Design
- Full width
- Collapse borders
- Gray header background (`#f8f9fa`)
- Header text: Uppercase, 13px, semi-bold
- Row hover: Light gray background
- Cell padding: 12px 16px
- Border between rows: 1px solid `#dee2e6`

### Form Design

**Input Fields**:
- Full width
- Padding: 10px 12px
- Border: 1px solid `#ced4da`
- Border radius: 4px
- Focus: Blue border + light shadow

**Dropdowns/Selects**:
- Same style as inputs
- Down arrow indicator

**Textareas**:
- Min height: 80px
- Vertical resize only

**Labels**:
- Font weight: 500
- Margin bottom: 8px
- Font size: 14px

### Modal Design
- Full screen overlay: `rgba(0,0,0,0.5)`
- Centered white card
- Max width: 600px (adjustable)
- Max height: 90vh
- Border radius: 12px
- Shadow: Large
- Slide-up animation on open

### Icon Usage
- Lucide React library
- Size: 18-20px for buttons
- Size: 24-32px for headers
- Color: Matches context (primary/secondary)

### Responsive Breakpoints

**Desktop** (> 1024px):
- 4-column grids
- Expanded sidebar (260px)
- Full table display

**Tablet** (768px - 1024px):
- 2-column grids
- Sidebar visible
- Table horizontal scroll

**Mobile** (< 768px):
- 1-column grids
- Collapsible sidebar
- Simplified navigation
- Stacked form fields
- Full-width buttons

### Animation & Transitions
- Hover transitions: 0.2s ease
- Page transitions: 0.3s fadeIn
- Modal open: slideUp animation
- Sidebar: 0.3s width transition
- Button hover: lift effect (translateY -1px)

### Accessibility
- Color contrast ratio: 4.5:1 minimum
- Focus indicators on all interactive elements
- Keyboard navigation support
- Alt text for icons (via aria-label)
- Semantic HTML structure

### Print Styles
- Hide navigation and action buttons
- Simplify colors (print-friendly)
- Page break controls
- Black borders on tables
- Expanded content areas

---

## Component Breakdown

### Reusable UI Patterns

1. **Stat Card**
   - Icon with gradient background
   - Label (uppercase)
   - Large number
   - Trend indicator

2. **Data Card**
   - Header with icon and title
   - Content area (flexible)
   - Optional footer

3. **Modal**
   - Header (title + close)
   - Body (scrollable)
   - Footer (actions)

4. **Badge**
   - Text indicator
   - Color-coded
   - Multiple variants

5. **Filter Bar**
   - Search input
   - Dropdown filters
   - Action buttons

6. **Empty State**
   - Large icon
   - Descriptive text
   - Call-to-action

7. **Form Group**
   - Label
   - Input/Select
   - Helper text
   - Error message

---

## Design Principles

1. **Clarity**: Information should be immediately understandable
2. **Consistency**: Similar elements should look and behave the same
3. **Efficiency**: Common tasks should be quick to complete
4. **Professional**: Business-appropriate visual design
5. **Accessible**: Usable by people with diverse abilities
6. **Responsive**: Works across all device sizes
7. **Guidance**: Help users make informed decisions
8. **Trust**: Security-focused visual language

---

**Document Version**: 1.0
**Last Updated**: January 2024
**Design System Owner**: UX/UI Team
