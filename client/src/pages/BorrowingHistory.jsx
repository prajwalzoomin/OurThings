import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import ItemCard from '../components/ItemCard';

export default function BorrowingHistory() {
  const { currentUser, currentCommunity, navigateTo, setSwitchAccountModalOpen } = useApp();
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

  if (!currentUser) {
    return (
      <div className="card-container" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📜</div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Sign In to View Loan History</h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0.5rem auto 1.5rem auto', fontSize: '0.9rem' }}>
          You are currently in guest mode. Sign in to your account to see your borrowing and lending audit logs.
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
        <div className="ecom-grid">
          {activeList.map((loan) => {
            const hr = loan.handoverRecord;
            const otherParty = historyType === 'borrowed' ? loan.ownerName : loan.borrowerName;
            const otherPartyLoc = historyType === 'borrowed' ? loan.ownerRoomOrFlat : loan.borrowerRoomOrFlat;
            const hasIssue = hr && hr.issueReported;
            const conditionBadge = hr?.returnedAt
              ? '✓ Returned'
              : hr?.handedOverAt
              ? '★ Active Loan'
              : 'Pending Handover';

            return (
              <ItemCard
                key={loan.id}
                item={{
                  id: loan.itemId,
                  title: loan.itemTitle,
                  category: loan.itemCategory,
                  status: loan.status,
                  pickupLocation: otherPartyLoc || 'Community Area',
                  ownerName: loan.ownerName,
                  borrowerName: loan.borrowerName,
                  startDate: loan.startDate,
                  endDate: loan.endDate,
                  itemCondition: hr?.initialConditionNotes || 'Inspected',
                  description: hr?.returnConditionNotes
                    ? `Return condition: "${hr.returnConditionNotes}". Handover check: "${hr.initialConditionNotes || 'None'}".`
                    : hr?.initialConditionNotes
                    ? `Handover inspection notes: "${hr.initialConditionNotes}".`
                    : `Booking period: ${loan.startDate} to ${loan.endDate}.`,
                }}
                metaSubtitle={`${historyType === 'borrowed' ? 'Owner' : 'Borrower'}: ${otherParty || 'Member'}`}
                dateLabel={`📅 ${loan.startDate} → ${loan.endDate}`}
                statusOverride={loan.status}
                badgeText={conditionBadge}
                actions={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
                    {hasIssue && (
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: '#ef4444',
                          fontWeight: 700,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '4px',
                          padding: '0.15rem 0.35rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={`Issue: ${hr.issueDetails}`}
                      >
                        ⚠️ Issue: {hr.issueDetails}
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', fontSize: '0.72rem', padding: '0.3rem 0.4rem', justifyContent: 'center' }}
                      onClick={() => navigateTo('detail', { itemId: loan.itemId })}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <span>Full Audit Record</span>
                    </button>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
