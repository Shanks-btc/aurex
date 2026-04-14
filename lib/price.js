/**
 * AUREX — Price Data Module
 * Onchain OS Skill: DEX Aggregator API — Real-time OKB price on X Layer
 *
 * Maintains sliding price window for momentum calculation
 * Used exclusively by Signal Price Agent
 */

import { fetchTokenPriceFromOnchainOS } from './onchain.js';
import 'dotenv/config';

// Sliding window of price data points for momentum calculation
const priceDataWindow = [];
const MAX_PRICE_HISTORY = 30;

/**
 * fetchAndStorePriceDataPoint()
 * Fetches current OKB price via Onchain OS DEX API
 * Stores in sliding window for momentum analysis
 */
export async function fetchAndStorePriceDataPoint() {
  const currentPrice = await fetchTokenPriceFromOnchainOS(
    process.env.OKB_ADDRESS
  );

  if (currentPrice) {
    priceDataWindow.push({
      price: parseFloat(currentPrice),
      timestamp: Date.now(),
    });

    // Maintain fixed window size — remove oldest data point
    if (priceDataWindow.length > MAX_PRICE_HISTORY) {
      priceDataWindow.shift();
    }
  }

  return currentPrice;
}

/**
 * calculatePriceMomentumPercent()
 * Calculates percentage price change over entire window
 * Positive = upward momentum = BUY candidate
 * Negative = downward momentum = SELL candidate
 */
export function calculatePriceMomentumPercent() {
  if (priceDataWindow.length < 2) return 0;

  const latestPrice = priceDataWindow[priceDataWindow.length - 1].price;
  const earliestPrice = priceDataWindow[0].price;

  return ((latestPrice - earliestPrice) / earliestPrice) * 100;
}

/**
 * getLatestPrice()
 * Returns most recent price from window
 */
export function getLatestPrice() {
  if (priceDataWindow.length === 0) return null;
  return priceDataWindow[priceDataWindow.length - 1].price;
}