import React from 'react';
import { useApp } from '../context/AppContext';

export default function SwitchAccountModal({ isOpen, onClose }) {
  const { users, currentUser, switchUser, communities } = useApp();

  if (!isOpen) return null;

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
          maxWidth: '520px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
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
              <span>🧪</span>
              <span>Switch Testing Profile</span>
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Quickly switch personas to test lender approvals, borrower reservations, and returns.
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

        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {users.map((u) => {
            const isSelected = currentUser && currentUser.id === u.id;
            const comm = communities.find((c) => c.id === u.activeCommunityId);
            return (
              <div
                key={u.id}
                onClick={() => {
                  switchUser(u.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-brand-light)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    u.name.charAt(0)
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                      {u.name}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          backgroundColor: 'var(--color-brand)',
                          color: '#ffffff',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          fontWeight: 700,
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
                    {u.roomOrFlat || 'Campus Area'} • {comm ? comm.name.split('(')[0].trim() : 'Local Community'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
