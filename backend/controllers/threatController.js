const { promisePool } = require('../config/database');

const LIKELIHOOD_LEVELS = Object.freeze([
  'Very Low', 'Low', 'Medium', 'High', 'Very High',
]);
const IMPACT_LEVELS = Object.freeze([
  'Very Low', 'Low', 'Medium', 'High', 'Critical',
]);

function validateThreatPayload(body) {
  const { threatName, threatDescription, vulnerability, likelihood, impact } = body;

  const missingCore =
    threatName == null || !String(threatName).trim() ||
    threatDescription == null || !String(threatDescription).trim() ||
    vulnerability == null || !String(vulnerability).trim() ||
    likelihood == null || !String(likelihood).trim() ||
    impact == null || !String(impact).trim();

  if (missingCore) {
    return {
      ok: false, status: 400,
      message: 'Please fill in all required fields: threat name, description, vulnerability, likelihood, and impact.',
    };
  }

  if (!LIKELIHOOD_LEVELS.includes(likelihood)) {
    return { ok: false, status: 400, message: `Invalid likelihood. Use one of: ${LIKELIHOOD_LEVELS.join(', ')}.` };
  }
  if (!IMPACT_LEVELS.includes(impact)) {
    return { ok: false, status: 400, message: `Invalid impact. Use one of: ${IMPACT_LEVELS.join(', ')}.` };
  }

  return { ok: true };
}

async function assertUserOwnsAsset(userId, assetId) {
  const assetIdNum = parseInt(String(assetId), 10);
  if (Number.isNaN(assetIdNum) || assetIdNum < 1) {
    return { ok: false, status: 400, message: 'Please select a valid asset.' };
  }
  const [rows] = await promisePool.query(
    'SELECT id, name FROM assets WHERE id = ? AND user_id = ?',
    [assetIdNum, userId]
  );
  if (rows.length === 0) {
    return {
      ok: false, status: 400,
      message: 'That asset was not found or does not belong to your account.',
    };
  }
  return { ok: true, assetId: assetIdNum, assetName: rows[0].name };
}

const calculateRiskLevel = (likelihood, impact) => {
  const likelihoodValues = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
  const impactValues = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Critical': 5 };
  const score = likelihoodValues[likelihood] * impactValues[impact];
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
};

// ISO/IEC 27001:2022 Annex A Controls reference
const getProposedControl = (riskLevel, threatName) => {
  const threat = (threatName || '').toLowerCase();
  
  if (threat.includes('sql') || threat.includes('injection')) {
    return 'Implement parameterized queries and input validation — ISO/IEC 27001:2022 Annex A.8.28 (Secure coding)';
  }
  if (threat.includes('xss') || threat.includes('cross-site')) {
    return 'Implement input sanitization and output encoding — ISO/IEC 27001:2022 Annex A.8.28 (Secure coding)';
  }
  if (threat.includes('brute') || threat.includes('password')) {
    return 'Implement account lockout policy and multi-factor authentication — ISO/IEC 27001:2022 Annex A.5.17 (Authentication)';
  }
  if (threat.includes('malware') || threat.includes('virus') || threat.includes('ransomware')) {
    return 'Install and regularly update enterprise antivirus software — ISO/IEC 27001:2022 Annex A.8.7 (Malware protection)';
  }
  if (threat.includes('phishing') || threat.includes('social')) {
    return 'Conduct regular security awareness training — ISO/IEC 27001:2022 Annex A.6.3 (Security awareness)';
  }
  if (threat.includes('unauthorized') || threat.includes('access')) {
    return 'Implement Role-Based Access Control and least privilege principle — ISO/IEC 27001:2022 Annex A.8.3 (Access control)';
  }
  if (threat.includes('data') || threat.includes('breach') || threat.includes('leak')) {
    return 'Implement data encryption at rest and in transit — ISO/IEC 27001:2022 Annex A.8.24 (Encryption)';
  }
  if (threat.includes('backup') || threat.includes('loss')) {
    return 'Implement regular automated backup with offsite storage — ISO/IEC 27001:2022 Annex A.8.13 (Backup)';
  }
  if (threat.includes('network') || threat.includes('ddos')) {
    return 'Implement network segmentation and firewall rules — ISO/IEC 27001:2022 Annex A.8.20 (Network security)';
  }
  if (threat.includes('physical') || threat.includes('theft')) {
    return 'Implement physical access controls and CCTV monitoring — ISO/IEC 27001:2022 Annex A.7.1 (Physical security)';
  }

  // Default based on risk level
  if (riskLevel === 'Critical') {
    return 'Implement immediate security controls and incident response plan — ISO/IEC 27001:2022 Annex A.5.24 (Incident management)';
  }
  if (riskLevel === 'High') {
    return 'Implement access control and security monitoring — ISO/IEC 27001:2022 Annex A.8.15 (Logging and monitoring)';
  }
  return 'Implement regular security review and risk assessment — ISO/IEC 27001:2022 Clause 8.2 (Risk assessment)';
};

