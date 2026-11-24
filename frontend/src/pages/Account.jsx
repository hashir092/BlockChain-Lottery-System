import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { createContractService } from '../services/ContractService';
import { SHORT_ADDRESS, ACTIVE_NETWORK } from '../config';
import { Link } from 'react-router-dom';

export default function Account() {
  const { account, balance, shortAddress, connect, isMetaMaskInstalled, provider } = useWallet();
  const [ticketCount, setTicketCount] = useState(0);
  const [roundTickets, setRoundTickets] = useState(0);
  const [roundInfo, setRoundInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provider || !account) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const service = createContractService(provider);
        const [total, info] = await Promise.all([
          service.getPlayerTicketCount(account),
          service.getCurrentRoundInfo(),
        ]);
        const mine = await service.getPlayerTicketsInRound(account, info.roundId);
        if (mounted) {
          setTicketCount(total);
          setRoundTickets(mine);
          setRoundInfo(info);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
  }, [provider, account]);

  if (!account) {
    return (
      <div className="account-page">
        <div className="container">
          <div className="connect-prompt card">
            <h2>Connect your wallet</h2>
            <p className="text-muted">
              {isMetaMaskInstalled
                ? 'Connect MetaMask to view your tickets and history.'
                : 'MetaMask is not installed. Please install it from metamask.io first.'}
            </p>
            <button className="btn btn-primary btn-lg" onClick={connect} style={{ marginTop: 20 }}>
              {isMetaMaskInstalled ? 'Connect Wallet' : 'Install MetaMask'}
            </button>
          </div>
        </div>
        <style>{`
          .account-page { padding: 80px 0; }
          .connect-prompt { text-align: center; padding: 60px 40px; max-width: 480px; margin: 0 auto; }
          .connect-prompt h2 { font-family: var(--font-display); margin-bottom: 12px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">My Account</h1>
        </header>

        <div className="account-grid">
          <div className="wallet-card card">
            <div className="wc-label">Connected Wallet</div>
            <div className="wc-address">{shortAddress}</div>
            <div className="wc-full mono text-muted">{account}</div>
            <div className="wc-balance">
              Balance: <strong className="text-emerald">{balance ? parseFloat(balance).toFixed(4) : '—'} ETH</strong>
            </div>
            {ACTIVE_NETWORK.explorer && (
              <a
                href={`${ACTIVE_NETWORK.explorer}/address/${account}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 16 }}
              >
                View on Explorer
              </a>
            )}
          </div>

          <div className="stats-cards">
            <div className="stat-box card">
              <div className="sb-label">Total Tickets Ever</div>
              <div className="sb-value">{loading ? '…' : ticketCount}</div>
            </div>
            <div className="stat-box card">
              <div className="sb-label">This Round</div>
              <div className="sb-value text-gold">{loading ? '…' : roundTickets}</div>
            </div>
            <div className="stat-box card">
              <div className="sb-label">Current Round</div>
              <div className="sb-value">#{roundInfo?.roundId || '—'}</div>
            </div>
          </div>
        </div>

        <div className="actions-row">
          <Link to="/lottery" className="btn btn-primary">
            Buy More Tickets
          </Link>
          <Link to="/winners" className="btn btn-secondary">
            View Winners
          </Link>
        </div>
      </div>

      <style>{`
        .account-page { padding: 48px 0 80px; }
        .page-header { margin-bottom: 32px; }
        .page-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
        }
        .account-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .wallet-card { padding: 28px; }
        .wc-label {
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .wc-address {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-gold);
        }
        .wc-full {
          font-size: 0.8rem;
          margin-top: 4px;
          word-break: break-all;
        }
        .wc-balance {
          margin-top: 16px;
          font-size: 1rem;
        }
        .mono { font-family: monospace; }
        .stats-cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .stat-box {
          padding: 20px;
          text-align: center;
        }
        .sb-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .sb-value {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
        }
        .actions-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 700px) {
          .account-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
