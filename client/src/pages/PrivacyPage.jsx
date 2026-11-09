import React from 'react';
import { useApp } from '../context/AppContext';

export default function PrivacyPage() {
  const { navigateTo } = useApp();

  return (
    <div className="card-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="card-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>Privacy & Healthcare Resource Policy</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            How OurThings safeguards member identities, personal recovery circumstances, and community records.
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigateTo('home')}>
          &larr; Back to Home
        </button>
      </div>

      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#166534',
        }}
      >
        <strong>Sensitive Item Protection:</strong> Healthcare equipment requests (crutches, wheelchairs, blood pressure monitors) receive special privacy handling to protect member dignity and confidentiality.
      </div>

      <div style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
          1. Healthcare and Mobility Aids Confidentiality
        </h3>
        <p>
          Requests for mobility aids or medical devices often reveal private personal recovery circumstances. OurThings enforces two key privacy protections:
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
          <li>
            <strong>Public Demand Summaries:</strong> Member names, room numbers, contact numbers, and personal notes are completely excluded from public demand views. Only the normalized item title (e.g. "Adult Wheelchair") and aggregate count are displayed.
          </li>
          <li>
            <strong>Direct Loan Coordination:</strong> Contact phone numbers and room details are shared only between the specific borrowing member and the item owner once a reservation inquiry is initiated.
          </li>
        </ul>

        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
          2. Server-Enforced Community Scoping
        </h3>
        <p>
          All data including item listings, borrow requests, handovers, and activity logs are strictly partitioned by community identifier (hostel, apartment block, or neighbourhood ward). Members registered in one community cannot inspect or query another community's records.
        </p>

        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
          3. Minimal Data Retention
        </h3>
        <p>
          OurThings retains records strictly needed for resource coordination: member name, room identifier, item descriptions, availability windows, and condition audit notes. No payment card data, commercial tracking scripts, or advertising trackers are used.
        </p>
      </div>
    </div>
  );
}
