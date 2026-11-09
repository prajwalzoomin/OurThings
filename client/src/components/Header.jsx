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
      {/* Community and User Switcher Context Bar */}
      <div className="context-bar">
        <div className="context-bar-inner">
          <div className="context-pill">
            <span className="context-label">Community:</span>
            <select
              className="context-select"
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

          <div className="context-pill">
            <span className="context-label">Active Member:</span>
            <select
              className="context-select"
              value={currentUser ? currentUser.id : ''}
              onChange={(e) => switchUser(e.target.value)}
              aria-label="Demo Member Account Selector"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} - {u.roomOrFlat || u.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="site-header">
        <div className="header-inner">
          <div className="brand-section">
            <a
              href="#home"
              className="brand-title"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('browse');
              }}
            >
              OurThings
            </a>
            <span className="brand-subtitle">Community Resource Sharing</span>
          </div>

          <nav className="nav-links" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-link ${currentTab === 'browse' ? 'active' : ''}`}
              onClick={() => navigateTo('browse')}
            >
              Find Items
            </button>
            <button
              type="button"
              className={`nav-link ${currentTab === 'create' ? 'active' : ''}`}
              onClick={() => navigateTo('create', { prefill: null })}
            >
              List an Item
            </button>
            <button
              type="button"
              className={`nav-link ${currentTab === 'requests' ? 'active' : ''}`}
              onClick={() => navigateTo('requests')}
            >
              Requests & Loans
            </button>
            <button
              type="button"
              className={`nav-link ${currentTab === 'demands' ? 'active' : ''}`}
              onClick={() => navigateTo('demands')}
            >
              Unmet Demand
            </button>
            <button
              type="button"
              className={`nav-link ${currentTab === 'history' ? 'active' : ''}`}
              onClick={() => navigateTo('history')}
            >
              History
            </button>
            <button
              type="button"
              className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('dashboard')}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
