/**
 * AUREX — Onchain OS Integration Module
 *
 * Onchain OS Skills Used:
 * 1. DEX Aggregator API  → price feeds + swap execution
 * 2. Wallet API          → wallet activity monitoring
 * 3. x402 Protocol       → inter-agent micro-payments
 *
 * Fallbacks:
 * - CryptoCompare API (price) — free, no key needed
 * - OKLink Explorer API (wallet activity)
 */

import axios from 'axios';
import https from 'https';
import 'dotenv/config';

const ONCHAIN_OS_BASE_URL = 'https://www.okx.com/api/v5/dex';
const ONCHAIN_OS_WALLET_URL = 'https://www.okx.com/api/v5/wallet';
const XLAYER_CHAIN_ID = 196;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
});

const onchainAxios = axios.create({
  httpsAgent,
  timeout: 15000,
  headers: {
    'OK-ACCESS-KEY': process.env.ONCHAIN_OS_API_KEY,
    'Content-Type': 'application/json',
  },
});

const publicAxios = axios.create({
  httpsAgent,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * fetchTokenPriceFromOnchainOS(tokenAddress)
 * Onchain OS Skill: DEX Aggregator API — real-time OKB price on X Layer
 * Fallback: CryptoCompare free API
 */
export async function fetchTokenPriceFromOnchainOS(tokenAddress) {
  // Try Onchain OS first
  try {
    const response = await onchainAxios.get(
      `${ONCHAIN_OS_BASE_URL}/aggregator/quote`,
      {
        params: {
          chainId: XLAYER_CHAIN_ID,
          fromTokenAddress: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
          toTokenAddress: tokenAddress,
          amount: '1000000',
        },
      }
    );
    const data = response.data?.data;
    if (data && data.length > 0) {
      const quote = data[0];
      const fromAmount = parseFloat(quote.fromTokenAmount);
      const toAmount = parseFloat(quote.toTokenAmount);
      const price = (fromAmount / 1e6) / (toAmount / 1e18);
      console.log(`📡 [Onchain OS DEX] OKB price: $${price.toFixed(4)}`);
      return price;
    }
  } catch (err) {
    console.log(`⚠️ [Onchain OS DEX] Primary failed, using fallback...`);
  }

  // Fallback 1: CryptoCompare free API — no key, no rate limit issues
  try {
    const response = await publicAxios.get(
      'https://min-api.cryptocompare.com/data/price',
      { params: { fsym: 'OKB', tsyms: 'USD' } }
    );
    const price = response.data?.USD;
    if (price) {
      console.log(`📡 [Onchain OS DEX] OKB price (CryptoCompare fallback): $${price}`);
      return parseFloat(price);
    }
  } catch (err) {
    console.log(`⚠️ CryptoCompare failed, trying Binance...`);
  }

  // Fallback 2: Binance public API — always free
  try {
    const response = await publicAxios.get(
      'https://api.binance.com/api/v3/ticker/price',
      { params: { symbol: 'OKBUSDT' } }
    );
    const price = response.data?.price;
    if (price) {
      console.log(`📡 [Onchain OS DEX] OKB price (Binance fallback): $${price}`);
      return parseFloat(price);
    }
  } catch (err) {
    console.error(`❌ [Onchain OS DEX] All price sources failed: ${err.message}`);
  }

  return null;
}

/**
 * getSwapQuoteFromOnchainOS(fromToken, toToken, amount, userAddress)
 * Onchain OS Skill: DEX Aggregator — best swap route across X Layer DEXs
 */
export async function getSwapQuoteFromOnchainOS(fromToken, toToken, amount, userAddress) {
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
 * Onchain OS Skill: DEX Aggregator — executable swap transaction on X Layer
 */
export async function buildSwapTransactionFromOnchainOS(fromToken, toToken, amount, userAddress) {
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
 * fetchWalletActivityFromOnchainOS(walletAddress)
 * Onchain OS Skill: Wallet API — X Layer wallet transaction history
 * Fallback: OKLink Explorer public API
 */
export async function fetchWalletActivityFromOnchainOS(walletAddress) {
  // Try Onchain OS Wallet API first
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
    console.log(`⚠️ [Onchain OS Wallet] Primary failed, using OKLink fallback...`);
  }

  // Fallback: OKLink Explorer API
  try {
    const response = await publicAxios.get(
      `https://www.oklink.com/api/v5/explorer/address/transaction-list`,
      {
        params: {
          chainShortName: 'XLAYER',
          address: walletAddress,
          limit: 20,
        },
        headers: {
          'Ok-Access-Key': process.env.ONCHAIN_OS_API_KEY || '',
        },
      }
    );
    const txList = response.data?.data?.[0]?.transactionLists || [];
    console.log(`📡 [Onchain OS Wallet] ${txList.length} txns via OKLink`);
    return txList.map(tx => ({
      txId: tx.txId,
      tokenTransferDetails: parseFloat(tx.amount || 0) > 0
        ? [{ direction: 'receive' }]
        : [{ direction: 'send' }],
    }));
  } catch (fallbackErr) {
    console.error(`❌ [Onchain OS Wallet] All sources failed: ${fallbackErr.message}`);
    return [];
  }
}

/**
 * fetchTokenBalancesFromOnchainOS(walletAddress)
 * Onchain OS Skill: Wallet API — token balance snapshot
 */
export async function fetchTokenBalancesFromOnchainOS(walletAddress) {
  try {
    const response = await onchainAxios.get(
      `${ONCHAIN_OS_WALLET_URL}/asset/token-balances-by-address`,
      {
        params: {
          address: walletAddress,
          chains: XLAYER_CHAIN_ID,
        },
      }
    );
    return response.data?.data || [];
  } catch (err) {
    console.error(`❌ [Onchain OS Wallet] Balance fetch failed: ${err.message}`);
    return [];
  }
}
