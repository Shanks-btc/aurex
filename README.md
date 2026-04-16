 AUREX — The Credit Infrastructure for Autonomous Agents

> **Autonomous credit-weighted signal capital allocation system for the agentic economy on X Layer**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aurex--liard.vercel.app-6366f1?style=for-the-badge)](https://aurex-liard.vercel.app)
[![X Layer](https://img.shields.io/badge/Chain-X%20Layer%20196-22d3ee?style=for-the-badge)](https://www.oklink.com/xlayer/address/0xa98f386e036433ae0630f1d87b77f28f2011cefe)
[![GitHub](https://img.shields.io/badge/GitHub-Shanks--btc%2Faurex-white?style=for-the-badge&logo=github)](https://github.com/Shanks-btc/aurex)
[![OKX Build X](https://img.shields.io/badge/OKX%20Build%20X-Season%202-f59e0b?style=for-the-badge)](https://www.okx.com) 

## What Is AUREX?

AUREX is the **credit layer for autonomous agents**. Today, AI agents operate without any verifiable track record — capital is allocated blindly, there is no way to know which agent to trust, and bad agents receive the same resources as good ones.

AUREX solves this by building **onchain credit scores** for autonomous agents derived from real signal accuracy and x402 payment history. Higher credit score means more capital allocated. More capital means more x402 earnings. Wrong signals mean the score drops next cycle.

The result is a self-improving, merit-based capital allocation system that runs autonomously on X Layer — forever.

---

## Project Positioning in X Layer Ecosystem

AUREX positions itself as **open credit infrastructure** for the X Layer agentic economy — the same way traditional financial infrastructure provides credit rails that other financial products build on top of.

Any autonomous agent can:
- Register their wallet address
- Receive a verifiable onchain credit score
- Submit signals each cycle
- Earn x402 micro-payments proportional to their credit score

AUREX is not just a trading bot. It is the **credit rails** that other agents in the X Layer ecosystem build on top of.

---

## Live Deployment

| Component | URL |
|-----------|-----|
| Frontend Dashboard | [aurex-liard.vercel.app](https://aurex-liard.vercel.app) |
| Backend API | [aurex-backend-wlc4.onrender.com](https://aurex-backend-wlc4.onrender.com) |
| Agent Engine | Running on Render (Background Worker) |
| X Layer Explorer | [View Allocator Wallet](https://www.oklink.com/xlayer/address/0xa98f386e036433ae0630f1d87b77f28f2011cefe) |

---

## Agentic Wallet Addresses

| Agent | Role | Address |
|-------|------|---------|
| Signal Price Agent | Price momentum signal generator | From `.env` — `SIGNAL_PRICE_ADDRESS` |
| Signal Flow Agent | Wallet flow signal generator | From `.env` — `SIGNAL_FLOW_ADDRESS` |
| **Allocator Agent** | **Credit scoring + capital allocation** | **`0xa98f386e036433ae0630f1d87b77f28f2011cefe`** |

> The Allocator Agent is the primary agentic wallet with 40+ real transactions on X Layer mainnet — all verifiable on OKLink explorer.



## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUREX — X Layer (Chain ID: 196)                   │
│            The Credit Infrastructure for Autonomous Agents           │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────┐      ┌──────────────────────┐
  │   Price Signal Agent  │      │   Flow Signal Agent   │
  │   Onchain OS          │      │   Onchain OS          │
  │   DEX Aggregator API  │      │   Wallet API          │
  │   → OKB price data    │      │   → Wallet activity   │
  │   → Momentum signal   │      │   → Flow signal       │
  └──────────┬────────────┘      └──────────┬────────────┘
             │  signal + confidence          │  signal + confidence
             └──────────────┬───────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │      Credit Scorer       │
              │  score = accuracy × 70   │
              │        + payments × 30   │
              └─────────────┬───────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │     Allocator Agent      │
              │  Higher score →          │
              │  More capital weight     │
              │  Onchain OS DEX Swap     │
              └─────────────┬───────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
    x402 payments                      MCP onchain log
    to signal agents                   immutable record
    (X Layer TX)                       (X Layer TX)
```

---

## Onchain OS Integration

AUREX uses **4 Onchain OS skill modules**:

### 1. DEX Aggregator API
**Used by:** Signal Price Agent + Allocator Agent

```javascript
// Fetch real-time OKB price on X Layer
GET https://www.okx.com/api/v5/dex/aggregator/quote
  ?chainId=196
  &fromTokenAddress=USDT
  &toTokenAddress=OKB
  &amount=1000000

// Execute best-route swap across 500+ X Layer DEXs
GET https://www.okx.com/api/v5/dex/aggregator/swap
  ?chainId=196
  &fromTokenAddress=...
  &toTokenAddress=...
  &userWalletAddress=ALLOCATOR_ADDRESS
```

Signal Price Agent reads OKB/USDT price every cycle and calculates momentum over a 30-point sliding window to generate BUY/SELL/HOLD signals.

Allocator Agent executes real swaps on X Layer via the DEX Aggregator when decision is BUY or SELL.

### 2. Wallet API
**Used by:** Signal Flow Agent

```javascript
// Monitor X Layer wallet activity
GET https://www.okx.com/api/v5/wallet/post-transaction/transactions
  ?address=WATCHED_WALLET
  &chainIndex=196
  &limit=20
```

Signal Flow Agent monitors 3 active X Layer wallets every cycle, aggregating net buy vs sell pressure to generate a smart money flow signal.

### 3. x402 Protocol
**Used by:** Allocator Agent

After every successful allocation cycle, the Allocator Agent autonomously pays both signal agents via x402 micro-payments on X Layer. This creates real machine-to-machine payment flows — two real X Layer transactions per cycle.

```javascript
// Direct ETH transfer on X Layer — x402 pattern
await allocatorWallet.sendTransaction({
  to: signalAgentAddress,
  value: ethers.parseEther(SIGNAL_FEE_ETH),
});
```

### 4. MCP Integration
**Used by:** Allocator Agent

Every allocation decision, credit score update, and cycle outcome is permanently logged onchain via MCP — creating a fully verifiable audit trail.

```javascript
// Encode decision data and broadcast to X Layer
const encodedDecision = ethers.hexlify(
  ethers.toUtf8Bytes(JSON.stringify({
    system: 'AUREX',
    event: 'ALLOCATION_CYCLE',
    priceSignal, flowSignal,
    creditScores, finalDecision,
    tradeHash, timestamp,
  }))
);
await allocatorWallet.sendTransaction({
  to: allocatorWallet.address,
  data: encodedDecision, // Permanent MCP log
});
```

---

## The Economy Loop

Every 2 minutes, AUREX runs a complete autonomous cycle:

```
1. Price Signal Generation
   → Onchain OS DEX API fetches OKB price
   → Calculates momentum over 30 data points
   → Outputs: BUY/SELL/HOLD + confidence score

2. Flow Signal Generation
   → Onchain OS Wallet API monitors wallets
   → Aggregates net buy/sell pressure
   → Outputs: BUY/SELL/HOLD + flow strength

3. Credit Score Evaluation
   → score = (signal accuracy × 70%) + (x402 payment reliability × 30%)
   → Agents with higher scores get more capital influence

4. Credit-Weighted Decision
   → Signals combined proportional to credit scores
   → Highest weighted vote determines final decision

5. Trade Execution on X Layer
   → Onchain OS DEX Aggregator executes real swap
   → Routes through 500+ X Layer DEXs for best price

6. x402 Inter-Agent Payments
   → Allocator pays both signal agents automatically
   → 2 real X Layer transactions per cycle

7. MCP Onchain Logging
   → Complete cycle data logged permanently onchain
   → Verifiable on X Layer explorer

8. Credit Score Update
   → Correct signal → score rises
   → Wrong signal → score falls
   → Next cycle allocation adjusts automatically
```

---

## Credit Score Formula

```
Credit Score (0-100) = (Signal Accuracy × 70) + (Payment Reliability × 30)

Where:
  Signal Accuracy    = correctSignals / totalSignals
  Payment Reliability = x402PaymentsOnTime / x402PaymentsMade

New agents start at 50/100
Scores update after every allocation cycle
All history is permanent and onchain via MCP
```

---

## Working Mechanics

### How Agents Compete

| Agent | Credit Score | Capital Allocation | x402 Earnings |
|-------|-------------|-------------------|---------------|
| Price Signal Agent | 82/100 | 53.7% | Higher |
| Flow Signal Agent | 68/100 | 46.3% | Lower |

The agent with higher credit score receives more capital weight. Their signal has more influence on the final decision. They earn more x402 fees. This creates competitive pressure to improve signal accuracy.

### How New Agents Join

1. Visit [aurex-liard.vercel.app/registry](https://aurex-liard.vercel.app/registry)
2. Connect any Web3 wallet (MetaMask, OKX Wallet, Coinbase, Trust Wallet)
3. Enter agent name and signal type
4. Register — receive starting score of 50/100
5. Submit accurate signals each cycle to increase score
6. Earn x402 fees proportional to credit score

---

## Project Structure

```
aurex/
├── agents/
│   ├── signal-price.js      # Price momentum signal agent
│   ├── signal-flow.js       # Wallet flow signal agent
│   └── allocator.js         # Credit scoring + allocation agent
├── lib/
│   ├── xlayer.js            # X Layer RPC connection (drpc)
│   ├── wallet.js            # Agentic wallet management
│   ├── onchain.js           # Onchain OS API integration
│   ├── price.js             # DEX price feed module
│   ├── walletflow.js        # Wallet activity analysis
│   ├── swap.js              # DEX swap execution
│   ├── x402.js              # x402 inter-agent payments
│   ├── mcp.js               # MCP onchain logging
│   └── nonce.js             # Nonce management for concurrent txns
├── core/
│   ├── engine.js            # Main autonomous agent loop
│   ├── credit.js            # Credit score calculation
│   └── allocator-logic.js   # Capital weighting algorithm
├── data/
│   ├── credit.json          # Agent credit scores
│   ├── signals.json         # Signal history
│   └── allocations.json     # Allocation history
├── app/                     # Next.js frontend
│   ├── page.js              # Main dashboard
│   ├── agents/page.js       # Agentic wallets page
│   ├── leaderboard/page.js  # Credit rankings
│   ├── economy/page.js      # Economy loop visualization
│   └── registry/page.js     # Agent registration + wallet connect
├── server/
│   └── api.js               # Express REST API
└── scripts/
    └── generateWallets.js   # Agentic wallet generator
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | X Layer (Chain ID: 196) |
| Smart Wallet | ethers.js v6 |
| Onchain OS | DEX API + Wallet API + x402 + MCP |
| RPC | drpc.org (X Layer public RPC) |
| Backend | Node.js + Express |
| Frontend | Next.js 14 + React 18 |
| Deployment | Render (backend + engine) + Vercel (frontend) |
| Data | JSON file persistence |

---

## Local Setup

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
git clone https://github.com/Shanks-btc/aurex
cd aurex
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# X Layer
XLAYER_RPC_URL=https://xlayer.drpc.org
XLAYER_CHAIN_ID=196

# Onchain OS API Key
# Get from: https://www.okx.com/web3/build/dev-hub
ONCHAIN_OS_API_KEY=your_key_here

# Generate with: npm run wallets
SIGNAL_PRICE_PRIVATE_KEY=
SIGNAL_PRICE_ADDRESS=

SIGNAL_FLOW_PRIVATE_KEY=
SIGNAL_FLOW_ADDRESS=

ALLOCATOR_PRIVATE_KEY=
ALLOCATOR_ADDRESS=

# X Layer Token Addresses
OKB_ADDRESS=0xe538905cf8410324e03a5a23c1c177a474d59b2
USDT_ADDRESS=0x1e4a5963abfd975d8c9021ce480b42188849d41d

# Config
LOOP_INTERVAL_MS=120000
TRADE_AMOUNT=5
SIGNAL_FEE_ETH=0.0001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Generate Agentic Wallets

```bash
npm run wallets
```

Fund `ALLOCATOR_ADDRESS` with OKB on X Layer:
[https://www.okx.com/xlayer/bridge](https://www.okx.com/xlayer/bridge)

### Run Locally

```bash
# Terminal 1 — Backend API
npm start

# Terminal 2 — Agent Engine
npm run agent

# Terminal 3 — Frontend
npm run build && npx next start
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | System health check |
| `GET /api/status` | Live system status + balances |
| `GET /api/credit` | Agent credit scores |
| `GET /api/allocations` | Allocation cycle history |
| `GET /api/agents` | Registered agent wallets |
| `GET /api/signals` | Signal history |



## Render Deployment

### Backend API Service
```
Type:          Web Service
Build Command: npm install
Start Command: node server/api.js
```

### Agent Engine Service
```
Type:          Web Service
Build Command: npm install
Start Command: node core/engine.js
```

### Frontend (Vercel)
```
Framework:     Next.js
Build Command: next build
Environment:
  NEXT_PUBLIC_API_URL=https://aurex-backend-wlc4.onrender.com
  NEXT_PUBLIC_SIGNAL_PRICE_ADDRESS=...
  NEXT_PUBLIC_SIGNAL_FLOW_ADDRESS=...
  NEXT_PUBLIC_ALLOCATOR_ADDRESS=...


## Onchain Verification

All AUREX activity is permanently verifiable on X Layer:

**Allocator Wallet:**
```
https://www.oklink.com/xlayer/address/0xa98f386e036433ae0630f1d87b77f28f2011cefe
```

Each transaction contains encoded MCP data in the input field — you can decode it to see the exact signals, credit scores, and decisions made each cycle.

**Sample decoded MCP log:**
```json
{
  "system": "AUREX",
  "version": "1.0.0",
  "chainId": 196,
  "event": "CREDIT_SCORE_UPDATE",
  "agentRole": "signal-price",
  "oldScore": 81,
  "newScore": 82,
  "scoreDelta": 1,
  "reason": "Correct signal rewarded"
}

## Team

| Member | Role | Contact |
|--------|------|---------|
| Shanks | Builder | [@Shanks_btc](https://twitter.com/Shanks_btc) |

---

## Hackathon Submission

- **Hackathon:** OKX Build X Hackathon Season 2
- **Track:** Skills Arena — Human Track
- **Agentic Wallet:** `0xa98f386e036433ae0630f1d87b77f28f2011cefe`
- **Live Demo:** [aurex-liard.vercel.app](https://aurex-liard.vercel.app)
- **X Post:** [View on X](https://x.com/AUREXprotocol)


## What's Next

AUREX is a foundation. Future development:

- **Multi-chain credit** — credit scores that follow agents across chains
- **Credit delegation** — established agents vouch for new agents
- **Decentralized registry** — onchain smart contract registry
- **Signal marketplace** — agents sell signal subscriptions
- **Credit-backed loans** — agents borrow capital against credit score

---

*AUREX — The credit infrastructure for autonomous agents*
