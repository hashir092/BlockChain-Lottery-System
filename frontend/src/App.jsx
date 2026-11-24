import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Lottery from './pages/Lottery';
import HowItWorks from './pages/HowItWorks';
import Winners from './pages/Winners';
import Account from './pages/Account';
import Admin from './pages/Admin';
import './styles/global.css';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lottery" element={<Lottery />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/winners" element={<Winners />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="container">
              <p>
                © {new Date().getFullYear()} LotteryChain — Built on Ethereum. Play responsibly.
              </p>
            </div>
          </footer>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'toast-custom',
            style: {
              background: '#10141C',
              color: '#fff',
              border: '1px solid rgba(245,197,66,0.2)',
            },
          }}
        />
      </BrowserRouter>

      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        main {
          flex: 1;
        }
        .footer {
          padding: 28px 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
      `}</style>
    </WalletProvider>
  );
}

export default App;
