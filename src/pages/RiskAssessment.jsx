import {
  AlertCircle,
  Calculator,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Grid,
  Info,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { assessmentsAPI, assetsAPI, threatsAPI } from '../services/api';
import './RiskAssessment.css';

const riskMatrixData = [
  { likelihood: 'Very High (5)', vals: [{v:5,l:'Low'},{v:10,l:'Medium'},{v:15,l:'High'},{v:20,l:'Critical'},{v:25,l:'Critical'}] },
  { likelihood: 'High (4)',      vals: [{v:4,l:'Low'},{v:8,l:'Medium'},{v:12,l:'High'},{v:16,l:'High'},{v:20,l:'Critical'}] },
  { likelihood: 'Medium (3)',    vals: [{v:3,l:'Low'},{v:6,l:'Medium'},{v:9,l:'Medium'},{v:12,l:'High'},{v:15,l:'High'}] },
  { likelihood: 'Low (2)',       vals: [{v:2,l:'Low'},{v:4,l:'Low'},{v:6,l:'Medium'},{v:8,l:'Medium'},{v:10,l:'Medium'}] },
  { likelihood: 'Very Low (1)',  vals: [{v:1,l:'Low'},{v:2,l:'Low'},{v:3,l:'Low'},{v:4,l:'Low'},{v:5,l:'Low'}] },
];
const impactHeaders = ['Very Low (1)', 'Low (2)', 'Medium (3)', 'High (4)', 'Critical (5)'];

const likelihoodGuide = [
  { level: 'Very Low', value: 1, freq: 'Less than once in 5 years', desc: 'Very unlikely to happen. No known cases in similar organizations.' },
  { level: 'Low',      value: 2, freq: 'Once every 2 to 5 years',   desc: 'Unlikely but possible. Rare cases reported in industry.' },
  { level: 'Medium',   value: 3, freq: 'Once per year',             desc: 'Possible. Has happened before in similar organizations.' },
  { level: 'High',     value: 4, freq: 'Multiple times per year',   desc: 'Likely to happen. Common threat in the industry.' },
  { level: 'Very High',value: 5, freq: 'Monthly or more frequent',  desc: 'Almost certain to happen. Ongoing or known active threat.' },
];

const impactGuide = [
  { level: 'Very Low', value: 1, financial: 'Less than RM 1,000',         desc: 'Minimal disruption. No data loss. Recoverable within hours.' },
  { level: 'Low',      value: 2, financial: 'RM 1,000 — RM 10,000',       desc: 'Minor disruption. Small data loss. Recoverable within 1 day.' },
  { level: 'Medium',   value: 3, financial: 'RM 10,000 — RM 100,000',     desc: 'Moderate disruption. Some data loss. Recoverable within 1 week.' },
  { level: 'High',     value: 4, financial: 'RM 100,000 — RM 1,000,000',  desc: 'Major disruption. Significant data loss. Recovery takes weeks.' },
  { level: 'Critical', value: 5, financial: 'Above RM 1,000,000',         desc: 'Catastrophic. Complete data loss. Business operations severely affected.' },
];

const vulnGuide = [
  { range: '0% — 20%',   level: 'Very Low', meaning: 'Asset is well protected. Very few weaknesses.' },
  { range: '21% — 40%',  level: 'Low',      meaning: 'Asset has minor weaknesses but mostly protected.' },
  { range: '41% — 60%',  level: 'Medium',   meaning: 'Asset has some weaknesses. Moderate risk of exploitation.' },
  { range: '61% — 80%',  level: 'High',     meaning: 'Asset has significant weaknesses. Likely to be exploited.' },
  { range: '81% — 100%', level: 'Critical', meaning: 'Asset is severely vulnerable. Almost certain to be exploited.' },
];

const assetValueDefaults = { 'Low': 500, 'Medium': 5000, 'High': 50000, 'Critical': 500000 };

const fmtRM = (val) => `RM ${parseFloat(val).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── CBA Justification Generator ───────────────────────────────────────────────
const generateJustification = (aleBefore, aleAfter, costOfControl, valueOfControl, controlEffectiveness) => {
  const annualSavings = aleBefore - aleAfter;
  const roi = costOfControl > 0 ? ((annualSavings - costOfControl) / costOfControl * 100).toFixed(1) : 0;
  const isWorth = valueOfControl >= 0;

  if (isWorth) {
    return {
      decision: 'WORTH IMPLEMENTING',
      color: '#1a5276',
      bgColor: '#d6eaf8',
      borderColor: '#2980b9',
      icon: '✅',
      analysis: [
        `📊 Annual Loss BEFORE Control: ${fmtRM(aleBefore)}/year`,
        `📊 Annual Loss AFTER Control: ${fmtRM(aleAfter)}/year`,
        `💰 Annual Savings: ${fmtRM(annualSavings)}/year`,
        `💸 Cost of Control: ${fmtRM(costOfControl)}/year`,
        `📈 Return on Investment (ROI): ${roi}%`,
        `✅ Net Value of Control: ${fmtRM(valueOfControl)}/year`,
      ],
      recommendation: `This security control is financially justified. By investing ${fmtRM(costOfControl)} per year, the organization saves ${fmtRM(annualSavings)} per year in potential losses. The control reduces annual risk exposure by ${controlEffectiveness}% with a positive ROI of ${roi}%. It is recommended to implement this control as soon as possible.`
    };
  } else {
    return {
      decision: 'NOT COST EFFECTIVE',
      color: '#922b21',
      bgColor: '#fadbd8',
      borderColor: '#e74c3c',
      icon: '❌',
      analysis: [
        `📊 Annual Loss BEFORE Control: ${fmtRM(aleBefore)}/year`,
        `📊 Annual Loss AFTER Control: ${fmtRM(aleAfter)}/year`,
        `💰 Annual Savings: ${fmtRM(annualSavings)}/year`,
        `💸 Cost of Control: ${fmtRM(costOfControl)}/year`,
        `📉 Net Value of Control: ${fmtRM(valueOfControl)}/year (negative)`,
      ],
      recommendation: `This security control is NOT financially justified at this cost. The implementation cost of ${fmtRM(costOfControl)} per year exceeds the annual savings of ${fmtRM(annualSavings)}. Consider finding a more cost-effective alternative control or negotiating a lower implementation cost.`
    };
  }
};

const RiskAssessment = () => {
  const [assessmentMode, setAssessmentMode] = useState('qualitative');
  const [riskResult, setRiskResult] = useState(null);
  const [savedAssessments, setSavedAssessments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const [assets, setAssets] = useState([]);
  const [allThreats, setAllThreats] = useState([]);

  const [showRiskMatrix, setShowRiskMatrix] = useState(false);
  const [showLikelihoodGuide, setShowLikelihoodGuide] = useState(false);
  const [showImpactGuide, setShowImpactGuide] = useState(false);
  const [showVulnGuide, setShowVulnGuide] = useState(false);

  const [qualitativeData, setQualitativeData] = useState({
    assetId: '', asset: '', threatId: '', threat: '', currentControl: '', likelihood: 'Medium', impact: 'Medium'
  });

  const [quantitativeData, setQuantitativeData] = useState({
    assetId: '', asset: '', threatId: '', threat: '', currentControl: '',
    assetValue: '', vulnerabilityScore: 50, exposureFactor: 50, aro: '', costOfControl: '', controlEffectiveness: 50
  });

  const [hybridData, setHybridData] = useState({
    assetId: '', asset: '', threatId: '', threat: '', currentControl: '',
    likelihood: 'Medium', impact: 'Medium', assetValue: '', controlEffectiveness: '50'
  });

  const likelihoodOptions = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const impactOptions = ['Very Low', 'Low', 'Medium', 'High', 'Critical'];

  useEffect(() => { fetchHistory(); fetchDBData(); }, []);

  const fetchDBData = async () => {
    try {
      const [assetsRes, threatsRes] = await Promise.all([assetsAPI.getAll(), threatsAPI.getAll()]);
      setAssets(assetsRes.data || []);
      setAllThreats(threatsRes.data || []);
    } catch (err) { console.error('Failed to load assets/threats:', err); }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await assessmentsAPI.getAll();
      setSavedAssessments(response.data);
    } catch (err) { console.error('Failed to load assessment history:', err); }
    finally { setLoadingHistory(false); }
  };

  const getThreatsForAsset = (assetId) => allThreats.filter(t => t.asset_id === parseInt(assetId));
  const getMatrixCellClass = (level) => ({ 'Critical': 'matrix-critical', 'High': 'matrix-high', 'Medium': 'matrix-medium', 'Low': 'matrix-low' })[level] || 'matrix-low';

  const handleAssetChange = (mode, assetId) => {
    const asset = assets.find(a => a.id === parseInt(assetId));
    const defaultVal = asset ? assetValueDefaults[asset.value] || '' : '';
    if (mode === 'qualitative') setQualitativeData(p => ({ ...p, assetId, asset: asset?.name || '', threatId: '', threat: '', currentControl: '' }));
    else if (mode === 'quantitative') setQuantitativeData(p => ({ ...p, assetId, asset: asset?.name || '', threatId: '', threat: '', currentControl: '', assetValue: defaultVal }));
    else setHybridData(p => ({ ...p, assetId, asset: asset?.name || '', threatId: '', threat: '', currentControl: '', assetValue: defaultVal }));
  };

  const handleThreatChange = (mode, threatId) => {
    const threat = allThreats.find(t => t.id === parseInt(threatId));
    if (mode === 'qualitative') setQualitativeData(p => ({ ...p, threatId, threat: threat?.threat_name || '', currentControl: threat?.current_control || '', likelihood: threat?.likelihood || p.likelihood, impact: threat?.impact || p.impact }));
    else if (mode === 'quantitative') setQuantitativeData(p => ({ ...p, threatId, threat: threat?.threat_name || '', currentControl: threat?.current_control || '' }));
    else setHybridData(p => ({ ...p, threatId, threat: threat?.threat_name || '', currentControl: threat?.current_control || '', likelihood: threat?.likelihood || p.likelihood, impact: threat?.impact || p.impact }));
  };

  const calculateQualitativeRisk = () => {
    const lv = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    const iv = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Critical': 5 };
    const ls = lv[qualitativeData.likelihood];
    const is = iv[qualitativeData.impact];
    const riskScore = ls * is;
    let riskLevel = riskScore >= 20 ? 'Critical' : riskScore >= 12 ? 'High' : riskScore >= 6 ? 'Medium' : 'Low';
    setRiskResult({ type: 'qualitative', asset: qualitativeData.asset, threat: qualitativeData.threat, currentControl: qualitativeData.currentControl, likelihood: qualitativeData.likelihood, impact: qualitativeData.impact, riskScore, riskLevel, calculation: `Risk Score = ${ls} (Likelihood) × ${is} (Impact) = ${riskScore}\nRisk Level = ${riskLevel}` });
  };

  const calculateQuantitativeRisk = () => {
    const assetValue = parseFloat(quantitativeData.assetValue);
    const exposureFactor = parseFloat(quantitativeData.exposureFactor) / 100;
    const aro = parseFloat(quantitativeData.aro);
    const costOfControl = parseFloat(quantitativeData.costOfControl) || 0;
    const controlEffectiveness = parseFloat(quantitativeData.controlEffectiveness) / 100;
    const sle = assetValue * exposureFactor;
    const aleBefore = sle * aro;
    const aleAfter = aleBefore * (1 - controlEffectiveness);
    const valueOfControl = aleBefore - aleAfter - costOfControl;
    let riskLevel = aleBefore >= 100000 ? 'Critical' : aleBefore >= 50000 ? 'High' : aleBefore >= 10000 ? 'Medium' : 'Low';
    const justification = generateJustification(aleBefore, aleAfter, costOfControl, valueOfControl, parseFloat(quantitativeData.controlEffectiveness));
    setRiskResult({
      type: 'quantitative', asset: quantitativeData.asset, threat: quantitativeData.threat,
      currentControl: quantitativeData.currentControl, assetValue,
      vulnerabilityScore: quantitativeData.vulnerabilityScore,
      exposureFactor: parseFloat(quantitativeData.exposureFactor), aro, costOfControl,
      controlEffectiveness: parseFloat(quantitativeData.controlEffectiveness),
      sle, aleBefore, aleAfter, valueOfControl, riskLevel, justification,
      calculation:
        `Step 1 — SLE = Asset Value × Exposure Factor\n  SLE = ${fmtRM(assetValue)} × ${quantitativeData.exposureFactor}% = ${fmtRM(sle)}\n\n` +
        `Step 2 — ALE Before Control = SLE × ARO\n  ALE Before = ${fmtRM(sle)} × ${aro} = ${fmtRM(aleBefore)}/year\n\n` +
        `Step 3 — ALE After Control = ALE Before × (1 − Control Effectiveness)\n  ALE After = ${fmtRM(aleBefore)} × (1 − ${quantitativeData.controlEffectiveness}%) = ${fmtRM(aleAfter)}/year\n\n` +
        `Step 4 — Value of Control (CBA) = ALE Before − ALE After − Cost of Control\n  Value = ${fmtRM(aleBefore)} − ${fmtRM(aleAfter)} − ${fmtRM(costOfControl)} = ${fmtRM(valueOfControl)}`
    });
  };

  const calculateHybridRisk = () => {
    const lv = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
    const iv = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Critical': 5 };
    const ls = lv[hybridData.likelihood];
    const is = iv[hybridData.impact];
    const qualitativeScore = ls * is;
    const assetValue = parseFloat(hybridData.assetValue);
    const controlEffectiveness = parseFloat(hybridData.controlEffectiveness);
    const residualRisk = qualitativeScore * (assetValue / 100) * ((100 - controlEffectiveness) / 100);
    let riskLevel = residualRisk >= 15 ? 'Critical' : residualRisk >= 10 ? 'High' : residualRisk >= 5 ? 'Medium' : 'Low';
    setRiskResult({ type: 'hybrid', asset: hybridData.asset, threat: hybridData.threat, currentControl: hybridData.currentControl, likelihood: hybridData.likelihood, impact: hybridData.impact, qualitativeScore, assetValue, controlEffectiveness, residualRisk: residualRisk.toFixed(2), riskLevel, calculation: `Qualitative Score = ${ls} (Likelihood) × ${is} (Impact) = ${qualitativeScore}\nResidual Risk = ${qualitativeScore} × (RM ${assetValue}/100) × (1 − ${controlEffectiveness}%) = ${residualRisk.toFixed(2)}` });
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setSaveSuccess(''); setSaveError('');
    if (assessmentMode === 'qualitative') calculateQualitativeRisk();
    else if (assessmentMode === 'quantitative') calculateQuantitativeRisk();
    else calculateHybridRisk();
  };

  const handleReset = () => {
    setRiskResult(null); setSaveSuccess(''); setSaveError('');
    setQualitativeData({ assetId: '', asset: '', threatId: '', threat: '', currentControl: '', likelihood: 'Medium', impact: 'Medium' });
    setQuantitativeData({ assetId: '', asset: '', threatId: '', threat: '', currentControl: '', assetValue: '', vulnerabilityScore: 50, exposureFactor: 50, aro: '', costOfControl: '', controlEffectiveness: 50 });
    setHybridData({ assetId: '', asset: '', threatId: '', threat: '', currentControl: '', likelihood: 'Medium', impact: 'Medium', assetValue: '', controlEffectiveness: '50' });
  };

  const handleSaveAssessment = async () => {
    if (!riskResult) return;
    setSaving(true); setSaveSuccess(''); setSaveError('');
    try {
      let payload = { assessment_type: riskResult.type, asset_name: riskResult.asset, threat_name: riskResult.threat, risk_level: riskResult.riskLevel, calculation: riskResult.calculation };
      if (riskResult.type === 'qualitative') {
        payload = { ...payload, likelihood: riskResult.likelihood, impact: riskResult.impact, risk_score: riskResult.riskScore };
      } else if (riskResult.type === 'quantitative') {
        payload = { ...payload, asset_value: riskResult.assetValue, exposure_factor: riskResult.exposureFactor, aro: riskResult.aro, sle: riskResult.sle, ale: riskResult.aleBefore, vulnerability_score: riskResult.vulnerabilityScore, cost_of_control: riskResult.costOfControl, ale_before: riskResult.aleBefore, ale_after: riskResult.aleAfter, value_of_control: riskResult.valueOfControl, control_effectiveness: riskResult.controlEffectiveness };
      } else {
        payload = { ...payload, likelihood: riskResult.likelihood, impact: riskResult.impact, risk_score: riskResult.qualitativeScore, asset_value: riskResult.assetValue, control_effectiveness: riskResult.controlEffectiveness, residual_risk: parseFloat(riskResult.residualRisk) };
      }
      await assessmentsAPI.create(payload);
      setSaveSuccess('Assessment saved successfully!');
      fetchHistory();
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save assessment');
      setTimeout(() => setSaveError(''), 4000);
    } finally { setSaving(false); }
  };

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm('Delete this saved assessment?')) return;
    try {
      await assessmentsAPI.delete(id);
      setSavedAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err) { setSaveError(err.response?.data?.message || 'Failed to delete assessment'); }
  };

  const getRiskColor = (level) => ({ 'Critical': '#8e1010', 'High': '#e74c3c', 'Medium': '#f39c12', 'Low': '#27ae60' })[level] || '#6c757d';
  const getBadgeClass = (level) => ({ 'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' })[level] || 'badge-medium';

  const renderAssetThreatFields = (mode, data) => {
    const threatsForAsset = getThreatsForAsset(data.assetId);
    return (
      <>
        <div className="form-group">
          <label className="form-label">Asset Name *</label>
          <select className="form-select" value={data.assetId} onChange={e => handleAssetChange(mode, e.target.value)} required>
            <option value="">Select an asset...</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.value})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Threat Name *</label>
          <select className="form-select" value={data.threatId} onChange={e => handleThreatChange(mode, e.target.value)} required disabled={!data.assetId}>
            <option value="">{data.assetId ? 'Select a threat...' : 'Select an asset first'}</option>
            {threatsForAsset.map(t => <option key={t.id} value={t.id}>{t.threat_name}</option>)}
          </select>
        </div>
        {data.threatId && (
          <div className="current-control-box">
            <div className="current-control-label">Current Control</div>
            <div className="current-control-value">{data.currentControl || 'No controls currently in place'}</div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="risk-assessment">
      <div className="page-header">
        <div className="header-content">
          <h2><Calculator size={28} />Risk Assessment Calculator</h2>
          <p>Calculate cybersecurity risks using different methodologies</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><TrendingUp size={20} />Select Assessment Method</div>
        <div className="mode-selector">
          <div className={`mode-card ${assessmentMode === 'qualitative' ? 'active' : ''}`} onClick={() => { setAssessmentMode('qualitative'); handleReset(); }}>
            <div className="mode-icon"><AlertCircle size={32} /></div>
            <h3>Qualitative</h3><p>Risk = Likelihood × Impact</p>
            <p className="mode-description">Uses descriptive scales to assess risk levels</p>
          </div>
          <div className={`mode-card ${assessmentMode === 'quantitative' ? 'active' : ''}`} onClick={() => { setAssessmentMode('quantitative'); handleReset(); }}>
            <div className="mode-icon"><Calculator size={32} /></div>
            <h3>Quantitative</h3><p>ALE = SLE × ARO + CBA</p>
            <p className="mode-description">Uses financial metrics and cost-benefit analysis</p>
          </div>
          <div className={`mode-card ${assessmentMode === 'hybrid' ? 'active' : ''}`} onClick={() => { setAssessmentMode('hybrid'); handleReset(); }}>
            <div className="mode-icon"><CheckCircle size={32} /></div>
            <h3>Hybrid</h3><p>Combines both approaches</p>
            <p className="mode-description">Integrates qualitative and quantitative factors</p>
          </div>
        </div>
      </div>

      <div className="card">
        <button className="guide-toggle-btn" onClick={() => setShowRiskMatrix(v => !v)}>
          <Grid size={16} />Risk Assessment Matrix (Likelihood × Impact)
          {showRiskMatrix ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showRiskMatrix && (
          <>
            <div style={{ overflowX: 'auto', padding: '8px 16px' }}>
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
                      {row.vals.map((cell, i) => <td key={i} className={`matrix-cell ${getMatrixCellClass(cell.l)}`}>{cell.v} — {cell.l}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="matrix-legend">
              <span className="legend-item matrix-low">Low (1–5) — Monitor annually</span>
              <span className="legend-item matrix-medium">Medium (6–11) — Action within 90 days</span>
              <span className="legend-item matrix-high">High (12–19) — Action within 30 days</span>
              <span className="legend-item matrix-critical">Critical (20–25) — Immediate action</span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><Info size={20} />Risk Assessment Form</div>
          <form onSubmit={handleCalculate} className="assessment-form">

            {assessmentMode === 'qualitative' && (
              <>
                {renderAssetThreatFields('qualitative', qualitativeData)}
                <div className="form-group">
                  <label className="form-label">Likelihood *<button type="button" className="label-info-btn" onClick={() => setShowLikelihoodGuide(v => !v)}><Info size={14} /></button></label>
                  <select className="form-select" value={qualitativeData.likelihood} onChange={e => setQualitativeData(p => ({ ...p, likelihood: e.target.value }))} required>
                    {likelihoodOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {showLikelihoodGuide && <div className="inline-guide">{likelihoodGuide.map(r => <div key={r.level} className="inline-guide-row"><strong>{r.level} ({r.value}):</strong> {r.freq} — {r.desc}</div>)}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Impact *<button type="button" className="label-info-btn" onClick={() => setShowImpactGuide(v => !v)}><Info size={14} /></button></label>
                  <select className="form-select" value={qualitativeData.impact} onChange={e => setQualitativeData(p => ({ ...p, impact: e.target.value }))} required>
                    {impactOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {showImpactGuide && <div className="inline-guide">{impactGuide.map(r => <div key={r.level} className="inline-guide-row"><strong>{r.level} ({r.value}):</strong> {r.financial} — {r.desc}</div>)}</div>}
                </div>
              </>
            )}

            {assessmentMode === 'quantitative' && (
              <>
                {renderAssetThreatFields('quantitative', quantitativeData)}
                <div className="form-group">
                  <label className="form-label">Asset Value (RM) *</label>
                  <input type="number" className="form-input" value={quantitativeData.assetValue} onChange={e => setQuantitativeData(p => ({ ...p, assetValue: e.target.value }))} required min="0" step="0.01" placeholder="e.g., 5000" />
                  <small className="form-hint">Total value of the asset in Ringgit Malaysia (RM).</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Vulnerability Score (%) *<button type="button" className="label-info-btn" onClick={() => setShowVulnGuide(v => !v)}><Info size={14} /></button></label>
                  <input type="range" className="form-range" value={quantitativeData.vulnerabilityScore} onChange={e => setQuantitativeData(p => ({ ...p, vulnerabilityScore: parseInt(e.target.value) }))} min="0" max="100" step="1" />
                  <div className="range-value">{quantitativeData.vulnerabilityScore}%</div>
                  <small className="form-hint">How vulnerable is the asset?</small>
                  {showVulnGuide && <div className="inline-guide">{vulnGuide.map(r => <div key={r.range} className="inline-guide-row"><strong>{r.range} ({r.level}):</strong> {r.meaning}</div>)}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Exposure Factor (%) *</label>
                  <input type="range" className="form-range" value={quantitativeData.exposureFactor} onChange={e => setQuantitativeData(p => ({ ...p, exposureFactor: parseInt(e.target.value) }))} min="0" max="100" step="1" />
                  <div className="range-value">{quantitativeData.exposureFactor}%</div>
                  <small className="form-hint">If an attack happens, what percentage of the asset value is lost?</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Annual Rate of Occurrence (ARO) *</label>
                  <input type="number" className="form-input" value={quantitativeData.aro} onChange={e => setQuantitativeData(p => ({ ...p, aro: e.target.value }))} required min="0" step="0.1" placeholder="e.g., 3" />
                  <small className="form-hint">How many times per year is this attack expected to occur?</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Cost of Control (RM) *</label>
                  <input type="number" className="form-input" value={quantitativeData.costOfControl} onChange={e => setQuantitativeData(p => ({ ...p, costOfControl: e.target.value }))} required min="0" step="0.01" placeholder="e.g., 500" />
                  <small className="form-hint">Annual cost (RM) to implement the proposed security control.</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Control Effectiveness (%) *</label>
                  <input type="range" className="form-range" value={quantitativeData.controlEffectiveness} onChange={e => setQuantitativeData(p => ({ ...p, controlEffectiveness: parseInt(e.target.value) }))} min="0" max="100" step="1" />
                  <div className="range-value">{quantitativeData.controlEffectiveness}%</div>
                  <small className="form-hint">How effective is the proposed control?</small>
                </div>
              </>
            )}

            {assessmentMode === 'hybrid' && (
              <>
                {renderAssetThreatFields('hybrid', hybridData)}
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Likelihood *<button type="button" className="label-info-btn" onClick={() => setShowLikelihoodGuide(v => !v)}><Info size={14} /></button></label>
                    <select className="form-select" value={hybridData.likelihood} onChange={e => setHybridData(p => ({ ...p, likelihood: e.target.value }))} required>
                      {likelihoodOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Impact *<button type="button" className="label-info-btn" onClick={() => setShowImpactGuide(v => !v)}><Info size={14} /></button></label>
                    <select className="form-select" value={hybridData.impact} onChange={e => setHybridData(p => ({ ...p, impact: e.target.value }))} required>
                      {impactOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                {(showLikelihoodGuide || showImpactGuide) && (
                  <div className="inline-guide">
                    {showLikelihoodGuide && likelihoodGuide.map(r => <div key={r.level} className="inline-guide-row"><strong>Likelihood {r.level} ({r.value}):</strong> {r.freq}</div>)}
                    {showImpactGuide && impactGuide.map(r => <div key={r.level} className="inline-guide-row"><strong>Impact {r.level} ({r.value}):</strong> {r.financial}</div>)}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Asset Value (RM) *</label>
                  <input type="number" className="form-input" value={hybridData.assetValue} onChange={e => setHybridData(p => ({ ...p, assetValue: e.target.value }))} required min="0" step="0.01" placeholder="e.g., 5000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Control Effectiveness (%)</label>
                  <input type="range" className="form-range" value={hybridData.controlEffectiveness} onChange={e => setHybridData(p => ({ ...p, controlEffectiveness: e.target.value }))} min="0" max="100" step="5" />
                  <div className="range-value">{hybridData.controlEffectiveness}%</div>
                  <small className="form-hint">Effectiveness of existing security controls.</small>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-full"><Calculator size={18} />Calculate Risk</button>
              <button type="button" className="btn btn-secondary btn-full" onClick={handleReset}>Reset Form</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><TrendingUp size={20} />Risk Assessment Result</div>
          {riskResult ? (
            <div className="risk-result">
              <div className="result-header">
                <h3>{riskResult.asset}</h3>
                <p className="threat-name">{riskResult.threat}</p>
              </div>

              {riskResult.currentControl && (
                <div className="current-control-box" style={{ marginBottom: '16px' }}>
                  <div className="current-control-label">Current Control</div>
                  <div className="current-control-value">{riskResult.currentControl}</div>
                </div>
              )}

              <div className="result-badge-container">
                <div className="result-badge" style={{ backgroundColor: getRiskColor(riskResult.riskLevel) }}>
                  <span className="badge-label">Risk Level</span>
                  <span className="badge-value">{riskResult.riskLevel}</span>
                </div>
              </div>

              <div className="result-details">
                {riskResult.type === 'qualitative' && (
                  <>
                    <div className="detail-row"><span className="detail-label">Likelihood:</span><span className="detail-value">{riskResult.likelihood}</span></div>
                    <div className="detail-row"><span className="detail-label">Impact:</span><span className="detail-value">{riskResult.impact}</span></div>
                    <div className="detail-row highlight"><span className="detail-label">Risk Score:</span><span className="detail-value">{riskResult.riskScore} / 25</span></div>
                  </>
                )}

                {riskResult.type === 'quantitative' && (
                  <>
                    <div className="detail-row"><span className="detail-label">Asset Value (RM):</span><span className="detail-value">{fmtRM(riskResult.assetValue)}</span></div>
                    <div className="detail-row"><span className="detail-label">Vulnerability Score:</span><span className="detail-value">{riskResult.vulnerabilityScore}%</span></div>
                    <div className="detail-row"><span className="detail-label">Exposure Factor:</span><span className="detail-value">{riskResult.exposureFactor}%</span></div>
                    <div className="detail-row"><span className="detail-label">ARO:</span><span className="detail-value">{riskResult.aro} times/year</span></div>
                    <div className="detail-row highlight"><span className="detail-label">SLE:</span><span className="detail-value">{fmtRM(riskResult.sle)}</span></div>
                    <div className="detail-row highlight"><span className="detail-label">ALE Before Control:</span><span className="detail-value">{fmtRM(riskResult.aleBefore)}/year</span></div>
                    <div className="detail-row"><span className="detail-label">Cost of Control:</span><span className="detail-value">{fmtRM(riskResult.costOfControl)}/year</span></div>
                    <div className="detail-row"><span className="detail-label">Control Effectiveness:</span><span className="detail-value">{riskResult.controlEffectiveness}%</span></div>
                    <div className="detail-row"><span className="detail-label">ALE After Control:</span><span className="detail-value">{fmtRM(riskResult.aleAfter)}/year</span></div>
                    <div className={`detail-row ${riskResult.valueOfControl >= 0 ? 'highlight-positive' : 'highlight-negative'}`}>
                      <span className="detail-label">Value of Control (CBA):</span>
                      <span className="detail-value">{fmtRM(riskResult.valueOfControl)}</span>
                    </div>

                    {/* ── CBA JUSTIFICATION BOX ── */}
                    {riskResult.justification && (
                      <div style={{
                        marginTop: '12px',
                        padding: '14px',
                        backgroundColor: riskResult.justification.bgColor,
                        border: `2px solid ${riskResult.justification.borderColor}`,
                        borderRadius: '8px',
                      }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: riskResult.justification.color, marginBottom: '10px' }}>
                          {riskResult.justification.icon} Decision: {riskResult.justification.decision}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          {riskResult.justification.analysis.map((line, i) => (
                            <div key={i} style={{ fontSize: '12px', color: riskResult.justification.color, marginBottom: '3px' }}>{line}</div>
                          ))}
                        </div>
                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: riskResult.justification.color,
                          fontStyle: 'italic'
                        }}>
                          📋 <strong>Recommendation:</strong> {riskResult.justification.recommendation}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {riskResult.type === 'hybrid' && (
                  <>
                    <div className="detail-row"><span className="detail-label">Likelihood:</span><span className="detail-value">{riskResult.likelihood}</span></div>
                    <div className="detail-row"><span className="detail-label">Impact:</span><span className="detail-value">{riskResult.impact}</span></div>
                    <div className="detail-row"><span className="detail-label">Qualitative Score:</span><span className="detail-value">{riskResult.qualitativeScore}</span></div>
                    <div className="detail-row"><span className="detail-label">Asset Value (RM):</span><span className="detail-value">{fmtRM(riskResult.assetValue)}</span></div>
                    <div className="detail-row"><span className="detail-label">Control Effectiveness:</span><span className="detail-value">{riskResult.controlEffectiveness}%</span></div>
                    <div className="detail-row highlight"><span className="detail-label">Residual Risk Score:</span><span className="detail-value">{riskResult.residualRisk}</span></div>
                  </>
                )}
              </div>

              <div className="calculation-box">
                <h4>Calculation Steps:</h4>
                <pre>{riskResult.calculation}</pre>
              </div>

              {saveSuccess && <div style={{ padding: '10px', backgroundColor: '#e8f8e8', color: '#27ae60', borderRadius: '6px', marginBottom: '10px', fontSize: '14px' }}>{saveSuccess}</div>}
              {saveError && <div style={{ padding: '10px', backgroundColor: '#fde8e8', color: '#c0392b', borderRadius: '6px', marginBottom: '10px', fontSize: '14px' }}>{saveError}</div>}

              <button className="btn btn-success btn-full" onClick={handleSaveAssessment} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Assessment'}
              </button>
            </div>
          ) : (
            <div className="no-result">
              <Calculator size={64} />
              <p>Complete the form and click "Calculate Risk" to see results</p>
            </div>
          )}
        </div>
      </div>

      {/* Saved Assessments History */}
      <div className="card">
        <div className="card-header"><Clock size={20} />Saved Assessment History ({savedAssessments.length})</div>
        {loadingHistory ? (
          <div style={{ padding: '20px', color: '#6c757d', textAlign: 'center' }}>Loading history...</div>
        ) : savedAssessments.length === 0 ? (
          <div style={{ padding: '30px', color: '#6c757d', textAlign: 'center' }}>
            <Clock size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p>No saved assessments yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Asset</th><th>Threat</th><th>Type</th><th>Risk Level</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {savedAssessments.map(a => (
                  <tr key={a.id}>
                    <td>{a.asset_name}</td>
                    <td>{a.threat_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{a.assessment_type}</td>
                    <td><span className={`badge ${getBadgeClass(a.risk_level)}`}>{a.risk_level}</span></td>
                    <td>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td><button className="btn-icon danger" onClick={() => handleDeleteAssessment(a.id)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Value Guides */}
      <div className="card">
        <div className="card-header"><Info size={20} />Value Definition Guides</div>
        <div className="guide-toggle-section">
          <button className="guide-toggle-btn" onClick={() => setShowLikelihoodGuide(v => !v)}>
            <Info size={16} />Likelihood Guide{showLikelihoodGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showLikelihoodGuide && (
            <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
              <table className="guide-table">
                <thead><tr><th>Likelihood</th><th>Value</th><th>Frequency</th><th>Description</th></tr></thead>
                <tbody>{likelihoodGuide.map(r => <tr key={r.level}><td><span className={`badge ${getBadgeClass(r.level)}`}>{r.level}</span></td><td style={{ textAlign: 'center', fontWeight: 600 }}>{r.value}</td><td>{r.freq}</td><td>{r.desc}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
        <div className="guide-toggle-section">
          <button className="guide-toggle-btn" onClick={() => setShowImpactGuide(v => !v)}>
            <Info size={16} />Impact Guide{showImpactGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showImpactGuide && (
            <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
              <table className="guide-table">
                <thead><tr><th>Impact</th><th>Value</th><th>Financial Loss (RM)</th><th>Description</th></tr></thead>
                <tbody>{impactGuide.map(r => <tr key={r.level}><td><span className={`badge ${getBadgeClass(r.level)}`}>{r.level}</span></td><td style={{ textAlign: 'center', fontWeight: 600 }}>{r.value}</td><td>{r.financial}</td><td>{r.desc}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
        <div className="guide-toggle-section">
          <button className="guide-toggle-btn" onClick={() => setShowVulnGuide(v => !v)}>
            <Info size={16} />Vulnerability Score Guide{showVulnGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showVulnGuide && (
            <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
              <table className="guide-table">
                <thead><tr><th>Score Range</th><th>Level</th><th>Meaning</th></tr></thead>
                <tbody>{vulnGuide.map(r => <tr key={r.range}><td style={{ fontWeight: 600 }}>{r.range}</td><td><span className={`badge ${getBadgeClass(r.level)}`}>{r.level}</span></td><td>{r.meaning}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><Info size={20} />Assessment Methodology Information</div>
        <div className="methodology-info">
          <div className="info-section">
            <h4>Qualitative Assessment</h4>
            <p>Uses descriptive scales to evaluate likelihood and impact. Best for quick assessments when precise financial data is unavailable.</p>
            <ul><li>Simple and intuitive</li><li>Requires less data</li><li>Suitable for initial risk screening</li></ul>
          </div>
          <div className="info-section">
            <h4>Quantitative Assessment</h4>
            <p>Uses financial metrics in RM. Calculates ALE Before/After control and performs Cost-Benefit Analysis with full justification and ROI calculation.</p>
            <ul><li>Provides financial impact estimates in RM</li><li>Includes Cost-Benefit Analysis (CBA)</li><li>Shows ROI and recommendation</li></ul>
          </div>
          <div className="info-section">
            <h4>Hybrid Assessment</h4>
            <p>Combines qualitative ratings with quantitative factors. Includes control effectiveness to calculate residual risk.</p>
            <ul><li>Balances simplicity and precision</li><li>Accounts for existing controls</li><li>Provides comprehensive risk view</li></ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;