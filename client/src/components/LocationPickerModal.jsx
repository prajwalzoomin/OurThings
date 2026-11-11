import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function LocationPickerModal({ initialLocation, onConfirm, onClose }) {
  const { userLocation } = useApp();

  const startLat = initialLocation?.latitude || userLocation?.latitude || 12.9345;
  const startLng = initialLocation?.longitude || userLocation?.longitude || 77.6912;

  const [lat, setLat] = useState(startLat);
  const [lng, setLng] = useState(startLng);
  const [premise, setPremise] = useState(initialLocation?.premise || '');
  const [building, setBuilding] = useState(initialLocation?.building || '');
  const [landmark, setLandmark] = useState(initialLocation?.landmark || '');
  const [locality, setLocality] = useState(initialLocation?.locality || userLocation?.locality?.split(',')[0] || 'Bengaluru');
  const [city, setCity] = useState(initialLocation?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(initialLocation?.pincode || '560103');
  const [formattedAddress, setFormattedAddress] = useState(initialLocation?.formattedAddress || '');

  // Place search inside modal
  const [searchPlaceQuery, setSearchPlaceQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingPlace, setSearchingPlace] = useState(false);

  const [locating, setLocating] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Load Leaflet dynamically
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

  // Live reverse geocoding via server endpoint (no CORS blocks, accurate data)
  const updateCoordinates = async (newLat, newLng) => {
    const fixedLat = Number(newLat.toFixed(5));
    const fixedLng = Number(newLng.toFixed(5));
    setLat(fixedLat);
    setLng(fixedLng);

    try {
      const geo = await api.reverseGeocode(fixedLat, fixedLng);
      if (geo) {
        if (geo.locality) setLocality(geo.locality);
        if (geo.city) setCity(geo.city);
        if (geo.pincode) setPincode(geo.pincode);
        if (geo.street && !landmark) {
          setLandmark(geo.street);
        }
        if (geo.formattedAddress) {
          setFormattedAddress(geo.formattedAddress);
        }
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
  };

  // High-accuracy live GPS location from device
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const cLat = Number(pos.coords.latitude.toFixed(5));
        const cLng = Number(pos.coords.longitude.toFixed(5));
        setLat(cLat);
        setLng(cLng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([cLat, cLng], 16);
          markerRef.current.setLatLng([cLat, cLng]);
        }
        await updateCoordinates(cLat, cLng);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocating(false);
        alert('Could not retrieve precise location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Search places / localities to move the map
  const handleSearchPlace = async (e) => {
    if (e) e.preventDefault();
    if (!searchPlaceQuery.trim()) return;

    setSearchingPlace(true);
    try {
      const results = await api.searchLocation(searchPlaceQuery.trim());
      setSearchResults(results || []);
      if (results && results.length > 0) {
        selectSearchResult(results[0]);
      }
    } catch (err) {
      console.error('Place search error:', err);
    } finally {
      setSearchingPlace(false);
    }
  };

  const selectSearchResult = (item) => {
    const sLat = Number(item.latitude.toFixed(5));
    const sLng = Number(item.longitude.toFixed(5));
    setLat(sLat);
    setLng(sLng);
    if (item.locality) setLocality(item.locality);
    if (item.city) setCity(item.city);
    if (item.pincode) setPincode(item.pincode);
    if (item.displayName) setFormattedAddress(item.displayName);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([sLat, sLng], 16);
      markerRef.current.setLatLng([sLat, sLng]);
    }
  };

  // Format textual address fields without touching pinned coordinates
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
      }
    } catch (err) {
      console.error('Address format error:', err);
    } finally {
      setAiParsing(false);
    }
  };

  const handleConfirm = () => {
    const finalFormatted =
      formattedAddress ||
      `${premise ? `${premise}, ` : ''}${building ? `${building}, ` : ''}${landmark ? `${landmark}, ` : ''}${locality}, ${city} ${pincode}`.trim();

    const pickupSummary = [premise, building, locality].filter(Boolean).join(', ') || locality;

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
      pickupLocation: pickupSummary + (landmark ? ` (Near: ${landmark})` : ''),
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
              <span>Accurate Pickup Location & Pin</span>
            </h2>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Pinpoint your exact item handover location using live GPS or by searching any area.
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
          {/* Search place on map */}
          <form onSubmit={handleSearchPlace} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
              placeholder="Search any colony, street, or landmark (e.g. HSR Layout, Indiranagar, Electronic City)..."
              value={searchPlaceQuery}
              onChange={(e) => setSearchPlaceQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-secondary btn-sm"
              disabled={searchingPlace}
              style={{ whiteSpace: 'nowrap' }}
            >
              {searchingPlace ? 'Searching...' : '🔍 Find Area'}
            </button>
          </form>

          {/* Quick Place Search Result Chips */}
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '0.75rem', paddingBottom: '0.2rem' }}>
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(res)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>📍</span>
                  <span>{res.locality || res.displayName.split(',')[0]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Top GPS Action Bar */}
          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>{locating ? '⏳ Locating precisely...' : '📍 Use Device GPS Location'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAiRefineAddress}
              disabled={aiParsing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>{aiParsing ? 'Formatting...' : 'Auto-Format Text Fields'}</span>
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
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                color: '#ffffff',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              📍 {lat.toFixed(4)}, {lng.toFixed(4)} ({locality}) • Click or drag pin to adjust
            </div>
          </div>

          {/* Structured Indian Address Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Flat / Room / House No
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                placeholder="e.g. Room 304, Flat 402, House 12"
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Building / Society / Hostel Wing
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                placeholder="e.g. Block A, Green Glen Heights, Sunshine Enclave"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              Identifiable Landmark (Helpful for handover pickup)
            </label>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
              placeholder="e.g. Near Community Library, Opposite Main Gate"
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
                placeholder="e.g. Indiranagar, HSR Layout, Marathahalli"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                required
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
                required
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
            Pinned: <strong>{lat.toFixed(4)}, {lng.toFixed(4)}</strong> ({locality})
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirm}>
              ✓ Confirm Pinned Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
