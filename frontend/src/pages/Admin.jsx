import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { createContractService } from '../services/ContractService';
import toast from 'react-hot-toast';

export default function Admin() {
  const { account, signer, provider, connect } = useWallet();
  const [owner, setOwner] = useState(null);
  const [roundInfo, setRoundInfo] = useState(null);
  const [duration, setDuration] = useState(3600); // 1 hour default
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const isOwner = account && owner && account.toLowerCase() === owner.toLowerCase();

  const load = async () => {
    if (!provider) {
      setFetching(false);
      return;
    }
    try {
      const service = createContractService(provider);
      const [o, info] = await Promise.all([
        service.getOwner(),
        service.getCurrentRoundInfo(),
      ]);
      setOwner(o);
      setRoundInfo(info);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    load();
  }, [provider]);

  const runTx = async (fn, successMsg) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    setLoading(true);
    try {
      const service = createContractService(signer);
      const tx = await fn(service);
      toast.loading('Transaction pending…', { id: 'admin' });
      await tx.wait();
      toast.success(successMsg, { id: 'admin' });
      await load();
    } catch (err) {
      console.error(err);
      const msg = err.reason || err.shortMessage || err.message || 'Failed';
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        toast.error('Rejected', { id: 'admin' });
      } else {
        toast.error(msg.slice(0, 120), { id: 'admin' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: 48, maxWidth: 420, margin: '60px auto' }}>
            <h2>Admin Panel</h2>
            <p className="text-muted" style={{ margin: '12px 0 20px' }}>Connect the owner wallet to manage the lottery.</p>
            <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">
            {isOwner ? (
              <span className="text-emerald">You are the contract owner</span>
            ) : (
              <span className="text-muted">View only — connect owner wallet for actions</span>
            )}
          </p>
        </header>

        <div className="admin-grid">
          <div className="card info-card">
            <h3>Contract Status</h3>
            {fetching ? (
              <p className="text-muted">Loading…</p>
            ) : (
              <ul className="info-list">
                <li><span>Owner</span><code>{owner?.slice(0, 10)}…</code></li>
                <li><span>Round</span><strong>#{roundInfo?.roundId}</strong></li>
                <li><span>Entries</span><strong>{roundInfo?.entriesOpen ? 'OPEN' : 'CLOSED'}</strong></li>
                <li><span>Drawn</span><strong>{roundInfo?.drawn ? 'Yes' : 'No'}</strong></li>
                <li><span>Jackpot</span><strong className="text-gold">{roundInfo?.jackpot} ETH</strong></li>
                <li><span>Tickets</span><strong>{roundInfo?.ticketCount}</strong></li>
              </ul>
            )}
          </div>

          <div className="card actions-card">
            <h3>Actions</h3>
            {!isOwner && (
              <p className="text-muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
                Only the contract owner can execute these actions.
              </p>
            )}

            <div className="action-group">
              <label>Round duration (seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="60"
                disabled={!isOwner || loading}
              />
              <button
                className="btn btn-primary"
                disabled={!isOwner || loading || roundInfo?.entriesOpen}
                onClick={() => runTx((s) => s.startRound(duration), 'Round started!')}
              >
                Start New Round
              </button>
            </div>

            <div className="action-group">
              <button
                className="btn btn-secondary"
                disabled={!isOwner || loading || !roundInfo?.entriesOpen}
                onClick={() => runTx((s) => s.closeEntries(), 'Entries closed')}
              >
                Close Entries
              </button>
            </div>

            <div className="action-group">
              <button
                className="btn btn-emerald"
                disabled={!isOwner || loading || roundInfo?.entriesOpen || roundInfo?.drawn || (roundInfo?.ticketCount || 0) === 0}
                onClick={() => runTx((s) => s.executeDraw(), 'Draw executed! Winner paid.')}
              >
                Execute Draw
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-page { padding: 48px 0 80px; }
        .page-header { margin-bottom: 32px; }
        .page-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
        }
        .page-sub { margin-top: 6px; }
        .admin-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .info-card h3, .actions-card h3 {
          font-family: var(--font-display);
          margin-bottom: 16px;
          font-size: 1.2rem;
        }
        .info-list {
          list-style: none;
        }
        .info-list li {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 0.95rem;
        }
        .info-list li span { color: var(--text-secondary); }
        .action-group {
          margin-bottom: 20px;
        }
        .action-group label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .action-group input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: rgba(0,0,0,0.3);
          color: white;
          margin-bottom: 10px;
        }
        .action-group button {
          width: 100%;
        }
        @media (max-width: 700px) {
          .admin-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
