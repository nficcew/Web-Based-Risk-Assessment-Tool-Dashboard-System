import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown, ChevronUp,
  Edit2,
  Filter,
  Grid,
  Info,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { assetsAPI, threatsAPI } from '../services/api';
import './ThreatManagement.css';

const emptyThreat = {
  id: null,
  asset_id: '',
  asset_name: '',
  threat_name: '',
  threat_description: '',
  vulnerability: '',
  current_control: '',
  proposed_control: '',
  likelihood: 'Medium',
  impact: 'Medium'
};

const riskMatrixData = [
  { likelihood: 'Very High (5)', vals: [{v:5,l:'Low'},{v:10,l:'Medium'},{v:15,l:'High'},{v:20,l:'Critical'},{v:25,l:'Critical'}] },
  { likelihood: 'High (4)',      vals: [{v:4,l:'Low'},{v:8,l:'Medium'},{v:12,l:'High'},{v:16,l:'High'},{v:20,l:'Critical'}] },
  { likelihood: 'Medium (3)',    vals: [{v:3,l:'Low'},{v:6,l:'Medium'},{v:9,l:'Medium'},{v:12,l:'High'},{v:15,l:'High'}] },
  { likelihood: 'Low (2)',       vals: [{v:2,l:'Low'},{v:4,l:'Low'},{v:6,l:'Medium'},{v:8,l:'Medium'},{v:10,l:'Medium'}] },
  { likelihood: 'Very Low (1)',  vals: [{v:1,l:'Low'},{v:2,l:'Low'},{v:3,l:'Low'},{v:4,l:'Low'},{v:5,l:'Low'}] },
];

const impactHeaders = ['Very Low (1)', 'Low (2)', 'Medium (3)', 'High (4)', 'Critical (5)'];

const likelihoodGuide = [
  { level: 'Very Low', value: 1, freq: 'Less than once in 5 years', desc: 'Very unlikely to happen.' },
  { level: 'Low',      value: 2, freq: 'Once every 2 to 5 years',   desc: 'Unlikely but possible.' },
  { level: 'Medium',   value: 3, freq: 'Once per year',             desc: 'Possible. Has happened before.' },
  { level: 'High',     value: 4, freq: 'Multiple times per year',   desc: 'Likely to happen.' },
  { level: 'Very High',value: 5, freq: 'Monthly or more frequent',  desc: 'Almost certain to happen.' },
];

const impactGuide = [
  { level: 'Very Low', value: 1, financial: 'Less than RM 1,000',        desc: 'Minimal disruption.' },
  { level: 'Low',      value: 2, financial: 'RM 1,000 — RM 10,000',      desc: 'Minor disruption.' },
  { level: 'Medium',   value: 3, financial: 'RM 10,000 — RM 100,000',    desc: 'Moderate disruption.' },
  { level: 'High',     value: 4, financial: 'RM 100,000 — RM 1,000,000', desc: 'Major disruption.' },
  { level: 'Critical', value: 5, financial: 'Above RM 1,000,000',        desc: 'Catastrophic.' },
];

