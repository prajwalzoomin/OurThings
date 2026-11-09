import React from 'react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { currentCommunity, navigateTo } = useApp();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <strong>OurThings</strong>: Community Resource Sharing Platform
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            Current Community Scope: {currentCommunity ? currentCommunity.name : 'Not selected'}. All bookings, condition logs, and requests are strictly scoped to verified community members.
          </div>
        </div>

        <div className="footer-links">
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('terms');
            }}
          >
            Reviewable Terms of Sharing
          </a>
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('privacy');
            }}
          >
            Privacy & Healthcare Item Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
