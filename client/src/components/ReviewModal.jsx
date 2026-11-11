import React, { useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function ReviewModal({ isOpen, onClose, itemId, requestId, itemTitle, revieweeName, reviewType = 'BORROWER_TO_OWNER', onReviewSubmitted }) {
  const { notify } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const TAGS = [
    'Spotless & Clean',
    'Great Communication',
    'Punctual Handover',
    'Includes All Accessories',
    'Friendly Neighbour',
    'Smooth Return',
  ];

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const fullComment = [
        comment.trim(),
        selectedTags.length > 0 ? `Highlights: ${selectedTags.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      await api.submitReview({
        itemId,
        requestId,
        rating,
        comment: fullComment,
        reviewType,
      });

      notify('success', 'Thank you! Your verified community review has been posted.');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      notify('error', err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1300,
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
          maxWidth: '480px',
          width: '100%',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Rate Your Experience</h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
              How was your borrowing of <strong>{itemTitle}</strong> from <strong>{revieweeName}</strong>?
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
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Interactive Star Rating */}
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              SELECT RATING
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.8rem',
                      cursor: 'pointer',
                      color: active ? '#f59e0b' : 'var(--color-border)',
                      transition: 'transform 0.1s',
                      transform: active ? 'scale(1.15)' : 'scale(1)',
                      padding: '0.1rem',
                    }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.35rem' }}>
              {rating === 5 && '🌟 Exceptional / Flawless'}
              {rating === 4 && '👍 Very Good & Reliable'}
              {rating === 3 && '👌 Satisfactory / Average'}
              {rating === 2 && '👎 Had Minor Issues'}
              {rating === 1 && '⚠️ Poor Experience'}
            </div>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="form-label" style={{ fontSize: '0.825rem', marginBottom: '0.35rem' }}>
              What went well?
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-brand-light)' : 'var(--color-surface)',
                      color: isSelected ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.825rem' }}>
              Written Feedback (Optional)
            </label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Share details to help other neighbours in your community..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {submitting ? 'Submitting Review...' : 'Submit Community Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
