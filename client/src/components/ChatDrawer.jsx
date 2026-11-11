import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { getItemImageUrl } from '../utils/itemImages';

export default function ChatDrawer({ isOpen, onClose, itemId, otherUserId, otherUserName, otherUserAvatar, itemTitle, itemImageUrl }) {
  const { currentUser, notify } = useApp();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const QUICK_QUESTIONS = [
    'Is this available this weekend?',
    'Can I pick this up tomorrow morning?',
    'Are all cords and bits included?',
    'Where is the best pickup spot?',
  ];

  const fetchThread = async () => {
    if (!itemId || !otherUserId || !currentUser) return;
    try {
      const data = await api.getChatThread(itemId, otherUserId);
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load chat thread:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchThread();
      const interval = setInterval(fetchThread, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, itemId, otherUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !currentUser) return;

    try {
      setSending(true);
      const sent = await api.sendChatMessage({
        itemId,
        recipientId: otherUserId,
        messageText: text,
      });
      setMessages((prev) => [...prev, sent]);
      setInputText('');
    } catch (err) {
      notify('error', err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

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
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInRight 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <img
              src={otherUserAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${otherUserId}`}
              alt={otherUserName}
              style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {otherUserName || 'Neighbour'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-brand)', fontWeight: 600 }}>
                ● Active on Community Circle
              </div>
            </div>
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

        {/* Item Context Banner */}
        {itemTitle && (
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--color-surface-subtle)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {itemImageUrl && (
              <img
                src={itemImageUrl}
                alt={itemTitle}
                style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Inquiring About
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {itemTitle}
              </div>
            </div>
          </div>
        )}

        {/* Message Log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem', fontSize: '0.85rem' }}>
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '2rem', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>No messages yet</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Ask the owner about availability, pickup spot, or included accessories.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = currentUser && m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor: isMine ? 'var(--color-brand)' : 'var(--color-surface-hover)',
                      color: isMine ? '#ffffff' : 'var(--color-text-primary)',
                      border: isMine ? 'none' : '1px solid var(--color-border)',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {m.messageText}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', padding: '0 0.25rem' }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length < 3 && (
          <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderTop: '1px solid var(--color-border)' }}>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Type a message to neighbour..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            style={{ fontSize: '0.875rem', padding: '0.55rem 0.85rem' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending || !inputText.trim()}
            style={{ padding: '0.55rem 1rem', flexShrink: 0 }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
