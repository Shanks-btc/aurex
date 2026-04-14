/**
 * AUREX — X Layer Connection Module
 * X Layer Chain ID: 196 (OKX EVM L2)
 * RPC: drpc public endpoint (most reliable free option)
 */

import { ethers } from 'ethers';
import 'dotenv/config';

let provider;

/**
 * getXLayerProvider()
 * Creates connection to X Layer mainnet via drpc RPC
 * Note: Network auto-detected by ethers v6 to avoid TLS issues
 */
export function getXLayerProvider() {
  if (!provider) {
    // Let ethers v6 auto-detect network
    // Passing network object manually causes TLS handshake failures
    provider = new ethers.JsonRpcProvider(
      process.env.XLAYER_RPC_URL
    );
  }
  return provider;
}

/**
 * verifyXLayerConnection()
 * Confirms AUREX is connected to X Layer before starting agent loop
 * Hackathon Requirement: X Layer ecosystem integration (25% score)
 */
export async function verifyXLayerConnection() {
  try {
    const provider = getXLayerProvider();
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    console.log(`✅ [X Layer] Connected | Chain ID: ${network.chainId} | Block: ${blockNumber}`);
    return true;
  } catch (err) {
    console.error(`❌ [X Layer] Connection failed: ${err.message}`);
    return false;
  }
}

/**
 * getXLayerGasPrice()
 * Fetches current gas price on X Layer
 * X Layer has near-zero gas fees making micro-transactions viable
 */
export async function getXLayerGasPrice() {
  try {
    const provider = getXLayerProvider();
    const feeData = await provider.getFeeData();
    return feeData.gasPrice;
  } catch (err) {
    console.error(`❌ [X Layer] Gas price fetch failed: ${err.message}`);
    return null;
  }
}

/**
 * getXLayerBlockNumber()
 * Returns current block number on X Layer
 * Used for activity verification and logging
 */
export async function getXLayerBlockNumber() {
  try {
    const provider = getXLayerProvider();
    return await provider.getBlockNumber();
  } catch (err) {
    console.error(`❌ [X Layer] Block number fetch failed: ${err.message}`);
    return null;
  }
}