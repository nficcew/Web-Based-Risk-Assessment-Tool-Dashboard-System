const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserStats,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAuditLog,
  createUser,
  getUser,
  updateUser
} = require('../controllers/userController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// All routes require authentication AND admin role
router.use(authMiddleware);
router.use(adminOnly);

// @route   GET /api/users
// @desc    Get all users with statistics
// @access  Private/Admin
router.get('/', getAllUsers);

// @route   POST /api/users
// @desc    Create new user
// @access  Private/Admin
router.post('/', createUser);

// @route   GET /api/users/stats
// @desc    Get system-wide user statistics
// @access  Private/Admin
router.get('/stats', getUserStats);

// @route   GET /api/users/audit-log
// @desc    Get audit log with pagination
// @access  Private/Admin
router.get('/audit-log', getAuditLog);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/:id', getUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/:id', updateUser);

// @route   PUT /api/users/:id/status
// @desc    Update user active/inactive status
// @access  Private/Admin
router.put('/:id/status', updateUserStatus);

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin/user)
// @access  Private/Admin
router.put('/:id/role', updateUserRole);

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private/Admin
router.delete('/:id', deleteUser);

module.exports = router;
