/**
 * AUREX — MCP Onchain Logging Module
 * Fix: fresh nonce per transaction to avoid conflicts
 */

import { ethers } from 'ethers';
import { getAgenticWallet } from './wallet.js';
import { getXLayerProvider } from './xlayer.js';

export async function logAgentDecisionViaMCP(decisionData) {
  try {
    const allocatorWallet = getAgenticWallet('allocator');
    const provider = getXLayerProvider();

    // Get fresh nonce to avoid conflicts
    const nonce = await provider.getTransactionCount(
      allocatorWallet.address,
      'latest'
    );

    const encodedDecision = ethers.hexlify(
      ethers.toUtf8Bytes(
        JSON.stringify({
          system: 'AUREX',
          version: '1.0.0',
          chainId: 196,
          ...decisionData,
          timestamp: Date.now(),
        })
      )
    );

    const transaction = await allocatorWallet.sendTransaction({
      to: allocatorWallet.address,
      value: 0n,
      data: encodedDecision,
      nonce,
    });

    console.log(`📡 [MCP] Decision logged on X Layer | TX: ${transaction.hash}`);
    const receipt = await transaction.wait();
    return { success: true, txHash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (err) {
    console.error(`❌ [MCP] Log failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export async function logCreditScoreUpdateViaMCP(agentRole, oldScore, newScore, reason) {
  return logAgentDecisionViaMCP({
    event: 'CREDIT_SCORE_UPDATE',
    agentRole,
    oldScore,
    newScore,
    scoreDelta: newScore - oldScore,
    reason,
  });
}
