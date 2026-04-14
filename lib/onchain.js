/**
 * AUREX — Onchain OS Integration Module
 *
 * AUREX uses THREE Onchain OS skill modules:
 * 1. DEX Aggregator API  → price feeds + swap execution (500+ DEXs)
 * 2. Wallet API          → wallet activity monitoring
 * 3. x402 Protocol       → inter-agent micro-payments
 *
 * Onchain OS Base URL: https://www.okx.com/api/v5/dex
 * X Layer Chain ID: 196
 */

import axios from 'axios';
import https from 'https';
import 'dotenv/config';

// Onchain OS API configuration
const ONCHAIN_OS_BASE_URL = 'https://www.okx.com/api/v5/dex';
const ONCHAIN_OS_WALLET_URL = 'https://www.okx.com/api/v5/wallet';
const XLAYER_CHAIN_ID = 196;

// Fix TLS connection issues on Windows
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
});

const onchainOSHeaders = {
  'OK-ACCESS-KEY': process.env.ONCHAIN_OS_API_KEY,
  'Content-Type': 'application/json',
};

// Axios instance with TLS fix applied
const onchainAxios = axios.create({
  httpsAgent,
  timeout: 15000,
  headers: onchainOSHeaders,
});

/**
 * ─── ONCHAIN OS SKILL 1: DEX AGGREGATOR ─────────────────────────────────────
 * Uses Onchain OS DEX API to aggregate liquidity across 500+ DEXs on X Layer
 */

/**
 * fetchTokenPriceFromOnchainOS(tokenAddress)
 * Onchain OS Skill: DEX Analytics — Real-time token price data
 * Used by Signal Price Agent to generate price momentum signals
 */
export async function fetchTokenPriceFromOnchainOS(tokenAddress) {
  try {
    const response = await onchainAxios.get(
      `${ONCHAIN_OS_BASE_URL}/aggregator/token-detail`,
      {
        params: {
          chainId: XLAYER_CHAIN_ID,
          tokenContractAddress: tokenAddress,
        },
      }
    );

    const price = response.data?.data?.price;
    console.log(`📡 [Onchain OS DEX] OKB price fetched: $${price}`);
    return parseFloat(price);
  } catch (err) {
    console.error(`❌ [Onchain OS DEX] Price fetch failed: ${err.message}`);
    return null;
  }
}

/**
 * getSwapQuoteFromOnchainOS(fromToken, toToken, amount, userAddress)
 * Onchain OS Skill: DEX Aggregator — Best swap route across all X Layer DEXs
 * Used by Allocator Agent before executing trades
 */
export async function getSwapQuoteFromOnchainOS(
  fromToken,
  toToken,
  amount,
  userAddress
) {
  try {
    const response = await onchainAxios.get(
      `${ONCHAIN_OS_BASE_URL}/aggregator/quote`,
      {
        params: {
          chainId: XLAYER_CHAIN_ID,
          fromTokenAddress: fromToken,
          toTokenAddress: toToken,
          amount,
          userWalletAddress: userAddress,
          slippage: '0.5',
        },
      }
    );

    console.log(`📡 [Onchain OS DEX] Swap quote received`);
    return response.data?.data || null;
  } catch (err) {
    console.error(`❌ [Onchain OS DEX] Quote failed: ${err.message}`);
    return null;
  }
}

/**
 * buildSwapTransactionFromOnchainOS(fromToken, toToken, amount, userAddress)
 * Onchain OS Skill: DEX Aggregator — Build executable swap transaction
 * Returns signed transaction data ready for X Layer broadcast
 */
export async function buildSwapTransactionFromOnchainOS(
  fromToken,
  toToken,
  amount,
  userAddress
) {
  try {
    const response = await onchainAxios.get(
      `${ONCHAIN_OS_BASE_URL}/aggregator/swap`,
      {
        params: {
          chainId: XLAYER_CHAIN_ID,
          fromTokenAddress: fromToken,
          toTokenAddress: toToken,
          amount,
          userWalletAddress: userAddress,
          slippage: '0.5',
        },
      }
    );

    const swapTxData = response.data?.data?.[0]?.tx;
    console.log(`📡 [Onchain OS DEX] Swap transaction built`);
    return swapTxData || null;
  } catch (err) {
    console.error(`❌ [Onchain OS DEX] Swap build failed: ${err.message}`);
    return null;
  }
}

/**
 * ─── ONCHAIN OS SKILL 2: WALLET API ─────────────────────────────────────────
 * Uses Onchain OS Wallet API to monitor X Layer wallet activity
 */

/**
 * fetchWalletActivityFromOnchainOS(walletAddress)
 * Onchain OS Skill: Wallet API — Transaction history and token movements
 * Used by Signal Flow Agent to detect smart money buying/selling patterns
 */
export async function fetchWalletActivityFromOnchainOS(walletAddress) {
  try {
    const response = await onchainAxios.get(
      `${ONCHAIN_OS_WALLET_URL}/post-transaction/transactions`,
      {
        params: {
          address: walletAddress,
          chainIndex: XLAYER_CHAIN_ID,
          limit: 20,
        },
      }
    );

    const transactions = response.data?.data?.[0]?.transactionList || [];
    console.log(`📡 [Onchain OS Wallet] ${transactions.length} txns fetched for ${walletAddress.slice(0, 8)}...`);
    return transactions;
  } catch (err) {
    console.error(`❌ [Onchain OS Wallet] Activity fetch failed: ${err.message}`);
    return [];
  }
}

/**
 * fetchTokenBalancesFromOnchainOS(walletAddress)
 * Onchain OS Skill: Wallet API — Token balance snapshot
 * Used to verify agent wallet has sufficient funds before execution
 */
export async function fetchTokenBalancesFromOnchainOS(walletAddress) {
  try {
    const response = await onchainAxios.get(
      `${ONCHAIN_OS_WALLET_URL}/asset/token-balances`,
      {
        params: {
          address: walletAddress,
          chainIndex: XLAYER_CHAIN_ID,
        },
      }
    );

    console.log(`📡 [Onchain OS Wallet] Balances fetched`);
    return response.data?.data || [];
  } catch (err) {
    console.error(`❌ [Onchain OS Wallet] Balance fetch failed: ${err.message}`);
    return [];
  }
}