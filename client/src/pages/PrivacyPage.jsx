import React from 'react';
import { useApp } from '../context/AppContext';

export default function PrivacyPage() {
  const { navigateTo } = useApp();

  return (
    <div className="panel" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Privacy & Sensitive Resource Handling Policy (Draft for Review)</h1>
          <p className="panel-description">
            How OurThings protects member identity, private medical circumstances, and community data.
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigateTo('browse')}>
          &larr; Back to Listings
        </button>
      </div>

      <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f0f4f8', border: '1px solid #bfdbfe', borderRadius: '3px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#1e3a5f' }}>
        <strong>Design Authority Compliance:</strong> This draft policy corresponds directly with the backend authorization, community scoping, and demand aggregation scrubbers implemented in this version of OurThings.
      </div>

      <div style={{ lineHeight: 1.6, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          1. Healthcare and Mobility Aids Privacy Protection
        </h2>
        <p>
          Requests for items such as wheelchairs, walkers, blood pressure monitors, and crutches may reveal temporary medical conditions or personal recovery situations. OurThings implements specific safeguards:
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
          <li>
            <strong>Public Aggregated Demand Summaries:</strong> Member names, room numbers, contact numbers, and personal notes are completely excluded from community demand views. Only the normalized item title (e.g. "Adult Wheelchair") and the aggregated request count are presented.
          </li>
          <li>
            <strong>Direct Loan Coordination:</strong> Contact phone numbers and room details are shared only between the specific borrowing member and the item owner once a reservation inquiry is initiated to facilitate pickup.
          </li>
        </ul>

        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          2. Server-Enforced Community Scoping
        </h2>
        <p>
          All data including item listings, borrow requests, handovers, and activity logs are strictly partitioned by community identifier (hostel, apartment block, or neighbourhood ward). Members registered in one community cannot inspect or query another community's directory, borrowing history, or member lists.
        </p>

        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          3. Data Stored and Retained
        </h2>
        <p>
          OurThings retains records strictly needed for resource coordination:
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
          <li>Member name, community email, room or flat identifier, and optional phone number.</li>
          <li>Resource descriptions, categories, condition ratings, and listed availability windows.</li>
          <li>Reservation records, booking dates, and mutual condition check notes.</li>
          <li>Community activity timestamps for auditability and dashboard statistics.</li>
        </ul>

        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          4. No External Commercial Tracking or Third-Party Resale
        </h2>
        <p>
          No personal information or resource usage data is sold, monetized, or shared with commercial advertising brokers. Payment details are not collected or processed in this version of the application.
        </p>
      </div>
    </div>
  );
}
