import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function BorrowingHistory() {
  const { currentUser, currentCommunity, navigateTo } = useApp();
  const [historyType, setHistoryType] = useState('borrowed'); // 'borrowed' or 'lent'
  const [borrowedLoans, setBorrowedLoans] = useState([]);
  const [lentLoans, setLentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!currentUser) return;
      try {
        setLoading(true);
        setError(null);
        const [myReqs, ownerReqs] = await Promise.all([
          api.getMyRequests(),
          api.getOwnerRequests(),
        ]);

        setBorrowedLoans(myReqs || []);
        setLentLoans(ownerReqs || []);
      } catch (err) {
        setError(err.message || 'Unable to retrieve loan records.');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [currentUser, currentCommunity]);

  const activeList = historyType === 'borrowed' ? borrowedLoans : lentLoans;

  return (
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
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Borrowing & Lending History</h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Permanent audit trail of handovers, condition inspections, and returns for <strong>{currentCommunity ? currentCommunity.name : ''}</strong>.
          </p>
        </div>

        {/* Segmented Switcher */}
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
            className={`nav-pill ${historyType === 'borrowed' ? 'active' : ''}`}
            onClick={() => setHistoryType('borrowed')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            Items I Borrowed
            <span
              style={{
                marginLeft: '0.45rem',
                backgroundColor: historyType === 'borrowed' ? 'rgba(255,255,255,0.2)' : 'var(--color-border)',
                color: historyType === 'borrowed' ? '#ffffff' : 'var(--color-text-secondary)',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {borrowedLoans.length}
            </span>
          </button>
          <button
            type="button"
            className={`nav-pill ${historyType === 'lent' ? 'active' : ''}`}
            onClick={() => setHistoryType('lent')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            Items I Lent Out
            <span
              style={{
                marginLeft: '0.45rem',
                backgroundColor: historyType === 'lent' ? 'rgba(255,255,255,0.2)' : 'var(--color-border)',
                color: historyType === 'lent' ? '#ffffff' : 'var(--color-text-secondary)',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {lentLoans.length}
            </span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="state-message">
          <div className="state-message-icon">⏳</div>
          <p>Loading loan records...</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="state-message">
          <div className="state-message-icon">📜</div>
          <h3>No Records Found</h3>
          <p>No historical or active loans recorded in this category yet.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>{historyType === 'borrowed' ? 'Owner / Lender' : 'Borrower'}</th>
                <th>Booking Window</th>
                <th>Mutual Condition & Handover</th>
                <th>Return Status & Notes</th>
              </tr>
            </thead>
            <tbody>
              {activeList.map((loan) => {
                const hr = loan.handoverRecord;
                return (
                  <tr key={loan.id}>
                    <td>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: 'var(--color-text-primary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigateTo('detail', { itemId: loan.itemId })}
                      >
                        {loan.itemTitle}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-brand)', fontWeight: 600, marginTop: '0.15rem' }}>
                        {loan.itemCategory}
                      </div>
                      <div style={{ marginTop: '0.35rem' }}>
                        <StatusBadge status={loan.status} />
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {historyType === 'borrowed' ? loan.ownerName : loan.borrowerName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {historyType === 'borrowed' ? loan.ownerRoomOrFlat : loan.borrowerRoomOrFlat}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600 }}>{loan.startDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>to {loan.endDate}</div>
                    </td>

                    <td style={{ fontSize: '0.825rem', maxWidth: '280px' }}>
                      {hr && hr.handedOverAt ? (
                        <div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                            Checked: {hr.handedOverAt.replace('T', ' ').slice(0, 16)}
                          </div>
                          <div style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                            "{hr.initialConditionNotes}"
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Handover pending</span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.825rem', maxWidth: '280px' }}>
                      {hr && hr.returnedAt ? (
                        <div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                            Returned: {hr.returnedAt.replace('T', ' ').slice(0, 16)}
                          </div>
                          <div style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                            "{hr.returnConditionNotes}"
                          </div>
                          {hr.issueReported ? (
                            <div
                              style={{
                                marginTop: '0.35rem',
                                padding: '0.35rem 0.6rem',
                                backgroundColor: '#fee2e2',
                                border: '1px solid #fecdd3',
                                borderRadius: 'var(--radius-sm)',
                                color: '#991b1b',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            >
                              ⚠️ Issue: {hr.issueDetails}
                            </div>
                          ) : (
                            <div style={{ marginTop: '0.25rem', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>
                              ✓ Returned in good order
                            </div>
                          )}
                        </div>
                      ) : loan.status === 'ACTIVE' ? (
                        <span className="status-pill status-active">Currently in Use</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>{loan.status}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
