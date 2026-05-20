const { promisePool } = require('../config/database');

const getAssets = async (req, res) => {
  try {
    const [assets] = await promisePool.query(
      'SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ success: false, message: 'Server error getting assets' });
  }
};

const getAsset = async (req, res) => {
  try {
    const [assets] = await promisePool.query(
      'SELECT * FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (assets.length === 0) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, data: assets[0] });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ success: false, message: 'Server error getting asset' });
  }
};

const createAsset = async (req, res) => {
  try {
    const { name, type, value, owner, custodian, classification, status, location, retention_period, disposal_method, review_date, description } = req.body;

    if (!name || !type || !value || !owner || !location) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO assets (user_id, name, type, value, owner, custodian, classification, status, location, retention_period, disposal_method, review_date, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, type, value, owner, custodian || null, classification || 'Internal', status || 'Active', location, retention_period || null, disposal_method || null, review_date || null, description || '']
    );

    // Auto-generate Asset ID based on category
    const prefixMap = {
      'Information': 'INFO', 'Software': 'SW', 'Physical': 'PHY',
      'Services': 'SVC', 'People': 'PPL', 'Intangible': 'INT'
    };
    const prefix = prefixMap[type] || 'ASSET';
    const assetId = `${prefix}-${String(result.insertId).padStart(3, '0')}`;

    await promisePool.query(
      'UPDATE assets SET asset_id = ? WHERE id = ?',
      [assetId, result.insertId]
    );

    const [assets] = await promisePool.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE_ASSET', 'assets', result.insertId, `Created asset: ${name} (${assetId})`]
    );

    res.status(201).json({ success: true, message: 'Asset created successfully', data: assets[0] });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ success: false, message: 'Server error creating asset' });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { name, type, value, owner, custodian, classification, status, location, retention_period, disposal_method, review_date, description } = req.body;

    const [existing] = await promisePool.query(
      'SELECT id FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Asset not found' });

    // Update Asset ID if type changed
    const prefixMap = {
      'Information': 'INFO', 'Software': 'SW', 'Physical': 'PHY',
      'Services': 'SVC', 'People': 'PPL', 'Intangible': 'INT'
    };
    const prefix = prefixMap[type] || 'ASSET';
    const assetId = `${prefix}-${String(req.params.id).padStart(3, '0')}`;

    await promisePool.query(
      `UPDATE assets SET asset_id = ?, name = ?, type = ?, value = ?, owner = ?, custodian = ?, classification = ?, status = ?, location = ?, retention_period = ?, disposal_method = ?, review_date = ?, description = ? WHERE id = ?`,
      [assetId, name, type, value, owner, custodian || null, classification || 'Internal', status || 'Active', location, retention_period || null, disposal_method || null, review_date || null, description, req.params.id]
    );

    const [assets] = await promisePool.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_ASSET', 'assets', req.params.id, `Updated asset: ${name}`]
    );

    res.json({ success: true, message: 'Asset updated successfully', data: assets[0] });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ success: false, message: 'Server error updating asset' });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const [existing] = await promisePool.query(
      'SELECT name FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Asset not found' });

    await promisePool.query('DELETE FROM assets WHERE id = ?', [req.params.id]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_ASSET', 'assets', req.params.id, `Deleted asset: ${existing[0].name}`]
    );

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting asset' });
  }
};

const getAssetStats = async (req, res) => {
  try {
    const [stats] = await promisePool.query(`
      SELECT
        COUNT(*) as total_assets,
        SUM(CASE WHEN value = 'Critical' THEN 1 ELSE 0 END) as critical_assets,
        SUM(CASE WHEN value = 'High' THEN 1 ELSE 0 END) as high_value_assets,
        SUM(CASE WHEN status = 'Active' OR status IS NULL THEN 1 ELSE 0 END) as active_assets,
        SUM(CASE WHEN classification = 'Restricted' OR classification = 'Confidential' THEN 1 ELSE 0 END) as sensitive_assets
      FROM assets WHERE user_id = ?
    `, [req.user.id]);

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error getting statistics' });
  }
};

module.exports = { getAssets, getAsset, createAsset, updateAsset, deleteAsset, getAssetStats };