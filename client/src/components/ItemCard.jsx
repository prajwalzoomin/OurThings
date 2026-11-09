import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from './StatusBadge';
import { getItemImageUrl } from '../utils/itemImages';

export default function ItemCard({
  item,
  metaSubtitle,
  statusOverride,
  dateLabel,
  badgeText,
  hidePrice,
  actions,
  onCardClick,
}) {
  const { openGlance } = useApp();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Normalize item fields across listings, requests, and demands
  const title = item.title || item.itemTitle || item.displayName || item.itemName || 'Community Resource';
  const category = item.category || item.itemCategory || 'Community Resource';
  const condition = badgeText || (item.itemCondition ? `★ ${item.itemCondition}` : null);
  const status = statusOverride || item.status || 'AVAILABLE';
  const imageUrl = getItemImageUrl({ ...item, title, category });

  const locationText = item.pickupLocation || item.itemPickupLocation || 'Community Area';
  const ownerOrLenderText = item.ownerName ? item.ownerName.split(' ')[0] : item.borrowerName ? item.borrowerName.split(' ')[0] : '';

  const handleClick = () => {
    if (onCardClick) {
      onCardClick();
    } else {
      openGlance({
        ...item,
        id: item.itemId || item.id,
        title,
        category,
        itemCondition: item.itemCondition || 'Good',
        pickupLocation: locationText,
        availableFrom: item.availableFrom || item.startDate || 'Today',
        availableTo: item.availableTo || item.endDate || 'Flexible',
        status,
        description: item.description || item.borrowPurpose || item.notes || 'Peer-to-peer resource shared within verified community.',
      });
    }
  };

  return (
    <div
      className="compact-item-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      title={`Click to glance: ${title}`}
    >
      {/* Compact Image Showcase Area */}
      <div className="compact-card-media">
        {/* Category Chip (Top Left) */}
        <div className="compact-chip-category">
          <span>{category}</span>
        </div>

        {/* Live Status Badge (Top Right) */}
        <div className="compact-chip-status">
          <StatusBadge status={status} />
        </div>

        {/* Condition Rating (Bottom Right) */}
        {condition && (
          <div className="compact-chip-condition">
            <span>{condition}</span>
          </div>
        )}

        {/* Product Photo */}
        {!imgError ? (
          <img
            src={imageUrl}
            alt={title}
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
        {/* Title: truncated with ellipsis */}
        <h3 className="compact-card-title" title={title}>
          {title}
        </h3>

        {/* Subtitle / Location / Owner line with strict ellipsis */}
        <div className="compact-card-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="compact-truncate-text">
            {metaSubtitle || `${locationText}${ownerOrLenderText ? ` • ${ownerOrLenderText}` : ''}`}
          </span>
        </div>

        {/* Availability / Dates badge */}
        <div className="compact-date-badge">
          <span>
            {dateLabel || (item.availableTo ? `📅 Available to ${item.availableTo}` : `📅 Scheduled Booking`)}
          </span>
        </div>

        {/* Bottom Pricing & Glance Action */}
        {!hidePrice && (
          <div className="compact-card-footer">
            <div className="compact-price-wrap">
              <span className="compact-free-tag">FREE</span>
              {item.estimatedReplacementValueInr && (
                <span className="compact-avoided-text" title="Estimated purchase expenditure avoided">
                  Avoided: ₹{Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <button
              type="button"
              className="compact-glance-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <span>Glance</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        )}

        {/* Contextual Action Buttons Below the Card */}
        {actions && (
          <div
            className="compact-actions-row"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
