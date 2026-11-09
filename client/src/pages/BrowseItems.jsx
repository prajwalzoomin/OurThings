import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = [
  'All Categories',
  'Healthcare & Mobility',
  'Tools & Hardware',
  'Electronics',
  'Event Equipment',
  'Travel Gear',
];

export default function BrowseItems() {
  const { currentCommunity, currentUser, navigateTo } = useApp();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All Categories');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    if (!currentCommunity) return;
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (category && category !== 'All Categories') params.category = category;
      if (keyword.trim()) params.keyword = keyword.trim();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await api.getItems(params);
      setItems(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load community items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentCommunity, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setCategory('All Categories');
    setKeyword('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', margin: 0 }}>Community Resource Directory</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Browse and reserve items shared by members in <strong>{currentCommunity ? currentCommunity.name : ''}</strong>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigateTo('create')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          List a Resource
        </button>
      </div>

      {/* Filter Card */}
      <div className="card-container" style={{ padding: '1.25rem' }}>
        {/* Category Pills Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`nav-pill ${category === cat ? 'active' : ''}`}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.85rem' }}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Dates Row */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '2', minWidth: '220px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by keywords (e.g. drill, wheelchair, projector)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <input
              type="date"
              className="form-input"
              title="Needed from date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <input
              type="date"
              className="form-input"
              title="Needed until date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Filter
          </button>

          {(keyword || category !== 'All Categories' || dateFrom || dateTo) && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleResetFilters}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Resource Cards */}
      {loading ? (
        <div className="state-message">
          <p>Loading community resources...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="state-message">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No resources match your filters</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto 1.25rem auto', fontSize: '0.9rem' }}>
            No one has listed this item yet in your community. You can submit an unmet demand request so neighbours know it is needed.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigateTo('demands')}
            >
              Post an Unmet Need
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="resource-grid">
          {items.map((item) => {
            const isOwner = currentUser && item.ownerId === currentUser.id;
            const hasConfirmedBookings = item.reservedPeriods && item.reservedPeriods.length > 0;

            return (
              <div key={item.id} className="resource-card">
                <div>
                  <div className="resource-card-top">
                    <span className="resource-category-pill">{item.category}</span>
                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="resource-title">
                    <a
                      href={`#item-${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('detail', { itemId: item.id });
                      }}
                    >
                      {item.title}
                    </a>
                  </h3>

                  <p className="resource-desc">{item.description}</p>
                </div>

                <div>
                  <div className="resource-meta-list">
                    <div className="resource-meta-row">
                      <svg className="meta-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>Location: <strong>{item.pickupLocation}</strong></span>
                    </div>

                    <div className="resource-meta-row">
                      <svg className="meta-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>Available: <strong>{item.availableFrom} to {item.availableTo}</strong></span>
                    </div>

                    <div className="resource-meta-row">
                      <svg className="meta-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Owner: <strong>{item.ownerName}</strong> ({item.itemCondition})</span>
                    </div>

                    {isOwner && (
                      <div style={{ marginTop: '0.2rem', color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.75rem' }}>
                        &bull; You own this resource
                      </div>
                    )}

                    {hasConfirmedBookings && (
                      <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #fde68a' }}>
                        Booked: {item.reservedPeriods.map((p) => `${p.startDate} to ${p.endDate}`).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="resource-card-footer">
                    <div>
                      {item.estimatedReplacementValueInr && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                          Est. Value: Rs {Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => navigateTo('detail', { itemId: item.id })}
                    >
                      {isOwner ? 'Manage Listing' : 'View Details & Reserve'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
