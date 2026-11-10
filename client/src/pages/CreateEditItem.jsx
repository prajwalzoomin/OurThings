import React, { useState, useEffect } from 'react';
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
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [estimatedReplacementValueInr, setEstimatedReplacementValueInr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
          setLatitude(parsed.latitude);
          setLongitude(parsed.longitude);
        }
        setPickupLocation(`${parsed.premise || parsed.building || parsed.locality}${parsed.landmark ? ` (Ref: ${parsed.landmark})` : ''}`);
        notify('success', 'Address standardized with Gemini Pro Indian postal schema.');
      }
    } catch (err) {
      notify('error', err.message || 'AI standardization failed.');
    } finally {
      setAiFormatting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: '#8b5cf6' }}
                  onClick={handleAiFormatAddress}
                  disabled={aiFormatting}
                  title="Use Gemini Pro to parse and structure Indian address"
                >
                  {aiFormatting ? '✨ Formatting...' : '✨ Gemini Format'}
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

          <div className="form-group">
            <label htmlFor="item-image-url" className="form-label">Product Image URL (Optional)</label>
            <input
              id="item-image-url"
              type="url"
              className="form-input"
              placeholder="https://... (Optional: leave blank for smart automatic photo matching)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <div className="form-hint">
              Leave blank to automatically match a high-definition product photo based on your item title and category.
            </div>
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
              Optional estimate used solely to calculate community Avoided Expenditure metrics when items are borrowed rather than bought. No money is charged or collected.
            </div>
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
