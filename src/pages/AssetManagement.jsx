import {
  AlertCircle, CheckCircle,
  ChevronDown, ChevronUp,
  Database,
  Download,
  Edit2,
  Filter,
  Info,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { assetsAPI } from '../services/api';
import './AssetManagement.css';

const assetValueGuide = [
  { value: 'Low', priceRange: 'Below RM 1,000', importance: 'Minimal impact if lost', examples: 'Office chairs, keyboards, mice, basic printers' },
  { value: 'Medium', priceRange: 'RM 1,000 — RM 10,000', importance: 'Moderate impact if lost, replaceable within days', examples: 'Employee laptops, desktop computers, small servers' },
  { value: 'High', priceRange: 'RM 10,000 — RM 100,000', importance: 'Significant impact if lost, hard to replace quickly', examples: 'Main servers, network switches, routers, CCTV systems' },
  { value: 'Critical', priceRange: 'Above RM 100,000 OR irreplaceable', importance: 'Catastrophic impact if lost, cannot be easily replaced', examples: 'Customer databases, financial records, trade secrets, core servers' },
];

const assetCategoryGuide = [
  { category: 'Information', desc: 'Databases, data files, contracts, documentation, research data' },
  { category: 'Software', desc: 'Application software, system software, development tools, utilities' },
  { category: 'Physical', desc: 'Computer equipment, laptops, servers, networking hardware, storage media' },
  { category: 'Services', desc: 'Computing services, communication services, internet service, utilities' },
  { category: 'People', desc: 'Staff, contractors, third party users with access to information assets' },
  { category: 'Intangible', desc: 'Reputation, brand image, intellectual property, patents, licenses' },
];

const emptyAsset = {
  id: null, name: '', type: 'Physical', value: 'Medium',
  owner: '', custodian: '', classification: 'Internal',
  status: 'Active', location: '', retention_period: '',
  disposal_method: '', review_date: '', description: ''
};

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentAsset, setCurrentAsset] = useState(emptyAsset);
  const [showValueGuide, setShowValueGuide] = useState(false);
  const [showCategoryGuide, setShowCategoryGuide] = useState(false);

  const assetTypes = ['All', 'Information', 'Software', 'Physical', 'Services', 'People', 'Intangible'];
  const valueOptions = ['Low', 'Medium', 'High', 'Critical'];
  const classificationOptions = ['Public', 'Internal', 'Confidential', 'Restricted'];
  const statusOptions = ['Active', 'Inactive', 'Disposed'];

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await assetsAPI.getAll();
      setAssets(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

  const handleAddAsset = () => { setEditMode(false); setCurrentAsset(emptyAsset); setShowModal(true); };

  const handleEditAsset = (asset) => {
    setEditMode(true);
    setCurrentAsset({
      id: asset.id, name: asset.name, type: asset.type,
      value: asset.value, owner: asset.owner,
      custodian: asset.custodian || '',
      classification: asset.classification || 'Internal',
      status: asset.status || 'Active',
      location: asset.location,
      retention_period: asset.retention_period || '',
      disposal_method: asset.disposal_method || '',
      review_date: asset.review_date ? asset.review_date.slice(0, 10) : '',
      description: asset.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteAsset = async (id, name) => {
    if (!window.confirm(`Delete asset "${name}"? This will also remove any linked threats.`)) return;
    try {
      await assetsAPI.delete(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      showSuccess('Asset deleted successfully');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: currentAsset.name, type: currentAsset.type,
      value: currentAsset.value, owner: currentAsset.owner,
      custodian: currentAsset.custodian || null,
      classification: currentAsset.classification,
      status: currentAsset.status, location: currentAsset.location,
      retention_period: currentAsset.retention_period || null,
      disposal_method: currentAsset.disposal_method || null,
      review_date: currentAsset.review_date || null,
      description: currentAsset.description || ''
    };
    try {
      if (editMode) {
        const response = await assetsAPI.update(currentAsset.id, payload);
        setAssets(prev => prev.map(a => a.id === currentAsset.id ? response.data : a));
        showSuccess('Asset updated successfully');
      } else {
        const response = await assetsAPI.create(payload);
        setAssets(prev => [response.data, ...prev]);
        showSuccess('Asset added successfully');
      }
      setShowModal(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setCurrentAsset({ ...currentAsset, [e.target.name]: e.target.value });
  };

  const getValueBadgeClass = (value) => ({ 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high', 'Critical': 'badge-critical' })[value] || 'badge-medium';
  const getClassificationColor = (c) => ({ 'Public': '#27ae60', 'Internal': '#2980b9', 'Confidential': '#e67e22', 'Restricted': '#c0392b' })[c] || '#6c757d';
  const getStatusColor = (s) => ({ 'Active': '#27ae60', 'Inactive': '#e67e22', 'Disposed': '#c0392b' })[s] || '#6c757d';
  const getCategoryColor = (t) => ({ 'Information': '#8e44ad', 'Software': '#2980b9', 'Physical': '#27ae60', 'Services': '#e67e22', 'People': '#c0392b', 'Intangible': '#16a085' })[t] || '#6c757d';

  const handleExport = () => {
    if (filteredAssets.length === 0) { showError('No assets to export'); return; }
    const headers = ['Asset ID', 'Name', 'Category', 'Value', 'Classification', 'Status', 'Owner', 'Custodian', 'Location', 'Retention Period', 'Disposal Method', 'Review Date', 'Description'];
    const rows = filteredAssets.map(a =>
      [a.asset_id || '', a.name, a.type, a.value, a.classification || '', a.status || '', a.owner, a.custodian || '', a.location, a.retention_period || '', a.disposal_method || '', a.review_date || '', a.description || '']
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assets_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.asset_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.custodian || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) return <div className="asset-management"><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#6c757d' }}>Loading assets...</div></div>;

  return (
    <div className="asset-management">
      <div className="page-header">
        <div className="header-content">
          <h2><Database size={28} />Asset Management</h2>
          <p>Manage and track your organization's information assets — ISO/IEC 27001:2022 Annex A.5.9</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddAsset}><Plus size={18} />Add New Asset</button>
      </div>

      {error && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fde8e8', color: '#c0392b', borderRadius: '8px', marginBottom: '16px' }}><AlertCircle size={18} /><span>{error}</span></div>}
      {success && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#e8f8e8', color: '#27ae60', borderRadius: '8px', marginBottom: '16px' }}><CheckCircle size={18} /><span>{success}</span></div>}

      <div className="card">
        <div className="filter-bar">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search by name, ID, owner..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>
          <div className="filter-group">
            <Filter size={18} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              {assetTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchAssets}><RefreshCw size={16} /></button>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={16} />Export CSV</button>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="stat-card-mini"><h4>Total Assets</h4><p className="stat-number">{assets.length}</p></div>
        <div className="stat-card-mini"><h4>Critical Assets</h4><p className="stat-number critical">{assets.filter(a => a.value === 'Critical').length}</p></div>
        <div className="stat-card-mini"><h4>Active Assets</h4><p className="stat-number high">{assets.filter(a => a.status === 'Active' || !a.status).length}</p></div>
        <div className="stat-card-mini"><h4>Restricted/Confidential</h4><p className="stat-number">{assets.filter(a => a.classification === 'Restricted' || a.classification === 'Confidential').length}</p></div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Value</th>
                <th>Classification</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Custodian</th>
                <th>Location</th>
                <th>Review Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map(asset => (
                  <tr key={asset.id}>
                    <td style={{ fontWeight: '700', color: '#1a5276', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {asset.asset_id || '-'}
                    </td>
                    <td className="asset-name">{asset.name}</td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: getCategoryColor(asset.type) + '20', color: getCategoryColor(asset.type), border: `1px solid ${getCategoryColor(asset.type)}` }}>
                        {asset.type}
                      </span>
                    </td>
                    <td><span className={`badge ${getValueBadgeClass(asset.value)}`}>{asset.value}</span></td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: getClassificationColor(asset.classification) + '20', color: getClassificationColor(asset.classification), border: `1px solid ${getClassificationColor(asset.classification)}` }}>
                        {asset.classification || 'Internal'}
                      </span>
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: getStatusColor(asset.status) + '20', color: getStatusColor(asset.status), border: `1px solid ${getStatusColor(asset.status)}` }}>
                        {asset.status || 'Active'}
                      </span>
                    </td>
                    <td>{asset.owner}</td>
                    <td>{asset.custodian || <em style={{ color: '#aaa' }}>Not assigned</em>}</td>
                    <td>{asset.location}</td>
                    <td>{asset.review_date ? new Date(asset.review_date).toLocaleDateString() : <em style={{ color: '#aaa' }}>Not set</em>}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => handleEditAsset(asset)} title="Edit"><Edit2 size={16} /></button>
                        <button className="btn-icon danger" onClick={() => handleDeleteAsset(asset.id, asset.name)} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="11" className="no-data">{assets.length === 0 ? 'No assets yet. Click "Add New Asset" to get started.' : 'No assets found.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <button className="guide-toggle-btn" onClick={() => setShowCategoryGuide(v => !v)}>
          <Info size={16} />Asset Category Guide — ISO/IEC 27001:2022 Annex A.5.9
          {showCategoryGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showCategoryGuide && (
          <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
            <table className="guide-table">
              <thead><tr><th>Category</th><th>Examples</th></tr></thead>
              <tbody>
                {assetCategoryGuide.map(row => (
                  <tr key={row.category}>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: getCategoryColor(row.category) + '20', color: getCategoryColor(row.category), border: `1px solid ${getCategoryColor(row.category)}` }}>
                        {row.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <button className="guide-toggle-btn" onClick={() => setShowValueGuide(v => !v)}>
          <Info size={16} />Asset Value Definition Guide — ISO/IEC 27001:2022 Annex A.5.9
          {showValueGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showValueGuide && (
          <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '10px' }}>
              Asset value based on <strong>both price AND business importance</strong> as per ISO/IEC 27001:2022 Annex A.5.9
            </p>
            <table className="guide-table">
              <thead><tr><th>Value Level</th><th>Price Range (RM)</th><th>Business Importance</th><th>Examples</th></tr></thead>
              <tbody>
                {assetValueGuide.map(row => (
                  <tr key={row.value}>
                    <td><span className={`badge badge-${row.value.toLowerCase()}`}>{row.value}</span></td>
                    <td style={{ fontWeight: 600 }}>{row.priceRange}</td>
                    <td>{row.importance}</td>
                    <td style={{ fontSize: '12px', color: '#888' }}>{row.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? 'Edit Asset' : 'Add New Asset'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveAsset}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Asset Name *</label>
                  <input type="text" name="name" className="form-input" value={currentAsset.name} onChange={handleInputChange} required placeholder="e.g., Employee Laptops" disabled={saving} />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Asset Category *
                      <button type="button" className="label-info-btn" onClick={() => setShowCategoryGuide(v => !v)}><Info size={14} /></button>
                    </label>
                    <select name="type" className="form-select" value={currentAsset.type} onChange={handleInputChange} required disabled={saving}>
                      <option value="Information">Information</option>
                      <option value="Software">Software</option>
                      <option value="Physical">Physical</option>
                      <option value="Services">Services</option>
                      <option value="People">People</option>
                      <option value="Intangible">Intangible</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Asset Value *
                      <button type="button" className="label-info-btn" onClick={() => setShowValueGuide(v => !v)}><Info size={14} /></button>
                    </label>
                    <select name="value" className="form-select" value={currentAsset.value} onChange={handleInputChange} required disabled={saving}>
                      {valueOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <small className="form-hint">Low: &lt;RM1K | Medium: RM1K–10K | High: RM10K–100K | Critical: &gt;RM100K</small>
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Classification *</label>
                    <select name="classification" className="form-select" value={currentAsset.classification} onChange={handleInputChange} required disabled={saving}>
                      {classificationOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <small className="form-hint">Public → Internal → Confidential → Restricted (most sensitive)</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select name="status" className="form-select" value={currentAsset.status} onChange={handleInputChange} required disabled={saving}>
                      {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Owner *</label>
                    <input type="text" name="owner" className="form-input" value={currentAsset.owner} onChange={handleInputChange} required placeholder="e.g., IT Department" disabled={saving} />
                    <small className="form-hint">Responsible for the asset</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Custodian</label>
                    <input type="text" name="custodian" className="form-input" value={currentAsset.custodian} onChange={handleInputChange} placeholder="e.g., IT Support Team" disabled={saving} />
                    <small className="form-hint">Who manages the asset daily</small>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input type="text" name="location" className="form-input" value={currentAsset.location} onChange={handleInputChange} required placeholder="e.g., Server Room / Cloud / Office" disabled={saving} />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Retention Period</label>
                    <input type="text" name="retention_period" className="form-input" value={currentAsset.retention_period} onChange={handleInputChange} placeholder="e.g., 5 years / Permanent" disabled={saving} />
                    <small className="form-hint">How long to keep this asset</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Disposal Method</label>
                    <input type="text" name="disposal_method" className="form-input" value={currentAsset.disposal_method} onChange={handleInputChange} placeholder="e.g., Secure wipe / Physical destruction" disabled={saving} />
                    <small className="form-hint">How to dispose when no longer needed</small>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Review Date</label>
                  <input type="date" name="review_date" className="form-input" value={currentAsset.review_date} onChange={handleInputChange} disabled={saving} />
                  <small className="form-hint">When should this asset be reviewed next</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-textarea" value={currentAsset.description} onChange={handleInputChange} placeholder="Brief description of the asset..." disabled={saving} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editMode ? 'Update Asset' : 'Add Asset')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;