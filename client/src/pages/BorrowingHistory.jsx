import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function BorrowingHistory() {
  const { currentUser, currentCommunity } = useApp();
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

        // Filter to completed or historical loans
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
    <div className="panel">
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Borrowing & Lending History</h1>
          <p className="panel-description">
            Complete audit trail of handovers, condition checks, and confirmed returns. Records are preserved permanently.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${historyType === 'borrowed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setHistoryType('borrowed')}
          >
            Items I Borrowed ({borrowedLoans.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${historyType === 'lent' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setHistoryType('lent')}
          >
            Items I Lent Out ({lentLoans.length})
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="state-message">
          <p>Loading loan history...</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="state-message">
          <p>No recorded loans found in this category.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>{historyType === 'borrowed' ? 'Lender / Owner' : 'Borrower'}</th>
                <th>Booking Window</th>
                <th>Condition Check & Handover Notes</th>
                <th>Return Status & Issues</th>
              </tr>
            </thead>
            <tbody>
              {activeList.map((loan) => {
                const hr = loan.handoverRecord;
                return (
                  <tr key={loan.id}>
                    <td>
                      <strong>{loan.itemTitle}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Category: {loan.itemCategory}
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <StatusBadge status={loan.status} />
                      </div>
                    </td>

                    <td>
                      <div>{historyType === 'borrowed' ? loan.ownerName : loan.borrowerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {historyType === 'borrowed' ? loan.ownerRoomOrFlat : loan.borrowerRoomOrFlat}
                      </div>
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {loan.startDate} to {loan.endDate}
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>
                      {hr && hr.handedOverAt ? (
                        <div>
                          <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
                            <strong>Handed Over:</strong> {hr.handedOverAt.replace('T', ' ').slice(0, 16)}
                          </div>
                          <div style={{ fontStyle: 'italic', color: 'var(--color-text-primary)' }}>
                            "{hr.initialConditionNotes}"
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                            Planned return: {hr.plannedReturnDate}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Handover not yet initiated</span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>
                      {hr && hr.returnedAt ? (
                        <div>
                          <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
                            <strong>Returned:</strong> {hr.returnedAt.replace('T', ' ').slice(0, 16)}
                          </div>
                          <div>"{hr.returnConditionNotes}"</div>
                          {hr.issueReported ? (
                            <div style={{ marginTop: '0.4rem', padding: '0.3rem 0.5rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '2px', color: '#991b1b', fontWeight: 600 }}>
                              Reported Issue: {hr.issueDetails}
                            </div>
                          ) : (
                            <div style={{ marginTop: '0.25rem', color: '#166534', fontSize: '0.75rem', fontWeight: 500 }}>
                              Closed with no problems reported
                            </div>
                          )}
                        </div>
                      ) : loan.status === 'ACTIVE' ? (
                        <div style={{ color: '#065f46', fontWeight: 600 }}>Currently in active use</div>
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
