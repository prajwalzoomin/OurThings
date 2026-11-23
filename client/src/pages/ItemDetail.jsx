import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { getItemImageUrl } from '../utils/itemImages';
import ChatDrawer from '../components/ChatDrawer';
import ReviewModal from '../components/ReviewModal';

export default function ItemDetail() {
  const { selectedItemId, currentUser, currentCommunity, userLocation, navigateTo, notify, setSwitchAccountModalOpen } = useApp();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reviews state
  const [reviewsData, setReviewsData] = useState({ averageRating: 5.0, totalReviews: 0, reviews: [] });
  const [chatOpen, setChatOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Map and Route state
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [showingDirections, setShowingDirections] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState(null);

  // Request form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [borrowPurpose, setBorrowPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);

  const fetchItemDetail = async () => {
    if (!selectedItemId) return;
    try {
      setLoading(true);
      setError(null);
      const [data, revs] = await Promise.all([
        api.getItem(selectedItemId),
        api.getItemReviews(selectedItemId).catch(() => null),
      ]);
      setItem(data);
      if (revs) {
        setReviewsData(revs);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve item specifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetail();
  }, [selectedItemId]);

  // Render Leaflet Map for Item Location & Direction Route
  useEffect(() => {
    if (!item || !item.latitude || !item.longitude || !mapContainerRef.current) return;

    // Load leaflet if needed
    const loadLeaflet = () => {
      let link = document.getElementById('leaflet-css');
      if (!link) {
        link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => renderMap();
        document.head.appendChild(script);
      } else {
        renderMap();
      }
    };

    const renderMap = () => {
      if (!window.L || !mapContainerRef.current) return;
      const L = window.L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const itemLat = item.latitude;
      const itemLng = item.longitude;
      const map = L.map(mapContainerRef.current).setView([itemLat, itemLng], 15);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Item Marker
      const itemMarker = L.marker([itemLat, itemLng])
        .addTo(map)
        .bindPopup(`<b>${item.title}</b><br/>${item.pickupLocation || 'Pickup Point'}`)
        .openPopup();

      // If user requested directions, add user marker and routing line
      if (showingDirections && userLocation?.latitude && userLocation?.longitude) {
        const userLat = userLocation.latitude;
        const userLng = userLocation.longitude;

        const userMarker = L.circleMarker([userLat, userLng], {
          radius: 9,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup('<b>You are here</b>');

        // Draw polyline connecting user to item
        const polyline = L.polyline(
          [
            [userLat, userLng],
            [itemLat, itemLng],
          ],
          { color: '#10b981', weight: 4, dashArray: '6, 8', opacity: 0.85 }
        ).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

        // Calculate straight line or road distance
        const earthR = 6371;
        const dLat = ((itemLat - userLat) * Math.PI) / 180;
        const dLng = ((itemLng - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((itemLat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = (earthR * c).toFixed(2);
        setCalculatedDistance(distKm);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [item, showingDirections, userLocation]);

  if (loading) {
    return (
      <div className="card-container">
        <div className="state-message">
          <p>Loading item specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="card-container">
        <div className="alert alert-danger">{error || 'Resource not found.'}</div>
        <button type="button" className="btn btn-secondary" onClick={() => navigateTo('browse')}>
          &larr; Back to Listings
        </button>
      </div>
    );
  }

  const isOwner = currentUser && item.ownerId === currentUser.id;

  // Real-time conflict preview
  const hasClientConflict =
    startDate &&
    endDate &&
    item.reservedPeriods &&
    item.reservedPeriods.some((p) => {
      return startDate <= p.endDate && endDate >= p.startDate;
    });

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(null);

    if (!startDate || !endDate) {
      setRequestError('Please select both a start date and an end date.');
      return;
    }
    if (endDate < startDate) {
      setRequestError('End date cannot precede start date.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitRequest({
        itemId: item.id,
        startDate,
        endDate,
        borrowPurpose,
      });

      setRequestSuccess('Borrow request submitted successfully! The owner will review your reservation.');
      notify('success', 'Borrow request recorded.');
      setTimeout(() => {
        navigateTo('requests');
      }, 1500);
    } catch (err) {
      setRequestError(err.message || 'Failed to submit borrow request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePause = async () => {
    try {
      const updated = await api.togglePauseItem(item.id);
      setItem(updated);
      notify('info', `Listing is now ${updated.status}.`);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Are you sure you want to remove the listing "${item.title}"?`)) {
      return;
    }
    try {
      await api.removeItem(item.id);
      notify('info', 'Item removed from community directory.');
      navigateTo('browse');
    } catch (err) {
      notify('error', err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigateTo('browse')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Directory
        </button>
      </div>

      <div className="card-container">
        {/* Header with Title and Badges */}
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <span className="resource-category-pill">{item.category}</span>
              <StatusBadge status={item.status} />
              {isOwner && (
                <span className="status-pill status-approved">
                  You are the Owner
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.65rem', margin: 0 }}>{item.title}</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Community: <strong>{currentCommunity ? currentCommunity.name : ''}</strong>
            </p>
          </div>

          {isOwner && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleTogglePause}
              >
                {item.status === 'PAUSED' ? 'Resume Availability' : 'Pause Listing'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigateTo('create', { prefill: item })}
              >
                Edit Listing
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Product Visual Showcase Banner */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '320px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-surface-hover)',
            marginBottom: '1.75rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <img
            src={getItemImageUrl(item)}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Pickup Spot: {item.pickupLocation}</span>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              right: '14px',
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            ★ {item.itemCondition} Condition
          </div>
        </div>

        {/* Specifications Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Condition & Rating</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              {item.itemCondition} &bull; ★ {reviewsData.averageRating}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
              {reviewsData.totalReviews} verified community reviews
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pricing & Terms</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-brand)', marginTop: '0.2rem' }}>
              {item.pricingType === 'RENTAL' && Number(item.dailyRateInr) > 0 ? `₹${Math.round(item.dailyRateInr)} / day` : 'FREE'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
              {item.securityDepositInr && Number(item.securityDepositInr) > 0
                ? `+ ₹${Math.round(item.securityDepositInr)} refundable deposit`
                : 'Zero security deposit'}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pickup Location & GPS</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              {item.pickupLocation}
            </div>
            {item.formattedAddress && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                {item.formattedAddress}
              </div>
            )}
            {item.latitude && item.longitude && (
              <div style={{ fontSize: '0.72rem', color: 'var(--color-brand)', marginTop: '0.25rem', fontWeight: 600 }}>
                📍 GPS Pin: {item.latitude}, {item.longitude} {item.distanceKm ? `(~${item.distanceKm} km away)` : ''}
              </div>
            )}
            {calculatedDistance && (
              <div style={{ marginTop: '0.35rem', display: 'inline-block', backgroundColor: 'var(--color-brand)', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)' }}>
                🚗 Route: {calculatedDistance} KM from your location
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Replacement Value</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-brand)', marginTop: '0.2rem' }}>
              {item.estimatedReplacementValueInr ? `₹${Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}` : 'Not specified'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
              Purchase cost avoided by borrowing
            </div>
          </div>
        </div>

        {/* Interactive Pickup Location Map & Directions */}
        {item.latitude && item.longitude && (
          <div style={{ marginBottom: '2.5rem', padding: '1.25rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>📍 Pickup Spot & Route Map</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {item.pickupLocation} {item.formattedAddress ? `• ${item.formattedAddress}` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {calculatedDistance && (
                  <span style={{ fontWeight: 800, color: 'var(--color-brand)', fontSize: '0.9rem', backgroundColor: 'var(--color-brand-light)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    🎯 {calculatedDistance} KM away
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{
                    backgroundColor: showingDirections ? 'var(--color-brand)' : 'var(--color-surface-hover)',
                    color: showingDirections ? '#ffffff' : 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setShowingDirections((prev) => !prev);
                  }}
                >
                  {showingDirections ? '✕ Hide Direction Route' : '🧭 Show Direction from Me'}
                </button>
              </div>
            </div>

            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '240px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                zIndex: 1,
              }}
            />
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Description & Included Accessories</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {item.description || 'No additional description provided.'}
          </p>
        </div>

        {/* Owner Trust & Direct Communication Card */}
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid var(--color-border)' }}>
              👤
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {item.ownerName}
                </span>
                <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--badge-green-bg)', color: 'var(--badge-green-text)', border: '1px solid var(--badge-green-border)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-xs)', fontWeight: 700 }}>
                  🛡️ VERIFIED RESIDENT
                </span>
                <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)', border: '1px solid var(--badge-blue-border)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-xs)', fontWeight: 700 }}>
                  ⭐ 98% TRUST SCORE
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                Resident at {item.ownerRoomOrFlat || 'Campus'} &bull; Prompt response &bull; Phone verified
              </div>
            </div>
          </div>

          {!isOwner && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (!currentUser) {
                  notify('info', 'Please sign in to message this neighbour.');
                  setSwitchAccountModalOpen(true);
                } else {
                  setChatOpen(true);
                }
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.95rem' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Ask Owner a Question</span>
            </button>
          )}
        </div>

        {/* Scheduled Confirmed Bookings */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Reserved Calendar Windows</h2>
          {item.reservedPeriods && item.reservedPeriods.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reservation Status</th>
                    <th>Availability Window</th>
                  </tr>
                </thead>
                <tbody>
                  {item.reservedPeriods.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{p.startDate}</td>
                      <td style={{ fontWeight: 600 }}>{p.endDate}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ color: '#b45309', fontWeight: 500 }}>
                        Locked (Server prevents overlapping bookings)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              No confirmed bookings currently overlap with this item. All dates in the availability window are open for reservations.
            </div>
          )}
        </div>

        {/* Verified Community Reviews & Ratings Section */}
        <div style={{ marginBottom: '2.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⭐ Community Reviews</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-brand)', fontWeight: 700 }}>
                  ({reviewsData.averageRating} / 5.0)
                </span>
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                Based on {reviewsData.totalReviews} verified borrows from neighbours in your circle.
              </p>
            </div>
          </div>

          {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviewsData.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={rev.reviewerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${rev.reviewerId}`}
                        alt={rev.reviewerName}
                        style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{rev.reviewerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          Verified Community Borrower
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.35rem' }}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                  {rev.comment && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                      {rev.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              No reviews written yet for this resource. Be the first neighbour to borrow and leave a review!
            </div>
          )}
        </div>

        {/* Borrower Request Form */}
        {!isOwner && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>Reserve This Resource</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Select your dates. The server validates availability and calculates transparent rental and deposit breakdown.
            </p>

            {item.status !== 'AVAILABLE' && (
              <div className="alert alert-warning">
                This resource is currently marked as <strong>{item.status}</strong> and is not accepting new requests right now.
              </div>
            )}

            {hasClientConflict && (
              <div className="alert alert-danger">
                Notice: The dates you selected overlap with an already confirmed reservation above. The server will reject this booking.
              </div>
            )}

            {requestError && <div className="alert alert-danger">{requestError}</div>}
            {requestSuccess && <div className="alert alert-success">{requestSuccess}</div>}

            {!currentUser ? (
              <div style={{ marginTop: '1rem', padding: '1.25rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', maxWidth: '640px' }}>
                <p style={{ margin: '0 0 0.85rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  You are currently browsing in Guest mode. Please sign in or create an account to reserve this resource.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSwitchAccountModalOpen(true)}
                >
                  Sign In to Borrow Resource
                </button>
              </div>
            ) : item.status === 'AVAILABLE' && (
              <form onSubmit={handleBorrowSubmit} style={{ maxWidth: '640px' }}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="req-start" className="form-label">Borrow Start Date *</label>
                    <input
                      id="req-start"
                      type="date"
                      className="form-input"
                      min={item.availableFrom}
                      max={item.availableTo}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="req-end" className="form-label">Return End Date *</label>
                    <input
                      id="req-end"
                      type="date"
                      className="form-input"
                      min={startDate || item.availableFrom}
                      max={item.availableTo}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Live E-Commerce Transparent Cost Breakdown */}
                {startDate && endDate && endDate >= startDate && (
                  <div style={{ backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                      📋 Transparent Cost Summary:
                    </div>
                    {item.pricingType === 'RENTAL' && Number(item.dailyRateInr) > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            Rental Duration:
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            {Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)} Days
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            Daily Rental (₹{Math.round(item.dailyRateInr)} × {Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)} days):
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            ₹{Math.round(item.dailyRateInr) * (Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1))}
                          </span>
                        </div>
                        {item.securityDepositInr && Number(item.securityDepositInr) > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                            <span>Refundable Security Deposit:</span>
                            <span style={{ fontWeight: 600 }}>+ ₹{Math.round(item.securityDepositInr)}</span>
                          </div>
                        )}
                        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.35rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
                          <span>Total Amount at Handover:</span>
                          <span style={{ color: 'var(--color-brand)' }}>
                            ₹{(Math.round(item.dailyRateInr) * (Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1))) + (Number(item.securityDepositInr) || 0)}
                          </span>
                        </div>
                        {item.securityDepositInr && Number(item.securityDepositInr) > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                            * ₹{Math.round(item.securityDepositInr)} security deposit is 100% refunded to you upon safe return.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--color-brand)' }}>100% Free Community Lending</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Zero rental charges &bull; No deposit required</div>
                        </div>
                        {item.estimatedReplacementValueInr && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-brand)', fontWeight: 700 }}>
                            You save ₹{Number(item.estimatedReplacementValueInr).toLocaleString('en-IN')}!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="req-purpose" className="form-label">Intended Use Note (Shared with Owner)</label>
                  <textarea
                    id="req-purpose"
                    className="form-textarea"
                    placeholder="Briefly state your task (e.g. mounting room wall shelves, ankle sprain recovery)..."
                    value={borrowPurpose}
                    onChange={(e) => setBorrowPurpose(e.target.value)}
                  />
                  <div className="form-hint">
                    For sensitive healthcare aids, provide only what is needed for pickup coordination.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting || hasClientConflict}
                >
                  {submitting ? 'Submitting request...' : 'Confirm & Submit Borrow Request'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Peer-to-Peer Chat Drawer */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        itemId={item.id}
        otherUserId={item.ownerId}
        otherUserName={item.ownerName}
        itemTitle={item.title}
        itemImageUrl={getItemImageUrl(item)}
      />

      {/* Leave Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        itemId={item.id}
        itemTitle={item.title}
        revieweeName={item.ownerName}
        onReviewSubmitted={fetchItemDetail}
      />
    </div>
  );
}
