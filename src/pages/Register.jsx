import { Building, Eye, EyeOff, Lock, Mail, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: ''
  });

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet all requirements');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        fullName: formData.fullName,
        email: formData.email,
        organization: formData.organization,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={48} />
          </div>
          <h1>Create Account</h1>
          <p>Get started with risk assessment</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fadbd8',
              color: '#c0392b',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              border: '1px solid #f1948a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} />
              <input
                type="text"
                name="fullName"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Organization</label>
            <div className="input-with-icon">
              <Building size={18} />
              <input
                type="text"
                name="organization"
                className="form-input"
                placeholder="Enter your organization name"
                value={formData.organization}
                onChange={handleChange}
                required
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formData.password.length > 0 && (
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

            {!isPasswordValid && formData.password.length > 0 && (
              <div style={{
                marginTop: '6px',
                padding: '8px 12px',
                backgroundColor: '#fadbd8',
                color: '#c0392b',
                borderRadius: '6px',
                fontSize: '12px',
                border: '1px solid #f1948a'
              }}>
                ⚠️ Please complete all password requirements!
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.confirmPassword.length > 0 && (
              <div style={{
                marginTop: '4px',
                fontSize: '12px',
                color: formData.password === formData.confirmPassword ? '#27ae60' : '#e74c3c'
              }}>
                {formData.password === formData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
              </div>
            )}

            {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
              <div style={{
                marginTop: '6px',
                padding: '8px 12px',
                backgroundColor: '#fadbd8',
                color: '#c0392b',
                borderRadius: '6px',
                fontSize: '12px',
                border: '1px solid #f1948a'
              }}>
                ⚠️ Passwords do not match! Please re-enter your password.
              </div>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !isPasswordValid}
            style={{
              opacity: (!isPasswordValid) ? 0.6 : 1,
              cursor: (!isPasswordValid) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {!isPasswordValid && formData.password.length > 0 && (
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#e74c3c',
              marginTop: '6px'
            }}>
              Complete all password requirements to enable this button
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="#" onClick={() => navigate('/login')} className="link">Sign in here</a></p>
        </div>

        <div className="auth-info">
          <p className="info-text">
            <Shield size={14} />
            Your data is protected with enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;