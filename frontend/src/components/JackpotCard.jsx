import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Countdown from './Countdown';

export default function JackpotCard({ data, loading }) {
  const amountRef = useRef(null);

  useEffect(() => {
    if (!data || !amountRef.current) return;
    const target = parseFloat(data.jackpot) || 0;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (amountRef.current) {
          amountRef.current.textContent = obj.val.toFixed(4);
        }
      },
    });
  }, [data?.jackpot]);

  if (loading) {
    return (
      <div className="jackpot-card glass-glow">
        <div className="skeleton" style={{ height: 20, width: 120, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 48, width: 200, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: 160 }} />
      </div>
    );
  }

  return (
    <div className="jackpot-card glass-glow">
      <div className="jackpot-label">CURRENT JACKPOT</div>
      <div className="jackpot-amount">
        <span ref={amountRef}>0.0000</span>
        <span className="jackpot-eth">ETH</span>
      </div>
      <div className="jackpot-meta">
        <span>Round #{data?.roundId || '—'}</span>
        <span className="dot">•</span>
        <span>{data?.ticketCount || 0} tickets sold</span>
      </div>
      {data?.entriesOpen && (
        <div className="jackpot-countdown">
          <span className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 6, display: 'block' }}>
            Ends in
          </span>
          <Countdown endTime={data?.endTime} />
        </div>
      )}
      {!data?.entriesOpen && data?.drawn && (
        <div className="winner-badge">
          Winner drawn
        </div>
      )}
      {!data?.entriesOpen && !data?.drawn && data?.roundId > 0 && (
        <div className="status-badge closed">Entries Closed</div>
      )}

      <style>{`
        .jackpot-card {
          padding: 32px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .jackpot-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(245,197,66,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .jackpot-label {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: var(--text-secondary);
          margin-bottom: 12px;
          font-weight: 600;
        }
        .jackpot-amount {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 5vw, 3.2rem);
          font-weight: 700;
          color: var(--accent-gold);
          line-height: 1.1;
          text-shadow: 0 0 40px rgba(245, 197, 66, 0.4);
        }
        .jackpot-eth {
          font-size: 0.45em;
          margin-left: 8px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .jackpot-meta {
          margin-top: 12px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .dot { opacity: 0.4; }
        .jackpot-countdown {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
        }
        .winner-badge, .status-badge {
          margin-top: 16px;
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .winner-badge {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-emerald);
        }
        .status-badge.closed {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
        }
      `}</style>
    </div>
  );
}
