import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = [
  'Healthcare & Mobility',
  'Tools & Hardware',
  'Electronics',
  'Event Equipment',
  'Travel Gear',
];

export default function UnmetDemandPage() {
  const { currentCommunity, currentUser, navigateTo, notify } = useApp();

  const [aggregated, setAggregated] = useState([]);
  const [myDemands, setMyDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [neededFrom, setNeededFrom] = useState('');
  const [neededTo, setNeededTo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!currentCommunity) return;
    try {
      setLoading(true);
      setError(null);
      const [aggData, myData] = await Promise.all([
        api.getAggregatedDemands(),
        api.getMyDemands(),
      ]);
      setAggregated(aggData || []);
      setMyDemands(myData || []);
    } catch (err) {
      setError(err.message || 'Failed to load community demand data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentCommunity, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      notify('error', 'Item name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitDemand({
        itemName: itemName.trim(),
        category,
        neededFrom: neededFrom || null,
        neededTo: neededTo || null,
        notes: notes.trim() || null,
      });

      notify('success', 'Your unlisted item demand was recorded.');
      setItemName('');
      setNotes('');
      setNeededFrom('');
      setNeededTo('');
      fetchData();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupplyItem = (aggItem) => {
    navigateTo('create', {
      prefill: {
        title: aggItem.displayName,
        category: aggItem.category,
      },
    });
  };

  return (
    <div>
      {/* Top Header Card */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-brand-light)',
                  color: 'var(--color-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Aggregated Community Needs</h1>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Transparently clustered needs in <strong>{currentCommunity ? currentCommunity.name : ''}</strong>. See what neighbours frequently need so you can lend unused items.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              const formEl = document.getElementById('demand-request-form');
              if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            + Request an Unlisted Item
          </button>
        </div>

        {/* Privacy Safeguard Banner */}
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.825rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <div>
            <strong>Privacy Safeguard:</strong> Requester identities and private medical circumstances are strictly stripped from community summaries. Only normalized resource titles and aggregated volume counts are visible.
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Aggregated Demands Grid */}
        {loading ? (
          <div className="state-message">
            <div className="state-message-icon">⏳</div>
            <p>Loading community demand summary...</p>
          </div>
        ) : aggregated.length === 0 ? (
          <div className="state-message">
            <div className="state-message-icon">✨</div>
            <h3>No Unmet Needs Currently Logged</h3>
            <p>All requested items have either been fulfilled or none are currently registered in this community.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            {aggregated.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="resource-category-pill">{item.category}</span>
                    <span
                      style={{
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {item.demandCount} member{item.demandCount > 1 ? 's' : ''} need this
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.35rem 0' }}>{item.displayName}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                    Clustered Key: {item.normalizedName}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleSupplyItem(item)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  I have this item! List it now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register Unlisted Item Request Form Card */}
      <div id="demand-request-form" className="card-container" style={{ maxWidth: '780px', margin: '0 auto 1.5rem auto' }}>
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>Request an Unlisted Resource</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Need adult crutches, a pressure washer, a camping tent, or a specific adapter? Log your requirement so neighbours can share theirs.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="demand-name" className="form-label">
              Needed Item Name *
            </label>
            <input
              id="demand-name"
              type="text"
              className="form-input"
              placeholder="e.g. Folding Adult Crutches, Rotary Hammer Drill, 65L Rucksack"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="demand-cat" className="form-label">
              Category *
            </label>
            <select
              id="demand-cat"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="demand-needed-from" className="form-label">
                Needed From (Optional)
              </label>
              <input
                id="demand-needed-from"
                type="date"
                className="form-input"
                value={neededFrom}
                onChange={(e) => setNeededFrom(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="demand-needed-to" className="form-label">
                Until Date (Optional)
              </label>
              <input
                id="demand-needed-to"
                type="date"
                className="form-input"
                value={neededTo}
                onChange={(e) => setNeededTo(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="demand-notes" className="form-label">
              Personal Logistics Notes (Confidential)
            </label>
            <textarea
              id="demand-notes"
              className="form-textarea"
              placeholder="e.g. Needed for temporary post-surgery recovery or project presentation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="form-hint">
              This note is kept strictly confidential to your account and is excluded from community aggregations.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Registering demand...' : 'Submit Community Need Request'}
            </button>
          </div>
        </form>
      </div>

      {/* My Registered Demands */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0' }}>
              My Registered Demand Inquiries ({myDemands.length})
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Items you have requested that were not listed when you checked.
            </p>
          </div>
        </div>

        {myDemands.length === 0 ? (
          <div className="state-message">
            <p>You have not registered any unlisted demand inquiries yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requested Item</th>
                  <th>Category</th>
                  <th>Needed Window</th>
                  <th>Private Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myDemands.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.itemName}</strong>
                    </td>
                    <td>{d.category}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {d.neededFrom ? `${d.neededFrom} to ${d.neededTo || 'TBD'}` : 'Flexible'}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      {d.notes || '—'}
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
