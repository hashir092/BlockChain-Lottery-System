import deployment from './contracts/deployment.json';

export const NETWORKS = {
  anvil: {
    chainId: 31337,
    chainIdHex: '0x7a69',
    name: 'Anvil Local',
    rpcUrl: 'http://127.0.0.1:8546',
    explorer: null,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  sepolia: {
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    name: 'Sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    explorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

// Active network – change this or use env to switch
export const ACTIVE_NETWORK = NETWORKS.sepolia;

export const CONTRACT_ADDRESS = deployment.address;
export const TICKET_PRICE_ETH = deployment.ticketPrice || '0.01';

export const SHORT_ADDRESS = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
