/**
 * AUREX — MCP Onchain Logging Module
 * Onchain OS Skill: MCP — Model Context Protocol for agent activity logging
 * Fix: uses nonce manager to prevent nonce conflicts
 */

import { ethers } from 'ethers';
import { getAgenticWallet } from './wallet.js';
import { getNextNonce, resetNonce } from './nonce.js';

export async function logAgentDecisionViaMCP(decisionData) {
  try {
    const allocatorWallet = getAgenticWallet('allocator');

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

    const nonce = await getNextNonce(allocatorWallet.address);

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
    const allocatorWallet = getAgenticWallet('allocator');
    resetNonce(allocatorWallet.address);
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
