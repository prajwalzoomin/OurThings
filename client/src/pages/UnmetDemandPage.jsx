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
      {/* Aggregated Demand Summary Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">Aggregated Community Demand</h1>
            <p className="panel-description">
              Repeated requests are grouped transparently by category and normalized name to highlight resources your community frequently needs.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const formEl = document.getElementById('demand-request-form');
              if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            + Request an Unlisted Item
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#f0f4f8', border: '1px solid #bfdbfe', borderRadius: '3px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#1e3a5f' }}>
          <strong>Privacy Safeguard:</strong> Requester identities and private medical circumstances are never exposed in public community summaries. Only the normalized item title, category, and aggregate demand count are shown.
        </div>

        {loading ? (
          <div className="state-message">
            <p>Loading demand summary...</p>
          </div>
        ) : aggregated.length === 0 ? (
          <div className="state-message">
            <p>No unmet demand requests currently logged in {currentCommunity ? currentCommunity.name : 'this community'}.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Needed Resource</th>
                  <th>Category</th>
                  <th>Demand Volume</th>
                  <th>Community Action</th>
                </tr>
              </thead>
              <tbody>
                {aggregated.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{item.displayName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Normalized Key: {item.normalizedName}
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <span className="status-badge status-pending" style={{ fontSize: '0.85rem', padding: '0.2rem 0.5rem' }}>
                        {item.demandCount} member{item.demandCount > 1 ? 's' : ''} requested
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSupplyItem(item)}
                      >
                        I have this item! List it now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Unmet Demand Form */}
      <div id="demand-request-form" className="panel" style={{ maxWidth: '780px' }}>
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Request an Item Not Currently Listed</h2>
            <p className="panel-description">
              Looking for crutches, a specific wrench, a travel iron, or camping gear? Register your need so owners know what to share.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="demand-name" className="form-label">Needed Resource Name *</label>
            <input
              id="demand-name"
              type="text"
              className="form-input"
              placeholder="e.g. Folding Adult Crutches, Rotary Hammer Drill, Folding Camping Tent"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="demand-cat" className="form-label">Category *</label>
            <select
              id="demand-cat"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="demand-needed-from" className="form-label">Estimated Date Needed</label>
              <input
                id="demand-needed-from"
                type="date"
                className="form-input"
                value={neededFrom}
                onChange={(e) => setNeededFrom(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="demand-needed-to" className="form-label">Until Date</label>
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
            <label htmlFor="demand-notes" className="form-label">Personal Notes (Private to you)</label>
            <textarea
              id="demand-notes"
              className="form-textarea"
              placeholder="Private logistics notes (e.g., needed for temporary post-surgery recovery)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="form-hint">
              This note remains confidential to your account and is stripped from public community aggregates.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Registering demand...' : 'Register Community Demand Request'}
          </button>
        </form>
      </div>

      {/* My Submitted Demand Requests */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">My Registered Demand Inquiries ({myDemands.length})</h2>
            <p className="panel-description">Items you have requested that were not listed when you checked.</p>
          </div>
        </div>

        {myDemands.length === 0 ? (
          <div className="state-message">
            <p>You have not registered any unlisted demand requests in this community.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requested Item</th>
                  <th>Category</th>
                  <th>Date Needed</th>
                  <th>Private Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myDemands.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.itemName}</strong></td>
                    <td>{d.category}</td>
                    <td>{d.neededFrom ? `${d.neededFrom} to ${d.neededTo || 'TBD'}` : 'Flexible'}</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      {d.notes || 'No private notes'}
                    </td>
                    <td><StatusBadge status={d.status} /></td>
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
