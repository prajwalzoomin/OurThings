import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const { currentCommunity } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!currentCommunity) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        setError(err.message || 'Unable to load community metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [currentCommunity]);

  if (loading) {
    return (
      <div className="card-container">
        <div className="state-message">
          <div className="state-message-icon">⏳</div>
          <p>Loading community activity metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-container">
        <div className="alert alert-danger">{error || 'Metrics unavailable.'}</div>
      </div>
    );
  }

  const hasAvoidedExp = data.avoidedExpenditureEstimateInr && Number(data.avoidedExpenditureEstimateInr) > 0;

  return (
    <div>
      {/* Top Header */}
      <div className="card-container" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>
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
                  <path d="M3 3v18h18"></path>
                  <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
              </div>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Community Activity & Impact</h1>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Verified sharing statistics for <strong>{currentCommunity ? currentCommunity.name : ''}</strong> derived directly from database records.
            </p>
          </div>
        </div>
      </div>

      {/* Avoided Community Expenditure Hero Banner */}
      <div className="impact-banner">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            <span>🌱</span>
            <span>Estimated Avoided Expenditure</span>
          </div>
          <div className="impact-amount">
            {hasAvoidedExp ? `Rs ${Number(data.avoidedExpenditureEstimateInr).toLocaleString('en-IN')}` : 'Rs 0'}
          </div>
          <p style={{ color: '#d1fae5', fontSize: '0.875rem', maxWidth: '650px', margin: '0.5rem 0 0 0', lineHeight: 1.5 }}>
            <strong>Calculation Method:</strong> {data.avoidedExpenditureExplanation}
          </p>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', minWidth: '180px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 600 }}>
            Resource Utilization
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
            {data.utilizationRatePercent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#d1fae5', marginTop: '0.15rem' }}>
            {data.totalDaysBorrowed} days actively loaned
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Shared Inventory
            </span>
            <div style={{ color: 'var(--color-brand)' }}>📦</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0.35rem 0 0.15rem 0' }}>
            {data.totalItems}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Active resources listed by members
          </div>
        </div>

        <div className="card-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Loans
            </span>
            <div style={{ color: '#0284c7' }}>🔄</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0.35rem 0 0.15rem 0' }}>
            {data.activeLoans}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Items currently handed over & in use
          </div>
        </div>

        <div className="card-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Fulfilled Borrowings
            </span>
            <div style={{ color: '#16a34a' }}>✅</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0.35rem 0 0.15rem 0' }}>
            {data.fulfilledRequests}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Completed loans returned & confirmed
          </div>
        </div>

        <div className="card-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Unmet Demands
            </span>
            <div style={{ color: '#ea580c' }}>💡</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0.35rem 0 0.15rem 0' }}>
            {data.openDemands}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Member requests awaiting lenders
          </div>
        </div>
      </div>

      {/* Category Breakdown & Sharing Dynamics */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0' }}>Resource Sharing by Category</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Breakdown of inventory and loan circulation across categories.
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Listed Resources</th>
                <th>Fulfilled or Active Loans</th>
                <th>Activity Indicator</th>
              </tr>
            </thead>
            <tbody>
              {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                data.categoryBreakdown.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{c.category}</strong>
                    </td>
                    <td>{c.itemCount} items listed</td>
                    <td>{c.loanCount} borrowings completed or active</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            flex: 1,
                            maxWidth: '140px',
                            height: '6px',
                            backgroundColor: 'var(--color-surface-hover)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, Math.max(10, c.loanCount * 25))}%`,
                              backgroundColor: 'var(--color-brand)',
                              borderRadius: 'var(--radius-full)',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {c.loanCount > 0 ? 'In circulation' : 'Ready to lend'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                    No category records recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Community Activity Log */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0' }}>Community Audit & Activity Feed</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Recent timestamped actions recorded deterministically into the database.
            </p>
          </div>
        </div>

        {data.recentActivity && data.recentActivity.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '160px' }}>Timestamp</th>
                  <th style={{ width: '150px' }}>Action Type</th>
                  <th>Audit Summary</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivity.map((act) => (
                  <tr key={act.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {act.createdAt ? act.createdAt.replace('T', ' ').slice(0, 16) : ''}
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          borderColor: '#cbd5e1',
                          fontSize: '0.725rem',
                        }}
                      >
                        {act.actionType}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{act.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="state-message">
            <p>No community activities logged yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
