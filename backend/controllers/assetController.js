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
    const { name, type, value, classification, status, owner, custodian,
            location, retention_period, disposal_method, review_date, description } = req.body;

    if (!name || !type || !value || !owner || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, type, value, owner, location'
      });
    }

    const validTypes = ['Information', 'Software', 'Physical', 'Services', 'People', 'Intangible'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid asset type. Must be one of: ${validTypes.join(', ')}` });
    }

    const [result] = await promisePool.query(
      `INSERT INTO assets
        (user_id, name, type, value, classification, status, owner, custodian,
         location, retention_period, disposal_method, review_date, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, name, type, value,
        classification || 'Internal',
        status || 'Active',
        owner,
        custodian || null,
        location,
        retention_period || null,
        disposal_method || null,
        review_date || null,
        description || ''
      ]
    );

    const [assets] = await promisePool.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE_ASSET', 'assets', result.insertId, `Created asset: ${name} (${assets[0].asset_id})`]
    );

    res.status(201).json({ success: true, message: 'Asset created successfully', data: assets[0] });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ success: false, message: 'Server error creating asset' });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { name, type, value, classification, status, owner, custodian,
            location, retention_period, disposal_method, review_date, description } = req.body;

    const [existing] = await promisePool.query(
      'SELECT id, asset_id FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Asset not found' });

    await promisePool.query(
      `UPDATE assets SET
        name = ?, type = ?, value = ?, classification = ?, status = ?,
        owner = ?, custodian = ?, location = ?,
        retention_period = ?, disposal_method = ?, review_date = ?, description = ?
       WHERE id = ?`,
      [
        name, type, value,
        classification || 'Internal',
        status || 'Active',
        owner,
        custodian || null,
        location,
        retention_period || null,
        disposal_method || null,
        review_date || null,
        description || '',
        req.params.id
      ]
    );

    const [assets] = await promisePool.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_ASSET', 'assets', req.params.id, `Updated asset: ${name} (${existing[0].asset_id})`]
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
      'SELECT name, asset_id FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Asset not found' });

    await promisePool.query('DELETE FROM assets WHERE id = ?', [req.params.id]);

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_ASSET', 'assets', req.params.id, `Deleted asset: ${existing[0].name} (${existing[0].asset_id})`]
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
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_assets,
        SUM(CASE WHEN classification IN ('Restricted','Confidential') THEN 1 ELSE 0 END) as sensitive_assets,
        SUM(CASE WHEN type = 'Information' THEN 1 ELSE 0 END) as information_assets,
        SUM(CASE WHEN type = 'Software' THEN 1 ELSE 0 END) as software_assets,
        SUM(CASE WHEN type = 'Physical' THEN 1 ELSE 0 END) as physical_assets,
        SUM(CASE WHEN type = 'Services' THEN 1 ELSE 0 END) as services_assets,
        SUM(CASE WHEN type = 'People' THEN 1 ELSE 0 END) as people_assets,
        SUM(CASE WHEN type = 'Intangible' THEN 1 ELSE 0 END) as intangible_assets
      FROM assets WHERE user_id = ?
    `, [req.user.id]);

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error getting statistics' });
  }
};

module.exports = { getAssets, getAsset, createAsset, updateAsset, deleteAsset, getAssetStats };