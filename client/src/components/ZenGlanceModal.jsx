import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from './StatusBadge';
import { getItemImageUrl } from '../utils/itemImages';

export default function ZenGlanceModal() {
  const { glanceItem, closeGlance, navigateTo, currentUser } = useApp();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeGlance();
      }
    };
    if (glanceItem) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [glanceItem]);

  if (!glanceItem) return null;

  const isOwner = currentUser && glanceItem.ownerId === currentUser.id;
  const imageUrl = getItemImageUrl(glanceItem);
  const hasBookings = glanceItem.reservedPeriods && glanceItem.reservedPeriods.length > 0;

  const handleOpenFullPage = () => {
    const itemId = glanceItem.id;
    closeGlance();
    navigateTo('detail', { itemId });
  };

  return (
    <div
      className="zen-glance-backdrop"
      onClick={closeGlance}
      role="dialog"
      aria-modal="true"
      aria-labelledby="zen-glance-title"
    >
      <div
        className="zen-glance-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glance Utility Header (Zen Browser Style) */}
        <div className="zen-glance-header">
          <div className="zen-glance-title-group">
            <span className="zen-glance-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              Resource Glance
            </span>
            <span className="zen-glance-hint">Tap card or expand to open full view</span>
          </div>

          <div className="zen-glance-actions">
            <button
              type="button"
              className="zen-glance-btn-expand"
              onClick={handleOpenFullPage}
              title="Open Complete Product Details (Full Page)"
            >
              <span>Open Full Page</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>

            <button
              type="button"
              className="zen-glance-btn-close"
              onClick={closeGlance}
              aria-label="Close Glance"
              title="Close Glance (Esc)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Clickable Glance Body: Clicking anywhere navigates to full detail */}
        <div className="zen-glance-body" onClick={handleOpenFullPage} style={{ cursor: 'pointer' }}>
          {/* Visual Showcase */}
          <div className="zen-glance-media">
            <img
              src={imageUrl}
              alt={glanceItem.title}
              className="zen-glance-img"
            />
            <div className="zen-glance-media-overlay">
              <span className="zen-glance-category">{glanceItem.category}</span>
              <StatusBadge status={glanceItem.status} />
            </div>

            <div className="zen-glance-media-bottom">
              <div className="zen-glance-loc">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{glanceItem.pickupLocation}</span>
              </div>
              <div className="zen-glance-cond">
                ★ {glanceItem.itemCondition}
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="zen-glance-content">
            <h2 id="zen-glance-title" className="zen-glance-product-title">
              {glanceItem.title}
            </h2>

            <div className="zen-glance-meta-row">
              <span className="zen-glance-lender">
                Shared by <strong>{glanceItem.ownerName}</strong>
                {glanceItem.ownerRoomOrFlat ? ` (${glanceItem.ownerRoomOrFlat})` : ''}
              </span>
              {isOwner && <span className="zen-glance-owner-tag">You Own This</span>}
            </div>

            <p className="zen-glance-desc">
              {glanceItem.description || 'No additional description provided.'}
            </p>

            <div className="zen-glance-dates-bar">
              <div className="zen-glance-dates-text">
                📅 Available: <strong>{glanceItem.availableFrom}</strong> to <strong>{glanceItem.availableTo}</strong>
              </div>
              {hasBookings && (
                <div className="zen-glance-conflict-tag">
                  ⚠️ Booked: {glanceItem.reservedPeriods.map((p) => `${p.startDate}–${p.endDate}`).join(', ')}
                </div>
              )}
            </div>

            {/* Price & Societal Impact */}
            <div className="zen-glance-footer">
              <div className="zen-glance-price-stack">
                <div className="zen-glance-free">FREE TO BORROW</div>
                {glanceItem.estimatedReplacementValueInr && (
                  <div className="zen-glance-avoided">
                    Avoided Cost: <strong>₹{Number(glanceItem.estimatedReplacementValueInr).toLocaleString('en-IN')}</strong> (No Purchase Needed)
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn btn-primary zen-glance-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenFullPage();
                }}
              >
                {isOwner ? 'Manage Listing' : 'Open Details & Reserve'} &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

