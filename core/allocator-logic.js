/**
 * AUREX — Credit-Weighted Capital Allocation Logic
 * Core Innovation: Capital flows to agents with proven accuracy
 *
 * Traditional allocation: Fixed 50/50 split regardless of performance
 * AUREX allocation: Dynamic split based on verified credit scores
 *
 * This solves the fundamental problem:
 * "How do you know which agent to trust with capital?"
 * Answer: Their onchain credit history tells you.
 */

import { loadAgentCreditData, calculateAgentCreditScore } from './credit.js';

/**
 * calculateCreditWeightedAllocation()
 * Computes capital split based on agent credit scores
 * Higher credit score = higher percentage of capital allocated
 *
 * Example:
 * Price Agent score: 79 → gets 53.7% of capital
 * Flow Agent score:  68 → gets 46.3% of capital
 */
export function calculateCreditWeightedAllocation() {
  const creditData = loadAgentCreditData();

  const priceAgentScore = creditData['signal-price'].score;
  const flowAgentScore = creditData['signal-flow'].score;
  const totalCreditScore = priceAgentScore + flowAgentScore;

  // Weight allocation proportionally to credit scores
  const priceAllocationPercent = ((priceAgentScore / totalCreditScore) * 100).toFixed(1);
  const flowAllocationPercent = ((flowAgentScore / totalCreditScore) * 100).toFixed(1);

  return {
    priceAgent: {
      allocationPercent: priceAllocationPercent,
      creditScore: priceAgentScore,
    },
    flowAgent: {
      allocationPercent: flowAllocationPercent,
      creditScore: flowAgentScore,
    },
  };
}

/**
 * makeCreditWeightedDecision(priceSignal, flowSignal, allocation)
 * Combines both agent signals weighted by their credit scores
 * Agent with higher credit score has more influence on final decision
 *
 * @param {Object} priceSignal - Signal from Price Agent
 * @param {Object} flowSignal - Signal from Flow Agent
 * @param {Object} allocation - Current credit-weighted allocation
 */
export function makeCreditWeightedDecision(priceSignal, flowSignal, allocation) {
  const priceWeight = parseFloat(allocation.priceAgent.allocationPercent);
  const flowWeight = parseFloat(allocation.flowAgent.allocationPercent);

  // Accumulate weighted votes for each direction
  const weightedVotes = { BUY: 0, SELL: 0, HOLD: 0 };

  // Price agent vote weighted by credit score
  weightedVotes[priceSignal.direction] += priceWeight;

  // Flow agent vote weighted by credit score
  weightedVotes[flowSignal.direction] += flowWeight;

  // Decision = direction with highest weighted vote
  const finalDecision = Object.keys(weightedVotes).reduce(
    (a, b) => weightedVotes[a] > weightedVotes[b] ? a : b
  );

  const decisionConfidence = weightedVotes[finalDecision].toFixed(1);

  console.log(`⚖️ [Allocator] Weighted votes: BUY=${weightedVotes.BUY} SELL=${weightedVotes.SELL} HOLD=${weightedVotes.HOLD}`);
  console.log(`🎯 [Allocator] Final decision: ${finalDecision} (${decisionConfidence}% confidence)`);

  return {
    finalDecision,
    decisionConfidence,
    weightedVotes,
  };
}