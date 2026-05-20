const { promisePool } = require('../config/database');

// @desc    Get all risk assessments for logged-in user
// @route   GET /api/assessments
// @access  Private
const getAssessments = async (req, res) => {
  try {
    const [assessments] = await promisePool.query(
      'SELECT * FROM risk_assessments WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting assessments'
    });
  }
};

// @desc    Get single risk assessment
// @route   GET /api/assessments/:id
// @access  Private
const getAssessment = async (req, res) => {
  try {
    const [assessments] = await promisePool.query(
      'SELECT * FROM risk_assessments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessments[0]
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting assessment'
    });
  }
};

// @desc    Create new risk assessment
// @route   POST /api/assessments
// @access  Private
const createAssessment = async (req, res) => {
  try {
    const {
      assessment_type,
      asset_name,
      threat_name,
      likelihood,
      impact,
      risk_score,
      asset_value,
      exposure_factor,
      aro,
      sle,
      ale,
      control_effectiveness,
      residual_risk,
      vulnerability_score,
      cost_of_control,
      ale_before,
      ale_after,
      value_of_control,
      risk_level,
      calculation,
      notes
    } = req.body;

    if (!assessment_type || !asset_name || !threat_name || !risk_level) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assessment_type, asset_name, threat_name, and risk_level'
      });
    }

    const validTypes = ['qualitative', 'quantitative', 'hybrid'];
    if (!validTypes.includes(assessment_type)) {
      return res.status(400).json({
        success: false,
        message: 'assessment_type must be qualitative, quantitative, or hybrid'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO risk_assessments
        (user_id, assessment_type, asset_name, threat_name, likelihood, impact, risk_score,
         asset_value, exposure_factor, aro, sle, ale, control_effectiveness, residual_risk,
         vulnerability_score, cost_of_control, ale_before, ale_after, value_of_control,
         risk_level, calculation, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        assessment_type,
        asset_name,
        threat_name,
        likelihood || null,
        impact || null,
        risk_score || null,
        asset_value || null,
        exposure_factor || null,
        aro || null,
        sle || null,
        ale || null,
        control_effectiveness || null,
        residual_risk || null,
        vulnerability_score || null,
        cost_of_control || null,
        ale_before || null,
        ale_after || null,
        value_of_control || null,
        risk_level,
        calculation || null,
        notes || null
      ]
    );

    const [assessments] = await promisePool.query(
      'SELECT * FROM risk_assessments WHERE id = ?',
      [result.insertId]
    );

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE_ASSESSMENT', 'risk_assessments', result.insertId,
       `Created ${assessment_type} assessment for: ${asset_name}`]
    );

    res.status(201).json({
      success: true,
      message: 'Assessment saved successfully',
      data: assessments[0]
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating assessment'
    });
  }
};

// @desc    Delete risk assessment
// @route   DELETE /api/assessments/:id
// @access  Private
const deleteAssessment = async (req, res) => {
  try {
    const [existing] = await promisePool.query(
      'SELECT id FROM risk_assessments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    await promisePool.query(
      'DELETE FROM risk_assessments WHERE id = ?',
      [req.params.id]
    );

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_ASSESSMENT', 'risk_assessments', req.params.id, 'Deleted risk assessment']
    );

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting assessment'
    });
  }
};

// @desc    Get assessment statistics
// @route   GET /api/assessments/stats
// @access  Private
const getAssessmentStats = async (req, res) => {
  try {
    const [stats] = await promisePool.query(
      `SELECT
        COUNT(*) as total_assessments,
        SUM(CASE WHEN risk_level = 'Critical' THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_count,
        SUM(CASE WHEN risk_level = 'Medium' THEN 1 ELSE 0 END) as medium_count,
        SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) as low_count,
        SUM(CASE WHEN assessment_type = 'qualitative' THEN 1 ELSE 0 END) as qualitative_count,
        SUM(CASE WHEN assessment_type = 'quantitative' THEN 1 ELSE 0 END) as quantitative_count,
        SUM(CASE WHEN assessment_type = 'hybrid' THEN 1 ELSE 0 END) as hybrid_count
      FROM risk_assessments WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get assessment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting statistics'
    });
  }
};

module.exports = {
  getAssessments,
  getAssessment,
  createAssessment,
  deleteAssessment,
  getAssessmentStats
};
