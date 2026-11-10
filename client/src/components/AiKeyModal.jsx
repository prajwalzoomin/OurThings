import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function AiKeyModal({ isOpen, onClose }) {
  const { notify } = useApp();
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getAiStatus()
        .then((data) => {
          setStatus(data);
          if (data && data.activeKeyMasked) {
            setApiKey(data.activeKeyMasked);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      notify('error', 'Please enter your Google Gemini Pro API Key.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.setAiKey(apiKey.trim());
      setStatus(res);
      notify('success', 'Gemini Pro API Key connected! AI Address Parser & Flipkart Dynamic Search are live.');
      onClose();
    } catch (err) {
      notify('error', err.message || 'Failed to save Gemini API key.');
    } finally {
      setSaving(false);
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
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
          maxWidth: '540px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✨</span>
              <span>Google Gemini Pro AI Settings</span>
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Configure your Google Gemini API key (Jio Offer / Google AI Studio).
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
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.825rem',
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>Jio Offer / Google AI Studio Key:</strong>
            <br />
            You can obtain your key free from <strong>aistudio.google.com</strong>.
            <br />
            Key is also loaded automatically if placed in:
            <br />
            <code style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-surface)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
              server/src/main/resources/application.properties &rarr; gemini.api.key=YOUR_KEY
            </code>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.825rem' }}>
              Gemini Pro API Key
            </label>
            <input
              type="password"
              className="form-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              required
            />
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Current Status:{' '}
            <strong style={{ color: status?.configured ? 'var(--color-brand)' : '#f59e0b' }}>
              {status?.configured ? '✓ Active & Connected (Gemini 1.5 Pro)' : '⚡ Using High-Precision Local Indian Parser Fallback'}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Testing & Saving...' : 'Save & Activate Gemini'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
