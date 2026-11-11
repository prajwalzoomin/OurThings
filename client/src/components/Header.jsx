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
    setSwitchAccountModalOpen,
    userLocation,
    requestUserLocation,
    signOut,
    requireAuth,
    notify,
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const dropdownRef = useRef(null);

  // Sync search input with state
  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

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

  const handleShareClick = () => {
    requireAuth(() => {
      navigateTo('create', { prefill: null });
    });
  };

  return (
    <header className="site-header-wrapper">
      {/* Top Utility Context Bar: Location & Food-App Style Scope Toggle */}
      <div className="top-utility-bar">
        <div className="top-utility-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Precise GPS Location Pin & Trigger */}
            <button
              type="button"
              className="utility-chip"
              onClick={requestUserLocation}
              title="Click to detect or refresh your precise GPS location"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.15rem 0.5rem' }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: userLocation.isGpsAccurate ? 'var(--color-brand)' : 'var(--color-text-muted)' }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="22" y1="12" x2="18" y2="12"></line>
                <line x1="6" y1="12" x2="2" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="2"></line>
                <line x1="12" y1="22" x2="12" y2="18"></line>
              </svg>
              <span>{userLocation.locality || 'Bengaluru'}</span>
              {userLocation.isGpsAccurate ? (
                <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-brand-light)', color: 'var(--color-brand)', padding: '0.05rem 0.35rem', borderRadius: '3px', fontWeight: 700 }}>
                  GPS ACCURATE
                </span>
              ) : (
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textDecoration: 'underline' }}>
                  {userLocation.loadingLocation ? 'Locating...' : 'Detect GPS'}
                </span>
              )}
            </button>

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
                  <span style={{ color: 'var(--color-brand)', fontWeight: 700 }}>🟢 Within My Community</span>
                ) : (
                  <span>🌐 Whole City (Bengaluru)</span>
                )}
              </span>
            </button>
          </div>

          {/* Right Status Note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Verified Peer Resource Sharing &bull; NHCE
            </span>
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
            <div className="header-search-input-wrap">
              <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="header-search-input"
                placeholder="Search tools, crutches, projector, rucksack, speaker..."
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
            </div>
            <button type="submit" className="header-search-btn">
              Search
            </button>
          </form>

          {/* Navigation Items */}
          <nav className="header-nav">
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
              className={`nav-pill ${currentTab === 'loans' ? 'active' : ''}`}
              onClick={() => navigateTo('loans')}
            >
              Requests & Loans
            </button>
            <button
              type="button"
              className={`nav-pill ${currentTab === 'unmet' ? 'active' : ''}`}
              onClick={() => navigateTo('unmet')}
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
              onClick={handleShareClick}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Share Item</span>
            </button>

            {/* Account / Sign-in Section */}
            {currentUser ? (
              <div className="user-profile-menu-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="user-profile-btn"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  aria-expanded={profileDropdownOpen}
                  aria-label="User account menu"
                >
                  <div className="user-avatar-circle">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="user-avatar-img" />
                    ) : (
                      <span>{currentUser.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="user-profile-text-wrap">
                    <span className="user-profile-name">{currentUser.name?.split(' ')[0]}</span>
                    <span className="user-profile-sub">{currentUser.roomOrFlat || 'Resident'}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {/* Popover Dropdown */}
                {profileDropdownOpen && (
                  <div className="user-profile-popover">
                    <div className="user-popover-header">
                      <div className="user-avatar-large">
                        {currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt={currentUser.name} className="user-avatar-img" />
                        ) : (
                          <span>{currentUser.name?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {currentUser.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
                          {currentUser.roomOrFlat} &bull; {currentCommunity?.name?.split('(')[0].trim()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                          {currentUser.phone}
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
                        <span>Profile & Account Settings</span>
                      </button>

                      <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.35rem 0' }} />

                      <button
                        type="button"
                        className="user-popover-item"
                        style={{ color: '#ef4444' }}
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut();
                        }}
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
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSwitchAccountModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.95rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
