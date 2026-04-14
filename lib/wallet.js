/**
 * AUREX — Agentic Wallet Module
 *
 * AUREX deploys 3 specialized agentic wallets:
 * 1. Signal Price Agent  → generates price momentum signals
 * 2. Signal Flow Agent   → generates wallet flow signals
 * 3. Allocator Agent     → credit scoring + capital allocation
 */

import { ethers } from 'ethers';
import { getXLayerProvider } from './xlayer.js';
import 'dotenv/config';

/**
 * getAgenticWallet(agentRole)
 * Returns the dedicated wallet for each AUREX agent
 * Each wallet has a unique onchain identity on X Layer
 *
 * @param {string} agentRole - 'price' | 'flow' | 'allocator'
 */
export function getAgenticWallet(agentRole) {
  const provider = getXLayerProvider();

  // Map agent roles to their dedicated private keys
  const agentWalletKeys = {
    price: process.env.SIGNAL_PRICE_PRIVATE_KEY,      // Price signal agent wallet
    flow: process.env.SIGNAL_FLOW_PRIVATE_KEY,         // Flow signal agent wallet
    allocator: process.env.ALLOCATOR_PRIVATE_KEY,      // Capital allocator wallet
  };

  if (!agentWalletKeys[agentRole]) {
    throw new Error(`Unknown agent role: ${agentRole}`);
  }

  return new ethers.Wallet(agentWalletKeys[agentRole], provider);
}

/**
 * getAgentBalance(agentRole)
 * Checks OKB balance of agent wallet on X Layer
 * Used before execution to ensure sufficient gas funds
 */
export async function getAgentBalance(agentRole) {
  const wallet = getAgenticWallet(agentRole);
  const provider = getXLayerProvider();
  const balanceWei = await provider.getBalance(wallet.address);
  return ethers.formatEther(balanceWei);
}

/**
 * getAllAgentBalances()
 * Returns balances of all 3 agentic wallets
 * Used by dashboard to display agent financial status
 */
export async function getAllAgentBalances() {
  const [priceBalance, flowBalance, allocatorBalance] = await Promise.all([
    getAgentBalance('price'),
    getAgentBalance('flow'),
    getAgentBalance('allocator'),
  ]);

  return {
    signalPriceAgent: priceBalance,
    signalFlowAgent: flowBalance,
    allocatorAgent: allocatorBalance,
  };
}