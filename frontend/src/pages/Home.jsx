import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWallet } from '../context/WalletContext';
import { createContractService } from '../services/ContractService';
import JackpotCard from '../components/JackpotCard';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { provider } = useWallet();
  const [roundInfo, setRoundInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const ballsRef = useRef([]);

  useEffect(() => {
    // Floating balls animation
    ballsRef.current.forEach((ball, i) => {
      if (!ball) return;
      gsap.to(ball, {
        y: `+=${20 + i * 10}`,
        x: `+=${10 - i * 5}`,
        duration: 3 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3,
      });
    });

    // Hero entrance
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { y: 40, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from('.hero-sub', { y: 30, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.from('.hero-cta', { y: 20, opacity: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' });
      gsap.from('.hero-jackpot', { scale: 0.9, opacity: 0, duration: 1, delay: 0.3, ease: 'back.out(1.4)' });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!provider) {
        setLoading(false);
        return;
      }
      try {
        const service = createContractService(provider);
        const info = await service.getCurrentRoundInfo();
        if (mounted) setRoundInfo(info);
      } catch (e) {
        console.error('Failed to load round info', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [provider]);

  return (
    <div className="home" ref={heroRef}>
      {/* Floating balls */}
      <div className="balls-container">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="floating-ball"
            ref={(el) => (ballsRef.current[i] = el)}
            style={{
              width: 18 + i * 8,
              height: 18 + i * 8,
              top: `${15 + i * 12}%`,
              left: `${10 + i * 18}%`,
              opacity: 0.35 + i * 0.08,
            }}
          />
        ))}
      </div>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              YOUR LUCK.<br />
              YOUR BLOCKCHAIN.<br />
              <span className="gradient-text">YOUR WIN.</span>
            </h1>
            <p className="hero-sub">
              The premium decentralized lottery. Transparent, trustless, and built for winners.
              Buy tickets, watch the jackpot grow, and claim your prize on-chain.
            </p>
            <div className="hero-cta">
              <Link to="/lottery" className="btn btn-primary btn-lg">
                Buy Tickets
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary btn-lg">
                How It Works
              </Link>
            </div>
          </div>
          <div className="hero-jackpot">
            <JackpotCard data={roundInfo} loading={loading} />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why LotteryChain?</h2>
          <div className="features-grid">
            {[
              {
                icon: '🔒',
                title: 'Fully On-Chain',
                desc: 'Every ticket, every draw, every prize is recorded on the blockchain. No middlemen.',
              },
              {
                icon: '⚡',
                title: 'Instant Transparency',
                desc: 'Verify winners and jackpot in real time. The smart contract is the source of truth.',
              },
              {
                icon: '💎',
                title: 'Premium Experience',
                desc: 'Beautiful UI, smooth animations, and seamless MetaMask integration.',
              },
              {
                icon: '🎯',
                title: 'Fair Draws',
                desc: 'Provably fair selection. Admin closes entries then executes the draw — fully auditable.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner glass-glow">
            <h2>Ready to try your luck?</h2>
            <p>Connect your wallet and buy your first tickets in seconds.</p>
            <Link to="/lottery" className="btn btn-primary btn-lg">
              Enter the Lottery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
