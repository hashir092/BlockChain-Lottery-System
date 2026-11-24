import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { createContractService } from '../services/ContractService';
import { SHORT_ADDRESS, ACTIVE_NETWORK } from '../config';

export default function Winners() {
  const { provider } = useWallet();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!provider) {
        setLoading(false);
        return;
      }
      try {
        const service = createContractService(provider);
        const list = await service.getRecentWinners(20);
        if (mounted) {
          setWinners(list);
          setLatest(list[0] || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
  }, [provider]);

  return (
    <div className="winners-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Winners</h1>
          <p className="page-sub">Verified on-chain winners only.</p>
        </header>

        {latest && (
          <div className="latest-winner glass-glow">
            <div className="lw-label">LATEST WINNER</div>
            <div className="lw-address">{SHORT_ADDRESS(latest.winner)}</div>
            <div className="lw-prize">
              <span className="text-gold">{latest.prize}</span> ETH
            </div>
            <div className="lw-round">Round #{latest.roundId}</div>
          </div>
        )}

        {!loading && winners.length === 0 && (
          <div className="empty card">
            <p>No winners yet. Be the first!</p>
          </div>
        )}

        {winners.length > 0 && (
          <div className="winners-table card">
            <div className="wt-header">
              <span>Round</span>
              <span>Winner</span>
              <span>Prize</span>
            </div>
            {winners.map((w, i) => (
              <div key={i} className="wt-row">
                <span>#{w.roundId}</span>
                <span className="mono">
                  {ACTIVE_NETWORK.explorer ? (
                    <a
                      href={`${ACTIVE_NETWORK.explorer}/address/${w.winner}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold"
                    >
                      {SHORT_ADDRESS(w.winner)}
                    </a>
                  ) : (
                    SHORT_ADDRESS(w.winner)
                  )}
                </span>
                <span className="text-emerald">{w.prize} ETH</span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div className="skeleton" style={{ height: 24, width: 200, margin: '0 auto' }} />
          </div>
        )}
      </div>

      <style>{`
        .winners-page { padding: 48px 0 80px; }
        .page-header { margin-bottom: 40px; }
        .page-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
        }
        .page-sub { color: var(--text-secondary); margin-top: 6px; }
        .latest-winner {
          text-align: center;
          padding: 40px;
          margin-bottom: 32px;
        }
        .lw-label {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .lw-address {
          font-family: monospace;
          font-size: 1.4rem;
          color: var(--accent-gold);
          margin-bottom: 8px;
        }
        .lw-prize {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
        }
        .lw-round {
          margin-top: 8px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .winners-table {
          padding: 0;
          overflow: hidden;
        }
        .wt-header, .wt-row {
          display: grid;
          grid-template-columns: 80px 1fr 140px;
          padding: 14px 24px;
          align-items: center;
        }
        .wt-header {
          background: rgba(255,255,255,0.03);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
        }
        .wt-row {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.95rem;
        }
        .wt-row:last-child { border-bottom: none; }
        .mono { font-family: monospace; }
        .empty {
          text-align: center;
          padding: 48px;
          color: var(--text-secondary);
        }
        @media (max-width: 500px) {
          .wt-header, .wt-row {
            grid-template-columns: 60px 1fr 100px;
            padding: 12px 16px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
