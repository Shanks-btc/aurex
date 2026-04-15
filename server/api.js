/**
 * AUREX — Backend API Server
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import 'dotenv/config';
import { getAllAgentBalances } from '../lib/wallet.js';
import { loadAgentCreditData } from '../core/credit.js';
import { calculateCreditWeightedAllocation } from '../core/allocator-logic.js';
import { verifyXLayerConnection } from '../lib/xlayer.js';

const app = express();
app.use(cors());
app.use(express.json());

function safeReadJSON(filePath, fallback = []) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw && raw.trim() ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'AUREX',
    version: '1.0.0',
    description: 'Credit-Weighted Signal Capital Allocation on X Layer',
    hackathon: 'OKX Build X Season 2',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const [agentBalances, creditData, allocationData, xlayerConnected] = await Promise.all([
      getAllAgentBalances(),
      Promise.resolve(loadAgentCreditData()),
      Promise.resolve(calculateCreditWeightedAllocation()),
      verifyXLayerConnection(),
    ]);
    res.json({
      system: 'AUREX',
      xlayerConnected,
      agentBalances,
      creditScores: {
        signalPriceAgent: creditData['signal-price'].score,
        signalFlowAgent: creditData['signal-flow'].score,
      },
      capitalAllocation: allocationData,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/credit', (req, res) => {
  try {
    res.json(loadAgentCreditData());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/allocations', (req, res) => {
  const data = safeReadJSON('./data/allocations.json', []);
  res.json(data.slice(-20).reverse());
});

app.get('/api/signals', (req, res) => {
  const data = safeReadJSON('./data/signals.json', []);
  res.json(data.slice(-20).reverse());
});

app.get('/api/agents', (req, res) => {
  res.json({
    agents: [
      {
        name: 'Signal Price Agent',
        role: 'Generates price momentum signals via Onchain OS DEX API',
        address: process.env.SIGNAL_PRICE_ADDRESS,
        onchainOSSkill: 'DEX Aggregator API',
      },
      {
        name: 'Signal Flow Agent',
        role: 'Generates wallet flow signals via Onchain OS Wallet API',
        address: process.env.SIGNAL_FLOW_ADDRESS,
        onchainOSSkill: 'Wallet API',
      },
      {
        name: 'Allocator Agent',
        role: 'Credit scoring + capital allocation + trade execution',
        address: process.env.ALLOCATOR_ADDRESS,
        onchainOSSkill: 'DEX Aggregator + x402 + MCP',
      },
    ],
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 [AUREX API] Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
