import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { createContractService } from '../services/ContractService';
import JackpotCard from '../components/JackpotCard';
import TicketPurchase from '../components/TicketPurchase';
import Countdown from '../components/Countdown';

export default function Lottery() {
  const { provider, account } = useWallet();
  const [roundInfo, setRoundInfo] = useState(null);
  const [totalSold, setTotalSold] = useState(0);
  const [totalWinners, setTotalWinners] = useState(0);
  const [myTickets, setMyTickets] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!provider) {
      setLoading(false);
      return;
    }
    try {
      const service = createContractService(provider);
      const [info, sold, winners] = await Promise.all([
        service.getCurrentRoundInfo(),
        service.getTotalTicketsSold(),
        service.getTotalWinners(),
      ]);
      setRoundInfo(info);
      setTotalSold(sold);
      setTotalWinners(winners);

      if (account) {
        const mine = await service.getPlayerTicketsInRound(account, info.roundId);
        setMyTickets(mine);
      } else {
        setMyTickets(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [provider, account]);

  useEffect(() => {
    load();
    const id = setInterval(load, 12000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="lottery-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Live Lottery</h1>
          <p className="page-sub">Buy tickets, track the jackpot, and win on-chain.</p>
        </header>

        <div className="lottery-grid">
          <div className="lottery-main">
            <JackpotCard data={roundInfo} loading={loading} />

            <div className="stats-row">
              <div className="stat-card card">
                <div className="stat-label">Ticket Price</div>
                <div className="stat-value text-gold">
                  {roundInfo ? `${roundInfo.ticketPrice} ETH` : '—'}
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-label">Tickets This Round</div>
                <div className="stat-value">{roundInfo?.ticketCount ?? '—'}</div>
              </div>
              <div className="stat-card card">
                <div className="stat-label">Total Ever Sold</div>
                <div className="stat-value">{totalSold}</div>
              </div>
              <div className="stat-card card">
                <div className="stat-label">Total Winners</div>
                <div className="stat-value text-emerald">{totalWinners}</div>
              </div>
            </div>

            {account && (
              <div className="my-tickets-banner card">
                <span>Your tickets this round:</span>
                <strong className="text-gold">{myTickets}</strong>
              </div>
            )}
          </div>

          <div className="lottery-side">
            <TicketPurchase roundInfo={roundInfo} onSuccess={load} />
          </div>
        </div>
      </div>

      <style>{`
        .lottery-page {
          padding: 48px 0 80px;
        }
        .page-header {
          margin-bottom: 40px;
        }
        .page-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          letter-spacing: -0.02em;
        }
        .page-sub {
          color: var(--text-secondary);
          margin-top: 6px;
        }
        .lottery-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 32px;
          align-items: start;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 24px;
        }
        .stat-card {
          padding: 18px;
          text-align: center;
        }
        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
        }
        .my-tickets-banner {
          margin-top: 20px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.95rem;
        }
        @media (max-width: 900px) {
          .lottery-grid {
            grid-template-columns: 1fr;
          }
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
