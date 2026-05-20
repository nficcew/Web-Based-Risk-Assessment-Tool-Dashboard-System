import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { threatsAPI, assessmentsAPI } from '../services/api';
import './Reports.css';

const Reports = () => {
  const [threats, setThreats] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const riskLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statusOptions = ['All', 'Open', 'In Progress', 'Mitigated', 'Accepted'];

  // Local status management stored in memory (could be persisted to DB in future)
  const [threatStatus, setThreatStatus] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [threatsRes, assessmentsRes] = await Promise.all([
        threatsAPI.getAll(),
        assessmentsAPI.getAll()
      ]);
      setThreats(threatsRes.data);
      setAssessments(assessmentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Build risk register from threats with optional status
  const riskRegister = threats.map((threat, index) => ({
    id: `RISK-${String(index + 1).padStart(3, '0')}`,
    threatId: threat.id,
    asset: threat.asset_name,
    threat: threat.threat_name,
    vulnerability: threat.vulnerability,
    riskLevel: threat.risk_level,
    likelihood: threat.likelihood,
    impact: threat.impact,
    status: threatStatus[threat.id] || 'Open',
    dateIdentified: new Date(threat.created_at).toLocaleDateString()
  }));

  const filteredRisks = riskRegister.filter(risk => {
    const matchesLevel = filterLevel === 'All' || risk.riskLevel === filterLevel;
    const matchesStatus = filterStatus === 'All' || risk.status === filterStatus;
    return matchesLevel && matchesStatus;
  });

  const topRisks = [...riskRegister]
    .sort((a, b) => {
      const levelOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return (levelOrder[b.riskLevel] || 0) - (levelOrder[a.riskLevel] || 0);
    })
    .slice(0, 5);

  const riskSummary = {
    total: riskRegister.length,
    critical: riskRegister.filter(r => r.riskLevel === 'Critical').length,
    high: riskRegister.filter(r => r.riskLevel === 'High').length,
    medium: riskRegister.filter(r => r.riskLevel === 'Medium').length,
    low: riskRegister.filter(r => r.riskLevel === 'Low').length,
    open: riskRegister.filter(r => r.status === 'Open').length,
    inProgress: riskRegister.filter(r => r.status === 'In Progress').length,
    mitigated: riskRegister.filter(r => r.status === 'Mitigated').length,
    accepted: riskRegister.filter(r => r.status === 'Accepted').length
  };

  const assessmentSummary = {
    total: assessments.length,
    qualitative: assessments.filter(a => a.assessment_type === 'qualitative').length,
    quantitative: assessments.filter(a => a.assessment_type === 'quantitative').length,
    hybrid: assessments.filter(a => a.assessment_type === 'hybrid').length
  };

  const getBadgeClass = (level) => {
    const classes = { 'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };
    return classes[level] || 'badge-medium';
  };

  const getStatusBadge = (status) => {
    const classes = { 'Open': 'status-open', 'In Progress': 'status-progress', 'Mitigated': 'status-mitigated', 'Accepted': 'status-accepted' };
    return classes[status] || 'status-open';
  };

  const handleStatusChange = (threatId, newStatus) => {
    setThreatStatus(prev => ({ ...prev, [threatId]: newStatus }));
  };

  const handleExportCSV = () => {
    if (filteredRisks.length === 0) return;
    const headers = ['Risk ID', 'Asset', 'Threat', 'Risk Level', 'Likelihood', 'Impact', 'Status', 'Date Identified'];
    const rows = filteredRisks.map(r =>
      [r.id, r.asset, r.threat, r.riskLevel, r.likelihood, r.impact, r.status, r.dateIdentified]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk_register_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="reports">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#6c757d' }}>
          Loading report data...
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="page-header">
        <div className="header-content">
          <h2>
            <FileText size={28} />
            Risk Assessment Reports
          </h2>
          <p>Comprehensive risk register and reporting — ISO/IEC 27001:2022</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchData} title="Refresh data">
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV} disabled={riskRegister.length === 0}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fde8e8', color: '#c0392b', borderRadius: '8px', marginBottom: '16px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {riskRegister.length === 0 && !error && (
        <div style={{ padding: '30px', backgroundColor: '#fff8e1', color: '#856404', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
          No threats found. Add threats in the Threats &amp; Vulnerabilities section to generate a report.
        </div>
      )}

      {/* Risk Summary Cards */}
      <div className="grid grid-4">
        <div className="summary-card">
          <div className="summary-header">
            <span>Total Risks</span>
            <AlertTriangle size={20} />
          </div>
          <div className="summary-value">{riskSummary.total}</div>
          <div className="summary-breakdown">
            <span className="breakdown-item critical">Critical: {riskSummary.critical}</span>
            <span className="breakdown-item high">High: {riskSummary.high}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <span>Open Risks</span>
            <AlertTriangle size={20} />
          </div>
          <div className="summary-value status-open">{riskSummary.open}</div>
          <div className="summary-detail">Requiring immediate attention</div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <span>In Progress</span>
            <TrendingUp size={20} />
          </div>
          <div className="summary-value status-progress">{riskSummary.inProgress}</div>
          <div className="summary-detail">Currently being addressed</div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <span>Mitigated</span>
            <CheckCircle size={20} />
          </div>
          <div className="summary-value status-mitigated">{riskSummary.mitigated}</div>
          <div className="summary-detail">Successfully addressed</div>
        </div>
      </div>

      {/* Assessment Summary */}
      {assessmentSummary.total > 0 && (
        <div className="card">
          <div className="card-header">
            <TrendingUp size={20} />
            Risk Assessment Summary ({assessmentSummary.total} saved assessments)
          </div>
          <div className="grid grid-4" style={{ padding: '16px' }}>
            <div className="stat-card-mini">
              <h4>Total Assessments</h4>
              <p className="stat-number">{assessmentSummary.total}</p>
            </div>
            <div className="stat-card-mini">
              <h4>Qualitative</h4>
              <p className="stat-number">{assessmentSummary.qualitative}</p>
            </div>
            <div className="stat-card-mini">
              <h4>Quantitative</h4>
              <p className="stat-number">{assessmentSummary.quantitative}</p>
            </div>
            <div className="stat-card-mini">
              <h4>Hybrid</h4>
              <p className="stat-number">{assessmentSummary.hybrid}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Highest Risks */}
      {topRisks.length > 0 && (
        <div className="card">
          <div className="card-header">
            <TrendingUp size={20} />
            Top {Math.min(5, topRisks.length)} Highest Risks
          </div>
          <div className="top-risks-grid">
            {topRisks.map((risk, index) => (
              <div key={risk.id} className="top-risk-card">
                <div className="risk-rank">#{index + 1}</div>
                <div className="risk-info">
                  <h4>{risk.threat}</h4>
                  <p className="risk-asset">{risk.asset}</p>
                  <div className="risk-meta">
                    <span className={`badge ${getBadgeClass(risk.riskLevel)}`}>
                      {risk.riskLevel}
                    </span>
                    <span className={`status-badge ${getStatusBadge(risk.status)}`}>
                      {risk.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="filter-bar">
          <div className="filter-group">
            <Filter size={18} />
            <label>Risk Level:</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
            >
              {riskLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-result">
            Showing {filteredRisks.length} of {riskRegister.length} risks
          </div>
        </div>
      </div>

      {/* Risk Register Table */}
      {filteredRisks.length > 0 && (
        <div className="card">
          <div className="card-header">
            <FileText size={20} />
            Risk Register
          </div>
          <div className="table-container">
            <table className="table report-table">
              <thead>
                <tr>
                  <th>Risk ID</th>
                  <th>Asset</th>
                  <th>Threat</th>
                  <th>Risk Level</th>
                  <th>Likelihood</th>
                  <th>Impact</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map(risk => (
                  <tr key={risk.id}>
                    <td className="risk-id">{risk.id}</td>
                    <td className="asset-name">{risk.asset}</td>
                    <td className="threat-name">{risk.threat}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(risk.riskLevel)}`}>
                        {risk.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(risk.likelihood)}`}>
                        {risk.likelihood}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(risk.impact)}`}>
                        {risk.impact}
                      </span>
                    </td>
                    <td>
                      <select
                        className="filter-select"
                        style={{ fontSize: '12px', padding: '2px 6px' }}
                        value={risk.status}
                        onChange={(e) => handleStatusChange(risk.threatId, e.target.value)}
                      >
                        {statusOptions.filter(s => s !== 'All').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="date-cell">{risk.dateIdentified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <div className="card">
        <div className="card-header">
          <FileText size={20} />
          Executive Summary
        </div>
        <div className="executive-summary">
          <div className="summary-section">
            <h3>Risk Assessment Overview</h3>
            <p>
              This report provides a comprehensive analysis of the cybersecurity risks identified
              for the organization as of {new Date().toLocaleDateString()}. The assessment follows
              ISO/IEC 27001:2022 standards for information security management.
            </p>
          </div>

          <div className="summary-section">
            <h3>Key Findings</h3>
            <ul>
              <li>
                <strong>{riskSummary.critical} Critical Risks:</strong> Require immediate executive
                attention and resource allocation.
              </li>
              <li>
                <strong>{riskSummary.high} High Risks:</strong> Should be addressed within the current
                quarter with dedicated security measures.
              </li>
              <li>
                <strong>{riskSummary.medium} Medium Risks:</strong> Require monitoring and planned
                mitigation activities within the next 6 months.
              </li>
              <li>
                <strong>{riskSummary.low} Low Risks:</strong> Can be accepted or addressed as resources
                become available.
              </li>
            </ul>
          </div>

          <div className="summary-section">
            <h3>Current Status</h3>
            <ul>
              <li><strong>{riskSummary.open} Open Risks:</strong> Awaiting mitigation actions</li>
              <li><strong>{riskSummary.inProgress} In Progress:</strong> Currently being addressed</li>
              <li><strong>{riskSummary.mitigated} Mitigated:</strong> Controls implemented successfully</li>
              <li><strong>{riskSummary.accepted} Accepted:</strong> Risk accepted by management</li>
            </ul>
          </div>

          <div className="summary-section">
            <h3>Recommendations</h3>
            <ol>
              <li>Prioritize critical and high-risk items for immediate remediation</li>
              <li>Allocate budget for security controls and mitigation measures</li>
              <li>Establish regular risk review cycles (monthly or quarterly)</li>
              <li>Implement continuous monitoring for identified threats</li>
              <li>Conduct security awareness training for all personnel</li>
              <li>Review and update risk assessment quarterly or when significant changes occur</li>
            </ol>
          </div>

          <div className="summary-footer">
            <p><strong>Report Generated:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Standard:</strong> ISO/IEC 27001:2022</p>
            <p><strong>Total Risks:</strong> {riskSummary.total} | <strong>Assessments Performed:</strong> {assessmentSummary.total}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
