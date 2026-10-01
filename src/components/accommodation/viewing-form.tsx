'use client';

import { useState } from 'react';

interface ViewingFormProps {
  listingId: string;
  propertyId: string;
}

export function ViewingForm({ listingId, propertyId }: ViewingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name || !phone) {
      setError('Name and phone number are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/accommodation/viewings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: listingId,
          property_id: propertyId,
          student_name: name,
          student_phone: phone,
          preferred_date: date || null,
          preferred_time: time || null,
          message: message || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        background: 'var(--success-bg)',
        border: '1px solid color-mix(in oklab, var(--success) 25%, transparent)',
        borderRadius: 'var(--radius-md, 12px)',
        padding: 20,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 24, marginBottom: 8 }}>✓</p>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--success-text)', marginBottom: 6 }}>
          Viewing request submitted
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          Our team will contact you within 24 hours to confirm your viewing.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md, 12px)',
      padding: 20,
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display, serif)',
        fontSize: 17,
        color: 'var(--foreground)',
        marginBottom: 16,
      }}>
        Request a viewing
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>
            Your name *
          </label>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--input)',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Phone */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>
            Phone number *
          </label>
          <input
            type="tel"
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--input)',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Preferred date/time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>
              Preferred date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--input)',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>
              Preferred time
            </label>
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--input)',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                background: 'var(--card)',
              }}
            >
              <option value="">Any time</option>
              <option value="morning">Morning (8am–12pm)</option>
              <option value="afternoon">Afternoon (12pm–4pm)</option>
              <option value="evening">Evening (4pm–7pm)</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}>
            Additional message (optional)
          </label>
          <textarea
            placeholder="Any specific questions or requests…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--input)',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: 'var(--error-text)' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            opacity: loading ? 0.7 : 1,
            border: 'none',
            borderRadius: 'var(--radius-sm, 8px)',
            padding: '12px 20px',
            fontSize: 15,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            minHeight: 48,
            width: '100%',
            transition: 'background 150ms ease',
          }}
        >
          {loading ? 'Submitting…' : 'Request viewing'}
        </button>

        <p style={{ fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'center', lineHeight: 1.5 }}>
          Campus&Me will coordinate the viewing. You will be contacted to confirm.
        </p>
      </div>
    </div>
  );
}