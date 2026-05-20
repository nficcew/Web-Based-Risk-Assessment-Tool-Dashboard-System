import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [copied, setCopied] = useState(false);
  /** @type {'idle'|'link'|'email'} */
  const [successMode, setSuccessMode] = useState('idle');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email);
      if (data.resetLink) {
        setResetLink(data.resetLink);
        setSuccessMode('link');
        setSuccessMessage(data.message || '');
      } else {
        setResetLink('');
        setSuccessMode('email');
        setSuccessMessage(
          data.message ||
            'If that email is registered, you will receive password reset instructions shortly.'
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openResetFromLink = () => {
    try {
      const u = new URL(resetLink);
      navigate(`${u.pathname}${u.search}`);
    } catch {
      navigate('/login');
    }
  };

  // ── Email sent / generic confirmation (no link on screen) ──
  if (successMode === 'email') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #27ae60, #229954)' }}>
              <Mail size={48} />
            </div>
            <h1>Check your email</h1>
            <p style={{ textAlign: 'center', lineHeight: 1.5 }}>{successMessage}</p>
          </div>
          <p style={{ fontSize: '14px', color: '#5d6d7e', textAlign: 'center', marginBottom: '20px' }}>
            If you use Gmail, check the <strong>Spam</strong> or <strong>Promotions</strong> tab. The link expires in 1 hour.
          </p>
          <button type="button" className="btn btn-primary btn-full" onClick={() => { setSuccessMode('idle'); setEmail(''); }}>
            Send another request
          </button>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a href="#" className="link" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Back to Login</a>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state: reset link shown (no SMTP / dev) ─────────
  if (successMode === 'link' && resetLink) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo" style={{ background: 'linear-gradient(135deg, #27ae60, #229954)' }}>
              <CheckCircle size={48} />
            </div>
            <h1>Reset Link Ready</h1>
            <p>{successMessage || 'Copy the link below to reset your password (email is not configured on the server).'}</p>
          </div>

          <div style={{
            background: '#f0faf4',
            border: '1px solid #a9dfbf',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '13px', color: '#1e8449', marginBottom: '10px', fontWeight: 600 }}>
              Your password reset link (valid for 1 hour):
            </p>
            <div style={{
              background: '#fff',
              border: '1px solid #d5f5e3',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '12px',
              wordBreak: 'break-all',
              color: '#1a5276',
              marginBottom: '10px',
              fontFamily: 'monospace'
            }}>
              {resetLink}
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleCopy}
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <button
            className="btn btn-primary btn-full"
            type="button"
            onClick={openResetFromLink}
          >
            Open Reset Page
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
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
  }

  // ── Email form ──────────────────────────────────────────────
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={48} />
          </div>
          <h1>Forgot Password</h1>
          <p>Enter your email to get a reset link</p>
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
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Generating Reset Link...' : 'Get Reset Link'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <a
            href="#"
            className="link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
