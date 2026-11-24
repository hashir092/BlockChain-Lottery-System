# LotteryChain — Premium Web3 Lottery DApp

A production-quality decentralized lottery built with React, Vite, ethers.js v6, and Solidity.

**Design**: Dark premium theme (`#07090D`), electric gold (`#F5C542`), emerald accents, glassmorphism, GSAP animations.

---

## Features

- Real MetaMask connection (no simulated success)
- Live jackpot, ticket counts, countdown from the smart contract
- Buy 1–100 tickets with confirmation modal + transaction status
- My Account dashboard
- Winners history (on-chain only)
- Admin panel (start round / close entries / execute draw) — owner only
- Local Anvil (chainId 31337, RPC `http://127.0.0.1:8546`) + Sepolia ready

---

## Quick Start

### 1. Install dependencies

```bash
cd LotteryChain
npm install
cd frontend && npm install && cd ..
```

### 2. Start local blockchain (Anvil / Foundry)

```bash
# In a separate terminal – port 8546 as configured
anvil --port 8546 --chain-id 31337
```

Or with Hardhat:

```bash
npx hardhat node --port 8546
```

### 3. Compile & Deploy

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network anvil
```

This writes the contract address + ABI into `frontend/src/contracts/`.

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:5173

### 5. MetaMask setup

1. Install MetaMask
2. Add network:
   - Network Name: `Anvil Local`
   - RPC URL: `http://127.0.0.1:8546`
   - Chain ID: `31337`
   - Currency: `ETH`
3. Import a test account from Anvil (private key shown in Anvil output)
4. Click **Connect Wallet** on the site

---

## Vercel Deployment

Set the Vercel project **Root Directory** to `frontend`. The included `frontend/vercel.json` rewrites direct route requests (such as `/lottery` or `/account`) to the React app entry point, so these routes also work when opened or refreshed directly.

---

## Contract Overview

| Function | Description |
|----------|-------------|
| `buyTickets(uint256 quantity)` | Payable – buy tickets |
| `startRound(uint256 duration)` | Owner – open new round |
| `closeEntries()` | Owner – stop ticket sales |
| `executeDraw()` | Owner – pick winner & send jackpot |
| `getCurrentRoundInfo()` | View – full round state |

Default ticket price: **0.01 ETH**

---

## Project Structure

```
LotteryChain/
├── contracts/Lottery.sol
├── scripts/deploy.js
├── hardhat.config.js
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, JackpotCard, TicketPurchase, Countdown
│   │   ├── pages/        # Home, Lottery, HowItWorks, Winners, Account, Admin
│   │   ├── context/      # WalletContext
│   │   ├── services/     # ContractService
│   │   ├── contracts/    # ABI + deployment.json
│   │   └── styles/
│   └── package.json
└── README.md
```

---

## Switching to Sepolia

1. Set `SEPOLIA_RPC_URL` and `PRIVATE_KEY` in env
2. Deploy: `npx hardhat run scripts/deploy.js --network sepolia`
3. In `frontend/src/config.js` change `ACTIVE_NETWORK` to `NETWORKS.sepolia`
4. Update `deployment.json` with the new address

---

## License

MIT
