import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { ACTIVE_NETWORK, SHORT_ADDRESS } from '../config';
import toast from 'react-hot-toast';

const WalletContext = createContext(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum;

  const refreshBalance = useCallback(async (addr, prov) => {
    if (!addr || !prov) return;
    try {
      const bal = await prov.getBalance(addr);
      setBalance(formatEther(bal));
    } catch (e) {
      console.error('Balance fetch error', e);
    }
  }, []);

  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setBalance(null);
      setSigner(null);
      toast('Wallet disconnected', { icon: '🔌' });
    } else {
      const addr = accounts[0];
      setAccount(addr);
      if (provider) {
        const s = await provider.getSigner();
        setSigner(s);
        refreshBalance(addr, provider);
      }
    }
  }, [provider, refreshBalance]);

  const handleChainChanged = useCallback((hexChainId) => {
    const id = parseInt(hexChainId, 16);
    setChainId(id);
    setIsCorrectNetwork(id === ACTIVE_NETWORK.chainId);
    // Recommended by MetaMask: reload on chain change
    window.location.reload();
  }, []);

  // Init listeners
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const eth = window.ethereum;
    eth.on?.('accountsChanged', handleAccountsChanged);
    eth.on?.('chainChanged', handleChainChanged);

    // Check if already connected
    (async () => {
      try {
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const prov = new BrowserProvider(eth);
          setProvider(prov);
          const network = await prov.getNetwork();
          const id = Number(network.chainId);
          setChainId(id);
          setIsCorrectNetwork(id === ACTIVE_NETWORK.chainId);
          setAccount(accounts[0]);
          const s = await prov.getSigner();
          setSigner(s);
          refreshBalance(accounts[0], prov);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      eth.removeListener?.('accountsChanged', handleAccountsChanged);
      eth.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, handleAccountsChanged, handleChainChanged, refreshBalance]);

  const switchOrAddNetwork = async () => {
    const eth = window.ethereum;
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ACTIVE_NETWORK.chainIdHex }],
      });
    } catch (switchError) {
      // 4902 = chain not added
      if (switchError.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ACTIVE_NETWORK.chainIdHex,
              chainName: ACTIVE_NETWORK.name,
              rpcUrls: [ACTIVE_NETWORK.rpcUrl],
              nativeCurrency: ACTIVE_NETWORK.nativeCurrency,
              blockExplorerUrls: ACTIVE_NETWORK.explorer ? [ACTIVE_NETWORK.explorer] : null,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  const connect = async () => {
    if (!isMetaMaskInstalled) {
      toast.error('MetaMask is not installed. Please install it from metamask.io');
      return;
    }

    setIsConnecting(true);
    try {
      const eth = window.ethereum;
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        toast.error('No accounts returned');
        return;
      }

      const prov = new BrowserProvider(eth);
      setProvider(prov);

      const network = await prov.getNetwork();
      const id = Number(network.chainId);
      setChainId(id);

      if (id !== ACTIVE_NETWORK.chainId) {
        toast('Please switch to the correct network', { icon: '⚠️' });
        await switchOrAddNetwork();
        // After switch, chainChanged will reload
        return;
      }

      setIsCorrectNetwork(true);
      setAccount(accounts[0]);
      const s = await prov.getSigner();
      setSigner(s);
      await refreshBalance(accounts[0], prov);
      toast.success(`Connected: ${SHORT_ADDRESS(accounts[0])}`);
    } catch (err) {
      console.error(err);
      if (err.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error(err.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance(null);
    setSigner(null);
    setProvider(null);
    toast('Disconnected', { icon: '👋' });
  };

  const value = {
    account,
    balance,
    chainId,
    provider,
    signer,
    isConnecting,
    isCorrectNetwork,
    isMetaMaskInstalled,
    connect,
    disconnect,
    switchOrAddNetwork,
    refreshBalance: () => refreshBalance(account, provider),
    shortAddress: account ? SHORT_ADDRESS(account) : null,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
