import React from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    num: '01',
    title: 'Connect Wallet',
    desc: 'Link your MetaMask wallet. We support the local Anvil network (chain 31337) and Sepolia testnet.',
  },
  {
    num: '02',
    title: 'Buy Tickets',
    desc: 'Choose how many tickets you want. Each ticket costs a fixed amount of ETH. Payment goes straight into the jackpot.',
  },
  {
    num: '03',
    title: 'Wait for the Draw',
    desc: 'When the round ends, the admin closes entries and executes the draw. A winner is selected fairly from all ticket holders.',
  },
  {
    num: '04',
    title: 'Win & Receive',
    desc: 'The entire jackpot is sent automatically to the winner’s wallet. No claim step needed — pure on-chain magic.',
  },
];

export default function HowItWorks() {
  return (
    <div className="how-page">
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">How It Works</h1>
          <p className="page-sub">Simple, transparent, and fully decentralized.</p>
        </header>

        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={i} className="step card">
              <div className="step-num">{s.num}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-box glass-glow">
          <h2>Ready to play?</h2>
          <Link to="/lottery" className="btn btn-primary btn-lg">
            Buy Your First Tickets
          </Link>
        </div>
      </div>

      <style>{`
        .how-page { padding: 48px 0 80px; }
        .page-header { margin-bottom: 48px; }
        .page-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
        }
        .page-sub { color: var(--text-secondary); margin-top: 6px; }
        .steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 700px;
          margin: 0 auto 60px;
        }
        .step {
          display: flex;
          gap: 24px;
          padding: 28px;
          align-items: flex-start;
        }
        .step-num {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--accent-gold);
          opacity: 0.7;
          min-width: 48px;
        }
        .step h3 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          margin-bottom: 6px;
        }
        .step p {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
        }
        .cta-box {
          text-align: center;
          padding: 48px;
        }
        .cta-box h2 {
          font-family: var(--font-display);
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}
