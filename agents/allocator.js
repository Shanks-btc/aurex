/**
 * AUREX Allocator Agent
 * Onchain OS Skills: DEX Aggregator (swap) + x402 (payments) + MCP (logging)
 * Fix: safe JSON reading to prevent parse errors
 */

import { calculateCreditWeightedAllocation, makeCreditWeightedDecision } from '../core/allocator-logic.js';
import { buildSwapTransactionFromOnchainOS } from '../lib/onchain.js';
import { getAgenticWallet } from '../lib/wallet.js';
import { paySignalAgentsForContribution } from '../lib/x402.js';
import { logAgentDecisionViaMCP } from '../lib/mcp.js';
import { updateAgentCreditAfterCycle } from '../core/credit.js';
import { fetchTokenPriceFromOnchainOS } from '../lib/onchain.js';
import { ethers } from 'ethers';
import fs from 'fs';
import 'dotenv/config';

async function executeTradeOnXLayer(tradeDirection) {
  const allocatorWallet = getAgenticWallet('allocator');
  const OKB_ADDRESS = process.env.OKB_ADDRESS;
  const USDT_ADDRESS = process.env.USDT_ADDRESS;

  const fromToken = tradeDirection === 'BUY' ? USDT_ADDRESS : OKB_ADDRESS;
  const toToken = tradeDirection === 'BUY' ? OKB_ADDRESS : USDT_ADDRESS;
  const tokenDecimals = tradeDirection === 'BUY' ? 6 : 18;

  const tradeAmountInUnits = ethers.parseUnits(
    process.env.TRADE_AMOUNT || '5',
    tokenDecimals
  ).toString();

  const swapTransactionData = await buildSwapTransactionFromOnchainOS(
    fromToken, toToken, tradeAmountInUnits, allocatorWallet.address
  );

  if (!swapTransactionData) {
    console.warn(`⚠️ [Allocator] Swap data unavailable — skipping execution`);
    return null;
  }

  try {
    const transaction = await allocatorWallet.sendTransaction({
      to: swapTransactionData.to,
      data: swapTransactionData.data,
      value: BigInt(swapTransactionData.value || 0),
      gasLimit: BigInt(swapTransactionData.gas || 300000),
    });
    console.log(`🔄 [Allocator] Swap TX: ${transaction.hash}`);
    const receipt = await transaction.wait();
    console.log(`✅ [Allocator] Trade confirmed | Block: ${receipt.blockNumber}`);
    return receipt;
  } catch (err) {
    console.error(`❌ [Allocator] Trade failed: ${err.message}`);
    return null;
  }
}

export async function runAllocationCycle(priceSignal, flowSignal) {
  console.log(`\n🏦 [Allocator] Starting allocation cycle...`);

  const creditWeightedAllocation = calculateCreditWeightedAllocation();
  console.log(`📊 [Allocator] Capital split: Price ${creditWeightedAllocation.priceAgent.allocationPercent}% | Flow ${creditWeightedAllocation.flowAgent.allocationPercent}%`);

  const { finalDecision, decisionConfidence } = makeCreditWeightedDecision(
    priceSignal, flowSignal, creditWeightedAllocation
  );

  const priceBeforeTrade = await fetchTokenPriceFromOnchainOS(process.env.OKB_ADDRESS);

  let tradeReceipt = null;
  if (finalDecision !== 'HOLD') {
    tradeReceipt = await executeTradeOnXLayer(finalDecision);
  }

  let x402Payments = null;
  if (tradeReceipt) {
    x402Payments = await paySignalAgentsForContribution(
      process.env.SIGNAL_PRICE_ADDRESS,
      process.env.SIGNAL_FLOW_ADDRESS,
      process.env.SIGNAL_FEE_ETH
    );
  }

  await new Promise(r => setTimeout(r, 5000));
  const priceAfterTrade = await fetchTokenPriceFromOnchainOS(process.env.OKB_ADDRESS);

  const signalWasCorrect = finalDecision === 'BUY'
    ? (priceAfterTrade > priceBeforeTrade)
    : finalDecision === 'SELL'
      ? (priceAfterTrade < priceBeforeTrade)
      : true;

  await updateAgentCreditAfterCycle('signal-price', signalWasCorrect);
  await updateAgentCreditAfterCycle('signal-flow', signalWasCorrect);

  const mcpLog = await logAgentDecisionViaMCP({
    event: 'ALLOCATION_CYCLE',
    priceSignal,
    flowSignal,
    creditWeightedAllocation,
    finalDecision,
    decisionConfidence,
    tradeHash: tradeReceipt?.hash || null,
    x402Payments,
    signalWasCorrect,
    priceBeforeTrade,
    priceAfterTrade,
  });

  // Safe JSON read to prevent parse errors
  let allocationHistory = [];
  try {
    const raw = fs.readFileSync('./data/allocations.json', 'utf8');
    allocationHistory = raw && raw.trim() ? JSON.parse(raw) : [];
  } catch (e) {
    allocationHistory = [];
  }

  allocationHistory.push({
    timestamp: new Date().toISOString(),
    priceSignal,
    flowSignal,
    creditWeightedAllocation,
    finalDecision,
    decisionConfidence,
    tradeHash: tradeReceipt?.hash || null,
    mcpLogHash: mcpLog?.txHash || null,
    signalWasCorrect,
  });

  try {
    fs.writeFileSync(
      './data/allocations.json',
      JSON.stringify(allocationHistory.slice(-50), null, 2)
    );
  } catch (e) {
    console.error(`❌ [Allocator] Failed to save allocations: ${e.message}`);
  }

  console.log(`✅ [Allocator] Cycle complete | Decision: ${finalDecision} | Correct: ${signalWasCorrect}`);

  return {
    finalDecision,
    decisionConfidence,
    tradeHash: tradeReceipt?.hash,
    signalWasCorrect,
    creditWeightedAllocation,
  };
}
