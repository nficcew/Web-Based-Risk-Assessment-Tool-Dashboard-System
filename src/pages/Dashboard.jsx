import {
  Activity,
  AlertTriangle,
  BarChart2,
  ChevronRight,
  Database,
  PlusCircle,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { assetsAPI, threatsAPI, usersAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assets: { total: 0 },
    threats: { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
  });
  const [adminStats, setAdminStats] = useState(null);
  const [recentThreats, setRecentThreats] = useState([]);
  const [allThreats, setAllThreats] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [assetsRes, threatsRes, recentThreatsRes] = await Promise.all([
        assetsAPI.getStats(),
        threatsAPI.getStats(),
        threatsAPI.getAll()
      ]);

      setStats({
        assets: assetsRes.data,
        threats: threatsRes.data
      });

      // Store all threats for chart computation and show 5 most recent in table
      const sortedThreats = (recentThreatsRes.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAllThreats(sortedThreats);
      setRecentThreats(sortedThreats.slice(0, 5));

      if (isAdmin) {
        const userStatsRes = await usersAPI.getStats();
        setAdminStats(userStatsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const riskLevelData = [
    { name: 'Critical', value: stats.threats.critical_threats || 0, color: '#c0392b' },
    { name: 'High', value: stats.threats.high_threats || 0, color: '#e74c3c' },
    { name: 'Medium', value: stats.threats.medium_threats || 0, color: '#f39c12' },
    { name: 'Low', value: stats.threats.low_threats || 0, color: '#27ae60' }
  ];

  // Compute real bar chart data: threats per asset, grouped by risk level
  const riskBarData = Object.values(
    allThreats.reduce((acc, t) => {
      const key = t.asset_name || 'Unknown';
      const label = key.length > 18 ? key.slice(0, 17) + '\u2026' : key;
      if (!acc[key]) acc[key] = { asset: label, Critical: 0, High: 0, Medium: 0, Low: 0 };
      const lvl = t.risk_level || 'Low';
      acc[key][lvl] = (acc[key][lvl] || 0) + 1;
      return acc;
    }, {})
  ).slice(0, 6);

  const heatmapData = [
    { likelihood: 'Very High', veryLow: 'M', low: 'M', medium: 'H', high: 'C', veryHigh: 'C' },
    { likelihood: 'High', veryLow: 'L', low: 'M', medium: 'M', high: 'H', veryHigh: 'C' },
    { likelihood: 'Medium', veryLow: 'L', low: 'L', medium: 'M', high: 'M', veryHigh: 'H' },
    { likelihood: 'Low', veryLow: 'L', low: 'L', medium: 'L', high: 'M', veryHigh: 'M' },
    { likelihood: 'Very Low', veryLow: 'L', low: 'L', medium: 'L', high: 'L', veryHigh: 'M' }
  ];



  const getRiskColor = (level) => {
    const colors = {
      'Critical': '#c0392b',
      'High': '#e74c3c',
      'Medium': '#f39c12',
      'Low': '#27ae60'
    };
    return colors[level] || '#6c757d';
  };

  const getHeatmapColor = (level) => {
    const colors = {
      'C': '#c0392b',
      'H': '#e74c3c',
      'M': '#f39c12',
      'L': '#27ae60'
    };
    return colors[level] || '#dee2e6';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)' }}>
        <Shield size={40} style={{ opacity: 0.4 }} />
        <span style={{ fontSize: '16px' }}>Loading dashboard...</span>
      </div>
    );
  }

  const hasData = (stats.assets.total || 0) > 0 || (stats.threats.total || 0) > 0;

  // ── Empty / onboarding state ─────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>{isAdmin ? 'Admin Dashboard — System Overview' : 'Risk Assessment Dashboard'}</h2>
          <p>Welcome, {currentUser.fullName || currentUser.full_name}! Let's set up your risk profile.</p>
        </div>

        {/* Onboarding welcome banner */}
        <div className="welcome-banner">
          <div className="welcome-icon">
            <Shield size={56} />
          </div>
          <div className="welcome-body">
            <h2>Your dashboard is ready — start adding data</h2>
            <p>
              This ISO/IEC 27001:2022 Risk Assessment Tool helps you identify, evaluate, and manage
              cybersecurity risks across your organisation. Follow the three steps below to populate
              your dashboard.
            </p>
          </div>
        </div>

        {/* Step cards */}
        <div className="grid grid-3">
          <div className="onboarding-step-card" onClick={() => navigate('/assets')}>
            <div className="step-number">01</div>
            <div className="step-icon" style={{ background: 'linear-gradient(135deg, #4a90e2, #357abd)' }}>
              <Database size={28} />
            </div>
            <h3>Register Your Assets</h3>
            <p>Add your IT systems, databases, hardware, and data assets to build your asset inventory.</p>
            <div className="step-action">
              <span>Go to Assets</span>
              <ChevronRight size={18} />
            </div>
          </div>

          <div className="onboarding-step-card" onClick={() => navigate('/threats')}>
            <div className="step-number">02</div>
            <div className="step-icon" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
              <AlertTriangle size={28} />
            </div>
            <h3>Identify Threats</h3>
            <p>Document threats and vulnerabilities linked to each asset, with likelihood and impact ratings.</p>
            <div className="step-action">
              <span>Go to Threats</span>
              <ChevronRight size={18} />
            </div>
          </div>

          <div className="onboarding-step-card" onClick={() => navigate('/assessment')}>
            <div className="step-number">03</div>
            <div className="step-icon" style={{ background: 'linear-gradient(135deg, #27ae60, #229954)' }}>
              <Activity size={28} />
            </div>
            <h3>Run Risk Assessment</h3>
            <p>Calculate risk scores using qualitative, quantitative, or hybrid assessment methods.</p>
            <div className="step-action">
              <span>Go to Assessment</span>
              <ChevronRight size={18} />
            </div>
          </div>
        </div>

        {/* Quick add button */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/assets')} style={{ padding: '14px 32px', fontSize: '15px' }}>
            <PlusCircle size={20} />
            Add Your First Asset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{isAdmin ? 'Admin Dashboard - System Overview' : 'Risk Assessment Dashboard'}</h2>
        <p>Real-time overview of {isAdmin ? "the entire system's" : "your organization's"} cybersecurity risk posture</p>
      </div>

      {/* Admin-only Stats */}
      {isAdmin && adminStats && (
        <div className="grid grid-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #9b59b6, #8e44ad)' }}>
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-value">{adminStats.users.total_users}</p>
              <span className="stat-change positive">{adminStats.users.active_users} active</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4a90e2, #357abd)' }}>
              <Database size={24} />
            </div>
            <div className="stat-content">
              <h3>System Assets</h3>
              <p className="stat-value">{adminStats.assets.total_assets}</p>
              <span className="stat-change neutral">All users</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <h3>System Threats</h3>
              <p className="stat-value">{adminStats.threats.total_threats}</p>
              <span className="stat-change negative">{adminStats.threats.critical_threats} critical</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)' }}>
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <h3>Administrators</h3>
              <p className="stat-value">{adminStats.users.admin_count}</p>
              <span className="stat-change positive">System admins</span>
            </div>
          </div>
        </div>
      )}

      {/* User Stats */}
      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4a90e2, #357abd)' }}>
            <Database size={24} />
          </div>
          <div className="stat-content">
            <h3>{isAdmin ? 'Your Assets' : 'Total Assets'}</h3>
            <p className="stat-value">{stats.assets.total || 0}</p>
            <span className="stat-change neutral">Tracked items</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>{isAdmin ? 'Your Threats' : 'Total Threats'}</h3>
            <p className="stat-value">{stats.threats.total || 0}</p>
            <span className="stat-change negative">{stats.threats.critical_threats || 0} critical</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h3>High Risk</h3>
            <p className="stat-value">{stats.threats.high_threats || 0}</p>
            <span className="stat-change negative">Requires attention</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #27ae60, #229954)' }}>
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <h3>Medium/Low</h3>
            <p className="stat-value">{(stats.threats.medium_threats || 0) + (stats.threats.low_threats || 0)}</p>
            <span className="stat-change positive">Manageable</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-2">
        {/* Risk Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <TrendingUp size={20} />
            Risk Distribution by Severity
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk by Category Bar Chart */}
        <div className="card">
          <div className="card-header">
            <BarChart2 size={20} />
            Threats by Asset
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="asset" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Critical" stackId="a" fill="#c0392b" name="Critical" />
                <Bar dataKey="High" stackId="a" fill="#e74c3c" name="High" />
                <Bar dataKey="Medium" stackId="a" fill="#f39c12" name="Medium" />
                <Bar dataKey="Low" stackId="a" fill="#27ae60" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Heat Map */}
      <div className="card">
        <div className="card-header">
          <Activity size={20} />
          Risk Heat Map - Likelihood × Impact
        </div>
        <div className="heatmap-container">
          <div className="heatmap">
            <div className="heatmap-row header-row">
              <div className="heatmap-cell corner-cell"></div>
              <div className="heatmap-cell header-cell">Very Low</div>
              <div className="heatmap-cell header-cell">Low</div>
              <div className="heatmap-cell header-cell">Medium</div>
              <div className="heatmap-cell header-cell">High</div>
              <div className="heatmap-cell header-cell">Very High</div>
            </div>
            {heatmapData.map((row, idx) => (
              <div key={idx} className="heatmap-row">
                <div className="heatmap-cell header-cell">{row.likelihood}</div>
                <div
                  className="heatmap-cell data-cell"
                  style={{ backgroundColor: getHeatmapColor(row.veryLow) }}
                >
                  {row.veryLow}
                </div>
                <div
                  className="heatmap-cell data-cell"
                  style={{ backgroundColor: getHeatmapColor(row.low) }}
                >
                  {row.low}
                </div>
                <div
                  className="heatmap-cell data-cell"
                  style={{ backgroundColor: getHeatmapColor(row.medium) }}
                >
                  {row.medium}
                </div>
                <div
                  className="heatmap-cell data-cell"
                  style={{ backgroundColor: getHeatmapColor(row.high) }}
                >
                  {row.high}
                </div>
                <div
                  className="heatmap-cell data-cell"
                  style={{ backgroundColor: getHeatmapColor(row.veryHigh) }}
                >
                  {row.veryHigh}
                </div>
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
              <span>L - Low Risk</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f39c12' }}></div>
              <span>M - Medium Risk</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
              <span>H - High Risk</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#c0392b' }}></div>
              <span>C - Critical Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Risks Table */}
      <div className="card">
        <div className="card-header">
          <AlertTriangle size={20} />
          Recent Risk Identifications
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Risk Name</th>
                <th>Severity</th>
                <th>Affected Asset</th>
                <th>Date Identified</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentThreats.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#6c757d', padding: '24px' }}>
                    No threats recorded yet. Add threats in the Threats &amp; Vulnerabilities section.
                  </td>
                </tr>
              ) : (
                recentThreats.map((threat) => (
                  <tr key={threat.id}>
                    <td>{threat.threat_name}</td>
                    <td>
                      <span className={`badge badge-${(threat.risk_level || '').toLowerCase()}`}>
                        {threat.risk_level}
                      </span>
                    </td>
                    <td>{threat.asset_name}</td>
                    <td>{new Date(threat.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
