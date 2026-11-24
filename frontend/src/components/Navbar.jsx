import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import './Navbar.css';

export default function Navbar() {
  const { account, shortAddress, balance, isConnecting, connect, disconnect, isMetaMaskInstalled } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/lottery', label: 'Lottery' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/winners', label: 'Winners' },
    { to: '/account', label: 'My Account' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">Lottery<span className="logo-accent">Chain</span></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${isActive(l.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Admin
          </Link>
        </div>

        <div className="nav-actions">
          {account ? (
            <div className="wallet-info">
              <div className="wallet-balance">
                {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '—'}
              </div>
              <button className="btn btn-secondary btn-sm wallet-btn" onClick={disconnect}>
                {shortAddress}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting…' : isMetaMaskInstalled ? 'Connect Wallet' : 'Install MetaMask'}
            </button>
          )}

          <button
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
