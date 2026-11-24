import React, { useState, useEffect } from 'react';

export default function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, expired: true });
        return;
      }
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft({ h, m, s, expired: false });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (!endTime) return <span className="text-muted">—</span>;

  if (timeLeft.expired) {
    return <span className="text-gold" style={{ fontWeight: 600 }}>Round Ended</span>;
  }

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="countdown">
      <div className="countdown-unit">
        <span className="countdown-num">{pad(timeLeft.h)}</span>
        <span className="countdown-label">HRS</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-num">{pad(timeLeft.m)}</span>
        <span className="countdown-label">MIN</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <span className="countdown-num">{pad(timeLeft.s)}</span>
        <span className="countdown-label">SEC</span>
      </div>

      <style>{`
        .countdown {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
        }
        .countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 48px;
        }
        .countdown-num {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--accent-gold);
          line-height: 1.1;
        }
        .countdown-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }
        .countdown-sep {
          font-size: 1.4rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
