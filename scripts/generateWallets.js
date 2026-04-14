/**
 * AUREX — Agentic Wallet Generator
 *
 * Generates 3 dedicated wallets for AUREX agents:
 * 1. Signal Price Agent Wallet
 * 2. Signal Flow Agent Wallet
 * 3. Allocator Agent Wallet (main capital wallet)
 *
 * Run once: node scripts/generateWallets.js
 * Copy output into your .env file
 */

import { ethers } from 'ethers';

// Generate 3 unique agentic wallets for X Layer deployment
const signalPriceAgentWallet = ethers.Wallet.createRandom();
const signalFlowAgentWallet = ethers.Wallet.createRandom();
const allocatorAgentWallet = ethers.Wallet.createRandom();

console.log('');
console.log('╔════════════════════════════════════════╗');
console.log('║    AUREX Agentic Wallets Generated     ║');
console.log('║    Copy these into your .env file      ║');
console.log('╚════════════════════════════════════════╝');
console.log('');
console.log('# Agent 1 — Signal Price Agent');
console.log('# Role: Generates price momentum signals via Onchain OS DEX API');
console.log(`SIGNAL_PRICE_PRIVATE_KEY=${signalPriceAgentWallet.privateKey}`);
console.log(`SIGNAL_PRICE_ADDRESS=${signalPriceAgentWallet.address}`);
console.log('');
console.log('# Agent 2 — Signal Flow Agent');
console.log('# Role: Generates wallet flow signals via Onchain OS Wallet API');
console.log(`SIGNAL_FLOW_PRIVATE_KEY=${signalFlowAgentWallet.privateKey}`);
console.log(`SIGNAL_FLOW_ADDRESS=${signalFlowAgentWallet.address}`);
console.log('');
console.log('# Agent 3 — Allocator Agent');
console.log('# Role: Credit scoring + capital allocation + trade execution');
console.log(`ALLOCATOR_PRIVATE_KEY=${allocatorAgentWallet.privateKey}`);
console.log(`ALLOCATOR_ADDRESS=${allocatorAgentWallet.address}`);
console.log('');
console.log('⚠️  NEVER share your private keys or commit .env to GitHub');
console.log('✅  Fund ALLOCATOR_ADDRESS with OKB + USDT on X Layer');
console.log('    Bridge: https://www.okx.com/xlayer/bridge');