import { AlertCircle, Building, CheckCircle, Lock, Mail, Save, User } from 'lucide-react';
import { useState } from 'react';
import { authAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [profileData, setProfileData] = useState({
    full_name: currentUser.full_name || '',
    email: currentUser.email || '',
    organization: currentUser.organization || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password policy checker
  const passwordChecks = {
    minLength: passwordData.newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(passwordData.newPassword),
    hasLowercase: /[a-z]/.test(passwordData.newPassword),
    hasNumber: /\d/.test(passwordData.newPassword),
    hasSpecial: /[!@#$%^&*]/.test(passwordData.newPassword),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.updateProfile(profileData);
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet the requirements');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

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

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <User size={48} />
            </div>
            <div className="profile-info">
              <h2>{currentUser.full_name || 'User'}</h2>
              <p>{currentUser.email}</p>
              <span className={`role-badge ${currentUser.role}`}>
                {currentUser.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Edit Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  className="form-input"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Building size={16} />
                  Organization
                </label>
                <input
                  type="text"
                  name="organization"
                  className="form-input"
                  value={profileData.organization}
                  onChange={handleProfileChange}
                  placeholder="Enter your organization"
                  autoComplete="organization"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} />
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-input"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} />
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-input"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                  autoComplete="new-password"
                />

                {/* Password Requirements */}
                {passwordData.newPassword.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    padding: '10px 12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '6px', color: '#495057' }}>
                      Password Requirements:
                    </div>
                    <div style={{ color: passwordChecks.minLength ? '#27ae60' : '#e74c3c', marginBottom: '2px' }}>
                      {passwordChecks.minLength ? '✅' : '❌'} Minimum 8 characters
                    </div>
                    <div style={{ color: passwordChecks.hasUppercase ? '#27ae60' : '#e74c3c', marginBottom: '2px' }}>
                      {passwordChecks.hasUppercase ? '✅' : '❌'} At least 1 uppercase letter (A-Z)
                    </div>
                    <div style={{ color: passwordChecks.hasLowercase ? '#27ae60' : '#e74c3c', marginBottom: '2px' }}>
                      {passwordChecks.hasLowercase ? '✅' : '❌'} At least 1 lowercase letter (a-z)
                    </div>
                    <div style={{ color: passwordChecks.hasNumber ? '#27ae60' : '#e74c3c', marginBottom: '2px' }}>
                      {passwordChecks.hasNumber ? '✅' : '❌'} At least 1 number (0-9)
                    </div>
                    <div style={{ color: passwordChecks.hasSpecial ? '#27ae60' : '#e74c3c' }}>
                      {passwordChecks.hasSpecial ? '✅' : '❌'} At least 1 special character (!@#$%^&*)
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  autoComplete="new-password"
                />
                {passwordData.confirmPassword.length > 0 && (
                  <div style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: passwordData.newPassword === passwordData.confirmPassword ? '#27ae60' : '#e74c3c'
                  }}>
                    {passwordData.newPassword === passwordData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !isPasswordValid}
              >
                <Save size={18} />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;