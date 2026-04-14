/**
 * AUREX — Wallet Flow Analysis Module
 * Onchain OS Skill: Wallet API — Smart money activity monitoring
 *
 * Monitors X Layer wallet activity to detect buying/selling pressure
 * Used exclusively by Signal Flow Agent
 */

import { fetchWalletActivityFromOnchainOS } from './onchain.js';
import 'dotenv/config';

// Active X Layer wallets to monitor for smart money signals
const MONITORED_XLAYER_WALLETS = [
  process.env.WATCH_WALLET_1 || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  process.env.WATCH_WALLET_2 || '0x8ba1f109551bD432803012645Ac136cc1836bA',
  process.env.WATCH_WALLET_3 || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
];

/**
 * analyzeTransactionsForTokenFlow(transactions)
 * Detects buy/sell activity from transaction list
 * Counts token receive = buy, token send = sell
 */
function analyzeTransactionsForTokenFlow(transactions) {
  let buySignals = 0;
  let sellSignals = 0;

  for (const tx of transactions) {
    const transfers = tx.tokenTransferDetails || [];
    for (const transfer of transfers) {
      if (transfer.direction === 'receive') buySignals++;
      if (transfer.direction === 'send') sellSignals++;
    }
  }

  return { buySignals, sellSignals };
}

/**
 * aggregateXLayerWalletFlow()
 * Fetches activity from all monitored wallets via Onchain OS
 * Returns net buy/sell pressure across all wallets
 */
export async function aggregateXLayerWalletFlow() {
  let totalBuyPressure = 0;
  let totalSellPressure = 0;

  for (const walletAddress of MONITORED_XLAYER_WALLETS) {
    const transactions = await fetchWalletActivityFromOnchainOS(walletAddress);
    const { buySignals, sellSignals } = analyzeTransactionsForTokenFlow(transactions);
    totalBuyPressure += buySignals;
    totalSellPressure += sellSignals;
  }

  return {
    totalBuyPressure,
    totalSellPressure,
    netFlowPressure: totalBuyPressure - totalSellPressure,
    walletsMonitored: MONITORED_XLAYER_WALLETS.length,
  };
}