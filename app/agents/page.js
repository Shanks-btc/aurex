'use client';

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
      icon: '[PRICE]',
      color: '#6366f1',
      address: process.env.NEXT_PUBLIC_SIGNAL_PRICE_ADDRESS,
      balance: status?.agentBalances?.signalPriceAgent,
      creditKey: 'signal-price',
      skill: 'Onchain OS DEX Aggregator API',
      description: 'Monitors OKB/USDT price on X Layer via Onchain OS DEX Aggregator API. Calculates momentum over 30 data points to generate BUY/SELL/HOLD signals with confidence scores.',
      endpoints: [
        'GET /api/v5/dex/aggregator/token-detail',
        '-> Fetches real-time OKB price on X Layer',
        '-> Updates every 2-minute cycle',
      ],
      earnings: 'x402 micro-payment from Allocator per cycle',
      responsibilities: [
        'Fetch live token prices from Onchain OS DEX API',
        'Calculate price momentum over 30 data point window',
        'Generate directional signal with confidence score',
        'Earn x402 fee per signal used in allocation cycle',
      ],
    },
    {
      id: '02',
      name: 'Flow Signal Agent',
      role: 'Signal Generator',
      icon: '[FLOW]',
      color: '#a78bfa',
      address: process.env.NEXT_PUBLIC_SIGNAL_FLOW_ADDRESS,
      balance: status?.agentBalances?.signalFlowAgent,
      creditKey: 'signal-flow',
      skill: 'Onchain OS Wallet API',
      description: 'Monitors active X Layer wallets via Onchain OS Wallet API. Aggregates net buying vs selling pressure to produce a smart money flow signal.',
      endpoints: [
        'GET /api/v5/wallet/post-transaction/transactions',
        '-> Reads wallet activity for 3 X Layer addresses',
        '-> Aggregates net buy/sell pressure per cycle',
      ],
      earnings: 'x402 micro-payment from Allocator per cycle',
      responsibilities: [
        'Monitor X Layer wallet activity via Onchain OS',
        'Count buy vs sell transactions across smart wallets',
        'Generate net flow directional signal with confidence',
        'Earn x402 fee per signal used in allocation cycle',
      ],
    },
    {
      id: '03',
      name: 'Allocator Agent',
      role: 'Capital Allocator',
      icon: '[ALLOC]',
      color: '#22d3ee',
      address: process.env.NEXT_PUBLIC_ALLOCATOR_ADDRESS,
      balance: status?.agentBalances?.allocatorAgent,
      creditKey: null,
      skill: 'DEX Swap + x402 + MCP',
      description: 'The brain of AUREX. Weights signals by credit score, makes BUY/SELL/HOLD decision, executes trade on X Layer via Onchain OS DEX, pays agents via x402, and logs via MCP.',
      endpoints: [
        'GET /api/v5/dex/aggregator/swap',
        '-> Best-route swap execution on X Layer',
        '-> x402 payments to both signal agents',
        '-> MCP onchain decision logging per cycle',
      ],
      earnings: 'Trade profits minus signal agent fees',
      responsibilities: [
        'Calculate credit score for both signal agents',
        'Weight capital allocation by credit score',
        'Execute best-route swap via Onchain OS DEX API',
        'Pay signal agents via x402 on X Layer',
        'Log every decision onchain via MCP integration',
        'Update agent credit scores after trade outcome',
      ],
    },
  ];

  return (
    <div className="page">

      <div className="page-hero">
        <div className="page-eyebrow">Agentic Identity - X Layer - Hackathon Requirement</div>
        <h1 className="page-title">Autonomous <em>Agents</em></h1>
        <p className="page-desc">
          Three specialized agents with distinct onchain identities on X Layer.
          Each has a dedicated agentic wallet, a defined role, and earns
          autonomously through the AUREX credit scoring system.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {agents.map((agent, i) => {
          const agentCredit = agent.creditKey ? credit?.[agent.creditKey] : null;
          const accuracy = agentCredit?.totalSignals > 0
            ? ((agentCredit.correctSignals / agentCredit.totalSignals) * 100).toFixed(1)
            : null;

          return (
            <div
              key={i}
              className="card reveal"
              style={{ borderLeft: `3px solid ${agent.color}`, animationDelay: `${i * 0.1}s` }}
            >
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                <div style={{ flex: '0 0 260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '52px', height: '52px',
                      background: `${agent.color}20`,
                      border: `1px solid ${agent.color}40`,
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      color: agent.color, fontWeight: '700',
                    }}>
                      {agent.icon}
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                        color: agent.color, letterSpacing: '0.15em',
                        textTransform: 'uppercase', marginBottom: '3px',
                      }}>
                        AGENT {agent.id} - {agent.role}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.95rem',
                        fontWeight: '700', color: 'var(--text-primary)',
                      }}>
                        {agent.name}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '10px 12px', background: 'var(--bg-void)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-soft)',
                    marginBottom: '10px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Onchain Identity - X Layer
                    </div>
                    <a
                      href={`${XLAYER_ADDR}/${agent.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: agent.color, wordBreak: 'break-all', textDecoration: 'none' }}
                    >
                      {agent.address || '0x... (configure env)'} [view]
                    </a>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 12px', background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                    marginBottom: '10px',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>Balance</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '700', color: agent.color }}>
                      {parseFloat(agent.balance || 0).toFixed(4)} OKB
                    </span>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    color: agent.color, background: `${agent.color}12`,
                    border: `1px solid ${agent.color}25`,
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                  }}>
                    Onchain OS: {agent.skill}
                  </div>

                  {agentCredit && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Credit Score
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: '700', color: agent.color }}>
                          {agentCredit.score}/100
                        </span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${agentCredit.score}%`, background: agent.color }} />
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
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

                <div style={{ flex: '1', minWidth: '240px' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
                    {agent.description}
                  </p>

                  <div style={{ background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', border: '1px solid var(--border-soft)', marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Onchain OS Endpoints
                    </div>
                    {agent.endpoints.map((ep, j) => (
                      <div key={j} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                        color: ep.startsWith('->') ? 'var(--text-secondary)' : agent.color,
                        marginBottom: '3px',
                        paddingLeft: ep.startsWith('->') ? '12px' : '0',
                      }}>
                        {ep}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>Earns: </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--buy)' }}>{agent.earnings}</span>
                  </div>
                </div>

                <div style={{ flex: '0 0 200px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Responsibilities
                  </div>
                  {agent.responsibilities.map((r, j) => (
                    <div key={j} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '6px' }}>
                      <span style={{ color: agent.color, flexShrink: 0 }}>{'>'}</span>
                      {r}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      <div className="card reveal">
        <div className="card-header">
          <div>
            <div className="card-label">System Design</div>
            <div className="card-title">Architecture Overview</div>
          </div>
        </div>
        <div className="arch-block">
{`+------------------------------------------------------------------+
|             AUREX -- X Layer (Chain ID: 196)                     |
|      Credit-Weighted Signal Capital Allocation                   |
+------------------------------------------------------------------+

  +------------------+      +------------------+
  |  [PRICE] Agent01 |      |  [FLOW]  Agent02 |
  |  Onchain OS      |      |  Onchain OS      |
  |  DEX API         |      |  Wallet API      |
  |  -> Price signal |      |  -> Flow signal  |
  +--------+---------+      +--------+---------+
           |  signal + confidence    |
           +------------+-----------+
                        |
                        v
           +------------------------+
           |    Credit Scorer       |
           |  score = acc x 70      |
           |        + pay x 30      |
           +------------+-----------+
                        |
                        v
           +------------------------+
           |  [ALLOC]   Agent03     |
           |  Higher score ->       |
           |  More capital weight   |
           |  Onchain OS DEX Swap   |
           +------------+-----------+
                        |
         +--------------+--------------+
         |                             |
         v                             v
   x402 payments               MCP onchain log
   to signal agents            immutable record
   (X Layer TX)                (X Layer TX)

Powered by: Onchain OS - DEX API - Wallet API - x402 - MCP`}
        </div>
      </div>

    </div>
  );
}