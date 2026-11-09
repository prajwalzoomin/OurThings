import React from 'react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { currentCommunity, navigateTo } = useApp();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
              OurThings
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>&bull;</span>
            <span style={{ color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.8rem' }}>
              Peer-to-Peer Resource Sharing
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Active Community Scope: <strong>{currentCommunity ? currentCommunity.name : 'All Communities'}</strong>. Designed for hostel wings, residential complexes, and neighbourhoods.
          </div>
        </div>

        <nav className="footer-nav" aria-label="Footer links">
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('terms');
            }}
          >
            Terms of Sharing
          </a>
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('privacy');
            }}
          >
            Privacy & Sensitive Aids
          </a>
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('dashboard');
            }}
          >
            Community Impact
          </a>
        </nav>
      </div>
    </footer>
  );
}