const ThreatManagement = () => {
  const [threats, setThreats] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [currentThreat, setCurrentThreat] = useState(emptyThreat);
  const [showRiskMatrix, setShowRiskMatrix] = useState(false);
  const [showLikelihoodGuide, setShowLikelihoodGuide] = useState(false);
  const [showImpactGuide, setShowImpactGuide] = useState(false);

  const likelihoodOptions = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const impactOptions = ['Very Low', 'Low', 'Medium', 'High', 'Critical'];
  const riskLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [threatsRes, assetsRes] = await Promise.all([
        threatsAPI.getAll(),
        assetsAPI.getAll()
      ]);
      setThreats(threatsRes.data);
      setAssets(assetsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMsg = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showErrorMsg = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

  const getRiskLevel = (likelihood, impact) => {
    const lv = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    const iv = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Critical': 5 };
    const score = lv[likelihood] * iv[impact];
    if (score >= 20) return 'Critical';
    if (score >= 12) return 'High';
    if (score >= 6) return 'Medium';
    return 'Low';
  };

  const getBadgeClass = (level) => {
    const classes = {
      'Very Low': 'badge-low', 'Low': 'badge-low',
      'Medium': 'badge-medium',
      'High': 'badge-high', 'Very High': 'badge-high',
      'Critical': 'badge-critical'
    };
    return classes[level] || 'badge-medium';
  };

  const getMatrixCellClass = (level) => {
    const classes = { 'Critical': 'matrix-critical', 'High': 'matrix-high', 'Medium': 'matrix-medium', 'Low': 'matrix-low' };
    return classes[level] || 'matrix-low';
  };

  const handleAddThreat = () => {
    setEditMode(false);
    setCurrentThreat(emptyThreat);
    setShowModal(true);
  };

  const handleEditThreat = (threat) => {
    setEditMode(true);
    setCurrentThreat({
      id: threat.id,
      asset_id: threat.asset_id,
      asset_name: threat.asset_name,
      threat_name: threat.threat_name,
      threat_description: threat.threat_description,
      vulnerability: threat.vulnerability,
      current_control: threat.current_control || '',
      proposed_control: threat.proposed_control || '',
      likelihood: threat.likelihood,
      impact: threat.impact
    });
    setShowModal(true);
  };

  const handleDeleteThreat = async (id, name) => {
    if (!window.confirm(`Delete threat "${name}"?`)) return;
    try {
      await threatsAPI.delete(id);
      setThreats(prev => prev.filter(t => t.id !== id));
      showSuccessMsg('Threat deleted successfully');
    } catch (err) {
      showErrorMsg(err.response?.data?.message || 'Failed to delete threat');
    }
  };

  const handleAssetSelect = (e) => {
    const selectedAsset = assets.find(a => a.id === parseInt(e.target.value));
    setCurrentThreat(prev => ({
      ...prev,
      asset_id: selectedAsset ? selectedAsset.id : '',
      asset_name: selectedAsset ? selectedAsset.name : ''
    }));
  };

  const handleSaveThreat = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      assetId: currentThreat.asset_id,
      assetName: currentThreat.asset_name,
      threatName: currentThreat.threat_name,
      threatDescription: currentThreat.threat_description,
      vulnerability: currentThreat.vulnerability,
      currentControl: currentThreat.current_control,
      proposedControl: currentThreat.proposed_control,
      likelihood: currentThreat.likelihood,
      impact: currentThreat.impact
    };

    try {
      if (editMode) {
        const response = await threatsAPI.update(currentThreat.id, payload);
        setThreats(prev => prev.map(t => t.id === currentThreat.id ? response.data : t));
        showSuccessMsg('Threat updated successfully');
      } else {
        const response = await threatsAPI.create(payload);
        setThreats(prev => [response.data, ...prev]);
        showSuccessMsg('Threat added successfully');
      }
      setShowModal(false);
    } catch (err) {
      showErrorMsg(err.response?.data?.message || 'Failed to save threat');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setCurrentThreat({ ...currentThreat, [e.target.name]: e.target.value });
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch =
      threat.threat_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.vulnerability.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (threat.current_control || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (threat.proposed_control || '').toLowerCase().includes(searchTerm.toLowerCase());
    const riskLevel = threat.risk_level || getRiskLevel(threat.likelihood, threat.impact);
    const matchesRisk = filterRisk === 'All' || riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  if (loading) {
    return (
      <div className="threat-management">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#6c757d' }}>
          Loading threats...
        </div>
      </div>
    );
  }

  return (
    <div className="threat-management">
      <div className="page-header">
        <div className="header-content">
          <h2><AlertTriangle size={28} />Threats &amp; Vulnerabilities</h2>
          <p>Identify and manage potential threats and vulnerabilities</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowRiskMatrix(v => !v)}>
            <Grid size={18} />
            {showRiskMatrix ? 'Hide' : 'View'} Risk Matrix
          </button>
          <button className="btn btn-primary" onClick={handleAddThreat}>
            <Plus size={18} />
            Add New Threat
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fde8e8', color: '#c0392b', borderRadius: '8px', marginBottom: '16px' }}>
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#e8f8e8', color: '#27ae60', borderRadius: '8px', marginBottom: '16px' }}>
          <CheckCircle size={18} /><span>{success}</span>
        </div>
      )}

      {/* Risk Matrix */}
      {showRiskMatrix && (
        <div className="card">
          <div className="card-header"><Grid size={20} />Risk Assessment Matrix (Likelihood × Impact)</div>
          <div style={{ overflowX: 'auto', padding: '16px' }}>
            <table className="risk-matrix-table">
              <thead>
                <tr>
                  <th className="matrix-header-label">Likelihood / Impact</th>
                  {impactHeaders.map(h => <th key={h} className="matrix-col-header">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {riskMatrixData.map(row => (
                  <tr key={row.likelihood}>
                    <td className="matrix-row-label">{row.likelihood}</td>
                    {row.vals.map((cell, i) => (
                      <td key={i} className={`matrix-cell ${getMatrixCellClass(cell.l)}`}>
                        {cell.v} — {cell.l}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="matrix-legend">
            <span className="legend-item matrix-low">Low (1–5)</span>
            <span className="legend-item matrix-medium">Medium (6–11)</span>
            <span className="legend-item matrix-high">High (12–19)</span>
            <span className="legend-item matrix-critical">Critical (20–25)</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="filter-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search threats, vulnerabilities, assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <Filter size={18} />
            <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="filter-select">
              {riskLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4">
        <div className="stat-card-mini"><h4>Total Threats</h4><p className="stat-number">{threats.length}</p></div>
        <div className="stat-card-mini"><h4>Critical Risk</h4><p className="stat-number critical">{threats.filter(t => (t.risk_level || getRiskLevel(t.likelihood, t.impact)) === 'Critical').length}</p></div>
        <div className="stat-card-mini"><h4>High Risk</h4><p className="stat-number high">{threats.filter(t => (t.risk_level || getRiskLevel(t.likelihood, t.impact)) === 'High').length}</p></div>
        <div className="stat-card-mini"><h4>Affected Assets</h4><p className="stat-number">{new Set(threats.map(t => t.asset_id)).size}</p></div>
      </div>

      {/* Threats Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Threat</th>
                <th>Vulnerability</th>
                <th>Current Control</th>
                <th>Proposed Control (ISO 27001:2022)</th>
                <th>Likelihood</th>
                <th>Impact</th>
                <th>Risk Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredThreats.length > 0 ? (
                filteredThreats.map(threat => {
                  const riskLevel = threat.risk_level || getRiskLevel(threat.likelihood, threat.impact);
                  return (
                    <tr key={threat.id}>
                      <td className="asset-name">{threat.asset_name}</td>
                      <td>
                        <div className="threat-cell">
                          <strong>{threat.threat_name}</strong>
                          <p className="threat-description">{threat.threat_description}</p>
                        </div>
                      </td>
                      <td className="vulnerability-cell">{threat.vulnerability}</td>
                      <td className="vulnerability-cell">
                        {threat.current_control
                          ? threat.current_control
                          : <em style={{ color: '#aaa' }}>No controls in place</em>}
                      </td>
                      <td className="vulnerability-cell">
                        {threat.proposed_control
                          ? <span style={{ color: '#1a5276', fontSize: '12px' }}>{threat.proposed_control}</span>
                          : <em style={{ color: '#aaa' }}>No proposed control</em>}
                      </td>
                      <td><span className={`badge ${getBadgeClass(threat.likelihood)}`}>{threat.likelihood}</span></td>
                      <td><span className={`badge ${getBadgeClass(threat.impact)}`}>{threat.impact}</span></td>
                      <td><span className={`badge ${getBadgeClass(riskLevel)}`}>{riskLevel}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => handleEditThreat(threat)} title="Edit"><Edit2 size={16} /></button>
                          <button className="btn-icon danger" onClick={() => handleDeleteThreat(threat.id, threat.threat_name)} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    {threats.length === 0 ? 'No threats yet. Click "Add New Threat" to get started.' : 'No threats found matching your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Value Definition Guides */}
      <div className="card">
        <div className="card-header"><Shield size={20} />Value Definition Guides</div>
        <div className="guide-toggle-section">
          <button className="guide-toggle-btn" onClick={() => setShowLikelihoodGuide(v => !v)}>
            <Info size={16} />Likelihood Value Guide
            {showLikelihoodGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showLikelihoodGuide && (
            <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
              <table className="guide-table">
                <thead><tr><th>Likelihood</th><th>Value</th><th>Frequency</th><th>Description</th></tr></thead>
                <tbody>
                  {likelihoodGuide.map(row => (
                    <tr key={row.level}>
                      <td><span className={`badge ${getBadgeClass(row.level)}`}>{row.level}</span></td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.value}</td>
                      <td>{row.freq}</td>
                      <td>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="guide-toggle-section">
          <button className="guide-toggle-btn" onClick={() => setShowImpactGuide(v => !v)}>
            <Info size={16} />Impact Value Guide
            {showImpactGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showImpactGuide && (
            <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
              <table className="guide-table">
                <thead><tr><th>Impact</th><th>Value</th><th>Financial Loss (RM)</th><th>Description</th></tr></thead>
                <tbody>
                  {impactGuide.map(row => (
                    <tr key={row.level}>
                      <td><span className={`badge ${getBadgeClass(row.level)}`}>{row.level}</span></td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.value}</td>
                      <td>{row.financial}</td>
                      <td>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal threat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? 'Edit Threat' : 'Add New Threat'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveThreat}>
              <div className="modal-body">

                {/* Asset */}
                <div className="form-group">
                  <label className="form-label">Affected Asset *</label>
                  {assets.length > 0 ? (
                    <select name="asset_id" className="form-select" value={currentThreat.asset_id} onChange={handleAssetSelect} required disabled={saving}>
                      <option value="">Select an asset...</option>
                      {assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                    </select>
                  ) : (
                    <div style={{ padding: '10px', color: '#e67e22', backgroundColor: '#fef9e7', borderRadius: '6px', fontSize: '14px' }}>
                      No assets found. Please add assets first.
                    </div>
                  )}
                </div>

                {/* Threat Name */}
                <div className="form-group">
                  <label className="form-label">Threat Name *</label>
                  <input type="text" name="threat_name" className="form-input" value={currentThreat.threat_name} onChange={handleInputChange} required placeholder="e.g., SQL Injection Attack" disabled={saving} />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Threat Description *</label>
                  <textarea name="threat_description" className="form-textarea" value={currentThreat.threat_description} onChange={handleInputChange} required placeholder="Describe the potential threat..." disabled={saving} />
                </div>

                {/* Vulnerability */}
                <div className="form-group">
                  <label className="form-label">Vulnerability *</label>
                  <textarea name="vulnerability" className="form-textarea" value={currentThreat.vulnerability} onChange={handleInputChange} required placeholder="Describe the weakness that could be exploited..." disabled={saving} />
                </div>

                {/* Current Control */}
                <div className="form-group">
                  <label className="form-label">
                    Current Control
                    <span className="form-label-optional"> (optional)</span>
                  </label>
                  <textarea name="current_control" className="form-textarea" value={currentThreat.current_control} onChange={handleInputChange} placeholder="e.g., Antivirus installed, Firewall enabled, No controls in place" disabled={saving} />
                  <small className="form-hint">What security measures are currently in place?</small>
                </div>

                {/* Proposed Control — NEW! */}
                <div className="form-group">
                  <label className="form-label">
                    Proposed Control
                    <span className="form-label-optional"> (optional — auto-filled based on ISO 27001:2022)</span>
                  </label>
                  <textarea name="proposed_control" className="form-textarea" value={currentThreat.proposed_control} onChange={handleInputChange} placeholder="Leave blank to auto-suggest based on threat type and ISO/IEC 27001:2022 Annex A..." disabled={saving} />
                  <small className="form-hint" style={{ color: '#1a5276' }}>
                    💡 If left blank, system will auto-suggest a control based on ISO/IEC 27001:2022 Annex A
                  </small>
                </div>

                {/* Likelihood + Impact */}
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Likelihood *
                      <button type="button" className="label-info-btn" onClick={() => setShowLikelihoodGuide(v => !v)} title="View guide"><Info size={14} /></button>
                    </label>
                    <select name="likelihood" className="form-select" value={currentThreat.likelihood} onChange={handleInputChange} required disabled={saving}>
                      {likelihoodOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Impact *
                      <button type="button" className="label-info-btn" onClick={() => setShowImpactGuide(v => !v)} title="View guide"><Info size={14} /></button>
                    </label>
                    <select name="impact" className="form-select" value={currentThreat.impact} onChange={handleInputChange} required disabled={saving}>
                      {impactOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                </div>

                <div className="risk-preview">
                  <strong>Calculated Risk Level:</strong>
                  <span className={`badge ${getBadgeClass(getRiskLevel(currentThreat.likelihood, currentThreat.impact))}`}>
                    {getRiskLevel(currentThreat.likelihood, currentThreat.impact)}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || assets.length === 0}>
                  {saving ? 'Saving...' : (editMode ? 'Update Threat' : 'Add Threat')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatManagement;