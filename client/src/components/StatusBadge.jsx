import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toUpperCase();

  let className = 'status-pill ';
  let label = status;

  switch (s) {
    case 'AVAILABLE':
      className += 'status-available';
      label = 'Available to Borrow';
      break;
    case 'PENDING':
      className += 'status-pending';
      label = 'Pending Review';
      break;
    case 'APPROVED':
      className += 'status-approved';
      label = 'Reserved & Approved';
      break;
    case 'ACTIVE':
      className += 'status-active';
      label = 'Active Loan (Handed Over)';
      break;
    case 'RETURNED':
      className += 'status-returned';
      label = 'Returned & Verified';
      break;
    case 'PAUSED':
      className += 'status-paused';
      label = 'Paused by Owner';
      break;
    case 'LENT':
      className += 'status-active';
      label = 'Currently On Loan';
      break;
    case 'DECLINED':
      className += 'status-declined';
      label = 'Declined';
      break;
    case 'WITHDRAWN':
      className += 'status-withdrawn';
      label = 'Withdrawn';
      break;
    case 'OPEN':
      className += 'status-pending';
      label = 'Open Request';
      break;
    case 'FULFILLED':
      className += 'status-available';
      label = 'Fulfilled by Member';
      break;
    default:
      className += 'status-paused';
      label = status;
  }

  return <span className={className}>{label}</span>;
}
