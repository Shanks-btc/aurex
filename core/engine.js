/**
 * AUREX — Main Agent Engine
 * Runs on Render as Web Service with health server
 */

import 'dotenv/config';
import http from 'http';
import { verifyXLayerConnection } from '../lib/xlayer.js';
import { generatePriceMomentumSignal } from '../agents/signal-price.js';
import { generateWalletFlowSignal } from '../agents/signal-flow.js';
import { runAllocationCycle } from '../agents/allocator.js';
import { loadAgentCreditData } from './credit.js';
import { getAllAgentBalances } from '../lib/wallet.js';

let cycleCount = 0;
let engineRunning = false;

function displayAUREXBanner() {
  console.log(`
╔═══════════════════════════════════════════╗
║        AUREX — X Layer Agent System       ║
║  Credit-Weighted Signal Allocation        ║
║  OKX Build X Hackathon Season 2           ║
╚═══════════════════════════════════════════╝
  `);
}

async function runAutonomousAgentCycle() {
  cycleCount++;
  console.log(`\n🔄 ═══ AUREX CYCLE #${cycleCount} ═══`);

  const currentCreditData = loadAgentCreditData();
  console.log(`📊 Credit Scores:`);
  console.log(`   Price Agent: ${currentCreditData['signal-price'].score}/100`);
  console.log(`   Flow Agent:  ${currentCreditData['signal-flow'].score}/100`);

  const [priceSignal, flowSignal] = await Promise.all([
    generatePriceMomentumSignal(),
    generateWalletFlowSignal(),
  ]);

  const result = await runAllocationCycle(priceSignal, flowSignal);

  console.log(`✅ Cycle #${cycleCount} done | Decision: ${result.finalDecision}`);
  return result;
}

export async function startAUREXEngine() {
  displayAUREXBanner();

  const isConnected = await verifyXLayerConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to X Layer. Check XLAYER_RPC_URL');
    process.exit(1);
  }

  const balances = await getAllAgentBalances();
  console.log(`\n💰 Agent Balances:`);
  console.log(`   Price Agent:     ${balances.signalPriceAgent} OKB`);
  console.log(`   Flow Agent:      ${balances.signalFlowAgent} OKB`);
  console.log(`   Allocator Agent: ${balances.allocatorAgent} OKB`);

  engineRunning = true;
  const loopIntervalMs = parseInt(process.env.LOOP_INTERVAL_MS) || 120000;
  console.log(`\n🚀 Engine started | Interval: ${loopIntervalMs / 1000}s`);

  // Start health server to keep Render web service alive
  const PORT = process.env.PORT || 3002;
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      project: 'AUREX Engine',
      cycleCount,
      engineRunning,
    }));
  }).listen(PORT, () => {
    console.log(`🌐 Engine health server on port ${PORT}`);
  });

  // Main autonomous loop
  while (engineRunning) {
    try {
      await runAutonomousAgentCycle();
    } catch (err) {
      console.error(`❌ Cycle error: ${err.message}`);
    }
    console.log(`⏳ Next cycle in ${loopIntervalMs / 1000}s...`);
    await new Promise(r => setTimeout(r, loopIntervalMs));
  }
}

startAUREXEngine().catch(console.error);
