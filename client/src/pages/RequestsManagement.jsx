import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import ItemCard from '../components/ItemCard';

export default function RequestsManagement() {
  const { currentUser, currentCommunity, notify, navigateTo, setSwitchAccountModalOpen } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('incoming'); // 'incoming' (owner) or 'outgoing' (borrower)
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handover & Return modal state
  const [handoverModal, setHandoverModal] = useState(null); // { request, type: 'handover' | 'return' }
  const [conditionNotes, setConditionNotes] = useState('');
  const [plannedReturnDate, setPlannedReturnDate] = useState('');
  const [issueReported, setIssueReported] = useState(false);
  const [issueDetails, setIssueDetails] = useState('');
  const [submittingModal, setSubmittingModal] = useState(false);

  const fetchRequests = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const [inData, outData] = await Promise.all([
        api.getOwnerRequests(),
        api.getMyRequests(),
      ]);
      setIncomingRequests(inData || []);
      setOutgoingRequests(outData || []);
    } catch (err) {
      setError(err.message || 'Unable to load borrowing requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser, currentCommunity]);

  const handleApprove = async (id) => {
    try {
      await api.approveRequest(id);
      notify('success', 'Reservation approved and dates confirmed.');
      fetchRequests();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;
    try {
      await api.declineRequest(id);
      notify('info', 'Request declined.');
      fetchRequests();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw your borrow request?')) return;
    try {
      await api.withdrawRequest(id);
      notify('info', 'Request withdrawn.');
      fetchRequests();
    } catch (err) {
      notify('error', err.message);
    }
  };

  const openHandoverModal = (req, type) => {
    setHandoverModal({ request: req, type });
    if (type === 'handover') {
      setConditionNotes('Inspected together at pickup location. All accessories verified and in operational condition.');
      setPlannedReturnDate(req.endDate);
      setIssueReported(false);
      setIssueDetails('');
    } else {
      setConditionNotes('Returned on schedule. Checked and operating normally with no physical damage.');
      setIssueReported(false);
      setIssueDetails('');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!handoverModal) return;

    try {
      setSubmittingModal(true);
      if (handoverModal.type === 'handover') {
        await api.recordHandover(handoverModal.request.id, {
          initialConditionNotes: conditionNotes.trim(),
          plannedReturnDate,
        });
        notify('success', 'Handover confirmed. Item is now actively on loan.');
      } else {
        if (issueReported && !issueDetails.trim()) {
          notify('error', 'Please provide issue details when reporting a problem.');
          setSubmittingModal(false);
          return;
        }
        await api.recordReturn(handoverModal.request.id, {
          returnConditionNotes: conditionNotes.trim(),
          issueReported,
          issueDetails: issueReported ? issueDetails.trim() : null,
          confirmedByOwner: true,
          confirmedByBorrower: true,
        });
        notify(
          'success',
          issueReported
            ? 'Return completed with issue recorded in history.'
            : 'Return confirmed. Loan successfully closed.'
        );
      }
      setHandoverModal(null);
      fetchRequests();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSubmittingModal(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="card-container" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Sign In to View Requests & Loans</h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0.5rem auto 1.5rem auto', fontSize: '0.9rem' }}>
          You are currently browsing in guest mode. Please sign in to your account to manage loan approvals, handovers, and returns.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setSwitchAccountModalOpen(true)}
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header Card */}
      <div className="card-container">
        <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '1.25rem' }}>
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Requests & Loan Management</h1>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Review borrower inquiries, verify handovers with mutual condition checks, and confirm returns for <strong>{currentCommunity ? currentCommunity.name : ''}</strong>.
            </p>
          </div>

          {/* Clean Segmented Tab Switcher */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-surface-hover)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              gap: '0.25rem',
            }}
          >
            <button
              type="button"
              className={`nav-pill ${activeSubTab === 'incoming' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('incoming')}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
            >
              Incoming Inquiries for My Items
              <span
                style={{
                  marginLeft: '0.45rem',
                  backgroundColor: activeSubTab === 'incoming' ? 'rgba(255,255,255,0.2)' : 'var(--color-border)',
                  color: activeSubTab === 'incoming' ? '#ffffff' : 'var(--color-text-secondary)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {incomingRequests.length}
              </span>
            </button>
            <button
              type="button"
              className={`nav-pill ${activeSubTab === 'outgoing' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('outgoing')}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
            >
              My Outgoing Requests
              <span
                style={{
                  marginLeft: '0.45rem',
                  backgroundColor: activeSubTab === 'outgoing' ? 'rgba(255,255,255,0.2)' : 'var(--color-border)',
                  color: activeSubTab === 'outgoing' ? '#ffffff' : 'var(--color-text-secondary)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {outgoingRequests.length}
              </span>
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="state-message">
            <div className="state-message-icon">⏳</div>
            <p>Loading borrowing requests...</p>
          </div>
        ) : activeSubTab === 'incoming' ? (
          /* ============================================================ */
          /* INCOMING REQUESTS (AS OWNER)                                */
          /* ============================================================ */
          incomingRequests.length === 0 ? (
            <div className="state-message">
              <div className="state-message-icon">📬</div>
              <h3>No Incoming Requests Yet</h3>
              <p>You have not received any borrowing requests for items you shared in this community.</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigateTo('create')}
                style={{ marginTop: '0.75rem' }}
              >
                + List a Resource to Share
              </button>
            </div>
          ) : (
            <div className="ecom-grid">
              {incomingRequests.map((req) => (
                <ItemCard
                  key={req.id}
                  item={{
                    id: req.itemId,
                    title: req.itemTitle,
                    category: req.itemCategory || 'Resource Loan',
                    pickupLocation: req.itemPickupLocation,
                    status: req.status,
                    ownerName: currentUser ? currentUser.name : '',
                    borrowerName: req.borrowerName,
                    startDate: req.startDate,
                    endDate: req.endDate,
                    itemCondition: req.itemCondition || 'Inspected',
                    estimatedReplacementValueInr: req.estimatedReplacementValueInr,
                    description: req.borrowPurpose || 'Inquiry received for this resource.',
                    reservedPeriods: req.reservedPeriods,
                  }}
                  metaSubtitle={`Borrower: ${req.borrowerName} (${req.borrowerRoomOrFlat || 'N/A'})`}
                  statusOverride={req.status}
                  dateLabel={`📅 ${req.startDate} – ${req.endDate}`}
                  actions={
                    req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.35rem', width: '100%' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, padding: '0.28rem 0.35rem', fontSize: '0.72rem' }}
                          onClick={() => handleApprove(req.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ flex: 1, padding: '0.28rem 0.35rem', fontSize: '0.72rem' }}
                          onClick={() => handleDecline(req.id)}
                        >
                          Decline
                        </button>
                      </div>
                    ) : req.status === 'APPROVED' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', padding: '0.28rem 0.4rem', fontSize: '0.72rem' }}
                        onClick={() => openHandoverModal(req, 'handover')}
                      >
                        Record Handover
                      </button>
                    ) : req.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', padding: '0.28rem 0.4rem', fontSize: '0.72rem' }}
                        onClick={() => openHandoverModal(req, 'return')}
                      >
                        Confirm Return
                      </button>
                    ) : req.status === 'RETURNED' ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', padding: '0.28rem 0.4rem', fontSize: '0.72rem' }}
                        onClick={() => navigateTo('history')}
                      >
                        View History Record
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', padding: '0.28rem 0.4rem', fontSize: '0.72rem' }}
                        onClick={() => navigateTo('detail', { itemId: req.itemId })}
                      >
                        View Resource
                      </button>
                    )
                  }
                />
              ))}
            </div>
          )
        ) : (
          /* ============================================================ */
          /* OUTGOING REQUESTS (AS BORROWER)                             */
          /* ============================================================ */
          outgoingRequests.length === 0 ? (
            <div className="state-message">
              <div className="state-message-icon">🔍</div>
              <h3>No Outgoing Requests</h3>
              <p>You haven't requested any resources in this community yet.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigateTo('browse')}
                style={{ marginTop: '0.75rem' }}
              >
                Explore Available Items
              </button>
            </div>
          ) : (
            <div className="ecom-grid">
              {outgoingRequests.map((req) => (
                <ItemCard
                  key={req.id}
                  item={{
                    id: req.itemId,
                    title: req.itemTitle,
                    category: req.itemCategory || 'Resource Loan',
                    pickupLocation: req.itemPickupLocation,
                    status: req.status,
                    ownerName: req.ownerName,
                    borrowerName: currentUser ? currentUser.name : '',
                    startDate: req.startDate,
                    endDate: req.endDate,
                    itemCondition: req.itemCondition || 'Inspected',
                    estimatedReplacementValueInr: req.estimatedReplacementValueInr,
                    description: req.borrowPurpose || 'Your outgoing borrow request.',
                  }}
                  metaSubtitle={`Owner: ${req.ownerName} (${req.ownerRoomOrFlat || 'N/A'})`}
                  statusOverride={req.status}
                  dateLabel={`📅 ${req.startDate} – ${req.endDate}`}
                  actions={
                    (req.status === 'PENDING' || req.status === 'APPROVED') ? (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ width: '100%', padding: '0.28rem 0.4rem', fontSize: '0.72rem' }}
                        onClick={() => handleWithdraw(req.id)}
                      >
                        Withdraw Request
                      </button>
                    ) : req.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', padding: '0.28rem 0.4rem', fontSize: '0.72rem' }}
                        onClick={() => openHandoverModal(req, 'return')}
                      >
                        Record Return
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', padding: '0.28rem 0.4rem', fontSize: '0.72rem' }}
                        onClick={() => navigateTo('history')}
                      >
                        View Loan History
                      </button>
                    )
                  }
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Modern Aesthetic Handover & Return Modal */}
      {handoverModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-text-primary)' }}>
                  {handoverModal.type === 'handover'
                    ? 'Pre-Loan Handover Inspection'
                    : 'Observed Condition on Return'}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  Resource: <strong>{handoverModal.request.itemTitle}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHandoverModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label htmlFor="modal-notes" className="form-label">
                  {handoverModal.type === 'handover'
                    ? 'Mutual Condition Checklist & Observations *'
                    : 'Observed Return Condition *'}
                </label>
                <textarea
                  id="modal-notes"
                  className="form-textarea"
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="Record cosmetic state, verified accessories, cord condition..."
                  required
                />
                <div className="form-hint">
                  This observation is saved permanently into the community audit trail.
                </div>
              </div>

              {handoverModal.type === 'handover' ? (
                <div className="form-group">
                  <label htmlFor="modal-return-date" className="form-label">
                    Agreed Return Date *
                  </label>
                  <input
                    id="modal-return-date"
                    type="date"
                    className="form-input"
                    value={plannedReturnDate}
                    onChange={(e) => setPlannedReturnDate(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, cursor: 'pointer', color: issueReported ? '#be123c' : 'var(--color-text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={issueReported}
                      onChange={(e) => setIssueReported(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#be123c' }}
                    />
                    Report an issue, damage, or delayed return
                  </label>
                  <div className="form-hint" style={{ marginTop: '0.35rem' }}>
                    If either party reports an issue, it is preserved permanently in the borrowing history rather than silently closing the loan.
                  </div>

                  {issueReported && (
                    <div style={{ marginTop: '0.85rem' }}>
                      <label htmlFor="modal-issue-desc" className="form-label" style={{ color: '#be123c' }}>
                        Issue Details & Description *
                      </label>
                      <textarea
                        id="modal-issue-desc"
                        className="form-textarea"
                        value={issueDetails}
                        onChange={(e) => setIssueDetails(e.target.value)}
                        placeholder="Detail damage, missing bits, or return issues observed..."
                        required={issueReported}
                      />
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setHandoverModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingModal}
                >
                  {submittingModal
                    ? 'Saving record...'
                    : handoverModal.type === 'handover'
                    ? 'Confirm Handover & Start Loan'
                    : 'Confirm Return & Close Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