// @desc    Get all threats
// @route   GET /api/threats
// @access  Private
const getThreats = async (req, res) => {
  try {
    const [threats] = await promisePool.query(
      'SELECT * FROM threats WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, count: threats.length, data: threats });
  } catch (error) {
    console.error('Get threats error:', error);
    res.status(500).json({ success: false, message: 'Server error getting threats' });
  }
};

// @desc    Create new threat
// @route   POST /api/threats
// @access  Private
const createThreat = async (req, res) => {
  try {
    const { assetId, threatName, threatDescription, vulnerability, currentControl, proposedControl, likelihood, impact } = req.body;

    const payloadCheck = validateThreatPayload(req.body);
    if (!payloadCheck.ok) {
      return res.status(payloadCheck.status).json({ success: false, message: payloadCheck.message });
    }

    if (assetId == null || assetId === '') {
      return res.status(400).json({ success: false, message: 'Please select an asset for this threat.' });
    }

    const asset = await assertUserOwnsAsset(req.user.id, assetId);
    if (!asset.ok) {
      return res.status(asset.status).json({ success: false, message: asset.message });
    }

    const riskLevel = calculateRiskLevel(likelihood, impact);

    // Auto-suggest proposed control if not provided
    const finalProposedControl = proposedControl && String(proposedControl).trim()
      ? String(proposedControl).trim()
      : getProposedControl(riskLevel, threatName);

    const [result] = await promisePool.query(
      `INSERT INTO threats (user_id, asset_id, asset_name, threat_name, threat_description,
       vulnerability, current_control, proposed_control, likelihood, impact, risk_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        asset.assetId,
        asset.assetName,
        String(threatName).trim(),
        String(threatDescription).trim(),
        String(vulnerability).trim(),
        currentControl != null && String(currentControl).trim() ? String(currentControl).trim() : null,
        finalProposedControl,
        likelihood,
        impact,
        riskLevel,
      ]
    );

    const [threats] = await promisePool.query('SELECT * FROM threats WHERE id = ?', [result.insertId]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE_THREAT', 'threats', result.insertId, `Created threat: ${String(threatName).trim()}`]
    );

    res.status(201).json({ success: true, message: 'Threat created successfully', data: threats[0] });
  } catch (error) {
    console.error('Create threat error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid asset reference.' });
    }
    res.status(500).json({ success: false, message: 'Server error creating threat' });
  }
};

// @desc    Update threat
// @route   PUT /api/threats/:id
// @access  Private
const updateThreat = async (req, res) => {
  try {
    const { assetId, threatName, threatDescription, vulnerability, currentControl, proposedControl, likelihood, impact } = req.body;

    const payloadCheck = validateThreatPayload(req.body);
    if (!payloadCheck.ok) {
      return res.status(payloadCheck.status).json({ success: false, message: payloadCheck.message });
    }

    if (assetId == null || assetId === '') {
      return res.status(400).json({ success: false, message: 'Please select an asset for this threat.' });
    }

    const [existing] = await promisePool.query(
      'SELECT id FROM threats WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Threat not found' });
    }

    const asset = await assertUserOwnsAsset(req.user.id, assetId);
    if (!asset.ok) {
      return res.status(asset.status).json({ success: false, message: asset.message });
    }

    const riskLevel = calculateRiskLevel(likelihood, impact);

    const finalProposedControl = proposedControl && String(proposedControl).trim()
      ? String(proposedControl).trim()
      : getProposedControl(riskLevel, threatName);

    await promisePool.query(
      `UPDATE threats SET asset_id = ?, asset_name = ?, threat_name = ?, threat_description = ?,
       vulnerability = ?, current_control = ?, proposed_control = ?, likelihood = ?, impact = ?, risk_level = ? WHERE id = ?`,
      [
        asset.assetId,
        asset.assetName,
        String(threatName).trim(),
        String(threatDescription).trim(),
        String(vulnerability).trim(),
        currentControl != null && String(currentControl).trim() ? String(currentControl).trim() : null,
        finalProposedControl,
        likelihood,
        impact,
        riskLevel,
        req.params.id,
      ]
    );

    const [threats] = await promisePool.query('SELECT * FROM threats WHERE id = ?', [req.params.id]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_THREAT', 'threats', req.params.id, `Updated threat: ${String(threatName).trim()}`]
    );

    res.json({ success: true, message: 'Threat updated successfully', data: threats[0] });
  } catch (error) {
    console.error('Update threat error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid asset reference.' });
    }
    res.status(500).json({ success: false, message: 'Server error updating threat' });
  }
};

// @desc    Delete threat
// @route   DELETE /api/threats/:id
// @access  Private
const deleteThreat = async (req, res) => {
  try {
    const [existing] = await promisePool.query(
      'SELECT threat_name FROM threats WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Threat not found' });
    }

    await promisePool.query('DELETE FROM threats WHERE id = ?', [req.params.id]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_THREAT', 'threats', req.params.id, `Deleted threat: ${existing[0].threat_name}`]
    );

    res.json({ success: true, message: 'Threat deleted successfully' });
  } catch (error) {
    console.error('Delete threat error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting threat' });
  }
};

// @desc    Get threat statistics
// @route   GET /api/threats/stats
// @access  Private
const getThreatStats = async (req, res) => {
  try {
    const [stats] = await promisePool.query(`
      SELECT
        COUNT(*) as total_threats,
        SUM(CASE WHEN risk_level = 'Critical' THEN 1 ELSE 0 END) as critical_risks,
        SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risks,
        SUM(CASE WHEN risk_level = 'Medium' THEN 1 ELSE 0 END) as medium_risks,
        SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) as low_risks
      FROM threats WHERE user_id = ?
    `, [req.user.id]);

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Get threat stats error:', error);
    res.status(500).json({ success: false, message: 'Server error getting statistics' });
  }
};

module.exports = { getThreats, createThreat, updateThreat, deleteThreat, getThreatStats };