import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function RequestsManagement() {
  const { currentUser, currentCommunity, notify } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('incoming'); // 'incoming' (owner) or 'outgoing' (borrower)
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handover modal state
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
      setConditionNotes('Inspected together at pickup location. All accessories verified and in working condition.');
      setPlannedReturnDate(req.endDate);
      setIssueReported(false);
      setIssueDetails('');
    } else {
      setConditionNotes('Returned on schedule. Checked and operating normally.');
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
        notify('success', issueReported ? 'Return completed with issue recorded in history.' : 'Return confirmed. Loan successfully closed.');
      }
      setHandoverModal(null);
      fetchRequests();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setSubmittingModal(false);
    }
  };

  return (
    <div>
      <div className="panel">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">Requests & Loan Management</h1>
            <p className="panel-description">
              Review reservation inquiries, coordinate handovers, and confirm item returns.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeSubTab === 'incoming' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSubTab('incoming')}
            >
              Incoming Inquiries for My Items ({incomingRequests.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeSubTab === 'outgoing' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSubTab('outgoing')}
            >
              My Outgoing Requests ({outgoingRequests.length})
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="state-message">
            <p>Loading requests...</p>
          </div>
        ) : activeSubTab === 'incoming' ? (
          /* Incoming Owner View */
          incomingRequests.length === 0 ? (
            <div className="state-message">
              <p>No incoming borrow inquiries received for items you own in this community.</p>
            </div>
          ) : (
            <div className="items-list">
              {incomingRequests.map((req) => (
                <div key={req.id} className="item-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1rem', margin: 0 }}>{req.itemTitle}</h2>
                      <StatusBadge status={req.status} />
                    </div>

                    <div style={{ marginTop: '0.4rem', fontSize: '0.875rem' }}>
                      <strong>Borrower:</strong> {req.borrowerName} ({req.borrowerRoomOrFlat || 'Room not stated'}) &bull; <strong>Phone:</strong> {req.borrowerPhone || 'Not provided'}
                    </div>

                    <div className="item-meta">
                      <div className="item-meta-item">
                        <strong>Requested Dates:</strong> {req.startDate} to {req.endDate}
                      </div>
                      <div className="item-meta-item">
                        <strong>Pickup Spot:</strong> {req.itemPickupLocation}
                      </div>
                      {req.borrowPurpose && (
                        <div className="item-meta-item">
                          <strong>Note:</strong> {req.borrowPurpose}
                        </div>
                      )}
                    </div>

                    {req.hasConflictingPendingRequests && req.status === 'PENDING' && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#92400e', backgroundColor: '#fffbeb', padding: '0.3rem 0.5rem', borderRadius: '2px', border: '1px solid #fcd34d' }}>
                        Notice: Multiple pending requests overlap with these dates. Approving one will preserve the other pending requests for your explicit decision.
                      </div>
                    )}

                    {req.handoverRecord && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#faf9f6', border: '1px solid var(--color-border)', borderRadius: '3px', fontSize: '0.8rem' }}>
                        {req.handoverRecord.handedOverAt && (
                          <div>
                            <strong>Handover Recorded:</strong> {req.handoverRecord.handedOverAt.replace('T', ' ').slice(0, 16)} &bull; Notes: {req.handoverRecord.initialConditionNotes}
                          </div>
                        )}
                        {req.handoverRecord.returnedAt && (
                          <div style={{ marginTop: '0.25rem' }}>
                            <strong>Return Recorded:</strong> {req.handoverRecord.returnedAt.replace('T', ' ').slice(0, 16)} &bull; Return Notes: {req.handoverRecord.returnConditionNotes}
                            {req.handoverRecord.issueReported && (
                              <div style={{ color: '#991b1b', fontWeight: 600, marginTop: '0.15rem' }}>
                                Problem Reported: {req.handoverRecord.issueDetails}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Owner Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '150px', alignItems: 'flex-end' }}>
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%' }}
                          onClick={() => handleApprove(req.id)}
                        >
                          Approve Reservation
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ width: '100%' }}
                          onClick={() => handleDecline(req.id)}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'APPROVED' && (
                      <button
                        type="button"
                        className="btn btn-navy btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => openHandoverModal(req, 'handover')}
                      >
                        Record Handover
                      </button>
                    )}

                    {req.status === 'ACTIVE' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => openHandoverModal(req, 'return')}
                      >
                        Confirm Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Outgoing Borrower View */
          outgoingRequests.length === 0 ? (
            <div className="state-message">
              <p>You have not submitted any borrow requests yet in this community.</p>
            </div>
          ) : (
            <div className="items-list">
              {outgoingRequests.map((req) => (
                <div key={req.id} className="item-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1rem', margin: 0 }}>{req.itemTitle}</h2>
                      <StatusBadge status={req.status} />
                    </div>

                    <div style={{ marginTop: '0.4rem', fontSize: '0.875rem' }}>
                      <strong>Owner:</strong> {req.ownerName} ({req.ownerRoomOrFlat || 'Room not stated'}) &bull; <strong>Contact:</strong> {req.ownerPhone || 'Coordinate via in-app'}
                    </div>

                    <div className="item-meta">
                      <div className="item-meta-item">
                        <strong>Requested Booking:</strong> {req.startDate} to {req.endDate}
                      </div>
                      <div className="item-meta-item">
                        <strong>Pickup Location:</strong> {req.itemPickupLocation}
                      </div>
                    </div>

                    {req.status === 'APPROVED' && (
                      <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '3px', fontSize: '0.85rem', color: '#0369a1' }}>
                        Reservation approved! Coordinate with owner at {req.itemPickupLocation} for item inspection and handover.
                      </div>
                    )}

                    {req.status === 'ACTIVE' && (
                      <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '3px', fontSize: '0.85rem', color: '#065f46' }}>
                        Item is currently in your custody. Return on or before {req.endDate} to {req.itemPickupLocation}.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '150px', alignItems: 'flex-end' }}>
                    {(req.status === 'PENDING' || req.status === 'APPROVED') && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleWithdraw(req.id)}
                      >
                        Withdraw Request
                      </button>
                    )}
                    {req.status === 'ACTIVE' && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => openHandoverModal(req, 'return')}
                      >
                        Record Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Handover & Return Modal */}
      {handoverModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div className="panel" style={{ maxWidth: '540px', width: '100%', margin: 0, backgroundColor: '#ffffff' }}>
            <div className="panel-header">
              <h2 className="panel-title">
                {handoverModal.type === 'handover' ? 'Record Pre-Loan Handover Condition' : 'Record Observed Condition on Return'}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setHandoverModal(null)}
              >
                &times; Close
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Resource: <strong>{handoverModal.request.itemTitle}</strong>
              </div>

              <div className="form-group">
                <label htmlFor="modal-notes" className="form-label">
                  {handoverModal.type === 'handover' ? 'Initial Item Condition & Checklist *' : 'Observed Return Condition *'}
                </label>
                <textarea
                  id="modal-notes"
                  className="form-textarea"
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="Record cosmetic state, operational test result, all cords/bits verified..."
                  required
                />
              </div>

              {handoverModal.type === 'handover' ? (
                <div className="form-group">
                  <label htmlFor="modal-return-date" className="form-label">Planned Return Date *</label>
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
                <div style={{ marginBottom: '1rem', border: '1px solid var(--color-border)', padding: '0.75rem', borderRadius: '3px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={issueReported}
                      onChange={(e) => setIssueReported(e.target.checked)}
                    />
                    Report an issue, damage, or delayed return
                  </label>
                  <div className="form-hint" style={{ marginTop: '0.2rem' }}>
                    If either party reports an issue, it is preserved permanently in the borrowing history rather than silently closing the loan.
                  </div>

                  {issueReported && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <label htmlFor="modal-issue-desc" className="form-label">Issue Details *</label>
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

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
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
                  {submittingModal ? 'Saving record...' : handoverModal.type === 'handover' ? 'Confirm Handover & Start Loan' : 'Confirm Return & Close Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
