import React from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const {
    currentUser,
    currentCommunity,
    users,
    communities,
    currentTab,
    navigateTo,
    switchUser,
    switchCommunity,
  } = useApp();

  return (
    <header className="site-header-wrapper">
      {/* Top Utility Context Bar */}
      <div className="top-utility-bar">
        <div className="top-utility-inner">
          <div className="utility-selector-group">
            <div className="utility-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Community:</span>
              <select
                className="utility-select"
                value={currentCommunity ? currentCommunity.id : ''}
                onChange={(e) => switchCommunity(e.target.value)}
                aria-label="Active Community Selector"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="utility-selector-group">
            <div className="utility-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Logged In:</span>
              <select
                className="utility-select"
                value={currentUser ? currentUser.id : ''}
                onChange={(e) => switchUser(e.target.value)}
                aria-label="Demo Member Account Selector"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roomOrFlat || u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <div className="site-header">
        <div className="header-inner">
          <div
            className="brand-section"
            style={{ cursor: 'pointer' }}
            onClick={() => navigateTo('home')}
          >
            <div className="brand-logo-icon">OT</div>
            <div className="brand-text-block">
              <span className="brand-title">OurThings</span>
              <span className="brand-subtitle">Community Resource Sharing</span>
            </div>
          </div>

          <nav className="nav-links" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-pill ${currentTab === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              Home
            </button>
            <button
              type="button"
              className={`nav-pill ${currentTab === 'browse' ? 'active' : ''}`}
              onClick={() => navigateTo('browse')}
            >
              Explore Items
            </button>
            <button
              type="button"
              className={`nav-pill ${currentTab === 'requests' ? 'active' : ''}`}
              onClick={() => navigateTo('requests')}
            >
              Requests & Loans
            </button>
            <button
              type="button"
              className={`nav-pill ${currentTab === 'demands' ? 'active' : ''}`}
              onClick={() => navigateTo('demands')}
            >
              Unmet Needs
            </button>
            <button
              type="button"
              className={`nav-pill ${currentTab === 'history' ? 'active' : ''}`}
              onClick={() => navigateTo('history')}
            >
              History
            </button>
            <button
              type="button"
              className={`nav-pill ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('dashboard')}
            >
              Community Impact
            </button>
          </nav>

          <div>
            <button
              type="button"
              className="btn btn-primary btn-sm nav-cta-btn"
              onClick={() => navigateTo('create', { prefill: null })}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Share a Resource</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
