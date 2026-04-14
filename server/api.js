/**
 * AUREX — Backend API Server
 * Hackathon Requirement: AI Interactive Experience
 *
 * Exposes AUREX agent data to Next.js dashboard
 * Enables real-time monitoring of:
 * - Agent credit scores
 * - Capital allocation percentages
 * - Trade execution history
 * - Agent wallet balances
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

/**
 * GET /health
 * System health check — confirms AUREX API is online
 */
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

/**
 * GET /api/status
 * Returns complete AUREX system status
 * Used by dashboard to display live agent data
 */
app.get('/api/status', async (req, res) => {
  try {
    const [
      agentBalances,
      creditData,
      allocationData,
      xlayerConnected,
    ] = await Promise.all([
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

/**
 * GET /api/credit
 * Returns detailed credit history for both signal agents
 * Shows how credit scores have evolved over time
 */
app.get('/api/credit', (req, res) => {
  try {
    const creditData = loadAgentCreditData();
    res.json(creditData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/allocations
 * Returns recent allocation cycle history
 * Shows decisions, trade hashes, and outcomes
 */
app.get('/api/allocations', (req, res) => {
  try {
    const allocationHistory = JSON.parse(
      fs.readFileSync('./data/allocations.json', 'utf8')
    );
    res.json(allocationHistory.slice(-20).reverse());
  } catch (err) {
    res.json([]);
  }
});

/**
 * GET /api/signals
 * Returns recent signal history from both agents
 */
app.get('/api/signals', (req, res) => {
  try {
    const signalHistory = JSON.parse(
      fs.readFileSync('./data/signals.json', 'utf8')
    );
    res.json(signalHistory.slice(-20).reverse());
  } catch (err) {
    res.json([]);
  }
});

/**
 * GET /api/agents
 * Returns all 3 agentic wallet addresses
 * Required for hackathon README documentation
 */
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