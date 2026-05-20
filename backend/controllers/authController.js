const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');
const { encrypt, decrypt } = require('../utils/encryption');
const { isSmtpConfigured, sendPasswordResetEmail } = require('../utils/mailer');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, email, password, organization } = req.body;

    // Check if user already exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await promisePool.query(
      'INSERT INTO users (full_name, email, password, organization, role) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, organization, 'user']
    );

    // Get created user
    const [users] = await promisePool.query(
      'SELECT id, full_name, email, organization, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];

    // Generate token
    const token = generateToken(user.id);

    // Log audit
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
      [user.id, 'USER_REGISTERED', `User ${email} registered successfully`]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          organization: user.organization,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user from database
    const [users] = await promisePool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator.'
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await promisePool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    // Log audit
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
      [user.id, 'USER_LOGIN', `User ${email} logged in`]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          organization: user.organization,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const [users] = await promisePool.query(
      'SELECT id, full_name, email, organization, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        organization: user.organization,
        role: user.role,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Accept both camelCase (fullName) and snake_case (full_name)
    const fullName = req.body.fullName || req.body.full_name;
    const { email, organization } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    // If email is being changed, check it's not already taken
    if (email) {
      const [emailCheck] = await promisePool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
    }

    await promisePool.query(
      'UPDATE users SET full_name = ?, email = COALESCE(?, email), organization = ? WHERE id = ?',
      [fullName, email || null, organization || null, req.user.id]
    );

    // Get updated user
    const [users] = await promisePool.query(
      'SELECT id, full_name, email, organization, role FROM users WHERE id = ?',
      [req.user.id]
    );

    const updatedUser = users[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        organization: updatedUser.organization,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get user
    const [users] = await promisePool.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = users[0];

    // Verify current password using bcrypt
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await promisePool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    // Log audit
    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'PASSWORD_CHANGED', 'User changed password']
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
};

// @desc    Request password reset — generates a token and returns the reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const [users] = await promisePool.query(
      'SELECT id, full_name, email FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    const genericMessage =
      'If that email is registered, you will receive password reset instructions shortly.';

    // Always return success to avoid email enumeration
    if (users.length === 0) {
      return res.json({
        success: true,
        message: genericMessage,
      });
    }

    const user = users[0];

    // Generate a secure random token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await promisePool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expires, user.id]
    );

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
      [user.id, 'PASSWORD_RESET_REQUESTED', `Password reset requested for ${email}`]
    );

    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(
      /\/$/,
      ''
    );
    const resetLink = `${frontendBase}/reset-password?token=${resetToken}`;

    if (isSmtpConfigured()) {
      try {
        await sendPasswordResetEmail(user.email, resetLink, user.full_name);
        return res.json({
          success: true,
          message: genericMessage,
          emailSent: true,
        });
      } catch (mailErr) {
        console.error('Password reset email failed:', mailErr);
        return res.status(503).json({
          success: false,
          message:
            'Unable to send reset email right now. Please try again later or contact support.',
        });
      }
    }

    // No SMTP: return link in response (local / dev)
    res.json({
      success: true,
      message: 'Reset link generated successfully.',
      resetToken,
      resetLink,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const [users] = await promisePool.query(
      'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired. Please request a new one.'
      });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await promisePool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    await promisePool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
      [user.id, 'PASSWORD_RESET_COMPLETED', `Password reset completed for ${user.email}`]
    );

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
