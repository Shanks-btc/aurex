/**
 * AUREX — Main Agent Engine
 *
 * Orchestrates all AUREX agents in continuous autonomous loop:
 * Price Agent → Flow Agent → Allocator Agent
 *
 * Economy Loop:
 * Generate Signals → Credit Score → Allocate Capital →
 * Execute Trade → Pay Agents via x402 → Update Credit → Repeat
 *
 * Runs autonomously forever — zero human input required
 */

import 'dotenv/config';
import { verifyXLayerConnection } from '../lib/xlayer.js';
import { generatePriceMomentumSignal } from '../agents/signal-price.js';
import { generateWalletFlowSignal } from '../agents/signal-flow.js';
import { runAllocationCycle } from '../agents/allocator.js';
import { loadAgentCreditData } from './credit.js';
import { getAllAgentBalances } from '../lib/wallet.js';

let cycleCount = 0;
let engineRunning = false;

/**
 * displayAUREXBanner()
 * Shows system startup information
 */
function displayAUREXBanner() {
  console.log(`
╔═══════════════════════════════════════════════════╗
║          AUREX — X Layer Agent System             ║
║  Credit-Weighted Signal Capital Allocation        ║
║  OKX Build X Hackathon Season 2                   ║
╚═══════════════════════════════════════════════════╝
  `);
}

/**
 * runAutonomousAgentCycle()
 * Single cycle of AUREX autonomous agent loop
 * Each cycle creates multiple real X Layer transactions
 */
async function runAutonomousAgentCycle() {
  cycleCount++;
  console.log(`\n🔄 ═══════ AUREX CYCLE #${cycleCount} ═══════`);

  // Display current credit scores before cycle
  const currentCreditData = loadAgentCreditData();
  console.log(`\n📊 Current Credit Scores:`);
  console.log(`   Price Signal Agent: ${currentCreditData['signal-price'].score}/100`);
  console.log(`   Flow Signal Agent:  ${currentCreditData['signal-flow'].score}/100`);

  // Step 1: Run both signal agents in parallel
  // Each uses Onchain OS API to fetch real X Layer data
  console.log(`\n🤖 Running signal agents...`);
  const [priceSignal, flowSignal] = await Promise.all([
    generatePriceMomentumSignal(),  // Onchain OS DEX API
    generateWalletFlowSignal(),      // Onchain OS Wallet API
  ]);

  // Step 2: Run allocator — credit scoring + trade execution
  const cycleResult = await runAllocationCycle(priceSignal, flowSignal);

  // Display cycle summary
  console.log(`\n📋 Cycle #${cycleCount} Summary:`);
  console.log(`   Decision: ${cycleResult.finalDecision}`);
  console.log(`   Confidence: ${cycleResult.decisionConfidence}%`);
  console.log(`   Trade TX: ${cycleResult.tradeHash || 'HOLD — no trade'}`);
  console.log(`   Signal Correct: ${cycleResult.signalWasCorrect}`);

  return cycleResult;
}

/**
 * startAUREXEngine()
 * Starts autonomous AUREX agent loop
 * Runs continuously until stopped
 * Hackathon Requirement: Fully autonomous agent operation
 */
export async function startAUREXEngine() {
  displayAUREXBanner();

  // Verify X Layer connection before starting
  const isConnected = await verifyXLayerConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to X Layer. Check XLAYER_RPC_URL in .env');
    process.exit(1);
  }

  // Display initial agent wallet balances
  const initialBalances = await getAllAgentBalances();
  console.log(`\n💰 Agent Wallet Balances:`);
  console.log(`   Price Agent:     ${initialBalances.signalPriceAgent} OKB`);
  console.log(`   Flow Agent:      ${initialBalances.signalFlowAgent} OKB`);
  console.log(`   Allocator Agent: ${initialBalances.allocatorAgent} OKB`);

  engineRunning = true;
  const loopIntervalMs = parseInt(process.env.LOOP_INTERVAL_MS) || 120000;

  console.log(`\n🚀 AUREX engine started | Cycle interval: ${loopIntervalMs / 1000}s`);

  // Main autonomous loop
  while (engineRunning) {
    try {
      await runAutonomousAgentCycle();
    } catch (err) {
      console.error(`❌ Cycle error: ${err.message}`);
    }

    console.log(`\n⏳ Next cycle in ${loopIntervalMs / 1000} seconds...`);
    await new Promise(r => setTimeout(r, loopIntervalMs));
  }
}

/**
 * stopAUREXEngine()
 * Gracefully stops the autonomous agent loop
 */
export function stopAUREXEngine() {
  engineRunning = false;
  console.log('🛑 AUREX engine stopped gracefully');
}

// Auto-start when run directly
startAUREXEngine().catch(console.error);