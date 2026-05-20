const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const [users] = await promisePool.query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.organization,
        u.role,
        u.is_active,
        u.created_at,
        u.last_login,
        COUNT(DISTINCT a.id) as total_assets,
        COUNT(DISTINCT t.id) as total_threats
      FROM users u
      LEFT JOIN assets a ON u.id = a.user_id
      LEFT JOIN threats t ON u.id = t.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting users'
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const [stats] = await promisePool.query(`
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_users
      FROM users
    `);

    const [assetStats] = await promisePool.query(`
      SELECT COUNT(*) as total_assets FROM assets
    `);

    const [threatStats] = await promisePool.query(`
      SELECT
        COUNT(*) as total_threats,
        SUM(CASE WHEN risk_level = 'Critical' THEN 1 ELSE 0 END) as critical_threats,
        SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_threats
      FROM threats
    `);

    res.json({
      success: true,
      data: {
        users: stats[0],
        assets: assetStats[0],
        threats: threatStats[0]
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting statistics'
    });
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    // Don't allow disabling self
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot disable your own account'
      });
    }

    await promisePool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, userId]
    );

    // Log audit
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_USER_STATUS', 'users', userId, `User status changed to: ${isActive ? 'Active' : 'Inactive'}`]
    );

    res.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "admin" or "user"'
      });
    }

    // Don't allow changing own role
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    await promisePool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    // Log audit
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_USER_ROLE', 'users', userId, `User role changed to: ${role}`]
    );

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user role'
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Don't allow deleting self
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Get user info before deleting
    const [users] = await promisePool.query(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (cascade will delete associated data)
    await promisePool.query('DELETE FROM users WHERE id = ?', [userId]);

    // Log audit
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE_USER', 'users', userId, `Deleted user: ${users[0].email}`]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// @desc    Get audit log (Admin only)
// @route   GET /api/users/audit-log
// @access  Private/Admin
const getAuditLog = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const [logs] = await promisePool.query(`
      SELECT
        al.*,
        u.full_name,
        u.email
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [countResult] = await promisePool.query(
      'SELECT COUNT(*) as total FROM audit_log'
    );

    res.json({
      success: true,
      data: logs,
      total: countResult[0].total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting audit log'
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { full_name, email, password, organization, role } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password'
      });
    }

    // Check if email already exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await promisePool.query(
      'INSERT INTO users (full_name, email, password, organization, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, organization || null, role || 'user', true]
    );

    // Log audit
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE_USER', 'users', result.insertId, `Created user: ${email}`]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertId,
        full_name,
        email,
        organization,
        role: role || 'user'
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = async (req, res) => {
  try {
    const [users] = await promisePool.query(
      'SELECT id, full_name, email, organization, role, is_active, created_at, last_login FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user'
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { full_name, email, organization, role, password } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is taken by another user
    if (email) {
      const [emailCheck] = await promisePool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];

    if (full_name) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (organization !== undefined) {
      updateFields.push('organization = ?');
      updateValues.push(organization);
    }
    if (role && ['admin', 'user'].includes(role)) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (password) {
      // Hash password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 12);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(userId);

    await promisePool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Log audit
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE_USER', 'users', userId, `Updated user fields: ${updateFields.join(', ')}`]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserStats,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAuditLog,
  createUser,
  getUser,
  updateUser
};
