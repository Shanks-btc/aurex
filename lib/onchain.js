
/**
 * AUREX — Onchain OS Integration Module
 *
 * AUREX uses THREE Onchain OS skill modules:
 * 1. DEX Aggregator API  → price feeds + swap execution
 * 2. Wallet API          → wallet activity monitoring
 * 3. x402 Protocol       → inter-agent micro-payments
 */

import axios from 'axios';
import https from 'https';
import 'dotenv/config';

const ONCHAIN_OS_BASE_URL = 'https://www.okx.com/api/v5/dex';
const ONCHAIN_OS_WALLET_URL = 'https://www.okx.com/api/v5/wallet';
const XLAYER_CHAIN_ID = 196;

// Fix TLS issues
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
});

const onchainAxios = axios.create({
  httpsAgent,
  timeout: 20000,
  headers: {
    'OK-ACCESS-KEY': process.env.ONCHAIN_OS_API_KEY,
    'Content-Type': 'application/json',
  },
});

/**
 * fetchTokenPriceFromOnchainOS(tokenAddress)
 * Onchain OS Skill: DEX Aggregator — fetch OKB price on X Layer
 * Uses quote endpoint to get real token price
 */
export async function fetchTokenPriceFromOnchainOS(tokenAddress) {
  try {
    // Primary: use token list endpoint to get price
    const response = await onchainAxios.get(
      `${ONCHAIN_OS_BASE_URL}/aggregator/quote`,
      {
        params: {
          chainId: XLAYER_CHAIN_ID,
          fromTokenAddress: '0x1e4a5963abfd975d8c9021ce480b42188849d41d', // USDT
          toTokenAddress: tokenAddress, // OKB
          amount: '1000000', // 1 USDT (6 decimals)
        },
      }
    );

    const data = response.data?.data;
    if (data && data.length > 0) {
      const quote = data[0];
      // Calculate price from quote ratio
      const fromAmount = parseFloat(quote.fromTokenAmount);
      const toAmount = parseFloat(quote.toTokenAmount);
      const fromDecimals = parseInt(quote.fromToken?.decimal || 6);
      const toDecimals = parseInt(quote.toToken?.decimal || 18);
      const price = (fromAmount / 10 ** fromDecimals) / (toAmount / 10 ** toDecimals);
      console.log(`📡 [Onchain OS DEX] OKB price fetched: $${price.toFixed(4)}`);
      return price;
    }
    return null;
  } catch (err) {
    // Fallback: try market price endpoint
    try {
      const fallback = await onchainAxios.get(
        `${ONCHAIN_OS_BASE_URL}/aggregator/token-detail`,
        {
          params: {
            chainId: XLAYER_CHAIN_ID,
            tokenContractAddress: tokenAddress,
          },
        }
      );
      const price = fallback.data?.data?.tokenPrice
        || fallback.data?.data?.price
        || null;
      if (price) {
        console.log(`📡 [Onchain OS DEX] OKB price fetched (fallback): $${price}`);
        return parseFloat(price);
      }
    } catch (fallbackErr) {
      console.error(`❌ [Onchain OS DEX] Price fetch failed: ${fallbackErr.message}`);
    }
    return null;
  }
}

/**
 * getSwapQuoteFromOnchainOS(fromToken, toToken, amount, userAddress)
 * Onchain OS Skill: DEX Aggregator — best swap route on X Layer
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
 * Onchain OS Skill: DEX Aggregator — build swap transaction for X Layer
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
 * fetchWalletActivityFromOnchainOS(walletAddress)
 * Onchain OS Skill: Wallet API — transaction history on X Layer
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
    // Try alternative wallet endpoint
    try {
      const alt = await onchainAxios.get(
        `${ONCHAIN_OS_WALLET_URL}/post-transaction/transactions-by-address`,
        {
          params: {
            address: walletAddress,
            chains: XLAYER_CHAIN_ID,
            limit: 20,
          },
        }
      );
      const transactions = alt.data?.data?.[0]?.transactionList || [];
      console.log(`📡 [Onchain OS Wallet] ${transactions.length} txns fetched (alt endpoint)`);
      return transactions;
    } catch (altErr) {
      console.error(`❌ [Onchain OS Wallet] Activity fetch failed: ${altErr.message}`);
      return [];
    }
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
    console.log(`📡 [Onchain OS Wallet] Balances fetched`);
    return response.data?.data || [];
  } catch (err) {
    console.error(`❌ [Onchain OS Wallet] Balance fetch failed: ${err.message}`);
    return [];
  }
}
