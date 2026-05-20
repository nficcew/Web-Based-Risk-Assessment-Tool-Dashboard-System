import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, formData.newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ───────────────────────────────────────────
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #27ae60, #229954)' }}>
              <CheckCircle size={48} />
            </div>
            <h1>Password Reset!</h1>
            <p>Your password has been updated successfully.</p>
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Invalid token ──────────────────────────────────────────
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
              <XCircle size={48} />
            </div>
            <h1>Invalid Link</h1>
            <p>This reset link is missing or invalid.</p>
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate('/forgot-password')}
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  // ── Reset form ─────────────────────────────────────────────
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={48} />
          </div>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fadbd8',
              color: '#c0392b',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                className="form-input"
                placeholder="Enter new password (min 6 characters)"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <a
            href="#"
            className="link"
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
