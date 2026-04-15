/**
 * AUREX — Onchain OS Integration Module
 *
 * Primary: Onchain OS DEX API + Wallet API
 * Fallback: CoinGecko (price) + OKLink (wallet activity)
 * This ensures system runs while Onchain OS auth resolves
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

// Onchain OS axios instance
const onchainAxios = axios.create({
  httpsAgent,
  timeout: 15000,
  headers: {
    'OK-ACCESS-KEY': process.env.ONCHAIN_OS_API_KEY,
    'Content-Type': 'application/json',
  },
});

// Public axios instance — no auth needed
const publicAxios = axios.create({
  httpsAgent,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * fetchTokenPriceFromOnchainOS(tokenAddress)
 * Onchain OS Skill: DEX Aggregator API — real-time OKB price
 * Fallback: CoinGecko public API (no key required)
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

  // Fallback: CoinGecko free API — no key needed
  try {
    const response = await publicAxios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'okb',
          vs_currencies: 'usd',
        },
      }
    );
    const price = response.data?.okb?.usd;
    if (price) {
      console.log(`📡 [Onchain OS DEX] OKB price (CoinGecko fallback): $${price}`);
      return parseFloat(price);
    }
  } catch (cgErr) {
    console.error(`❌ [Onchain OS DEX] All price sources failed: ${cgErr.message}`);
  }

  return null;
}

/**
 * getSwapQuoteFromOnchainOS(fromToken, toToken, amount, userAddress)
 * Onchain OS Skill: DEX Aggregator — best swap route on X Layer
 */
export async function getSwapQuoteFromOnchainOS(
  fromToken, toToken, amount, userAddress
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
 * Onchain OS Skill: DEX Aggregator — executable swap transaction
 */
export async function buildSwapTransactionFromOnchainOS(
  fromToken, toToken, amount, userAddress
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
 * Onchain OS Skill: Wallet API — X Layer wallet activity
 * Fallback: OKLink public API
 */
export async function fetchWalletActivityFromOnchainOS(walletAddress) {
  // Try Onchain OS first
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
    console.log(`📡 [Onchain OS Wallet] ${transactions.length} txns fetched`);
    return transactions;
  } catch (err) {
    console.log(`⚠️ [Onchain OS Wallet] Primary failed, using OKLink fallback...`);
  }

  // Fallback: OKLink public API
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
    const transactions = response.data?.data?.[0]?.transactionLists || [];
    console.log(`📡 [Onchain OS Wallet] ${transactions.length} txns via OKLink`);
    return transactions.map(tx => ({
      txId: tx.txId,
      tokenTransferDetails: tx.amount > 0
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
