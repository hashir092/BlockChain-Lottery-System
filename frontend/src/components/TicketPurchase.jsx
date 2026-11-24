import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { createContractService } from '../services/ContractService';
import toast from 'react-hot-toast';

const PRESETS = [1, 2, 3, 5, 10];

export default function TicketPurchase({ roundInfo, onSuccess, loading: dataLoading = false }) {
  const { account, signer, connect, isConnecting, isCorrectNetwork, switchOrAddNetwork } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const price = parseFloat(roundInfo?.ticketPrice || '0.01');
  const total = (quantity * price).toFixed(4);
  const canBuy = roundInfo?.entriesOpen && !roundInfo?.drawn;

  if (dataLoading) {
    return (
      <div className="ticket-purchase card ticket-purchase-loading">
        <div className="skeleton" style={{ height: 24, width: 150, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 18, width: 190, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 44, width: '100%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 44, width: '100%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 50, width: '100%' }} />
      </div>
    );
  }

  const handlePreset = (n) => {
    setQuantity(n);
    setCustom('');
  };

  const handleCustom = (val) => {
    setCustom(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 100) {
      setQuantity(num);
    }
  };

  const openConfirm = () => {
    if (!account) {
      connect();
      return;
    }
    if (!isCorrectNetwork) {
      toast.error('Wrong network. Switching…');
      switchOrAddNetwork();
      return;
    }
    if (!canBuy) {
      toast.error('Entries are closed for this round');
      return;
    }
    setShowConfirm(true);
  };

  const buy = async () => {
    if (!signer || !roundInfo) return;
    setLoading(true);
    setTxHash(null);
    try {
      const service = createContractService(signer);
      const tx = await service.buyTickets(quantity, roundInfo.ticketPriceWei);
      setTxHash(tx.hash);
      toast.loading('Transaction pending…', { id: 'buy' });

      const receipt = await tx.wait();
      toast.success(`Successfully bought ${quantity} ticket${quantity > 1 ? 's' : ''}!`, { id: 'buy' });
      setShowConfirm(false);
      onSuccess?.(receipt);
    } catch (err) {
      console.error(err);
      const msg = err.reason || err.shortMessage || err.message || 'Transaction failed';
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected', { id: 'buy' });
      } else if (msg.includes('insufficient')) {
        toast.error('Insufficient funds', { id: 'buy' });
      } else {
        toast.error(msg.slice(0, 100), { id: 'buy' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ticket-purchase card">
        <h3 className="tp-title">Buy Tickets</h3>
        <p className="tp-price">
          Ticket price: <strong className="text-gold">{price} ETH</strong>
        </p>

        <div className="preset-row">
          {PRESETS.map((n) => (
            <button
              key={n}
              className={`preset-btn ${quantity === n && !custom ? 'active' : ''}`}
              onClick={() => handlePreset(n)}
              disabled={!canBuy}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="custom-row">
          <label>Custom quantity</label>
          <input
            type="number"
            min="1"
            max="100"
            placeholder="1–100"
            value={custom}
            onChange={(e) => handleCustom(e.target.value)}
            disabled={!canBuy}
          />
        </div>

        <div className="total-row">
          <span>Total</span>
          <span className="total-amount">{total} ETH</span>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 20 }}
          onClick={openConfirm}
          disabled={loading || isConnecting || !canBuy}
        >
          {isConnecting && <span className="btn-spinner" aria-hidden="true" />}
          {!account
            ? 'Connect Wallet to Buy'
            : !canBuy
            ? 'Entries Closed'
            : `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
        </button>

        {!canBuy && roundInfo?.roundId > 0 && (
          <p className="tp-hint">Waiting for next round to open…</p>
        )}
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => !loading && setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>Confirm Purchase</h3>
            <p className="text-muted" style={{ marginBottom: 20 }}>
              You are about to buy <strong className="text-gold">{quantity}</strong> ticket
              {quantity > 1 ? 's' : ''} for <strong className="text-gold">{total} ETH</strong>
            </p>
            {account && (
              <p style={{ fontSize: '0.85rem', marginBottom: 16, color: 'var(--text-secondary)' }}>
                Wallet: <code>{account.slice(0, 10)}…{account.slice(-6)}</code>
              </p>
            )}
            {txHash && (
              <p style={{ fontSize: '0.8rem', wordBreak: 'break-all', marginBottom: 12 }}>
                Tx: <span className="text-emerald">{txHash}</span>
              </p>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={buy}
                disabled={loading}
              >
                {loading && <span className="btn-spinner" aria-hidden="true" />}
                {loading ? 'Processing…' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ticket-purchase {
          padding: 28px;
        }
        .tp-title {
          font-family: var(--font-display);
          font-size: 1.3rem;
          margin-bottom: 6px;
        }
        .tp-price {
          color: var(--text-secondary);
          margin-bottom: 20px;
          font-size: 0.95rem;
        }
        .preset-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .preset-btn {
          flex: 1;
          min-width: 48px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid transparent;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .preset-btn:hover:not(:disabled) {
          border-color: var(--border-glow);
          background: rgba(245,197,66,0.1);
        }
        .preset-btn.active {
          border-color: var(--accent-gold);
          background: rgba(245,197,66,0.15);
          color: var(--accent-gold);
        }
        .preset-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }
        .custom-row {
          margin-bottom: 16px;
        }
        .custom-row label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .custom-row input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-subtle);
          background: rgba(0,0,0,0.3);
          color: var(--text-primary);
          font-size: 1rem;
        }
        .custom-row input:focus {
          outline: none;
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 3px rgba(245, 197, 66, 0.12);
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          font-size: 1.05rem;
        }
        .total-amount {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.3rem;
          color: var(--accent-gold);
        }
        .tp-hint {
          text-align: center;
          margin-top: 12px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        @media (max-width: 480px) {
          .ticket-purchase {
            padding: 20px 16px;
          }
          .modal .btn {
            min-width: 0;
            padding-left: 12px;
            padding-right: 12px;
          }
        }
      `}</style>
    </>
  );
}
