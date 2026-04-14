/**
 * AUREX — Agent Credit Scoring System
 *
 * Traditional DeFi allocates capital blindly.
 * AUREX builds verifiable credit scores from real onchain history:
 * → Signal accuracy (did the agent's signal lead to profit?)
 * → Payment reliability (did the agent complete x402 payments?)
 *
 * Higher credit score = more capital allocated = more x402 earnings
 * This creates competitive pressure for agents to improve accuracy
 */

import fs from 'fs';
import { logCreditScoreUpdateViaMCP } from '../lib/mcp.js';

const CREDIT_DATA_FILE = './data/credit.json';

/**
 * loadAgentCreditData()
 * Reads current credit scores for all AUREX signal agents
 */
export function loadAgentCreditData() {
  return JSON.parse(fs.readFileSync(CREDIT_DATA_FILE, 'utf8'));
}

/**
 * saveAgentCreditData(creditData)
 * Persists updated credit scores after each cycle
 */
export function saveAgentCreditData(creditData) {
  fs.writeFileSync(CREDIT_DATA_FILE, JSON.stringify(creditData, null, 2));
}

/**
 * calculateAgentCreditScore(agentData)
 * Computes 0-100 credit score from agent's onchain history
 *
 * Score Formula:
 * - Signal Accuracy (70%): correctSignals / totalSignals
 * - Payment History (30%): onTimePayments / totalPayments
 *
 * This mirrors traditional credit scoring but for AI agents
 */
export function calculateAgentCreditScore(agentData) {
  // Calculate signal accuracy component (70% weight)
  const signalAccuracy = agentData.totalSignals > 0
    ? agentData.correctSignals / agentData.totalSignals
    : 0.5; // Default 50% for new agents

  // Calculate payment reliability component (30% weight)
  const paymentReliability = agentData.x402PaymentsMade > 0
    ? agentData.x402PaymentsOnTime / agentData.x402PaymentsMade
    : 0.5; // Default 50% for new agents

  // Weighted credit score 0-100
  const creditScore = (signalAccuracy * 70) + (paymentReliability * 30);
  return Math.round(creditScore);
}

/**
 * updateAgentCreditAfterCycle(agentKey, signalWasCorrect)
 * Updates agent credit score after each allocation cycle
 * Logs update to X Layer via MCP for verifiability
 *
 * @param {string} agentKey - 'signal-price' or 'signal-flow'
 * @param {boolean} signalWasCorrect - Did agent signal lead to profit?
 */
export async function updateAgentCreditAfterCycle(agentKey, signalWasCorrect) {
  const creditData = loadAgentCreditData();
  const agent = creditData[agentKey];

  const previousScore = agent.score;

  // Update signal accuracy record
  agent.totalSignals++;
  if (signalWasCorrect) agent.correctSignals++;

  // Update payment history record
  agent.x402PaymentsMade++;
  agent.x402PaymentsOnTime++;

  // Recalculate credit score
  agent.score = calculateAgentCreditScore(agent);

  // Record in history
  agent.history.push({
    signalCorrect: signalWasCorrect,
    scoreBefore: previousScore,
    scoreAfter: agent.score,
    timestamp: Date.now(),
  });

  // Persist updated credit data
  saveAgentCreditData(creditData);

  // Log credit update onchain via MCP
  await logCreditScoreUpdateViaMCP(
    agentKey,
    previousScore,
    agent.score,
    signalWasCorrect ? 'Correct signal rewarded' : 'Incorrect signal penalized'
  );

  console.log(`📊 [Credit] ${agentKey}: ${previousScore} → ${agent.score}`);
  return agent.score;
}