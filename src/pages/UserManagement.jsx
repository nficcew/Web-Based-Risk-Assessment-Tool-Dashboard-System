import React, { useState, useEffect } from 'react';
import { Users, Shield, Trash2, AlertCircle, CheckCircle, XCircle, Database, Plus, Edit, X, Eye, EyeOff } from 'lucide-react';
import { usersAPI } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    organization: '',
    role: 'user'
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await usersAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      organization: '',
      role: 'user'
    });
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // CREATE User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await usersAPI.create(formData);
      setSuccess('User created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  // EDIT User - Open Modal
  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '',
      organization: user.organization || '',
      role: user.role
    });
    setShowEditModal(true);
  };

  // UPDATE User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        organization: formData.organization,
        role: formData.role
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await usersAPI.update(editingUser.id, updateData);
      setSuccess('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Toggle Status
  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this user?`)) {
      return;
    }

    try {
      await usersAPI.updateStatus(userId, !currentStatus);
      setSuccess(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Change Role
  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await usersAPI.updateRole(userId, newRole);
      setSuccess(`User role changed to ${newRole} successfully`);
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  // DELETE User
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone and will delete all their data.`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      setSuccess('User deleted successfully');
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-state">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-management-header">
        <div>
          <h1>User Management</h1>
          <p>Manage system users and permissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-content">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.users.total_users}</p>
            </div>
            <div className="stat-card-icon pink">
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-content">
              <h3>Administrators</h3>
              <p className="stat-value">{stats.users.admin_count}</p>
            </div>
            <div className="stat-card-icon purple">
              <Shield size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-content">
              <h3>Active Users</h3>
              <p className="stat-value">{stats.users.active_users}</p>
            </div>
            <div className="stat-card-icon green">
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-content">
              <h3>Total Assets</h3>
              <p className="stat-value">{stats.assets.total_assets}</p>
            </div>
            <div className="stat-card-icon blue">
              <Database size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-card">
        <div className="users-table-header">
          <h2>
            <Users size={20} />
            All Users
          </h2>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Organization</th>
                <th>Role</th>
                <th>Status</th>
                <th>Assets</th>
                <th>Threats</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info-cell">
                      <span className="user-name">{user.full_name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </td>
                  <td className="data-cell muted">
                    {user.organization || '-'}
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="data-cell">
                    {user.total_assets}
                  </td>
                  <td className="data-cell">
                    {user.total_threats}
                  </td>
                  <td className="data-cell muted">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    {/* Only show action buttons if not the current logged-in user */}
                    {user.id !== currentUser.id ? (
                      <div className="action-buttons">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(user)}
                          className="action-btn edit"
                          title="Edit user"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          className={`action-btn ${user.is_active ? 'disable' : 'enable'}`}
                          title={user.is_active ? 'Disable user' : 'Enable user'}
                        >
                          {user.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>

                        {/* Toggle Role Button */}
                        <button
                          onClick={() => handleChangeRole(user.id, user.role)}
                          className="action-btn role"
                          title={`Change to ${user.role === 'admin' ? 'user' : 'admin'}`}
                        >
                          <Shield size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="action-btn delete"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="current-user-label">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New User</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-input"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <input
                    type="text"
                    name="organization"
                    className="form-input"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Enter organization (optional)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={18} />
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-input"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password (optional)"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <input
                    type="text"
                    name="organization"
                    className="form-input"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Enter organization (optional)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Edit size={18} />
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
