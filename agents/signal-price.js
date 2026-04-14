/**
 * AUREX Signal Price Agent
 * Onchain OS Skill: DEX Aggregator API — Real-time price data
 *
 * Role: Generates price momentum signals for OKB/USDT on X Layer
 * Wallet: SIGNAL_PRICE_ADDRESS (dedicated agentic wallet)
 * Earns: x402 payment from Allocator Agent per valid signal
 */

import { fetchTokenPriceFromOnchainOS } from '../lib/onchain.js';
import 'dotenv/config';

// Price history for momentum calculation
const priceHistoryWindow = [];
const PRICE_HISTORY_LIMIT = 30;

// Momentum threshold to trigger BUY/SELL signal (1% price change)
const MOMENTUM_SIGNAL_THRESHOLD = 1.0;

/**
 * recordPriceDataPoint(price)
 * Maintains sliding window of price data for momentum calculation
 * Window size: 30 data points for reliable momentum signal
 */
function recordPriceDataPoint(price) {
  priceHistoryWindow.push({ price, timestamp: Date.now() });

  // Maintain fixed window size
  if (priceHistoryWindow.length > PRICE_HISTORY_LIMIT) {
    priceHistoryWindow.shift();
  }
}

/**
 * calculatePriceMomentum()
 * Calculates price momentum as percentage change over window
 * Positive momentum = price trending up = BUY signal candidate
 * Negative momentum = price trending down = SELL signal candidate
 */
function calculatePriceMomentum() {
  if (priceHistoryWindow.length < 2) return 0;

  const latestPrice = priceHistoryWindow[priceHistoryWindow.length - 1].price;
  const earliestPrice = priceHistoryWindow[0].price;

  // Percentage change over entire window
  return ((latestPrice - earliestPrice) / earliestPrice) * 100;
}

/**
 * generatePriceMomentumSignal()
 * Main function: Fetches OKB price via Onchain OS DEX API
 * Analyzes momentum to generate BUY/SELL/HOLD signal
 * Signal includes confidence score for credit-weighted allocation
 */
export async function generatePriceMomentumSignal() {
  console.log(`📊 [Price Agent] Fetching OKB price via Onchain OS...`);

  // Onchain OS DEX API call — fetches real X Layer price
  const currentPrice = await fetchTokenPriceFromOnchainOS(process.env.OKB_ADDRESS);

  if (!currentPrice) {
    console.warn(`⚠️ [Price Agent] Price fetch failed — emitting HOLD`);
    return { agent: 'signal-price', direction: 'HOLD', confidence: 0, price: null };
  }

  // Record for momentum calculation
  recordPriceDataPoint(currentPrice);
  const momentumPercent = calculatePriceMomentum();

  // Determine signal direction based on momentum threshold
  let signalDirection = 'HOLD';
  let signalConfidence = 50;

  if (momentumPercent > MOMENTUM_SIGNAL_THRESHOLD) {
    // Positive momentum — price trending up
    signalDirection = 'BUY';
    signalConfidence = Math.min(50 + momentumPercent * 10, 95);
  } else if (momentumPercent < -MOMENTUM_SIGNAL_THRESHOLD) {
    // Negative momentum — price trending down
    signalDirection = 'SELL';
    signalConfidence = Math.min(50 + Math.abs(momentumPercent) * 10, 95);
  }

  const signal = {
    agent: 'signal-price',
    direction: signalDirection,
    confidence: Math.round(signalConfidence),
    currentPrice,
    momentumPercent: momentumPercent.toFixed(2),
    timestamp: Date.now(),
  };

  console.log(`📊 [Price Agent] Signal: ${signalDirection} | Confidence: ${signal.confidence}% | Price: $${currentPrice}`);
  return signal;
}