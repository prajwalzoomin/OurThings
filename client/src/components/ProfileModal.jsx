import React, { useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Prajwal',
  'https://api.dicebear.com/7.x/bottts/svg?seed=TechHero',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Kasim',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Ananya',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Ramesh',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Explorer',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Maker',
  'https://api.dicebear.com/7.x/bottts/svg?seed=GreenHostel',
];

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, setCurrentUser, currentCommunity, notify } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [roomOrFlat, setRoomOrFlat] = useState(currentUser?.roomOrFlat || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || PRESET_AVATARS[0]);
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(currentUser?.pincode || '560103');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        roomOrFlat: roomOrFlat.trim(),
        avatarUrl: avatarUrl.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      };
      const updated = await api.updateProfile(payload);
      setCurrentUser(updated);
      notify('success', 'Profile and avatar updated successfully!');
      onClose();
    } catch (err) {
      notify('error', err.message || 'Failed to update profile.');
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
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👤</span>
              <span>Customize Profile & PFP</span>
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Manage your verified member identity in <strong>{currentCommunity?.name}</strong>.
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

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Avatar Preview & Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--color-brand)',
                backgroundColor: 'var(--color-surface-hover)',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
              }}
            >
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = PRESET_AVATARS[0];
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Choose Profile Avatar (PFP)
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      padding: 0,
                      border: avatarUrl === url ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-surface-hover)',
                      transform: avatarUrl === url ? 'scale(1.15)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img src={url} alt={`Preset ${i}`} style={{ width: '100%', height: '100%' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.825rem' }}>
              Full Member Name *
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.825rem' }}>
                Contact Phone *
              </label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.825rem' }}>
                Hostel Room / Apartment Flat *
              </label>
              <input
                type="text"
                className="form-input"
                value={roomOrFlat}
                onChange={(e) => setRoomOrFlat(e.target.value)}
                placeholder="Room 304, Block A"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.825rem' }}>
              Full Residence Address (for nearby borrowers)
            </label>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. NHCE Campus Block A, Outer Ring Road, Marathahalli"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.825rem' }}>
                City
              </label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.825rem' }}>
                PIN Code
              </label>
              <input
                type="text"
                className="form-input"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

