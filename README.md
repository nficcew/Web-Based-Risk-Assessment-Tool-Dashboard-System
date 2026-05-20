# Risk Assessment Tool Dashboard System

A comprehensive web-based Risk Assessment Tool aligned with **ISO/IEC 27001:2022** standards, designed for cybersecurity risk assessment in small organizations and academic environments.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)

## Overview

This MVP (Minimum Viable Product) provides a clean, modern, and professional interface for managing cybersecurity risks. It helps organizations identify assets, assess threats and vulnerabilities, calculate risk levels using multiple methodologies, and generate comprehensive reports.

## Target Users

- Small and Medium Enterprises (SMEs)
- IT Security Officers
- Students and Researchers
- Cybersecurity Professionals
- Organizations pursuing ISO 27001 compliance

## Key Features

### 1. Authentication System
- **Login Page**: Secure email/password authentication
- **Register Page**: User registration with organization details
- Modern, professional design with security indicators

### 2. Main Dashboard
- **Real-time Risk Overview**: Visual summary of organizational risk posture
- **Statistical Cards**: Total assets, risks, risk scores, and compliance status
- **Interactive Charts**:
  - Pie chart for risk distribution by severity
  - Bar chart for risks by category
  - Risk heat map (Likelihood × Impact matrix)
- **Recent Risk Table**: Latest identified risks with quick actions

### 3. Asset Management
- **CRUD Operations**: Create, Read, Update, Delete assets
- **Asset Attributes**:
  - Asset name and type (System, Data, Hardware)
  - Value classification (Low, Medium, High, Critical)
  - Owner and location information
  - Detailed descriptions
- **Search & Filter**: Find assets quickly
- **Statistics Dashboard**: Overview of asset inventory

### 4. Threat & Vulnerability Management
- **Threat Registration**: Document threats affecting assets
- **Vulnerability Tracking**: Record exploitable weaknesses
- **Risk Parameters**:
  - Likelihood assessment (Very Low to Very High)
  - Impact assessment (Very Low to Critical)
  - Automatic risk level calculation
- **Comprehensive Table**: View all threats with filtering options
- **Risk Assessment Guide**: Built-in reference for likelihood and impact levels

### 5. Risk Assessment Calculator
Three calculation methodologies:

#### Qualitative Method
- **Formula**: Risk = Likelihood × Impact
- **Output**: Low, Medium, High, or Critical risk level
- **Use Case**: Quick assessments without detailed financial data

#### Quantitative Method
- **Formulas**:
  - SLE = Asset Value × Exposure Factor
  - ALE = SLE × ARO
- **Output**: Financial risk estimates (Annual Loss Expectancy)
- **Use Case**: Cost-benefit analysis and budget planning

#### Hybrid Method
- **Formula**: Combines qualitative ratings with asset value and control effectiveness
- **Output**: Residual risk score after considering existing controls
- **Use Case**: Comprehensive risk assessment with mitigation consideration

### 6. Reports & Documentation
- **Risk Register**: Complete table of all identified risks
- **Top 5 Risks**: Highest priority risks requiring attention
- **Risk Summary Statistics**: Overview by severity and status
- **Executive Summary**: Professional report with:
  - Key findings and recommendations
  - Current status breakdown
  - ISO 27001:2022 compliance reference
- **Export Functions**: PDF generation and print capability (mocked)

## Technical Stack

### Frontend
- **React 18.2.0**: Modern UI framework
- **React Router 6**: Client-side routing
- **Recharts 2.10.0**: Data visualization
- **Lucide React**: Icon library
- **CSS3**: Custom styling with CSS variables

### Build Tool
- **Vite 5.0**: Fast development and build tool

### Development
- **ES6+ JavaScript**: Modern JavaScript features
- **Modular Architecture**: Component-based design
- **Responsive Design**: Mobile-first approach

## Project Structure

