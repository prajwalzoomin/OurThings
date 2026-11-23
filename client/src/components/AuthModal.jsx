import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import logoImg from '../assets/logo.png';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, communities, notify, userLocation } = useApp();

  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  
  // Sign in form state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRoomOrFlat, setRegRoomOrFlat] = useState('');
  const [regCommunityInput, setRegCommunityInput] = useState('');
  const [regCommunityId, setRegCommunityId] = useState(null);
  const [isCommunityFocused, setIsCommunityFocused] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [regLocality, setRegLocality] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimerRef = useRef(null);

  // Debounced AI Community resolution
  useEffect(() => {
    if (!regCommunityInput || regCommunityInput.trim().length < 2) {
      setAiSuggestion(null);
      setAiLoading(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setAiLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.resolveCommunity(
          regCommunityInput.trim(),
          userLocation?.latitude,
          userLocation?.longitude
        );
        if (res) {
          setAiSuggestion(res);
          // If high confidence match or exact ID, bind it
          if (res.matchedCommunityId) {
            setRegCommunityId(res.matchedCommunityId);
          }
          if (res.standardAddress && !regLocality) {
            const parts = res.standardAddress.split(',');
            if (parts.length > 0) setRegLocality(parts[0].trim());
          }
        }
      } catch (e) {
        console.warn('AI community resolve error:', e);
      } finally {
        setAiLoading(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [regCommunityInput, userLocation]);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setSignInPassword('');
    setRegPassword('');
    setRegConfirmPassword('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!signInIdentifier.trim()) {
      setError('Please enter your email address or mobile number.');
      return;
    }
    if (!signInPassword.trim()) {
      setError('Please enter your password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(signInIdentifier.trim(), signInPassword.trim());
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    const payload = {
      name: name.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      roomOrFlat: regRoomOrFlat.trim(),
      communityId: regCommunityId ? Number(regCommunityId) : null,
      communityInput: regCommunityInput.trim() || (communities?.[0]?.name || 'NHCE Campus Community Circle'),
      city: 'Bengaluru',
      address: [regRoomOrFlat, regLocality || aiSuggestion?.standardAddress].filter(Boolean).join(', '),
      password: regPassword.trim(),
    };

    try {
      setSubmitting(true);
      await register(payload);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--color-border)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mode Tabs */}
        <div
          style={{
            padding: '1.25rem 1.5rem 0 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <img
                  src={logoImg}
                  alt="OurThings"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'contain',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
                  {mode === 'signin' ? 'Sign In to Your Account' : 'Create New Account'}
                </h2>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {mode === 'signin'
                  ? 'Access your community borrowings, loans, and shared inventory.'
                  : 'Join your verified neighbourhood circle to borrow and share freely.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '0.2rem',
              }}
              title="Close"
            >
              &times;
            </button>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '0.65rem 0.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: mode === 'signin' ? '2px solid var(--color-brand)' : '2px solid transparent',
                color: mode === 'signin' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: mode === 'signin' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '0.65rem 0.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: mode === 'register' ? '2px solid var(--color-brand)' : '2px solid transparent',
                color: mode === 'register' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: mode === 'register' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {mode === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Email Address or Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. resident@example.com or 9876543210"
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    required
                    autoFocus
                    autoComplete="username"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                    Password
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword((p) => !p)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '0.2rem',
                    }}
                    title={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--color-brand)' }}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                }}
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                New neighbour?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-brand)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Create an account
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Prajwal B, Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-grid-2" style={{ gap: '0.75rem', margin: 0 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ gap: '0.75rem', margin: 0 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Flat / Room / House No. *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Flat 304, Block A"
                    value={regRoomOrFlat}
                    onChange={(e) => setRegRoomOrFlat(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      Neighbourhood / Community *
                    </label>
                    {aiLoading && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-brand)' }}>
                        AI Normalizing...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. NHCE Campus, Bellandur, Green Glen..."
                    value={regCommunityInput}
                    onFocus={() => setIsCommunityFocused(true)}
                    onBlur={() => setTimeout(() => setIsCommunityFocused(false), 250)}
                    onChange={(e) => {
                      setRegCommunityInput(e.target.value);
                      setRegCommunityId(null);
                    }}
                    required
                  />

                  {/* AI Semantic Suggestion - clean & fades when blurring field */}
                  {isCommunityFocused && aiSuggestion && (
                    <div
                      style={{
                        marginTop: '0.35rem',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.74rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.7rem' }}>
                          Suggested Community
                        </div>
                        <div style={{ color: 'var(--color-text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {aiSuggestion.canonicalName}
                        </div>
                        {aiSuggestion.standardAddress && (
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {aiSuggestion.standardAddress}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', backgroundColor: 'var(--color-brand)', color: '#fff', border: 'none', flexShrink: 0 }}
                        onClick={() => {
                          setRegCommunityInput(aiSuggestion.canonicalName);
                          if (aiSuggestion.matchedCommunityId) setRegCommunityId(aiSuggestion.matchedCommunityId);
                          if (aiSuggestion.standardAddress && !regLocality) {
                            setRegLocality(aiSuggestion.standardAddress.split(',')[0].trim());
                          }
                          setIsCommunityFocused(false);
                        }}
                      >
                        Select
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Locality / Area (Bengaluru)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bellandur, Marathahalli, Whitefield"
                  value={regLocality}
                  onChange={(e) => setRegLocality(e.target.value)}
                />
              </div>

              <div className="form-grid-2" style={{ gap: '0.75rem', margin: 0 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Create Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ paddingRight: '2.4rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((p) => !p)}
                      style={{
                        position: 'absolute',
                        right: '0.65rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                      }}
                      title={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Confirm Password *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                }}
              >
                {submitting ? 'Creating Account...' : 'Create Account & Sign In'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-brand)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Sign In instead
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

