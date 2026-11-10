import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const {
    currentUser,
    currentCommunity,
    currentTab,
    theme,
    toggleTheme,
    navigateTo,
    communityOnly,
    toggleCommunityOnly,
    searchQuery,
    setSearchQuery,
    setProfileModalOpen,
    setAiKeyModalOpen,
    setSwitchAccountModalOpen,
    notify,
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    navigateTo('browse');
  };

  const handleSignOut = () => {
    setProfileDropdownOpen(false);
    notify('info', 'Signed out from session. Reloading application...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <header className="site-header-wrapper">
      {/* Top Utility Context Bar: Location & Food-App Style Scope Toggle */}
      <div className="top-utility-bar">
        <div className="top-utility-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* City & Locality Pin */}
            <div className="utility-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand)' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Bengaluru</span>
              <span style={{ color: 'var(--color-text-muted)' }}>&bull;</span>
              <strong>{currentCommunity ? currentCommunity.name.split('(')[0].trim() : 'Local Campus'}</strong>
            </div>

            {/* Food-Delivery "VEG ONLY" Style Scope Toggle */}
            <button
              type="button"
              className={`scope-toggle-pill ${communityOnly ? 'active-scope' : 'city-scope'}`}
              onClick={toggleCommunityOnly}
              title={communityOnly ? 'Showing items in your community only. Click to view all Bengaluru' : 'Showing all Bengaluru resources. Click to filter to your community only'}
              aria-label="Toggle Community Scope Filter"
            >
              <div className="scope-toggle-indicator">
                <span className="scope-toggle-dot"></span>
              </div>
              <span className="scope-toggle-label">
                {communityOnly ? (
                  <>
                    <span style={{ color: 'var(--color-brand)', fontWeight: 700 }}>🟢 Within My Community</span>
                  </>
                ) : (
                  <>
                    <span>🌐 Whole City (Bengaluru)</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Right Action: Gemini Pro AI Status & Help */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setAiKeyModalOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.2rem 0.65rem',
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
              title="Configure Google Gemini Pro API Key (Jio Offer / Google AI Studio)"
            >
              <span style={{ color: '#8b5cf6' }}>✨</span>
              <span>Gemini Pro AI Active</span>
              <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-brand-light)', color: 'var(--color-brand)', padding: '0.05rem 0.3rem', borderRadius: '3px', fontWeight: 700 }}>
                JIO OFFER
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <div className="site-header">
        <div className="header-inner">
          {/* Brand Logo */}
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

          {/* Flipkart / Zepto Style Global Omnibar Search */}
          <form className="header-search-form" onSubmit={handleSearchSubmit}>
            <div className="header-search-wrapper">
              <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="header-search-input"
                placeholder="Search resources in Bengaluru (drill, projector, crutches, rucksack)..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              {localSearch && (
                <button
                  type="button"
                  className="header-search-clear"
                  onClick={() => {
                    setLocalSearch('');
                    setSearchQuery('');
                  }}
                  title="Clear search"
                >
                  &times;
                </button>
              )}
              <button type="submit" className="header-search-btn">
                Search
              </button>
            </div>
          </form>

          {/* Navigation Links with Taskbar Indicator */}
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
              Impact
            </button>
          </nav>

          {/* Right Action Icons & Zepto/E-Commerce User Profile Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Theme Toggle */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <svg className="theme-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              ) : (
                <svg className="theme-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              )}
            </button>

            {/* Share Resource Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm nav-cta-btn"
              onClick={() => navigateTo('create', { prefill: null })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Share Item</span>
            </button>

            {/* Zepto/Flipkart Style User Account Avatar & Dropdown */}
            <div className="user-profile-menu-container" ref={dropdownRef}>
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                aria-expanded={profileDropdownOpen}
                aria-label="User account menu"
              >
                <div className="user-avatar-circle">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="user-avatar-img" />
                  ) : (
                    <span>{currentUser?.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="user-profile-text-wrap">
                  <span className="user-profile-name">{currentUser?.name?.split(' ')[0] || 'Member'}</span>
                  <span className="user-profile-sub">{currentUser?.roomOrFlat || 'Room 304'}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Popover Dropdown (Zepto Style) */}
              {profileDropdownOpen && (
                <div className="user-profile-popover">
                  <div className="user-popover-header">
                    <div className="user-avatar-large">
                      {currentUser?.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="user-avatar-img" />
                      ) : (
                        <span>{currentUser?.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
                        {currentUser?.roomOrFlat} &bull; {currentCommunity?.name?.split('(')[0].trim()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                        {currentUser?.phone}
                      </div>
                    </div>
                  </div>

                  <div className="user-popover-links">
                    <button
                      type="button"
                      className="user-popover-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Customize Profile & PFP</span>
                    </button>

                    <button
                      type="button"
                      className="user-popover-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setAiKeyModalOpen(true);
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8b5cf6' }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span>Gemini Pro AI Key (Jio Offer)</span>
                    </button>

                    <button
                      type="button"
                      className="user-popover-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setSwitchAccountModalOpen(true);
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0284c7' }}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>Switch Testing Personas</span>
                    </button>

                    <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.35rem 0' }} />

                    <button
                      type="button"
                      className="user-popover-item"
                      style={{ color: '#ef4444' }}
                      onClick={handleSignOut}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
