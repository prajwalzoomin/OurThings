import React from 'react';
import { useApp } from '../context/AppContext';

export default function TermsPage() {
  const { navigateTo } = useApp();

  return (
    <div className="card-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="card-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>Community Resource Sharing Terms</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Operational guidelines and member responsibilities for non-commercial peer lending.
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigateTo('home')}>
          &larr; Back to Home
        </button>
      </div>

      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#1e40af',
        }}
      >
        <strong>Operational Framework:</strong> This platform enforces non-commercial, peer-to-peer resource sharing scoped strictly to verified community groups (hostels, apartment complexes, neighbourhoods).
      </div>

      <div style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)', fontSize: '0.925rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
          1. Scope of Service & Non-Commercial Purpose
        </h3>
        <p>
          OurThings is designed solely for community members living in close geographic proximity (hostel blocks, apartment wings, neighbourhood associations). Lending is strictly non-commercial: no rental charges, service fees, or deposits are collected or processed.
        </p>

        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
          2. Server-Enforced Community Scoping
        </h3>
        <p>
          Members must belong to the active community to view listings, submit requests, or view demand records. Community isolation is validated server-side on every read and write operation.
        </p>

        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
          3. Deterministic Reservation Integrity
        </h3>
        <p>
          Once an owner approves a borrow request for a specific calendar window, that window is immediately locked. Overlapping confirmed reservations are blocked on the server to prevent double-booking.
        </p>

        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
          4. Handover Inspection & Condition Audit
        </h3>
        <p>
          Members must inspect the resource together at handover and return. Condition observations and any reported damages or delays are permanently preserved in the database audit log.
        </p>

        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>
          5. Avoided Expenditure Estimations
        </h3>
        <p>
          Values displayed on the community dashboard represent estimated avoided replacement costs based on values provided by item owners. They serve as an educational indicator of community resource efficiency.
        </p>
      </div>
    </div>
  );
}
