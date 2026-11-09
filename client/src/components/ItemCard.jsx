import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from './StatusBadge';
import { getItemImageUrl } from '../utils/itemImages';

export default function ItemCard({ item }) {
  const { openGlance } = useApp();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = getItemImageUrl(item);

  return (
    <div
      className="compact-item-card"
      onClick={() => openGlance(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openGlance(item);
        }
      }}
      title={`Click to glance: ${item.title}`}
    >
      {/* Compact Image Showcase Area */}
      <div className="compact-card-media">
        {/* Category Chip (Top Left) */}
        <div className="compact-chip-category">
          <span>{item.category}</span>
        </div>

        {/* Live Status Badge (Top Right) */}
        <div className="compact-chip-status">
          <StatusBadge status={item.status} />
        </div>

        {/* Condition Rating (Bottom Right) */}
        <div className="compact-chip-condition">
          <span>★ {item.itemCondition}</span>
        </div>

        {/* Product Photo */}
        {!imgError ? (
          <img
            src={imageUrl}
            alt={item.title}
            className={`compact-card-img ${imgLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="compact-fallback-box">
            <span style={{ fontSize: '1.5rem' }}>📦</span>
          </div>
        )}
      </div>

      {/* Compact Card Details */}
      <div className="compact-card-body">
        {/* Title: 1 or 2 lines strictly truncated with ellipsis */}
        <h3 className="compact-card-title" title={item.title}>
          {item.title}
        </h3>

        {/* Location & Owner with strict single-line ellipsis */}
        <div className="compact-card-meta" title={`Pickup: ${item.pickupLocation} · Owner: ${item.ownerName}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="compact-truncate-text">
            {item.pickupLocation} &bull; {item.ownerName ? item.ownerName.split(' ')[0] : 'Owner'}
          </span>
        </div>

        {/* Availability chip */}
        <div className="compact-date-badge">
          <span>📅 Free to borrow until <strong>{item.availableTo}</strong></span>
        </div>

        {/* Bottom Pricing & Quick Glance Action */}
        <div className="compact-card-footer">
          <div className="compact-price-wrap">
            <span className="compact-free-tag">FREE</span>
            {item.estimatedReplacementValueInr && (
              <span className="compact-avoided-text" title="Avoided upfront purchase expenditure">
                Avoided: ₹{Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            type="button"
            className="compact-glance-btn"
            onClick={(e) => {
              e.stopPropagation();
              openGlance(item);
            }}
          >
            <span>Glance</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
