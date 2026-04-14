'use client';

/**
 * AUREX — Agents Page
 * Shows all 3 agentic wallets with full details
 * Onchain OS skill integration breakdown
 * Architecture diagram
 */

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const XLAYER_ADDR = 'https://www.oklink.com/xlayer/address';

export default function AgentsPage() {
  const [status, setStatus] = useState(null);
  const [credit, setCredit] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/status`).then(r => r.json()).catch(() => null),
      fetch(`${API_URL}/api/credit`).then(r => r.json()).catch(() => null),
    ]).then(([s, c]) => { setStatus(s); setCredit(c); });
  }, []);

  const agents = [
    {
      id: '01',
      name: 'Price Signal Agent',
      role: 'Signal Generator',
      icon: '📊',
      color: '#6366f1',
      colorDim: '#6366f115',
      envKey: 'SIGNAL_PRICE_ADDRESS',
      address: process.env.NEXT_PUBLIC_SIGNAL_PRICE_ADDRESS,
      balance: status?.agentBalances?.signalPriceAgent,
      creditKey: 'signal-price',
      skill: 'Onchain OS DEX Aggregator API',
      skillColor: 'var(--primary-bright)',
      description: 'Continuously monitors OKB/USDT price on X Layer via the Onchain OS DEX Aggregator API. Calculates momentum over a sliding window of 30 data points to generate BUY/SELL/HOLD signals with confidence scores.',
      endpoints: [
        'GET /api/v5/dex/aggregator/token-detail',
        '→ Fetches real-time OKB price',
        '→ Updates every 2-minute cycle',
      ],
      earnings: 'x402 micro-payment from Allocator per cycle',
      responsibilities: [
        'Fetch live token prices from Onchain OS',
        'Calculate price momentum (% change over window)',
        'Generate directional signal with confidence',
        'Earn x402 fee per signal used in allocation',
      ],
    },
    {
      id: '02',
      name: 'Flow Signal Agent',
      role: 'Signal Generator',
      icon: '🔍',
      color: '#a78bfa',
      colorDim: '#a78bfa15',
      envKey: 'SIGNAL_FLOW_ADDRESS',
      address: process.env.NEXT_PUBLIC_SIGNAL_FLOW_ADDRESS,
      balance: status?.agentBalances?.signalFlowAgent,
      creditKey: 'signal-flow',
      skill: 'Onchain OS Wallet API',
      skillColor: '#a78bfa',
      description: 'Monitors a curated list of active X Layer wallets via the Onchain OS Wallet API. Aggregates net buying vs selling pressure across all watched wallets to produce a smart money flow signal.',
      endpoints: [
        'GET /api/v5/wallet/post-transaction/transactions',
        '→ Reads wallet activity for 3 X Layer addresses',
        '→ Aggregates net buy/sell pressure',
      ],
      earnings: 'x402 micro-payment from Allocator per cycle',
      responsibilities: [
        'Monitor X Layer wallet activity via Onchain OS',
        'Count buy vs sell transactions across smart wallets',
        'Generate net flow directional signal',
        'Earn x402 fee per signal used in allocation',
      ],
    },
    {
      id: '03',
      name: 'Allocator Agent',
      role: 'Capital Allocator',
      icon: '🏦',
      color: '#22d3ee',
      colorDim: '#22d3ee10',
      envKey: 'ALLOCATOR_ADDRESS',
      address: process.env.NEXT_PUBLIC_ALLOCATOR_ADDRESS,
      balance: status?.agentBalances?.allocatorAgent,
      creditKey: null,
      skill: 'DEX Swap + x402 + MCP',
      skillColor: 'var(--accent)',
      description: 'The brain of AUREX. Reads both agent signals, weights them by credit score, makes the final BUY/SELL/HOLD decision, executes the trade on X Layer via Onchain OS DEX, pays signal agents via x402, and logs everything to the chain via MCP.',
      endpoints: [
        'GET /api/v5/dex/aggregator/swap',
        '→ Best-route swap execution on X Layer',
        'x402 payments to signal agents',
        'MCP onchain decision logging',
      ],
      earnings: 'Trade profits minus signal fees',
      responsibilities: [
        'Credit score calculation for both signal agents',
        'Credit-weighted capital allocation decision',
        'Execute best-route swap via Onchain OS DEX API',
        'Pay signal agents via x402 on X Layer',
        'Log every decision onchain via MCP',
        'Update agent credit scores after outcome',
      ],
    },
  ];

  return (
    <div className="page">

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="page-eyebrow">Agentic Identity · X Layer</div>
        <h1 className="page-title">Autonomous <em>Agents</em></h1>
        <p className="page-desc">
          Three specialized agents with distinct onchain identities on X Layer.
          Each has a dedicated agentic wallet, a defined role, and earns autonomously
          through the AUREX credit system.
        </p>
      </div>

      {/* ── Agent Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {agents.map((agent, i) => {
          const agentCredit = agent.creditKey ? credit?.[agent.creditKey] : null;
          const accuracy = agentCredit?.totalSignals > 0
            ? ((agentCredit.correctSignals / agentCredit.totalSignals) * 100).toFixed(1)
            : null;

          return (
            <div
              key={i}
              className={`card reveal stagger-${i + 1}`}
              style={{
                borderLeft: `3px solid ${agent.color}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background glow */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '300px', height: '300px',
                background: `radial-gradient(circle, ${agent.color}08, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', position: 'relative' }}>

                {/* Left: Agent identity */}
                <div style={{ flex: '0 0 260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '52px', height: '52px',
                      background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}10)`,
                      border: `1px solid ${agent.color}40`,
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>
                      {agent.icon}
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                        color: agent.color, letterSpacing: '0.15em',
                        textTransform: 'uppercase', marginBottom: '3px',
                      }}>
                        AGENT {agent.id} · {agent.role}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.95rem',
                        fontWeight: '700', color: 'var(--text-primary)',
                      }}>
                        {agent.name}
                      </div>
                    </div>
                  </div>

                  {/* Wallet address */}
                  <div style={{
                    padding: '10px 12px', background: 'var(--bg-void)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-soft)',
                    marginBottom: '10px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Onchain Identity · X Layer
                    </div>
                    <a
                      href={`${XLAYER_ADDR}/${agent.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                        color: agent.color, wordBreak: 'break-all',
                        textDecoration: 'none',
                      }}
                    >
                      {agent.address || '0x... (configure .env)'} ↗
                    </a>
                  </div>

                  {/* Balance */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                    marginBottom: '10px',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>Balance</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '700', color: agent.color }}>
                      {parseFloat(agent.balance || 0).toFixed(4)} OKB
                    </span>
                  </div>

                  {/* Skill badge */}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: agent.skillColor,
                    background: `${agent.color}12`, border: `1px solid ${agent.color}25`,
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                  }}>
                    Onchain OS: {agent.skill}
                  </div>

                  {/* Credit score if applicable */}
                  {agentCredit && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Credit Score</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: '700', color: agent.color }}>
                          {agentCredit.score}/100
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${agentCredit.score}%`, background: agent.color }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                          {accuracy !== null ? `${accuracy}% accuracy` : 'No data yet'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                          {agentCredit.totalSignals} signals
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Middle: Description + endpoints */}
                <div style={{ flex: '1', minWidth: '240px' }}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                    color: 'var(--text-secondary)', lineHeight: '1.7',
                    marginBottom: '16px',
                  }}>
                    {agent.description}
                  </p>

                  <div style={{
                    background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px', border: '1px solid var(--border-soft)',
                    marginBottom: '12px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Onchain OS Endpoints
                    </div>
                    {agent.endpoints.map((ep, j) => (
                      <div key={j} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                        color: ep.startsWith('→') ? 'var(--text-secondary)' : agent.color,
                        marginBottom: '3px', paddingLeft: ep.startsWith('→') ? '12px' : '0',
                      }}>
                        {ep}
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: '8px 12px', background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>Earns: </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--buy)' }}>{agent.earnings}</span>
                  </div>
                </div>

                {/* Right: Responsibilities */}
                <div style={{ flex: '0 0 200px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Responsibilities
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {agent.responsibilities.map((r, j) => (
                      <div key={j} style={{
                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                        color: 'var(--text-secondary)', lineHeight: '1.4',
                      }}>
                        <span style={{ color: agent.color, flexShrink: 0 }}>›</span>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Architecture Diagram ── */}
      <div className="card reveal">
        <div className="card-header">
          <div>
            <div className="card-label">System Design</div>
            <div className="card-title">Architecture Overview</div>
          </div>
        </div>
        <div className="arch-block">{`
┌──────────────────────────────────────────────────────────────────────────┐
│                        AUREX — X Layer                                    │
│                Credit-Weighted Signal Capital Allocation                  │
└──────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐      ┌─────────────────┐
  │  📊 Price Agent  │      │  🔍 Flow Agent   │
  │  (Agent 01)      │      │  (Agent 02)      │
  │                  │      │                  │
  │ Onchain OS       │      │ Onchain OS       │
  │ DEX API →        │      │ Wallet API →     │
  │ Price momentum   │      │ Net flow signal  │
  └────────┬─────────┘      └────────┬─────────┘
           │  signal + confidence     │  signal + confidence
           └──────────┬───────────────┘
                      ↓
           ┌──────────────────────┐
           │   Credit Scorer      │
           │   (in Allocator)     │
           │                      │
           │ score = accuracy×70  │
           │       + payments×30  │
           └──────────┬───────────┘
                      ↓
           ┌──────────────────────┐
           │  🏦 Allocator Agent  │
           │  (Agent 03)          │
           │                      │
           │ Higher score →       │
           │ More capital weight  │
           │                      │
           │ Onchain OS DEX API → │
           │ Best-route swap      │
           └──────────┬───────────┘
                      ↓
    ┌─────────────────┴──────────────────┐
    │                                    │
    ↓                                    ↓
 x402 payment                     MCP onchain log
 to signal agents                 (immutable record)
 (X Layer TX)                     (X Layer TX)

Chain: X Layer (ID: 196) | Gas: Near-zero | Powered by Onchain OS
`}</div>
      </div>

    </div>
  );
}