import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

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
      availableFrom,
      availableTo,
      estimatedReplacementValueInr: estimatedReplacementValueInr ? Number(estimatedReplacementValueInr) : null,
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
    <div className="panel" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">
            {isEditMode ? `Edit Resource: ${prefillItem.title}` : 'Share a Resource with Your Community'}
          </h1>
          <p className="panel-description">
            Listing in: <strong>{currentCommunity ? currentCommunity.name : ''}</strong> | Listed by: <strong>{currentUser ? currentUser.name : ''}</strong>
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigateTo('browse')}
        >
          Cancel
        </button>
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
          <label htmlFor="item-description" className="form-label">Detailed Description & Included Accessories</label>
          <textarea
            id="item-description"
            className="form-textarea"
            placeholder="Describe functionality, specifications, included cables, bits, attachments, and operating precautions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="item-location" className="form-label">Pickup & Handover Location *</label>
          <input
            id="item-location"
            type="text"
            className="form-input"
            placeholder="e.g. Room 304 Block A, Flat 402 Block B, Gate 1 Security Desk"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />
          <div className="form-hint">
            Specify room number or convenient on-premises handover spot within your hostel, apartment, or neighbourhood.
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
          <label htmlFor="item-rep-val" className="form-label">Optional Estimated Replacement Value (INR)</label>
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
            Optional. If provided, this value is aggregated into community Avoided Expenditure metrics when items are borrowed rather than bought. No money is charged or collected.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving listing...' : isEditMode ? 'Update Listing' : 'Publish Resource Listing'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigateTo('browse')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
