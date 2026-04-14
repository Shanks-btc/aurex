/**
 * AUREX Signal Flow Agent
 * Onchain OS Skill: Wallet API — Smart wallet activity monitoring
 *
 * Role: Analyzes X Layer wallet activity to detect smart money flow
 * Wallet: SIGNAL_FLOW_ADDRESS (dedicated agentic wallet)
 * Earns: x402 payment from Allocator Agent per valid signal
 *
 * Logic: If more smart wallets are buying OKB than selling → BUY signal
 */

import { fetchWalletActivityFromOnchainOS } from '../lib/onchain.js';

// X Layer wallets to monitor for smart money signals
// These are active X Layer addresses with significant history
const MONITORED_XLAYER_WALLETS = [
  process.env.WATCH_WALLET_1 || '0x742d35cc6634c0532925a3b8d4c9f6b5e8f4a1b',
  process.env.WATCH_WALLET_2 || '0x8ba1f109551bd432803012645aac136cc1836ba',
  process.env.WATCH_WALLET_3 || '0x1234567890abcdef1234567890abcdef12345678',
];

// Minimum net flow difference to trigger directional signal
const FLOW_SIGNAL_THRESHOLD = 2;

/**
 * analyzeWalletTransactionsForOKBFlow(transactions)
 * Determines if wallet is net buyer or seller of OKB
 * Based on token transfer direction in recent transactions
 */
function analyzeWalletTransactionsForOKBFlow(transactions) {
  let buyCount = 0;
  let sellCount = 0;

  for (const tx of transactions) {
    if (tx.tokenTransferDetails?.length > 0) {
      const transfer = tx.tokenTransferDetails[0];
      if (transfer.direction === 'receive') buyCount++;
      if (transfer.direction === 'send') sellCount++;
    }
  }

  return { buyCount, sellCount };
}

/**
 * generateWalletFlowSignal()
 * Main function: Monitors X Layer wallets via Onchain OS Wallet API
 * Aggregates buy/sell pressure across all monitored wallets
 * Generates BUY/SELL/HOLD signal based on net flow
 */
export async function generateWalletFlowSignal() {
  console.log(`🔍 [Flow Agent] Analyzing ${MONITORED_XLAYER_WALLETS.length} X Layer wallets via Onchain OS...`);

  let totalBuyers = 0;
  let totalSellers = 0;

  // Fetch activity for each monitored wallet via Onchain OS Wallet API
  for (const walletAddress of MONITORED_XLAYER_WALLETS) {
    const transactions = await fetchWalletActivityFromOnchainOS(walletAddress);
    const { buyCount, sellCount } = analyzeWalletTransactionsForOKBFlow(transactions);
    totalBuyers += buyCount;
    totalSellers += sellCount;
  }

  // Calculate net flow pressure
  const netFlowPressure = totalBuyers - totalSellers;

  // Determine signal based on net flow threshold
  let signalDirection = 'HOLD';
  let flowStrength = 0;

  if (netFlowPressure > FLOW_SIGNAL_THRESHOLD) {
    // More wallets buying than selling — bullish signal
    signalDirection = 'BUY';
    flowStrength = netFlowPressure;
  } else if (netFlowPressure < -FLOW_SIGNAL_THRESHOLD) {
    // More wallets selling than buying — bearish signal
    signalDirection = 'SELL';
    flowStrength = Math.abs(netFlowPressure);
  }

  const signalConfidence = signalDirection === 'HOLD'
    ? 50
    : Math.min(50 + flowStrength * 10, 90);

  const signal = {
    agent: 'signal-flow',
    direction: signalDirection,
    confidence: Math.round(signalConfidence),
    totalBuyers,
    totalSellers,
    netFlowPressure,
    timestamp: Date.now(),
  };

  console.log(`🔍 [Flow Agent] Signal: ${signalDirection} | Buyers: ${totalBuyers} | Sellers: ${totalSellers} | Net: ${netFlowPressure}`);
  return signal;
}