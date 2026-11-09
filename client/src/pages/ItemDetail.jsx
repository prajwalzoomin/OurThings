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
      <div className="panel">
        <div className="state-message">
          <p>Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="panel">
        <div className="alert alert-danger">{error || 'Resource not found.'}</div>
        <button type="button" className="btn btn-secondary" onClick={() => navigateTo('browse')}>
          Back to Listings
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
      setRequestError('End date cannot be prior to start date.');
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

      setRequestSuccess('Borrow request submitted successfully. The owner has been notified to review your reservation.');
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
      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigateTo('browse')}
        >
          &larr; Back to Resource Listings
        </button>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 className="panel-title">{item.title}</h1>
              <StatusBadge status={item.status} />
              {isOwner && (
                <span className="status-badge" style={{ backgroundColor: '#f0f4f8', color: '#1e3a5f', borderColor: '#bfdbfe' }}>
                  Your Listing
                </span>
              )}
            </div>
            <p className="panel-description" style={{ marginTop: '0.3rem' }}>
              Category: <strong>{item.category}</strong> | Community Scope: <strong>{currentCommunity ? currentCommunity.name : ''}</strong>
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
                Remove Listing
              </button>
            </div>
          )}
        </div>

        {/* Detailed Item Attributes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#faf9f6', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '3px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Observed Condition</span>
            <div style={{ fontWeight: 600 }}>{item.itemCondition}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pickup & Handover Location</span>
            <div style={{ fontWeight: 600 }}>{item.pickupLocation}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Owner Listed Availability</span>
            <div style={{ fontWeight: 600 }}>{item.availableFrom} to {item.availableTo}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Reported Replacement Value</span>
            <div style={{ fontWeight: 600 }}>
              {item.estimatedReplacementValueInr ? `Rs ${Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}` : 'Not provided'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Used solely for community avoided expenditure estimate</div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Description & Included Accessories</h2>
          <p style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>{item.description}</p>
        </div>

        {/* Owner Information (Strictly scoped to active community) */}
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRadius: '3px', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>Owner Contact Coordination</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <strong>Owner:</strong> {item.ownerName} &bull; <strong>Room/Flat:</strong> {item.ownerRoomOrFlat || 'Not listed'} &bull; <strong>Contact Phone:</strong> {item.ownerPhone || 'Coordinates via in-app request'}
          </div>
        </div>

        {/* Existing Confirmed Reservations Schedule */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Reserved Booking Periods</h2>
          {item.reservedPeriods && item.reservedPeriods.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Booking Status</th>
                    <th>Availability Window</th>
                  </tr>
                </thead>
                <tbody>
                  {item.reservedPeriods.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{p.startDate}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{p.endDate}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ color: '#92400e', fontWeight: 500 }}>
                        Locked period (Overlap prevention enforced on server)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '0.75rem', backgroundColor: '#faf9f6', border: '1px solid var(--color-border)', borderRadius: '3px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              No confirmed bookings currently exist within the availability window.
            </div>
          )}
        </div>

        {/* Borrower Request Form */}
        {!isOwner && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Request to Borrow This Resource</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Select your intended reservation window. Overlapping confirmed bookings are prevented deterministically on the server.
            </p>

            {item.status !== 'AVAILABLE' && (
              <div className="alert alert-warning">
                This item is currently marked as <strong>{item.status}</strong> and cannot accept new requests at this moment.
              </div>
            )}

            {hasClientConflict && (
              <div className="alert alert-danger">
                Warning: The selected dates overlap with an already confirmed reservation above. The server will reject overlapping bookings.
              </div>
            )}

            {requestError && <div className="alert alert-danger">{requestError}</div>}
            {requestSuccess && <div className="alert alert-success">{requestSuccess}</div>}

            {item.status === 'AVAILABLE' && (
              <form onSubmit={handleBorrowSubmit} style={{ maxWidth: '600px' }}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="req-start" className="form-label">Borrow Start Date</label>
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
                    <label htmlFor="req-end" className="form-label">Return End Date</label>
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
                  <label htmlFor="req-purpose" className="form-label">Intended Use Note (Visible to Owner)</label>
                  <textarea
                    id="req-purpose"
                    className="form-textarea"
                    placeholder="Briefly state your task (e.g., hanging bedroom shelf, knee injury recovery support)..."
                    value={borrowPurpose}
                    onChange={(e) => setBorrowPurpose(e.target.value)}
                  />
                  <div className="form-hint">
                    For sensitive healthcare or mobility aids, provide only what is necessary for pickup logistics.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
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
