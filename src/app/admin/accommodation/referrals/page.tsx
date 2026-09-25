'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Referral {
  id: string;
  referrer_id: string;
  eligibility_status: string;
  payout_status: string;
  reward_amount: number | null;
  paid_at: string | null;
  admin_notes: string | null;
  created_at: string;
  referrer: { full_name: string } | null;
  unit: {
    id: string;
    unit_number: string | null;
    room_type: string;
    property: { name: string; area: string };
  } | null;
  transaction: {
    id: string;
    rent_amount: number | null;
    completed_at: string | null;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  pending:  { text: '#A07800', bg: 'rgba(232,160,32,0.08)' },
  eligible: { text: '#1A7A52', bg: 'rgba(26,122,82,0.08)' },
  paid:     { text: '#1A5C8A', bg: 'rgba(26,92,138,0.08)' },
  disputed: { text: '#C44B2A', bg: 'rgba(196,75,42,0.08)' },
  rejected: { text: '#6B7B75', bg: 'rgba(107,123,117,0.08)' },
};

const PAYOUT_COLORS: Record<string, string> = {
  unpaid:     '#A07800',
  processing: '#1A5C8A',
  paid:       '#1A7A52',
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      color: c.text,
      background: c.bg,
      borderRadius: 99,
      padding: '3px 10px',
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white',
      border: '0.5px solid #D6E5DF',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

// ─── Referral Card ────────────────────────────────────────────────────────────

function ReferralCard({
  referral,
  onUpdate,
}: {
  referral: Referral;
  onUpdate: (id: string, updates: Partial<Referral>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(referral.reward_amount?.toString() || '');
  const [notes, setNotes] = useState(referral.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(p);

  async function updateReferral(updates: Record<string, any>) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/accommodation/referrals/${referral.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate(referral.id, data.referral);
      setExpanded(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      {/* Status bar */}
      <div style={{
        padding: '10px 16px',
        background: STATUS_COLORS[referral.eligibility_status]?.bg || 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <StatusBadge status={referral.eligibility_status} />
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          color: PAYOUT_COLORS[referral.payout_status] || '#6B7B75',
        }}>
          {referral.payout_status === 'paid' ? '✓ Paid' : referral.payout_status}
        </span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Referrer */}
        <p style={{
          fontFamily: 'var(--font-display, serif)',
          fontSize: 15,
          color: 'var(--color-forest, #1A3C34)',
          marginBottom: 4,
        }}>
          {referral.referrer?.full_name || 'Unknown student'}
        </p>

        {/* Property */}
        {referral.unit && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary, #6B7B75)', marginBottom: 6 }}>
            📍 {referral.unit.property.name} · {referral.unit.unit_number || referral.unit.room_type}
          </p>
        )}

        {/* Transaction amount */}
        {referral.transaction?.rent_amount && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Transaction: {formatPrice(referral.transaction.rent_amount)}/yr
            {referral.transaction.completed_at && (
              <span style={{ marginLeft: 6 }}>
                · {format(new Date(referral.transaction.completed_at), 'MMM d, yyyy')}
              </span>
            )}
          </p>
        )}

        {/* Reward amount */}
        {referral.reward_amount && (
          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-gold, #E8A020)',
            marginBottom: 8,
          }}>
            🏆 Reward: {formatPrice(referral.reward_amount)}
            {referral.paid_at && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400, marginLeft: 6 }}>
                paid {formatDistanceToNow(new Date(referral.paid_at), { addSuffix: true })}
              </span>
            )}
          </p>
        )}

        {/* Expand for actions */}
        {['eligible', 'pending'].includes(referral.eligibility_status) && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: 12,
              color: 'var(--color-sage, #4A8C73)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 500,
            }}
          >
            {expanded ? '▲ Hide actions' : '▼ Manage reward'}
          </button>
        )}

        {/* Action panel */}
        {expanded && (
          <div style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '0.5px solid #D6E5DF',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Reward amount (₦)
              </label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={rewardAmount}
                onChange={e => setRewardAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #C8E8DA',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Admin notes
              </label>
              <textarea
                placeholder="Internal notes about this referral…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #C8E8DA',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#C44B2A' }}>{error}</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Mark as processing */}
              {referral.payout_status === 'unpaid' && (
                <button
                  onClick={() => updateReferral({
                    payout_status: 'processing',
                    reward_amount: rewardAmount ? parseFloat(rewardAmount) : null,
                    admin_notes: notes || null,
                  })}
                  disabled={saving}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(26,92,138,0.08)',
                    border: '1px solid rgba(26,92,138,0.2)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1A5C8A',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  💳 Mark as processing payment
                </button>
              )}

              {/* Mark as paid */}
              {['unpaid', 'processing'].includes(referral.payout_status) && (
                <button
                  onClick={() => updateReferral({
                    eligibility_status: 'paid',
                    payout_status: 'paid',
                    reward_amount: rewardAmount ? parseFloat(rewardAmount) : null,
                    paid_at: new Date().toISOString(),
                    admin_notes: notes || null,
                  })}
                  disabled={saving || !rewardAmount}
                  style={{
                    padding: '10px 14px',
                    background: rewardAmount ? 'rgba(26,122,82,0.08)' : 'rgba(107,123,117,0.08)',
                    border: `1px solid ${rewardAmount ? 'rgba(26,122,82,0.2)' : '#D6E5DF'}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: rewardAmount ? '#1A7A52' : '#6B7B75',
                    cursor: rewardAmount ? 'pointer' : 'not-allowed',
                    textAlign: 'left',
                  }}
                >
                  ✓ Confirm reward paid{rewardAmount ? ` (₦${parseInt(rewardAmount).toLocaleString()})` : ''}
                </button>
              )}

              {/* Dispute */}
              <button
                onClick={() => updateReferral({
                  eligibility_status: 'disputed',
                  admin_notes: notes || null,
                })}
                disabled={saving}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(196,75,42,0.06)',
                  border: '1px solid rgba(196,75,42,0.2)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#C44B2A',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                ⚠️ Mark as disputed
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('eligible');

  useEffect(() => {
    const url = filter
      ? `/api/admin/accommodation/referrals?status=${filter}`
      : '/api/admin/accommodation/referrals';

    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => setReferrals(d.referrals || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  function handleUpdate(id: string, updates: Partial<Referral>) {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }

  const FILTERS = ['eligible', 'pending', 'paid', 'disputed', 'rejected', ''];

  // Stats
  const totalEligible = referrals.filter(r => r.eligibility_status === 'eligible').length;
  const totalPaid = referrals
    .filter(r => r.payout_status === 'paid' && r.reward_amount)
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(p);

  return (
    <div style={{
      background: 'var(--surface-page, #F0F5F3)',
      minHeight: '100vh',
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-forest, #1A3C34)',
        padding: '16px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display, serif)',
          fontSize: 20,
          color: 'white',
          marginBottom: 4,
        }}>
          Referral Rewards
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-leaf, #7EC8A0)' }}>
          Manage student referral payouts
        </p>
      </div>

      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        padding: '14px 16px 0',
      }}>
        <div style={{
          background: 'white',
          border: '0.5px solid #D6E5DF',
          borderRadius: 12,
          padding: '14px 16px',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 28,
            fontWeight: 500,
            color: 'var(--color-gold, #E8A020)',
            lineHeight: 1,
            marginBottom: 4,
          }}>
            {totalEligible}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Awaiting payout
          </p>
        </div>
        <div style={{
          background: 'white',
          border: '0.5px solid #D6E5DF',
          borderRadius: 12,
          padding: '14px 16px',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 20,
            fontWeight: 500,
            color: '#1A7A52',
            lineHeight: 1,
            marginBottom: 4,
          }}>
            {totalPaid > 0 ? formatPrice(totalPaid) : '₦0'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Total paid out
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '14px 16px 0',
        paddingBottom: 4,
      }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              background: filter === f
                ? 'var(--color-forest, #1A3C34)'
                : 'var(--color-mist, #E8F5EF)',
              color: filter === f ? 'white' : 'var(--color-forest)',
              border: 'none',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize',
              flexShrink: 0,
            }}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 120,
                background: 'var(--color-mist)',
                borderRadius: 12,
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))
        ) : referrals.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 36 }}>🏆</span>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              No {filter || ''} referrals found.
            </p>
          </div>
        ) : (
          referrals.map(r => (
            <ReferralCard key={r.id} referral={r} onUpdate={handleUpdate} />
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @media (prefers-reduced-motion: reduce) { *{animation:none!important} }
      `}</style>
    </div>
  );
}