'use client';

/**
 * AUREX — Main Dashboard
 * Features: Live credit scores, allocation visualization,
 *           signal feed, trade history, economy loop summary
 */

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const XLAYER_EXPLORER = 'https://www.oklink.com/xlayer/tx';

// ── Credit Score Ring Component ──────────────────────────
function CreditRing({ score = 0, color = '#6366f1', size = 72 }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="credit-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="credit-ring-bg"
          cx={size / 2} cy={size / 2} r={r}
        />
        <circle
          className="credit-ring-fill"
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="credit-ring-label">
        <span className="credit-ring-value">{score}</span>
        <span className="credit-ring-max">/100</span>
      </div>
    </div>
  );
}

// ── Score Color Helper ────────────────────────────────────
function scoreColor(s) {
  if (s >= 75) return '#10b981';
  if (s >= 50) return '#f59e0b';
  return '#f43f5e';
}

// ── Direction Badge ───────────────────────────────────────
function DirBadge({ direction }) {
  if (!direction) return <span className="badge badge-neutral">N/A</span>;
  const cls = direction === 'BUY' ? 'badge-buy' : direction === 'SELL' ? 'badge-sell' : 'badge-hold';
  return <span className={`badge ${cls}`}>{direction}</span>;
}

// ── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const [status, setStatus]         = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [credit, setCredit]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [error, setError]           = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [s, a, c] = await Promise.all([
        fetch(`${API_URL}/api/status`).then(r => r.json()),
        fetch(`${API_URL}/api/allocations`).then(r => r.json()),
        fetch(`${API_URL}/api/credit`).then(r => r.json()),
      ]);
      setStatus(s);
      setAllocations(Array.isArray(a) ? a : []);
      setCredit(c);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (e) {
      setError('Cannot reach AUREX backend. Deploy to Render or start locally.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 15000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const priceAgent  = credit?.['signal-price'];
  const flowAgent   = credit?.['signal-flow'];
  const alloc       = status?.capitalAllocation;
  const balances    = status?.agentBalances || {};

  const totalCycles   = allocations.length;
  const correct       = allocations.filter(a => a.signalWasCorrect).length;
  const accuracy      = totalCycles ? ((correct / totalCycles) * 100).toFixed(1) : '0.0';
  const trades        = allocations.filter(a => a.tradeHash).length;

  // ─────────────────────────────────────────────────────
  return (
    <div className="page">

      {/* ── Hero ── */}
      <div className="page-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="page-eyebrow">OKX Build X · Season 2 · X Layer</div>
            <h1 className="page-title">
              Signal <em>Intelligence</em><br />Dashboard
            </h1>
            <p className="page-desc">
              Three autonomous agents compete on X Layer. Credit scores built from
              real onchain accuracy determine capital allocation every cycle.
              No human input required.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span
              className={`badge ${status?.xlayerConnected ? 'badge-live' : 'badge-sell'}`}
              style={{ fontSize: '0.68rem', padding: '5px 12px' }}
            >
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: status?.xlayerConnected ? 'var(--accent)' : 'var(--sell)',
                display: 'inline-block', marginRight: '6px',
                boxShadow: status?.xlayerConnected ? '0 0 6px var(--accent)' : 'none',
                animation: status?.xlayerConnected ? 'pulse-dot 2s infinite' : 'none',
              }} />
              {status?.xlayerConnected ? 'X Layer Connected' : 'X Layer Offline'}
            </span>
            {lastUpdate && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                color: 'var(--text-muted)',
              }}>
                Updated {lastUpdate} · auto-refreshes every 15s
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '24px',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--sell)',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Stat Row ── */}
      <div className="grid-4 mb-6">
        {[
          {
            label: 'Allocation Cycles',
            value: loading ? '—' : totalCycles,
            sub: 'total cycles completed',
            color: 'var(--primary-bright)',
            delay: 'stagger-1',
          },
          {
            label: 'System Accuracy',
            value: loading ? '—' : `${accuracy}%`,
            sub: 'combined signal accuracy',
            color: 'var(--buy)',
            delay: 'stagger-2',
          },
          {
            label: 'Trades Executed',
            value: loading ? '—' : trades,
            sub: 'real X Layer swaps',
            color: 'var(--accent)',
            delay: 'stagger-3',
          },
          {
            label: 'Allocator Balance',
            value: loading ? '—' : `${parseFloat(balances.allocatorAgent || 0).toFixed(3)}`,
            sub: 'OKB on X Layer',
            color: 'var(--hold)',
            delay: 'stagger-4',
          },
        ].map(({ label, value, sub, color, delay }) => (
          <div key={label} className={`stat-card card-glow reveal ${delay}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Credit Scores + Allocation ── */}
      <div className="grid-3 mb-6">

        {/* Price Agent */}
        <div className="card card-glow reveal stagger-1">
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px',
          }}>
            <CreditRing
              score={priceAgent?.score || 0}
              color={scoreColor(priceAgent?.score || 0)}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                color: 'var(--primary-bright)', letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: '4px',
              }}>
                AGENT 01 · PRICE SIGNAL
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '0.82rem',
                fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px',
              }}>
                Price Agent
              </div>
              <span className="skill-pill">Onchain OS DEX API</span>
            </div>
          </div>

          {/* Score bar */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                Credit Score
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: '600', color: scoreColor(priceAgent?.score || 0) }}>
                {priceAgent?.score || 0}/100
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${priceAgent?.score || 0}%`,
                  background: `linear-gradient(90deg, ${scoreColor(priceAgent?.score || 0)}, ${scoreColor(priceAgent?.score || 0)}aa)`,
                }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Accuracy', value: priceAgent?.totalSignals > 0 ? `${((priceAgent.correctSignals / priceAgent.totalSignals) * 100).toFixed(0)}%` : 'N/A' },
              { label: 'Signals', value: priceAgent?.totalSignals || 0 },
              { label: 'Capital', value: `${alloc?.priceAgent?.allocationPercent || 50}%`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{
                background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                padding: '8px', border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: '700', color: highlight ? 'var(--primary-bright)' : 'var(--text-primary)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Wallet */}
          <div style={{ marginTop: '12px', padding: '8px 10px', background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '2px' }}>WALLET · X LAYER</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--primary-bright)', wordBreak: 'break-all' }}>
              {process.env.NEXT_PUBLIC_SIGNAL_PRICE_ADDRESS || '0x... (configure .env)'}
            </div>
          </div>
        </div>

        {/* Flow Agent */}
        <div className="card card-glow reveal stagger-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <CreditRing
              score={flowAgent?.score || 0}
              color={scoreColor(flowAgent?.score || 0)}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                color: '#a78bfa', letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: '4px',
              }}>
                AGENT 02 · FLOW SIGNAL
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '0.82rem',
                fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px',
              }}>
                Flow Agent
              </div>
              <span className="skill-pill">Onchain OS Wallet API</span>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                Credit Score
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: '600', color: scoreColor(flowAgent?.score || 0) }}>
                {flowAgent?.score || 0}/100
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${flowAgent?.score || 0}%`,
                  background: `linear-gradient(90deg, ${scoreColor(flowAgent?.score || 0)}, ${scoreColor(flowAgent?.score || 0)}aa)`,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Accuracy', value: flowAgent?.totalSignals > 0 ? `${((flowAgent.correctSignals / flowAgent.totalSignals) * 100).toFixed(0)}%` : 'N/A' },
              { label: 'Signals', value: flowAgent?.totalSignals || 0 },
              { label: 'Capital', value: `${alloc?.flowAgent?.allocationPercent || 50}%`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{
                background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                padding: '8px', border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: '700', color: highlight ? '#a78bfa' : 'var(--text-primary)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', padding: '8px 10px', background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: '2px' }}>WALLET · X LAYER</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#a78bfa', wordBreak: 'break-all' }}>
              {process.env.NEXT_PUBLIC_SIGNAL_FLOW_ADDRESS || '0x... (configure .env)'}
            </div>
          </div>
        </div>

        {/* Capital Allocation */}
        <div className="card card-glow reveal stagger-3">
          <div className="card-header">
            <div>
              <div className="card-label">CREDIT-WEIGHTED</div>
              <div className="card-title">Capital Allocation</div>
            </div>
            <span className="badge badge-live" style={{ fontSize: '0.6rem' }}>Auto-adjusting</span>
          </div>

          {/* Allocation bar */}
          <div className="alloc-bar" style={{ marginBottom: '16px' }}>
            <div
              className="alloc-segment"
              style={{
                width: `${alloc?.priceAgent?.allocationPercent || 50}%`,
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              }}
            >
              {parseFloat(alloc?.priceAgent?.allocationPercent || 50) > 15
                ? `${alloc?.priceAgent?.allocationPercent || 50}%` : ''}
            </div>
            <div
              className="alloc-segment"
              style={{
                width: `${alloc?.flowAgent?.allocationPercent || 50}%`,
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              }}
            >
              {parseFloat(alloc?.flowAgent?.allocationPercent || 50) > 15
                ? `${alloc?.flowAgent?.allocationPercent || 50}%` : ''}
            </div>
          </div>

          {/* Legend */}
          {[
            { color: '#6366f1', label: 'Price Signal Agent', alloc: alloc?.priceAgent?.allocationPercent || 50, score: alloc?.priceAgent?.creditScore },
            { color: '#a78bfa', label: 'Flow Signal Agent', alloc: alloc?.flowAgent?.allocationPercent || 50, score: alloc?.flowAgent?.creditScore },
          ].map(({ color, label, alloc: a, score }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80` }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '700', color }}>
                  {a}%
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                  score: {score || '—'}
                </span>
              </div>
            </div>
          ))}

          <div style={{
            marginTop: '12px', padding: '10px 12px',
            background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
            color: 'var(--text-muted)', lineHeight: '1.5',
          }}>
            ↗ Capital split updates automatically after every cycle based on verified onchain credit scores
          </div>

          {/* Agent balances */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Agent Balances · X Layer
            </div>
            {[
              { label: '📊 Price', value: parseFloat(balances.signalPriceAgent || 0).toFixed(4), color: 'var(--primary-bright)' },
              { label: '🔍 Flow', value: parseFloat(balances.signalFlowAgent || 0).toFixed(4), color: '#a78bfa' },
              { label: '🏦 Allocator', value: parseFloat(balances.allocatorAgent || 0).toFixed(4), color: 'var(--accent)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '4px 0', borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: '600', color }}>{value} OKB</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Signal Feed ── */}
      <div className="card card-glow mb-6 reveal">
        <div className="card-header">
          <div>
            <div className="card-label">ONCHAIN OS · DEX API + WALLET API</div>
            <div className="card-title">Live Signal Feed</div>
          </div>
          <span className="badge badge-live">
            {allocations.length} cycles
          </span>
        </div>

        {allocations.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">📡</span>
            <span className="empty-title">Awaiting first cycle</span>
            <span className="empty-desc">
              Start the engine with <code style={{ color: 'var(--primary-bright)', background: 'var(--primary-dim)', padding: '1px 5px', borderRadius: '3px' }}>node core/engine.js</code> and signals will appear here every 2 minutes
            </span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {allocations.slice(0, 6).map((cycle, i) => (
              <div key={i} className="signal-card">
                <div className="signal-card-header">
                  <span className="signal-cycle">Cycle #{allocations.length - i}</span>
                  <span className="signal-time">{new Date(cycle.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="signal-row">
                  <span className="signal-agent-name">📊 Price Agent</span>
                  <DirBadge direction={cycle.priceSignal?.direction} />
                  <span className="signal-conf">{cycle.priceSignal?.confidence || 0}%</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--primary-bright)', marginLeft: 'auto' }}>
                    {cycle.creditWeightedAllocation?.priceAgent?.allocationPercent || 50}% weight
                  </span>
                </div>

                <div className="signal-row">
                  <span className="signal-agent-name">🔍 Flow Agent</span>
                  <DirBadge direction={cycle.flowSignal?.direction} />
                  <span className="signal-conf">{cycle.flowSignal?.confidence || 0}%</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#a78bfa', marginLeft: 'auto' }}>
                    {cycle.creditWeightedAllocation?.flowAgent?.allocationPercent || 50}% weight
                  </span>
                </div>

                <div className="signal-decision">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>Decision →</span>
                  <DirBadge direction={cycle.finalDecision} />
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>
                    {cycle.signalWasCorrect ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Trade History Table ── */}
      <div className="card card-glow mb-6 reveal">
        <div className="card-header">
          <div>
            <div className="card-label">ONCHAIN OS DEX AGGREGATOR · X LAYER MAINNET</div>
            <div className="card-title">Allocation Cycle History</div>
          </div>
        </div>

        {allocations.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">🔄</span>
            <span className="empty-title">No cycles completed</span>
            <span className="empty-desc">Allocation history with X Layer transaction hashes will appear here</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Price Signal</th>
                  <th>Flow Signal</th>
                  <th>Decision</th>
                  <th>Allocation Split</th>
                  <th>Outcome</th>
                  <th>Trade TX</th>
                  <th>MCP Log</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((c, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(c.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <DirBadge direction={c.priceSignal?.direction} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{c.priceSignal?.confidence || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <DirBadge direction={c.flowSignal?.direction} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{c.flowSignal?.confidence || 0}%</span>
                      </div>
                    </td>
                    <td><DirBadge direction={c.finalDecision} /></td>
                    <td>
                      <span style={{ color: 'var(--primary-bright)', fontWeight: '600' }}>
                        {c.creditWeightedAllocation?.priceAgent?.allocationPercent || 50}%
                        {' / '}
                        {c.creditWeightedAllocation?.flowAgent?.allocationPercent || 50}%
                      </span>
                    </td>
                    <td>
                      {c.signalWasCorrect
                        ? <span style={{ color: 'var(--buy)' }}>✅ Correct</span>
                        : <span style={{ color: 'var(--sell)' }}>❌ Wrong</span>
                      }
                    </td>
                    <td>
                      {c.tradeHash
                        ? <a className="tx-link" href={`${XLAYER_EXPLORER}/${c.tradeHash}`} target="_blank" rel="noopener noreferrer">
                            {c.tradeHash.slice(0,8)}...{c.tradeHash.slice(-4)}
                          </a>
                        : <span style={{ color: 'var(--text-muted)' }}>HOLD</span>
                      }
                    </td>
                    <td>
                      {c.mcpLogHash
                        ? <a className="tx-link" href={`${XLAYER_EXPLORER}/${c.mcpLogHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>
                            {c.mcpLogHash.slice(0,6)}...
                          </a>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Economy Loop Visual ── */}
      <div className="card card-glow reveal">
        <div className="card-header">
          <div>
            <div className="card-label">EARN → PAY → EARN · AUTONOMOUS · FOREVER</div>
            <div className="card-title">Economy Loop</div>
          </div>
          <a href="/economy" style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--primary-bright)', border: '1px solid var(--border-bright)',
            padding: '4px 12px', borderRadius: '20px',
            transition: 'background 0.15s',
          }}>
            Full breakdown →
          </a>
        </div>

        <div className="loop-flow">
          {[
            { icon: '📊', title: 'Price Signal', sub: 'DEX API', arrow: true },
            { icon: '🔍', title: 'Flow Signal', sub: 'Wallet API', arrow: true },
            { icon: '📈', title: 'Credit Score', sub: 'Accuracy + History', arrow: true },
            { icon: '⚖️', title: 'Allocate', sub: 'Credit Weighted', arrow: true },
            { icon: '🔄', title: 'Execute', sub: 'DEX Swap', arrow: true },
            { icon: '💳', title: 'x402 Pay', sub: 'Agent Fees', arrow: true },
            { icon: '📡', title: 'MCP Log', sub: 'Onchain Record', arrow: false },
          ].map(({ icon, title, sub, arrow }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
              <div className="loop-node" style={{ flex: 1 }}>
                {arrow && <span className="loop-node-arrow">›</span>}
                <span className="loop-node-icon">{icon}</span>
                <span className="loop-node-title">{title}</span>
                <span className="loop-node-sub">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Onchain OS skills used */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          <span className="skill-pill">DEX Aggregator API</span>
          <span className="skill-pill">Wallet API</span>
          <span className="skill-pill skill-pill-accent">x402 Protocol</span>
          <span className="skill-pill skill-pill-buy">MCP Integration</span>
          <span className="skill-pill">X Layer (Chain 196)</span>
        </div>
      </div>

    </div>
  );
}