```
risk-assessment-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # Main application layout
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Login.jsx            # Authentication - Login
│   │   ├── Register.jsx         # Authentication - Register
│   │   ├── Auth.css
│   │   ├── Dashboard.jsx        # Main dashboard with charts
│   │   ├── Dashboard.css
│   │   ├── AssetManagement.jsx  # Asset CRUD operations
│   │   ├── AssetManagement.css
│   │   ├── ThreatManagement.jsx # Threat & vulnerability management
│   │   ├── ThreatManagement.css
│   │   ├── RiskAssessment.jsx   # Risk calculator (3 methods)
│   │   ├── RiskAssessment.css
│   │   ├── Reports.jsx          # Risk reports and register
│   │   └── Reports.css
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation Steps

1. **Clone or download the project**
   ```bash
   cd "web-based Risk Assessment Tool Dashboard System"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open browser to `http://localhost:5173`
   - Default login: Any email/password (authentication is mocked)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Usage Guide

### Getting Started

1. **Login/Register**
   - Navigate to login page
   - Create an account or use existing credentials (mock authentication)

2. **Dashboard Overview**
   - View overall risk posture
   - Analyze charts and statistics
   - Identify high-priority risks

3. **Manage Assets**
   - Add organizational assets
   - Classify by type and value
   - Assign owners and locations

4. **Identify Threats**
   - Document threats to each asset
   - Describe vulnerabilities
   - Assess likelihood and impact

5. **Calculate Risks**
   - Choose assessment method
   - Input required parameters
   - Review calculated risk levels

6. **Generate Reports**
   - View comprehensive risk register
   - Review executive summary
   - Export to PDF (mock feature)

## Design Philosophy

### Visual Design
- **Professional Color Scheme**: Dark blue, neutral grays, risk-based colors
- **Clean Layout**: Card-based design with clear hierarchy
- **Modern Typography**: System fonts for optimal readability
- **Consistent Spacing**: 8px base grid system

### UX Principles
- **Clarity**: Information presented clearly without clutter
- **Efficiency**: Quick access to key features
- **Guidance**: Built-in help and reference materials
- **Feedback**: Visual indicators for all actions

### Accessibility
- **Contrast Ratios**: WCAG AA compliant colors
- **Keyboard Navigation**: Tab-accessible interface
- **Responsive Design**: Works on desktop, tablet, and mobile

## ISO/IEC 27001:2022 Alignment

This tool supports the following ISO 27001:2022 requirements:

- **Clause 6.1.2**: Information security risk assessment
- **Clause 6.1.3**: Information security risk treatment
- **Clause 8.2**: Information security risk assessment process
- **Clause 8.3**: Information security risk treatment process
- **Annex A Controls**: Reference framework for security controls

## Mock Features (For MVP)

The following features are mocked in this MVP:

1. **Authentication**: No real user validation or session management
2. **Data Persistence**: All data is stored in component state (resets on refresh)
3. **PDF Export**: Alert message instead of actual PDF generation
4. **Backend API**: No server-side integration
5. **User Management**: No role-based access control

## Future Enhancements

Potential features for full production version:

- [ ] Backend API integration (Node.js/Express or Django)
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Real authentication with JWT
- [ ] Role-based access control (Admin, Analyst, Viewer)
- [ ] Actual PDF/Excel report generation
- [ ] Email notifications for high-priority risks
- [ ] Risk treatment tracking and workflow
- [ ] Audit trail and change history
- [ ] Multi-tenant organization support
- [ ] Advanced analytics and trending
- [ ] Integration with vulnerability scanners
- [ ] Automated risk scoring using AI/ML

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is an MVP/educational project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - Free for educational and commercial use

## Acknowledgments

- ISO/IEC 27001:2022 standard framework
- React and Vite communities
- Open source icon libraries

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [Your contact information]

---

**Built with care for cybersecurity professionals and organizations pursuing ISO 27001 compliance.**

*Version 1.0.0 - January 2024*
