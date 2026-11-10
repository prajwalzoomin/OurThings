import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import ItemCard from '../components/ItemCard';

const CATEGORIES = [
  'All Categories',
  'Healthcare & Mobility',
  'Tools & Hardware',
  'Electronics',
  'Event Equipment',
  'Travel Gear',
];

const CONDITIONS = ['All Conditions', 'Like New', 'Good', 'Fair'];

const DISTANCES = [
  { label: 'Entire Bengaluru', value: 999 },
  { label: '< 1 km (Local Campus / Wing)', value: 1.0 },
  { label: '< 3 km (Local Ward / Suburb)', value: 3.0 },
  { label: '< 5 km (Outer Ring Road Corridor)', value: 5.0 },
];

export default function BrowseItems() {
  const { currentCommunity, currentUser, navigateTo, communityOnly, toggleCommunityOnly, searchQuery, setSearchQuery, userLocation, requireAuth } = useApp();

  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All Categories');
  const [keyword, setKeyword] = useState(searchQuery || '');
  const [condition, setCondition] = useState('All Conditions');
  const [maxDistanceKm, setMaxDistanceKm] = useState(999);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Contextual Facets (Flipkart-style)
  const [aiFacets, setAiFacets] = useState([]);
  const [activeFacet, setActiveFacet] = useState(null);

  // Sync external search query from Header omnibar
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== keyword) {
      setKeyword(searchQuery);
    }
  }, [searchQuery]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (category && category !== 'All Categories') params.category = category;
      if (keyword.trim()) params.keyword = keyword.trim();
      if (condition && condition !== 'All Conditions') params.condition = condition;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (userLocation?.latitude != null && userLocation?.longitude != null) {
        params.userLat = userLocation.latitude;
        params.userLng = userLocation.longitude;
      }

      const data = await api.getItems(params);
      let list = data || [];

      // Filter by distance in client if specified
      if (maxDistanceKm < 999) {
        list = list.filter((item) => (item.distanceKm || 0.4) <= maxDistanceKm);
      }

      // Filter by active facet if selected
      if (activeFacet) {
        const facetLower = activeFacet.toLowerCase();
        list = list.filter((item) =>
          (item.title && item.title.toLowerCase().includes(facetLower)) ||
          (item.description && item.description.toLowerCase().includes(facetLower))
        );
      }

      // Sort
      if (sortBy === 'distance') {
        list.sort((a, b) => (a.distanceKm || 0.4) - (b.distanceKm || 0.4));
      } else if (sortBy === 'value') {
        list.sort((a, b) => (b.estimatedReplacementValueInr || 0) - (a.estimatedReplacementValueInr || 0));
      } else if (sortBy === 'newest') {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setItems(list);
    } catch (err) {
      setError(err.message || 'Failed to load community items.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contextual specifications when keyword or category changes
  useEffect(() => {
    const q = keyword || (category !== 'All Categories' ? category : '');
    if (q) {
      api.smartSearch(q)
        .then((res) => {
          if (res && res.dynamicFilters) {
            setAiFacets(res.dynamicFilters);
          }
        })
        .catch(() => {});
    } else {
      setAiFacets([]);
    }
  }, [keyword, category]);

  useEffect(() => {
    fetchItems();
  }, [currentCommunity, category, condition, maxDistanceKm, sortBy, communityOnly, activeFacet, userLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(keyword);
    fetchItems();
  };

  const handleResetFilters = () => {
    setCategory('All Categories');
    setKeyword('');
    setSearchQuery('');
    setCondition('All Conditions');
    setMaxDistanceKm(999);
    setDateFrom('');
    setDateTo('');
    setActiveFacet(null);
    setSortBy('relevance');
  };

  return (
    <div>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛍️</span>
            <span>Bengaluru Resource Directory</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
            {communityOnly ? (
              <span>Scoped strictly to <strong>{currentCommunity?.name}</strong>.</span>
            ) : (
              <span>Showing available resources across all communities in <strong>Bengaluru</strong>.</span>
            )}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => requireAuth(() => navigateTo('create'))}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          + Offer an Item to Lend
        </button>
      </div>

      {/* Flipkart-Style Main Layout: Left Filter Sidebar + Right Product Grid */}
      <div className="flipkart-layout-container">
        {/* ============================================================ */}
        {/* LEFT SIDEBAR: FILTERS                                        */}
        {/* ============================================================ */}
        <aside className="flipkart-filter-sidebar">
          <div className="flipkart-filter-header">
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              Filters
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-brand)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              CLEAR ALL
            </button>
          </div>

          {/* 1. Food Delivery "VEG ONLY" Style Scope Filter */}
          <div className="flipkart-filter-section">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              Scope & Distance
            </div>
            <button
              type="button"
              className={`scope-toggle-pill ${communityOnly ? 'active-scope' : 'city-scope'}`}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '0.65rem' }}
              onClick={toggleCommunityOnly}
            >
              <div className="scope-toggle-indicator">
                <span className="scope-toggle-dot"></span>
              </div>
              <span className="scope-toggle-label">
                {communityOnly ? '🟢 My Community Only' : '🌐 Whole City (Bengaluru)'}
              </span>
            </button>

            {/* Distance Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {DISTANCES.map((d) => (
                <label
                  key={d.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: maxDistanceKm === d.value ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                    fontWeight: maxDistanceKm === d.value ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="distanceFilter"
                    checked={maxDistanceKm === d.value}
                    onChange={() => setMaxDistanceKm(d.value)}
                    style={{ accentColor: 'var(--color-brand)' }}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Categories Section */}
          <div className="flipkart-filter-section">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              Categories
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: category === cat ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                    fontWeight: category === cat ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="categoryFilter"
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                    style={{ accentColor: 'var(--color-brand)' }}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Condition Rating */}
          <div className="flipkart-filter-section">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              Item Condition
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {CONDITIONS.map((cond) => (
                <label
                  key={cond}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: condition === cond ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                    fontWeight: condition === cond ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="conditionFilter"
                    checked={condition === cond}
                    onChange={() => setCondition(cond)}
                    style={{ accentColor: 'var(--color-brand)' }}
                  />
                  <span>{cond}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Specifications & Contextual Features (Flipkart Style) */}
          {aiFacets.length > 0 && (
            <div className="flipkart-filter-section" style={{ borderBottom: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
                  Specifications & Features
                </span>
              </div>

              {aiFacets.map((group, gIdx) => (
                <div key={gIdx} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                    {group.filterName}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {group.options.map((opt, oIdx) => {
                      const isSelected = activeFacet === opt;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setActiveFacet(isSelected ? null : opt)}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
                            backgroundColor: isSelected ? 'var(--color-brand-light)' : 'var(--color-surface-hover)',
                            color: isSelected ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ============================================================ */}
        {/* RIGHT CONTENT AREA: PRODUCTS & SEARCH BAR                    */}
        {/* ============================================================ */}
        <main className="flipkart-content-area">
          {/* Top Search Bar & Sort Dropdown */}
          <div className="flipkart-toolbar">
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2rem', fontSize: '0.875rem' }}
                  placeholder="Search resources by title, specs, or locality..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <svg
                  style={{ position: 'absolute', left: '0.65rem', color: 'var(--color-text-muted)' }}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                Sort By:
              </span>
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="distance">Distance (Closest First)</option>
                <option value="value">Avoided Value (Highest First)</option>
                <option value="newest">Newest Listed</option>
              </select>
            </div>
          </div>

          {/* Result Count and Active Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
              Showing <strong>{items.length}</strong> resources in Bengaluru
              {keyword ? ` for "${keyword}"` : ''}
              {category !== 'All Categories' ? ` in ${category}` : ''}
            </div>

            {/* Active Pill Tags */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {category !== 'All Categories' && (
                <span className="utility-chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                  {category}
                  <button type="button" onClick={() => setCategory('All Categories')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>&times;</button>
                </span>
              )}
              {condition !== 'All Conditions' && (
                <span className="utility-chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                  {condition}
                  <button type="button" onClick={() => setCondition('All Conditions')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>&times;</button>
                </span>
              )}
              {activeFacet && (
                <span className="utility-chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderColor: '#8b5cf6', color: '#8b5cf6' }}>
                  ✨ {activeFacet}
                  <button type="button" onClick={() => setActiveFacet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#8b5cf6' }}>&times;</button>
                </span>
              )}
            </div>
          </div>

          {/* Product Items Grid */}
          {loading ? (
            <div className="state-message">
              <p>Scanning community inventory across Bengaluru...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : items.length === 0 ? (
            <div className="state-message">
              <div className="state-message-icon">🔍</div>
              <h3>No resources found matching criteria</h3>
              <p>Try widening your search keywords, turning off distance filters, or posting an unmet need for neighbours.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => navigateTo('demands')}>
                  + Post an Unmet Need
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="ecom-grid">
              {items.map((item) => {
                const isOwner = currentUser && item.ownerId === currentUser.id;
                const isSameCommunity = currentUser && item.communityId === currentUser.activeCommunityId;

                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    metaSubtitle={`📍 ${item.locality || 'Bengaluru'} • ~${item.distanceKm || 0.4} km away`}
                    badgeText={isSameCommunity ? '★ Same Community' : null}
                    actions={
                      <button
                        type="button"
                        className={`btn ${isOwner ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        style={{ width: '100%', padding: '0.28rem 0.4rem', fontSize: '0.72rem' }}
                        onClick={() => navigateTo('detail', { itemId: item.id })}
                      >
                        {isOwner ? 'Manage Listing' : item.status === 'AVAILABLE' ? 'Borrow Resource' : 'View Details'}
                      </button>
                    }
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
