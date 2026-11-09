import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function ItemDetail() {
  const { selectedItemId, currentUser, currentCommunity, navigateTo, notify } = useApp();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Request form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [borrowPurpose, setBorrowPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);

  const fetchItemDetail = async () => {
    if (!selectedItemId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItem(selectedItemId);
      setItem(data);
    } catch (err) {
      setError(err.message || 'Unable to retrieve item specifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetail();
  }, [selectedItemId]);

  if (loading) {
    return (
      <div className="card-container">
        <div className="state-message">
          <p>Loading item specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="card-container">
        <div className="alert alert-danger">{error || 'Resource not found.'}</div>
        <button type="button" className="btn btn-secondary" onClick={() => navigateTo('browse')}>
          &larr; Back to Listings
        </button>
      </div>
    );
  }

  const isOwner = currentUser && item.ownerId === currentUser.id;

  // Real-time conflict preview
  const hasClientConflict =
    startDate &&
    endDate &&
    item.reservedPeriods &&
    item.reservedPeriods.some((p) => {
      return startDate <= p.endDate && endDate >= p.startDate;
    });

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(null);

    if (!startDate || !endDate) {
      setRequestError('Please select both a start date and an end date.');
      return;
    }
    if (endDate < startDate) {
      setRequestError('End date cannot precede start date.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitRequest({
        itemId: item.id,
        startDate,
        endDate,
        borrowPurpose,
      });

      setRequestSuccess('Borrow request submitted successfully! The owner will review your reservation.');
      notify('success', 'Borrow request recorded.');
      setTimeout(() => {
        navigateTo('requests');
      }, 1500);
    } catch (err) {
      setRequestError(err.message || 'Failed to submit borrow request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePause = async () => {
    try {
      const updated = await api.togglePauseItem(item.id);
      setItem(updated);
      notify('info', `Listing is now ${updated.status}.`);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Are you sure you want to remove the listing "${item.title}"?`)) {
      return;
    }
    try {
      await api.removeItem(item.id);
      notify('info', 'Item removed from community directory.');
      navigateTo('browse');
    } catch (err) {
      notify('error', err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigateTo('browse')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Directory
        </button>
      </div>

      <div className="card-container">
        {/* Header with Title and Badges */}
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <span className="resource-category-pill">{item.category}</span>
              <StatusBadge status={item.status} />
              {isOwner && (
                <span className="status-pill status-approved">
                  You are the Owner
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.65rem', margin: 0 }}>{item.title}</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Community: <strong>{currentCommunity ? currentCommunity.name : ''}</strong>
            </p>
          </div>

          {isOwner && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleTogglePause}
              >
                {item.status === 'PAUSED' ? 'Resume Availability' : 'Pause Listing'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigateTo('create', { prefill: item })}
              >
                Edit Listing
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Specifications Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Condition</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              {item.itemCondition}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pickup Location</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              {item.pickupLocation}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Listed Availability</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              {item.availableFrom} to {item.availableTo}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Value</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-brand)', marginTop: '0.2rem' }}>
              {item.estimatedReplacementValueInr ? `Rs ${Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}` : 'Not specified'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Description & Included Accessories</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {item.description || 'No additional description provided.'}
          </p>
        </div>

        {/* Owner Card */}
        <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              Listed By Community Member
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              {item.ownerName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Residence: {item.ownerRoomOrFlat || 'Room not listed'} &bull; Phone: {item.ownerPhone || 'Coordinates in-app'}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', backgroundColor: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
            Verified Resident in Community
          </div>
        </div>

        {/* Scheduled Confirmed Bookings */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Reserved Calendar Windows</h2>
          {item.reservedPeriods && item.reservedPeriods.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reservation Status</th>
                    <th>Availability Window</th>
                  </tr>
                </thead>
                <tbody>
                  {item.reservedPeriods.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{p.startDate}</td>
                      <td style={{ fontWeight: 600 }}>{p.endDate}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ color: '#b45309', fontWeight: 500 }}>
                        Locked (Server prevents overlapping bookings)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              No confirmed bookings currently overlap with this item. All dates in the availability window are open for reservations.
            </div>
          )}
        </div>

        {/* Borrower Request Form */}
        {!isOwner && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>Reserve This Resource</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Submit your desired borrowing period. The server validates dates and atomically checks for scheduling conflicts.
            </p>

            {item.status !== 'AVAILABLE' && (
              <div className="alert alert-warning">
                This resource is currently marked as <strong>{item.status}</strong> and is not accepting new requests right now.
              </div>
            )}

            {hasClientConflict && (
              <div className="alert alert-danger">
                Notice: The dates you selected overlap with an already confirmed reservation above. The server will reject this booking.
              </div>
            )}

            {requestError && <div className="alert alert-danger">{requestError}</div>}
            {requestSuccess && <div className="alert alert-success">{requestSuccess}</div>}

            {item.status === 'AVAILABLE' && (
              <form onSubmit={handleBorrowSubmit} style={{ maxWidth: '640px' }}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="req-start" className="form-label">Borrow Start Date *</label>
                    <input
                      id="req-start"
                      type="date"
                      className="form-input"
                      min={item.availableFrom}
                      max={item.availableTo}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="req-end" className="form-label">Return End Date *</label>
                    <input
                      id="req-end"
                      type="date"
                      className="form-input"
                      min={startDate || item.availableFrom}
                      max={item.availableTo}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="req-purpose" className="form-label">Intended Use Note (Shared with Owner)</label>
                  <textarea
                    id="req-purpose"
                    className="form-textarea"
                    placeholder="Briefly state your task (e.g. mounting room wall shelves, ankle sprain recovery)..."
                    value={borrowPurpose}
                    onChange={(e) => setBorrowPurpose(e.target.value)}
                  />
                  <div className="form-hint">
                    For sensitive healthcare aids, provide only what is needed for pickup coordination.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting || hasClientConflict}
                >
                  {submitting ? 'Submitting request...' : 'Confirm & Submit Borrow Request'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
