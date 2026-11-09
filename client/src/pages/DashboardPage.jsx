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
      <div className="panel">
        <div className="state-message">
          <p>Loading community activity metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="panel">
        <div className="alert alert-danger">{error || 'Metrics unavailable.'}</div>
      </div>
    );
  }

  const hasAvoidedExp = data.avoidedExpenditureEstimateInr && Number(data.avoidedExpenditureEstimateInr) > 0;

  return (
    <div>
      <div className="panel">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">Community Sharing Activity & Impact</h1>
            <p className="panel-description">
              Verified operational statistics for <strong>{currentCommunity ? currentCommunity.name : ''}</strong> derived directly from database records.
            </p>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-card-label">Shared Inventory</div>
            <div className="metric-card-value">{data.totalItems}</div>
            <div className="metric-card-sub">Active resources listed by members</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-label">Active Loans in Progress</div>
            <div className="metric-card-value">{data.activeLoans}</div>
            <div className="metric-card-sub">Items currently handed over to borrowers</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-label">Fulfilled Borrowings</div>
            <div className="metric-card-value">{data.fulfilledRequests}</div>
            <div className="metric-card-sub">Completed loans returned and confirmed</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-label">Resource Utilization</div>
            <div className="metric-card-value">{data.utilizationRatePercent}%</div>
            <div className="metric-card-sub">{data.totalDaysBorrowed} cumulative days of active item use</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-label">Unmet Demand Volume</div>
            <div className="metric-card-value">{data.openDemands}</div>
            <div className="metric-card-sub">Member requests waiting for owners to list</div>
          </div>
        </div>

        {/* Traceable Avoided Community Expenditure Section */}
        <div style={{ backgroundColor: '#f0f4f0', border: '1px solid #cce2d6', borderRadius: '3px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1f4e3b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Estimated Community Avoided Expenditure (Rough Estimate)
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#163a2b', marginTop: '0.2rem' }}>
                {hasAvoidedExp ? `Rs ${Number(data.avoidedExpenditureEstimateInr).toLocaleString('en-IN')}` : 'No estimate recorded yet'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', borderTop: '1px solid #cce2d6', paddingTop: '0.6rem' }}>
            <strong>Calculation Method:</strong> {data.avoidedExpenditureExplanation}
          </div>
        </div>

        {/* Popular Categories Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Resource Sharing by Category</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Listed Items</th>
                  <th>Fulfilled / Active Loans</th>
                </tr>
              </thead>
              <tbody>
                {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                  data.categoryBreakdown.map((c, idx) => (
                    <tr key={idx}>
                      <td><strong>{c.category}</strong></td>
                      <td>{c.itemCount} items</td>
                      <td>{c.loanCount} borrowings completed or active</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No category records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Community Activity Log */}
        <div>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Recent Timestamped Activity</h2>
          {data.recentActivity && data.recentActivity.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '170px' }}>Timestamp</th>
                    <th style={{ width: '180px' }}>Action Type</th>
                    <th>Audit Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity.map((act) => (
                    <tr key={act.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {act.createdAt ? act.createdAt.replace('T', ' ').slice(0, 16) : ''}
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}>
                          {act.actionType}
                        </span>
                      </td>
                      <td>{act.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: '#faf9f6', border: '1px solid var(--color-border)', borderRadius: '3px', fontSize: '0.875rem' }}>
              No logged activities recorded in this community yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
