import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export default function LocationPickerModal({ initialLocation, onConfirm, onClose }) {
  const [lat, setLat] = useState(initialLocation?.latitude || 12.9345);
  const [lng, setLng] = useState(initialLocation?.longitude || 77.6912);
  const [premise, setPremise] = useState(initialLocation?.premise || '');
  const [building, setBuilding] = useState(initialLocation?.building || '');
  const [landmark, setLandmark] = useState(initialLocation?.landmark || '');
  const [locality, setLocality] = useState(initialLocation?.locality || 'Marathahalli');
  const [city, setCity] = useState(initialLocation?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(initialLocation?.pincode || '560103');
  const [formattedAddress, setFormattedAddress] = useState(initialLocation?.formattedAddress || '');

  const [locating, setLocating] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Load Leaflet dynamically if not already on window
  useEffect(() => {
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
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (!window.L || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      updateCoordinates(newPos.lat, newPos.lng);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      updateCoordinates(e.latlng.lat, e.latlng.lng);
    });

    setMapLoaded(true);
  };

  const updateCoordinates = (newLat, newLng) => {
    const fixedLat = Number(newLat.toFixed(5));
    const fixedLng = Number(newLng.toFixed(5));
    setLat(fixedLat);
    setLng(fixedLng);

    // Reverse geocode via OpenStreetMap Nominatim
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${fixedLat}&lon=${fixedLng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.street || '';
          const sub = addr.suburb || addr.neighbourhood || addr.residential || locality;
          const pin = addr.postcode || pincode;
          const c = addr.city || addr.town || 'Bengaluru';

          setLocality(sub);
          setCity(c);
          setPincode(pin);
          if (data.display_name) {
            setFormattedAddress(data.display_name);
          }
        }
      })
      .catch(() => {});
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cLat = Number(pos.coords.latitude.toFixed(5));
        const cLng = Number(pos.coords.longitude.toFixed(5));
        setLat(cLat);
        setLng(cLng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([cLat, cLng], 16);
          markerRef.current.setLatLng([cLat, cLng]);
        }
        updateCoordinates(cLat, cLng);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        // Fallback to Bangalore center
        updateCoordinates(12.9345, 77.6912);
      },
      { timeout: 8000 }
    );
  };

  const handleAiRefineAddress = async () => {
    setAiParsing(true);
    try {
      const combined = `${premise} ${building} ${landmark} ${locality} ${city} ${pincode}`.trim() || formattedAddress;
      const res = await api.parseAddress(combined);
      if (res) {
        if (res.premise) setPremise(res.premise);
        if (res.building) setBuilding(res.building);
        if (res.landmark) setLandmark(res.landmark);
        if (res.locality) setLocality(res.locality);
        if (res.city) setCity(res.city);
        if (res.pincode) setPincode(res.pincode);
        if (res.formattedAddress) setFormattedAddress(res.formattedAddress);
        if (res.latitude && res.longitude) {
          setLat(res.latitude);
          setLng(res.longitude);
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([res.latitude, res.longitude], 16);
            markerRef.current.setLatLng([res.latitude, res.longitude]);
          }
        }
      }
    } catch (err) {
      console.error('AI address refine error:', err);
    } finally {
      setAiParsing(false);
    }
  };

  const handleConfirm = () => {
    const finalFormatted =
      formattedAddress ||
      `${premise ? `${premise}, ` : ''}${building ? `${building}, ` : ''}${landmark ? `${landmark}, ` : ''}${locality}, ${city} ${pincode}`.trim();

    onConfirm({
      latitude: lat,
      longitude: lng,
      premise,
      building,
      landmark,
      locality,
      city,
      pincode,
      state: 'Karnataka',
      formattedAddress: finalFormatted,
      pickupLocation: `${premise || building || locality}${landmark ? ` (Ref: ${landmark})` : ''}`,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '780px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📍</span>
              <span>Pickup Location & Map Pin</span>
            </h2>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Pinpoint the pickup spot so borrowers in your community can easily collect this item.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.4rem',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {/* Top GPS & AI Action Bar */}
          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>{locating ? '⏳ Locating...' : '📍 Use Current GPS Location'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAiRefineAddress}
              disabled={aiParsing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>{aiParsing ? '✨ Refining...' : '✨ Gemini AI Standardize Address'}</span>
            </button>
          </div>

          {/* Interactive Map Container */}
          <div
            style={{
              height: '240px',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              marginBottom: '1rem',
              position: 'relative',
              backgroundColor: '#e2e8f0',
            }}
          >
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                zIndex: 1000,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              Lat: {lat}, Lng: {lng} • Click or drag pin to adjust
            </div>
          </div>

          {/* Structured Indian Address Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Flat / Room / House No *
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                placeholder="e.g. Room 304, 3rd Floor or Flat 402"
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Building / Hostel Wing / Complex
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                placeholder="e.g. Cauvery Boys Hostel, Block A"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              Identifiable Landmark (Crucial for Indian pickup) *
            </label>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
              placeholder="e.g. Near NHCE Central Library, Opposite Basketball Court Gate"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Area / Locality *
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                placeholder="e.g. Marathahalli / Bellandur"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                City
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                PIN Code *
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                placeholder="560103"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Coordinates: <strong>{lat}, {lng}</strong> ({locality})
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirm}>
              ✓ Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
