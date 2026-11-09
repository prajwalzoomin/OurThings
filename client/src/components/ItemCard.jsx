import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from './StatusBadge';
import { getItemImageUrl } from '../utils/itemImages';

export default function ItemCard({ item }) {
  const { currentUser, navigateTo } = useApp();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isOwner = currentUser && item.ownerId === currentUser.id;
  const hasConfirmedBookings = item.reservedPeriods && item.reservedPeriods.length > 0;
  const imageUrl = getItemImageUrl(item);

  return (
    <div
      className="ecom-product-card"
      onClick={() => navigateTo('detail', { itemId: item.id })}
    >
      {/* Product Image Media Box (Amazon / Zomato / Flipkart Style) */}
      <div className="ecom-media-box">
        {/* Category Pill Overlay (Top Left) */}
        <div className="ecom-badge-top-left">
          <span>{item.category}</span>
        </div>

        {/* Live Status Badge Overlay (Top Right) */}
        <div className="ecom-badge-top-right">
          <StatusBadge status={item.status} />
        </div>

        {/* Location / Distance Overlay (Zomato Style - Bottom Left) */}
        <div className="ecom-badge-bottom-left">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="ecom-location-text">{item.pickupLocation}</span>
        </div>

        {/* Condition Rating Badge (Flipkart / Amazon Style - Bottom Right) */}
        <div className="ecom-badge-bottom-right">
          <span className="ecom-star-icon">★</span>
          <span>{item.itemCondition}</span>
        </div>

        {/* Main Product Image */}
        {!imgError ? (
          <img
            src={imageUrl}
            alt={item.title}
            className={`ecom-product-img ${imgLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="ecom-fallback-img">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
            <span>{item.title}</span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="ecom-card-body">
        {/* Title */}
        <h3 className="ecom-title" title={item.title}>
          {item.title}
        </h3>

        {/* Owner / Verified Assured Subtitle (Flipkart Assured / Amazon Prime style) */}
        <div className="ecom-lender-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
          <span className="ecom-lender-name">
            By <strong>{item.ownerName ? item.ownerName.split(' ')[0] : 'Member'}</strong>
            {item.ownerRoomOrFlat ? ` (${item.ownerRoomOrFlat})` : ''}
          </span>
          {isOwner && <span className="ecom-owner-tag">You Own This</span>}
        </div>

        {/* Description snippet */}
        <p className="ecom-description">
          {item.description}
        </p>

        {/* Availability Window (Flipkart "Delivery by" style) */}
        <div className="ecom-delivery-timeline">
          <div className="ecom-timeline-info">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Available: <strong>{item.availableFrom}</strong> to <strong>{item.availableTo}</strong></span>
          </div>

          {hasConfirmedBookings && (
            <div className="ecom-booking-notice">
              <span>⚠️ Already booked: {item.reservedPeriods.map((p) => `${p.startDate}–${p.endDate}`).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Pricing / Avoided Expenditure & Action Footer (Amazon / Flipkart Style) */}
        <div className="ecom-footer">
          <div className="ecom-price-group">
            <div className="ecom-price-row">
              <span className="ecom-free-badge">FREE</span>
              <span className="ecom-price-sub">Community Lending</span>
            </div>

            {item.estimatedReplacementValueInr ? (
              <div className="ecom-avoided-cost">
                <span className="ecom-avoided-label">Est. Worth:</span>
                <span className="ecom-avoided-val">₹{Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}</span>
                <span className="ecom-avoided-tag">(Avoided Purchase)</span>
              </div>
            ) : (
              <div className="ecom-avoided-cost">
                <span className="ecom-avoided-tag">₹0 Rental Fee</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm ecom-cta-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigateTo('detail', { itemId: item.id });
            }}
          >
            {isOwner ? 'Manage' : 'Reserve'}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
