import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import LocationPickerModal from '../components/LocationPickerModal';

const CATEGORIES = [
  'Healthcare & Mobility',
  'Tools & Hardware',
  'Electronics',
  'Event Equipment',
  'Travel Gear',
];

const CONDITIONS = ['Like New', 'Good', 'Fair'];

const PRESET_PRODUCT_PHOTOS = [
  { name: 'Impact Drill Kit', icon: '🔌', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Underarm Crutches', icon: '🩼', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80' },
  { name: 'Folding Wheelchair', icon: '♿', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Full HD Projector', icon: '📽️', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Portable PA Speaker', icon: '🔊', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80' },
  { name: '65L Trekking Rucksack', icon: '🎒', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { name: 'Folding Ladder', icon: '🪜', url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80' },
  { name: 'Digital BP Monitor', icon: '🩺', url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSLR Camera & Kit', icon: '📷', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { name: 'Camping Tent', icon: '⛺', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mechanic Toolkit', icon: '🔧', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80' },
];

export default function CreateEditItem() {
  const { currentCommunity, currentUser, prefillItem, navigateTo, notify } = useApp();

  const isEditMode = Boolean(prefillItem && prefillItem.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [itemCondition, setItemCondition] = useState('Good');
  const [pickupLocation, setPickupLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [premise, setPremise] = useState('');
  const [building, setBuilding] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locality, setLocality] = useState('Marathahalli');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560103');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [aiFormatting, setAiFormatting] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef(null);

  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [estimatedReplacementValueInr, setEstimatedReplacementValueInr] = useState('');
  const [pricingType, setPricingType] = useState('FREE'); // 'FREE' | 'RENTAL'
  const [dailyRateInr, setDailyRateInr] = useState('');
  const [securityDepositInr, setSecurityDepositInr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const compressAndReadImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('error', 'Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    try {
      setUploadingImage(true);
      const base64 = await compressAndReadImage(file);
      setImageUrl(base64);
      notify('success', 'Product photo attached successfully!');
    } catch (err) {
      console.error('Image upload processing failed:', err);
      notify('error', 'Failed to process image file.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (prefillItem) {
      setTitle(prefillItem.title || prefillItem.itemName || '');
      setDescription(prefillItem.description || '');
      if (prefillItem.category && CATEGORIES.includes(prefillItem.category)) {
        setCategory(prefillItem.category);
      }
      setItemCondition(prefillItem.itemCondition || 'Good');
      setPickupLocation(prefillItem.pickupLocation || (currentUser && currentUser.roomOrFlat ? currentUser.roomOrFlat : ''));
      setLatitude(prefillItem.latitude || null);
      setLongitude(prefillItem.longitude || null);
      setFormattedAddress(prefillItem.formattedAddress || '');
      setPremise(prefillItem.premise || '');
      setBuilding(prefillItem.building || '');
      setLandmark(prefillItem.landmark || '');
      setLocality(prefillItem.locality || 'Marathahalli');
      setCity(prefillItem.city || 'Bengaluru');
      setPincode(prefillItem.pincode || '560103');
      setImageUrl(prefillItem.imageUrl || '');
      setAvailableFrom(prefillItem.availableFrom || prefillItem.neededFrom || new Date().toISOString().slice(0, 10));
      setAvailableTo(prefillItem.availableTo || prefillItem.neededTo || '');
      if (prefillItem.estimatedReplacementValueInr) {
        setEstimatedReplacementValueInr(String(prefillItem.estimatedReplacementValueInr));
      }
      setPricingType(prefillItem.pricingType || 'FREE');
      setDailyRateInr(prefillItem.dailyRateInr ? String(prefillItem.dailyRateInr) : '');
      setSecurityDepositInr(prefillItem.securityDepositInr ? String(prefillItem.securityDepositInr) : '');
    } else {
      const todayStr = new Date().toISOString().slice(0, 10);
      setAvailableFrom(todayStr);
      if (currentUser && currentUser.roomOrFlat) {
        setPickupLocation(currentUser.roomOrFlat);
      }
    }
  }, [prefillItem, currentUser]);

  const handleLocationConfirm = (locData) => {
    setLatitude(locData.latitude);
    setLongitude(locData.longitude);
    setPremise(locData.premise);
    setBuilding(locData.building);
    setLandmark(locData.landmark);
    setLocality(locData.locality);
    setCity(locData.city);
    setPincode(locData.pincode);
    setFormattedAddress(locData.formattedAddress);
    setPickupLocation(locData.pickupLocation);
    notify('success', `Location pinned: ${locData.locality} (${locData.latitude}, ${locData.longitude})`);
  };

  const handleAiFormatAddress = async () => {
    if (!pickupLocation.trim()) {
      notify('error', 'Please enter a location or room number first.');
      return;
    }
    setAiFormatting(true);
    try {
      const parsed = await api.parseAddress(pickupLocation);
      if (parsed) {
        if (parsed.premise) setPremise(parsed.premise);
        if (parsed.building) setBuilding(parsed.building);
        if (parsed.landmark) setLandmark(parsed.landmark);
        if (parsed.locality) setLocality(parsed.locality);
        if (parsed.city) setCity(parsed.city);
        if (parsed.pincode) setPincode(parsed.pincode);
        if (parsed.formattedAddress) setFormattedAddress(parsed.formattedAddress);
        if (parsed.latitude && parsed.longitude) {
          // Preserve precise GPS / Map pin if already chosen
          if (!latitude || !longitude) {
            setLatitude(parsed.latitude);
            setLongitude(parsed.longitude);
          }
        }
        const locationSummary = [parsed.premise, parsed.building, parsed.locality].filter(Boolean).join(', ');
        setPickupLocation(locationSummary || parsed.locality || pickupLocation);
        notify('success', 'Address formatted to standard postal structure.');
      }
    } catch (err) {
      notify('error', err.message || 'Address formatting failed.');
    } finally {
      setAiFormatting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('Please sign in or create an account before listing an item.');
      return;
    }

    if (!title.trim()) {
      setError('Resource title is required.');
      return;
    }
    if (!pickupLocation.trim()) {
      setError('Pickup location is required for community members.');
      return;
    }
    if (!availableFrom || !availableTo) {
      setError('Both availability start and end dates are required.');
      return;
    }
    if (availableTo < availableFrom) {
      setError('Availability end date cannot precede start date.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      itemCondition,
      pickupLocation: pickupLocation.trim(),
      latitude,
      longitude,
      formattedAddress,
      premise,
      building,
      landmark,
      locality,
      city,
      pincode,
      state: 'Karnataka',
      availableFrom,
      availableTo,
      estimatedReplacementValueInr: estimatedReplacementValueInr ? Number(estimatedReplacementValueInr) : null,
      pricingType,
      dailyRateInr: pricingType === 'RENTAL' && dailyRateInr ? Number(dailyRateInr) : 0,
      securityDepositInr: pricingType === 'RENTAL' && securityDepositInr ? Number(securityDepositInr) : 0,
      imageUrl: imageUrl.trim() || null,
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await api.updateItem(prefillItem.id, payload);
        notify('success', 'Resource listing updated successfully.');
        navigateTo('detail', { itemId: prefillItem.id });
      } else {
        const created = await api.createItem(payload);
        notify('success', 'Resource listed in community directory.');
        navigateTo('detail', { itemId: created.id });
      }
    } catch (err) {
      setError(err.message || 'Failed to save resource listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          Back to Listings
        </button>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div>
            <h1 style={{ fontSize: '1.6rem', margin: 0 }}>
              {isEditMode ? `Edit Resource: ${prefillItem.title}` : 'Share a Resource with Neighbours'}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Listing in <strong>{currentCommunity ? currentCommunity.name : ''}</strong> as <strong>{currentUser ? currentUser.name : ''}</strong>
            </p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item-title" className="form-label">Resource Title *</label>
            <input
              id="item-title"
              type="text"
              className="form-input"
              placeholder="e.g. Bosch 13mm Impact Drill, Adult Folding Crutches, Epson HD Projector"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="item-category" className="form-label">Category *</label>
              <select
                id="item-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="item-condition" className="form-label">Observed Condition *</label>
              <select
                id="item-condition"
                className="form-select"
                value={itemCondition}
                onChange={(e) => setItemCondition(e.target.value)}
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="item-description" className="form-label">Description & Included Accessories</label>
            <textarea
              id="item-description"
              className="form-textarea"
              placeholder="Describe operating condition, included accessories, chuck keys, bits, cords, or usage instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label htmlFor="item-location" className="form-label" style={{ margin: 0 }}>
                Pickup & Handover Location *
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setLocationModalOpen(true)}
                  title="Open Interactive Map to drop pin or use GPS"
                >
                  📍 Pick on Map / GPS
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  onClick={handleAiFormatAddress}
                  disabled={aiFormatting}
                  title="Automatically parse and format into standard postal address"
                >
                  {aiFormatting ? 'Formatting...' : 'Auto-Format Address'}
                </button>
              </div>
            </div>

            <input
              id="item-location"
              type="text"
              className="form-input"
              placeholder="e.g. Room 304 Block A, Flat 402 Block B, Kaikondrahalli Gate 1"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />

            {latitude && longitude && (
              <div
                style={{
                  marginTop: '0.45rem',
                  padding: '0.35rem 0.65rem',
                  backgroundColor: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span style={{ color: 'var(--color-brand)', fontWeight: 700 }}>✓ Pinned Location:</span>
                <span>
                  {locality || city} ({latitude}, {longitude}) {landmark ? `• Ref: ${landmark}` : ''}
                </span>
              </div>
            )}

            <div className="form-hint">
              Exact pickup location within your community or Bengaluru locality with GPS pin & landmark guidance for borrowers.
            </div>
          </div>

          {/* E-Commerce Product Photo Uploader & Selection */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>
                📸 Product Photo
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Remove Photo
                </button>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />

            {imageUrl ? (
              /* Photo Preview Card */
              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '120px',
                    height: '100px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-surface-hover)',
                    flexShrink: 0,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--badge-green-bg)',
                        color: 'var(--badge-green-text)',
                        border: '1px solid var(--badge-green-border)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      ✓ Photo Attached
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {imageUrl.startsWith('data:') ? 'Uploaded from device' : 'Web / Preset image'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.65rem 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    Neighbours and borrowers will see this photo on cards, search results, and glance views.
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Processing...' : 'Upload Different Photo'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowUrlField((prev) => !prev)}
                    >
                      {showUrlField ? 'Hide URL' : 'Edit URL'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State: Upload / Choose Preset / Enter URL */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Upload from Device Dropzone */}
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-surface-subtle)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-brand)';
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>📷</div>
                  <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--color-text-primary)' }}>
                    {uploadingImage ? 'Compressing and processing photo...' : 'Click to Upload Product Photo from Device'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Supports camera capture, JPEG, PNG, WebP &bull; Instant auto-compression
                  </div>
                </div>

                {/* Quick Stock Photos */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                    Or select a verified product stock photo:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {PRESET_PRODUCT_PHOTOS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.url);
                          notify('success', `Applied photo: ${preset.name}`);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-brand)';
                          e.currentTarget.style.color = 'var(--color-brand)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                      >
                        <span>{preset.icon}</span>
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link URL fallback toggle */}
                <div style={{ marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowUrlField((prev) => !prev)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-brand)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    {showUrlField ? '– Hide image URL input' : '+ Or paste direct web image link'}
                  </button>
                </div>
              </div>
            )}

            {/* Direct Image URL input (visible when toggled or if user wants to type url) */}
            {showUrlField && (
              <div style={{ marginTop: '0.75rem' }}>
                <input
                  id="item-image-url"
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/... or https://..."
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <div className="form-hint" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Paste any valid image URL. If left empty, a matching photo is automatically chosen.
                </div>
              </div>
            )}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="item-avail-from" className="form-label">Available From *</label>
              <input
                id="item-avail-from"
                type="date"
                className="form-input"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-avail-to" className="form-label">Available Until *</label>
              <input
                id="item-avail-to"
                type="date"
                className="form-input"
                value={availableTo}
                onChange={(e) => setAvailableTo(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="item-rep-val" className="form-label">Estimated Replacement Purchase Value in INR (Optional)</label>
            <input
              id="item-rep-val"
              type="number"
              min="0"
              step="1"
              className="form-input"
              placeholder="e.g. 3500 (approximate retail purchase cost)"
              value={estimatedReplacementValueInr}
              onChange={(e) => setEstimatedReplacementValueInr(e.target.value)}
            />
            <div className="form-hint">
              Optional estimate used solely to calculate community Avoided Expenditure metrics when items are borrowed rather than bought.
            </div>
          </div>

          {/* Flexible Economic Terms: Free vs Nominal Rent + Security Deposit */}
          <div className="form-group" style={{ backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💰</span>
              <span>Lending Terms & Compensation</span>
            </label>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem 0' }}>
              Decide whether to share for free as goodwill, or charge a nominal daily rent to cover wear-and-tear.
            </p>

            {/* Pricing Mode Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                onClick={() => setPricingType('FREE')}
                style={{
                  border: pricingType === 'FREE' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                  backgroundColor: pricingType === 'FREE' ? 'var(--color-brand-light)' : 'var(--color-surface)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🤝</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: pricingType === 'FREE' ? 'var(--color-brand)' : 'var(--color-text-primary)' }}>
                    Share for Free (₹0)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  100% free community sharing. Recommended for medical recovery aids, books, and basic household cables.
                </div>
              </div>

              <div
                onClick={() => setPricingType('RENTAL')}
                style={{
                  border: pricingType === 'RENTAL' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                  backgroundColor: pricingType === 'RENTAL' ? 'var(--color-brand-light)' : 'var(--color-surface)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>💵</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: pricingType === 'RENTAL' ? 'var(--color-brand)' : 'var(--color-text-primary)' }}>
                    Charge Nominal Daily Rent
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  Earn back your equipment cost. Recommended for power tools, projectors, camping gear, and cameras.
                </div>
              </div>
            </div>

            {/* Rental Rates Details */}
            {pricingType === 'RENTAL' && (
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div className="form-grid-2" style={{ gap: '1rem', margin: 0 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                      Daily Rental Rate (₹ / Day) *
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      className="form-input"
                      placeholder="e.g. 150"
                      value={dailyRateInr}
                      onChange={(e) => setDailyRateInr(e.target.value)}
                      required={pricingType === 'RENTAL'}
                    />
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                      {['50', '100', '150', '250', '500'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDailyRateInr(amt)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: dailyRateInr === amt ? 'var(--color-brand)' : 'var(--color-surface-hover)',
                            color: dailyRateInr === amt ? '#fff' : 'var(--color-text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          ₹{amt}/day
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                      Refundable Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      className="form-input"
                      placeholder="e.g. 500 (Refunded on safe return)"
                      value={securityDepositInr}
                      onChange={(e) => setSecurityDepositInr(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                      {['0', '500', '1000', '2000'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSecurityDepositInr(amt)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: securityDepositInr === amt ? 'var(--color-brand)' : 'var(--color-surface-hover)',
                            color: securityDepositInr === amt ? '#fff' : 'var(--color-text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          {amt === '0' ? 'No Deposit' : `₹${amt} Deposit`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--color-brand)', fontWeight: 700 }}>💡 Summary for Borrowers:</span>
                  <span>
                    A 3-day booking will be ₹{(Number(dailyRateInr) || 0) * 3} rent
                    {Number(securityDepositInr) > 0 ? ` + ₹${securityDepositInr} security deposit (fully refunded on return)` : ''}.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Saving listing...' : isEditMode ? 'Update Resource Listing' : 'Publish Resource Listing'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => navigateTo('browse')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {locationModalOpen && (
        <LocationPickerModal
          initialLocation={{
            latitude,
            longitude,
            premise,
            building,
            landmark,
            locality,
            city,
            pincode,
            formattedAddress,
          }}
          onConfirm={handleLocationConfirm}
          onClose={() => setLocationModalOpen(false)}
        />
      )}
    </div>
  );
}
