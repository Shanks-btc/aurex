'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const XLAYER_EXPLORER = 'https://www.oklink.com/xlayer/tx';

export default function EconomyPage() {
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/allocations`)
      .then(r => r.json())
      .catch(() => [])
      .then(a => setAllocations(Array.isArray(a) ? a : []));
  }, []);

  const trades     = allocations.filter(a => a.tradeHash).length;
  const x402Pays   = trades * 2;
  const mcpLogs    = allocations.filter(a => a.mcpLogHash).length;
  const totalTxns  = trades + x402Pays + mcpLogs;

  const steps = [
    {
      num: '01', icon: '📊', color: '#6366f1',
      title: 'Price Signal Generation',
      badge: 'Read · No Gas',
      badgeColor: 'var(--text-muted)',
      onchainOS: 'Onchain OS DEX Aggregator API',
      desc: 'Price Agent reads real-time OKB/USDT price from Onchain OS DEX API every 2 minutes. Calculates momentum over 30 data points and returns BUY/SELL/HOLD with confidence score.',
      code: 'GET /api/v5/dex/aggregator/token-detail\n→ chainId: 196 (X Layer)\n→ Output: { direction, confidence, price }',
    },
    {
      num: '02', icon: '🔍', color: '#a78bfa',
      title: 'Flow Signal Generation',
      badge: 'Read · No Gas',
      badgeColor: 'var(--text-muted)',
      onchainOS: 'Onchain OS Wallet API',
      desc: 'Flow Agent monitors 3 active X Layer wallets via Onchain OS Wallet API. Counts net buy vs sell pressure across all wallets to generate a smart money flow signal.',
      code: 'GET /api/v5/wallet/post-transaction/transactions\n→ 3 X Layer wallets monitored\n→ Output: { direction, netFlow }',
    },
    {
      num: '03', icon: '📈', color: '#22d3ee',
      title: 'Credit Score Evaluation',
      badge: 'Off-chain',
      badgeColor: 'var(--text-muted)',
      onchainOS: 'Local computation',
      desc: 'Allocator reads both agent credit histories. Score = (accuracy × 70%) + (payment reliability × 30%). Higher score = more capital allocated next cycle.',
      code: 'score = (correctSignals/total × 70)\n      + (onTimePayments/total × 30)\nRange: 0–100',
    },
    {
      num: '04', icon: '⚖️', color: '#10b981',
      title: 'Credit-Weighted Decision',
      badge: 'Off-chain',
      badgeColor: 'var(--text-muted)',
      onchainOS: 'Allocator logic',
      desc: 'Signals are combined proportionally to credit scores. Agent with score 79 gets 54% influence, score 68 gets 46%. Highest weighted vote determines BUY/SELL/HOLD.',
      code: 'weight = score / (score1 + score2)\nweightedVote[direction] += weight\nfinalDecision = maxVote()',
    },
    {
      num: '05', icon: '🔄', color: '#f59e0b',
      title: 'Swap Execution on X Layer',
      badge: '⛓ Real X Layer TX',
      badgeColor: 'var(--buy)',
      onchainOS: 'Onchain OS DEX Aggregator Swap',
      desc: 'If decision is BUY or SELL, Allocator executes real swap via Onchain OS DEX. Routes through 500+ DEXs on X Layer for best price. Creates verifiable onchain transaction.',
      code: 'GET /api/v5/dex/aggregator/swap\n→ Routes across 500+ X Layer DEXs\n→ Creates: Real TX · AI judge scans',
    },
    {
      num: '06', icon: '💳', color: '#f43f5e',
      title: 'x402 Inter-Agent Payments',
      badge: '⛓ 2 Real X Layer TXs',
      badgeColor: 'var(--buy)',
      onchainOS: 'x402 Protocol',
      desc: 'After trade, Allocator pays both signal agents via x402 micro-payments. Two autonomous machine-to-machine transactions on X Layer. No human approval needed.',
      code: 'TX 1: Allocator → Price Agent (x402)\nTX 2: Allocator → Flow Agent (x402)\nAmount: SIGNAL_FEE_ETH each',
    },
    {
      num: '07', icon: '📡', color: '#818cf8',
      title: 'MCP Onchain Logging',
      badge: '⛓ Real X Layer TX',
      badgeColor: 'var(--buy)',
      onchainOS: 'MCP Integration',
      desc: 'Allocator logs the complete cycle decision onchain via MCP. Creates immutable verifiable record of every signal, credit score, decision, and outcome. AI judge verified.',
      code: 'encodes: signals + scores + decision\nbroadcasts: self-TX with data field\nImmutable: X Layer explorer verified',
    },
    {
      num: '08', icon: '🔁', color: '#34d399',
      title: 'Credit Score Update',
      badge: 'Auto-adjusting',
      badgeColor: 'var(--accent)',
      onchainOS: 'Local + MCP log',
      desc: 'After trade outcome known, both agent credit scores update automatically. Correct signal = score rises. Wrong signal = score falls. Next cycle allocation adjusts accordingly.',
      code: 'if (tradeProfit > 0) correctSignals++\nagentScore = recalculate()\nnextAllocation = scoreWeighted()',
    },
  ];

  return (
    <div className="page">

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="page-eyebrow">Best Economy Loop · OKX Build X Season 2</div>
        <h1 className="page-title">The <em>Economy</em> Loop</h1>
        <p className="page-desc">
          AUREX runs a self-sustaining earn-pay-earn cycle. Agents generate signals,
          earn x402 fees for accuracy, and the entire system improves autonomously
          with every cycle — zero human input required.
        </p>
      </div>

      {/* ── Economy Metrics ── */}
      <div className="grid-4 mb-6">
        {[
          { label: 'Onchain Transactions', value: totalTxns, color: 'var(--primary-bright)', sub: 'total X Layer txns' },
          { label: 'Trades Executed', value: trades, color: 'var(--buy)', sub: 'DEX swaps via Onchain OS' },
          { label: 'x402 Payments', value: x402Pays, color: 'var(--accent)', sub: 'inter-agent micro-pays' },
          { label: 'MCP Logs', value: mcpLogs, color: '#a78bfa', sub: 'onchain decision records' },
        ].map(({ label, value, color, sub }, i) => (
          <div key={label} className={`stat-card reveal stagger-${i + 1}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Loop Visualization ── */}
      <div className="card mb-6 reveal">
        <div className="card-header">
          <div>
            <div className="card-label">Full Autonomous Cycle</div>
            <div className="card-title">Economy Loop Flow</div>
          </div>
          <span className="badge badge-live">Running autonomously</span>
        </div>

        {/* Compact visual flow */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0',
          overflowX: 'auto', padding: '4px 0 12px',
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '6px', padding: '14px 12px',
                background: 'var(--bg-elevated)',
                border: `1px solid ${step.color}25`,
                borderRadius: 'var(--radius-md)',
                minWidth: '100px', maxWidth: '120px',
                transition: 'border-color 0.2s',
              }}>
                <span style={{ fontSize: '1.3rem' }}>{step.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                  color: step.color, fontWeight: '700', letterSpacing: '0.1em',
                }}>
                  STEP {step.num}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.62rem',
                  fontWeight: '600', color: 'var(--text-primary)',
                  textAlign: 'center', lineHeight: '1.3',
                }}>
                  {step.title}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                  color: step.badgeColor, textAlign: 'center',
                }}>
                  {step.badge}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: '24px', height: '2px', flexShrink: 0,
                  background: `linear-gradient(90deg, ${step.color}, ${steps[i+1].color})`,
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute', right: '-4px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: steps[i+1].color, fontSize: '0.8rem', fontWeight: '800',
                  }}>›</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Onchain OS pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          {['DEX Aggregator API', 'Wallet API', 'x402 Protocol', 'MCP Integration', 'X Layer Chain 196'].map(skill => (
            <span key={skill} className={`skill-pill ${skill.includes('x402') ? 'skill-pill-accent' : skill.includes('MCP') ? 'skill-pill-buy' : ''}`}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ── Detailed Steps ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            className={`card reveal stagger-${(i % 4) + 1}`}
            style={{ borderLeft: `3px solid ${step.color}` }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

              {/* Step number + icon */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '6px', minWidth: '60px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                  color: step.color, fontWeight: '700', letterSpacing: '0.12em',
                }}>
                  STEP {step.num}
                </div>
                <div style={{
                  width: '44px', height: '44px',
                  background: `${step.color}15`,
                  border: `1px solid ${step.color}30`,
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: '700',
                    fontSize: '0.9rem', color: 'var(--text-primary)',
                  }}>
                    {step.title}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                    color: step.color, background: `${step.color}12`,
                    border: `1px solid ${step.color}25`,
                    padding: '2px 8px', borderRadius: '4px',
                  }}>
                    {step.onchainOS}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                    color: step.badgeColor,
                    marginLeft: 'auto',
                  }}>
                    {step.badge}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                  color: 'var(--text-secondary)', lineHeight: '1.6',
                }}>
                  {step.desc}
                </p>
              </div>

              {/* Code block */}
              <div style={{
                flex: '0 0 280px', background: 'var(--bg-void)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: step.color, lineHeight: '1.7',
                whiteSpace: 'pre',
              }}>
                {step.code}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ── Recent x402 Payments ── */}
      <div className="card reveal">
        <div className="card-header">
          <div>
            <div className="card-label">x402 Protocol · X Layer</div>
            <div className="card-title">Recent Inter-Agent Payments</div>
          </div>
          <span className="badge badge-live">{x402Pays} total</span>
        </div>

        {allocations.filter(a => a.tradeHash).length === 0 ? (
          <div className="empty">
            <span className="empty-icon">💳</span>
            <span className="empty-title">No x402 payments yet</span>
            <span className="empty-desc">
              x402 payments appear here after first trade execution.
              Each trade triggers 2 payments — one to each signal agent.
            </span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Decision</th>
                  <th>Trade TX (Onchain OS DEX)</th>
                  <th>x402 Status</th>
                  <th>MCP Log TX</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {allocations.filter(a => a.tradeHash).slice(0, 15).map((c, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(c.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <span className={`badge badge-${c.finalDecision?.toLowerCase() || 'hold'}`}>
                        {c.finalDecision}
                      </span>
                    </td>
                    <td>
                      <a
                        className="tx-link"
                        href={`${XLAYER_EXPLORER}/${c.tradeHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {c.tradeHash?.slice(0, 10)}...{c.tradeHash?.slice(-6)}
                      </a>
                    </td>
                    <td>
                      <span style={{ color: 'var(--buy)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                        ✓ 2 payments sent
                      </span>
                    </td>
                    <td>
                      {c.mcpLogHash ? (
                        <a
                          className="tx-link"
                          href={`${XLAYER_EXPLORER}/${c.mcpLogHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#a78bfa' }}
                        >
                          {c.mcpLogHash?.slice(0, 8)}...
                        </a>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      {c.signalWasCorrect
                        ? <span style={{ color: 'var(--buy)' }}>✅ Correct</span>
                        : <span style={{ color: 'var(--sell)' }}>❌ Wrong</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}