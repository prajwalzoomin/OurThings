import React from 'react';
import { useApp } from '../context/AppContext';

export default function TermsPage() {
  const { navigateTo } = useApp();

  return (
    <div className="panel" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Community Resource Sharing Terms (Draft for Review)</h1>
          <p className="panel-description">
            Operational guidelines and member responsibilities for non-commercial peer borrowing within defined groups.
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigateTo('browse')}>
          &larr; Back to Listings
        </button>
      </div>

      <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '3px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#92400e' }}>
        <strong>Review Notice:</strong> This document reflects the actual operational logic implemented in the OurThings platform. It is subject to review and formal approval by community coordinators and student project advisors.
      </div>

      <div style={{ lineHeight: 1.6, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          1. Scope of Service & Non-Commercial Purpose
        </h2>
        <p>
          OurThings is a peer-to-peer resource-sharing platform intended solely for hostel wings, residential apartment complexes, and local neighbourhoods. Lending and borrowing through this platform are strictly non-commercial. No rental fees, security deposits, subscriptions, or monetary charges are levied or processed through this service.
        </p>

        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          2. Community Association & Scoping
        </h2>
        <p>
          Members must belong to the respective hostel, apartment, or neighbourhood group to browse listings, post items, submit requests, or view demand records. Community scoping is enforced on the server. Members must not attempt to circumvent community access boundaries.
        </p>

        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          3. Reservation Integrity & Overlap Prevention
        </h2>
        <p>
          Confirmed reservations are deterministic and server-enforced. Once an item owner approves a reservation for a specified calendar period, that window is locked. Overlapping bookings for the same item are blocked. Borrowers are required to plan pickup and returns strictly within their approved reservation period.
        </p>

        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          4. Handover Inspection & Condition Verification
        </h2>
        <p>
          Both lender and borrower must visually inspect the item prior to handover and on return. Handover condition notes, planned return dates, and observed return conditions are logged permanently into the database. If any wear, damage, or malfunction occurs during borrowing, members must record the issue upon return so an accurate, transparent history is preserved.
        </p>

        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          5. Reasonable Care & Safe Handling
        </h2>
        <p>
          Borrowers agree to use shared tools, mobility aids, and electrical appliances with due diligence and according to standard operating safety practices. The application owners and developers do not accept liability for injuries or damages arising from improper item operation.
        </p>

        <h2 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '1rem' }}>
          6. Avoided Expenditure Estimations
        </h2>
        <p>
          Avoided expenditure numbers presented on community dashboards represent rough estimates based on optional replacement purchase costs entered by owners. They serve to highlight community resource optimization and do not reflect guaranteed financial savings or legal entitlements.
        </p>
      </div>
    </div>
  );
}
