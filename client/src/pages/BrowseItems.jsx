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
      <div className="panel">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">Available Community Resources</h1>
            <p className="panel-description">
              Find and borrow shared tools, healthcare aids, and equipment in {currentCommunity ? currentCommunity.name : 'your community'}.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigateTo('create')}
            >
              + List an Item to Share
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.25rem' }}>
          <div className="form-grid-2" style={{ marginBottom: '0.75rem' }}>
            <div>
              <label htmlFor="search-keyword" className="form-label">Search by Title or Description</label>
              <input
                id="search-keyword"
                type="text"
                className="form-input"
                placeholder="e.g. drill, wheelchair, projector, suitcase..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="search-category" className="form-label">Resource Category</label>
              <select
                id="search-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label htmlFor="search-dateFrom" className="form-label">Needed From</label>
              <input
                id="search-dateFrom"
                type="date"
                className="form-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label htmlFor="search-dateTo" className="form-label">Needed Until</label>
              <input
                id="search-dateTo"
                type="date"
                className="form-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-secondary">Apply Filters</button>
              {(keyword || category !== 'All Categories' || dateFrom || dateTo) && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="state-message">
            <p>Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="state-message">
            <p>No items found matching your filter criteria in this community.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Looking for something not yet shared? Submit an unlisted request in Unmet Demand so neighbours know what is needed.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigateTo('demands')}
              >
                Submit Unmet Demand Request
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigateTo('create')}
              >
                List a New Resource
              </button>
            </div>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item) => {
              const isOwner = currentUser && item.ownerId === currentUser.id;
              const hasConfirmedBookings = item.reservedPeriods && item.reservedPeriods.length > 0;

              return (
                <div key={item.id} className="item-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.05rem', margin: 0 }}>
                        <a
                          href={`#item-${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateTo('detail', { itemId: item.id });
                          }}
                        >
                          {item.title}
                        </a>
                      </h2>
                      <StatusBadge status={item.status} />
                      {isOwner && (
                        <span className="status-badge" style={{ backgroundColor: '#f0f4f8', color: '#1e3a5f', borderColor: '#bfdbfe' }}>
                          You are the owner
                        </span>
                      )}
                    </div>

                    <p style={{ margin: '0.35rem 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      {item.description}
                    </p>

                    <div className="item-meta">
                      <div className="item-meta-item">
                        <strong>Category:</strong> {item.category}
                      </div>
                      <div className="item-meta-item">
                        <strong>Condition:</strong> {item.itemCondition}
                      </div>
                      <div className="item-meta-item">
                        <strong>Pickup:</strong> {item.pickupLocation}
                      </div>
                      <div className="item-meta-item">
                        <strong>Availability:</strong> {item.availableFrom} to {item.availableTo}
                      </div>
                      {item.estimatedReplacementValueInr && (
                        <div className="item-meta-item">
                          <strong>Replacement Value:</strong> Rs {Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    {hasConfirmedBookings && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#92400e', backgroundColor: '#fffbeb', padding: '0.3rem 0.5rem', borderRadius: '2px', border: '1px solid #fcd34d' }}>
                        <strong>Scheduled Confirmed Bookings:</strong>{' '}
                        {item.reservedPeriods.map((p, idx) => (
                          <span key={idx} style={{ marginRight: '0.75rem' }}>
                            {p.startDate} to {p.endDate} [{p.status}]
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '130px', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigateTo('detail', { itemId: item.id })}
                    >
                      View Details & Schedule
                    </button>
                    {!isOwner && item.status === 'AVAILABLE' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => navigateTo('detail', { itemId: item.id })}
                      >
                        Request to Borrow
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
