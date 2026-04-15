/**
 * AUREX — X Layer Connection Module
 */

import { ethers } from 'ethers';
import 'dotenv/config';

let provider;

export function getXLayerProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(
      process.env.XLAYER_RPC_URL,
      undefined,
      {
        batchMaxCount: 1, // Disable batching — drpc free tier limit
        batchMaxSize: 1,
        staticNetwork: true,
      }
    );
  }
  return provider;
}

export async function verifyXLayerConnection() {
  try {
    const p = getXLayerProvider();
    const blockNumber = await p.getBlockNumber();
    const network = await p.getNetwork();
    console.log(`✅ [X Layer] Connected | Chain ID: ${network.chainId} | Block: ${blockNumber}`);
    return true;
  } catch (err) {
    console.error(`❌ [X Layer] Connection failed: ${err.message}`);
    return false;
  }
}

export async function getXLayerGasPrice() {
  try {
    const p = getXLayerProvider();
    const feeData = await p.getFeeData();
    return feeData.gasPrice;
  } catch (err) {
    console.error(`❌ [X Layer] Gas price fetch failed: ${err.message}`);
    return null;
  }
}

export async function getXLayerBlockNumber() {
  try {
    const p = getXLayerProvider();
    return await p.getBlockNumber();
  } catch (err) {
    console.error(`❌ [X Layer] Block fetch failed: ${err.message}`);
    return null;
  }
}
