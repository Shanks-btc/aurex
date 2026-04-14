'use client';

/**
 * AUREX — Leaderboard Page
 * Live agent credit rankings, performance charts,
 * accuracy history visualization
 */

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Leaderboard() {
  const [credit, setCredit]         = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/credit`).then(r => r.json()).catch(() => null),
      fetch(`${API_URL}/api/allocations`).then(r => r.json()).catch(() => []),
    ]).then(([c, a]) => {
      setCredit(c);
      setAllocations(Array.isArray(a) ? a : []);
    }).finally(() => setLoading(false));
  }, []);

  const agents = credit ? [
    {
      key: 'signal-price',
      name: 'Price Signal Agent',
      icon: '📊',
      color: '#6366f1',
      skill: 'Onchain OS DEX API',
      data: credit['signal-price'],
    },
    {
      key: 'signal-flow',
      name: 'Flow Signal Agent',
      icon: '🔍',
      color: '#a78bfa',
      skill: 'Onchain OS Wallet API',
      data: credit['signal-flow'],
    },
  ].sort((a, b) => (b.data?.score || 0) - (a.data?.score || 0)) : [];

  function accuracy(d) {
    if (!d?.totalSignals) return 0;
    return ((d.correctSignals / d.totalSignals) * 100);
  }

  function paymentRate(d) {
    if (!d?.x402PaymentsMade) return 0;
    return ((d.x402PaymentsOnTime / d.x402PaymentsMade) * 100);
  }

  const totalCycles = allocations.length;
  const correctTotal = allocations.filter(a => a.signalWasCorrect).length;
  const systemAccuracy = totalCycles ? ((correctTotal / totalCycles) * 100).toFixed(1) : 0;
  const trades = allocations.filter(a => a.tradeHash).length;

  // Last 30 cycles for chart
  const recentCycles = allocations.slice(0, 30).reverse();

  return (
    <div className="page">

      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="page-eyebrow">Merit-Based Rankings · Onchain Verified</div>
        <h1 className="page-title">Agent <em>Leaderboard</em></h1>
        <p className="page-desc">
          Agent rankings update automatically after every allocation cycle.
          Higher credit score = more capital allocated = more x402 earnings.
          All scores derived from real onchain activity.
        </p>
      </div>

      {/* ── System Stats ── */}
      <div className="grid-4 mb-6">
        {[
          { label: 'Total Cycles', value: loading ? '—' : totalCycles, color: 'var(--primary-bright)' },
          { label: 'System Accuracy', value: loading ? '—' : `${systemAccuracy}%`, color: 'var(--buy)' },
          { label: 'Trades Executed', value: loading ? '—' : trades, color: 'var(--accent)' },
          { label: 'x402 Payments', value: loading ? '—' : trades * 2, color: '#a78bfa' },
        ].map(({ label, value, color }, i) => (
          <div key={label} className={`stat-card reveal stagger-${i + 1}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Rankings ── */}
      <div className="card mb-6 reveal">
        <div className="card-header">
          <div>
            <div className="card-label">Credit Score Rankings</div>
            <div className="card-title">Agent Performance Board</div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2].map(i => (
              <div key={i} className="shimmer" style={{ height: '80px' }} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">🏆</span>
            <span className="empty-title">No rankings yet</span>
            <span className="empty-desc">Start the AUREX engine to build agent credit scores</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {agents.map((agent, i) => {
              const acc = accuracy(agent.data);
              const pay = paymentRate(agent.data);
              const isLeader = i === 0;

              return (
                <div
                  key={agent.key}
                  className={`rank-card rank-${i + 1}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Rank */}
                  <div className="rank-number">
                    {isLeader ? '🥇' : '🥈'}
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: '44px', height: '44px',
                    background: `linear-gradient(135deg, ${agent.color}25, ${agent.color}10)`,
                    border: `1px solid ${agent.color}30`,
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', flexShrink: 0,
                  }}>
                    {agent.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: '700',
                        fontSize: '0.88rem', color: 'var(--text-primary)',
                      }}>
                        {agent.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                        color: agent.color,
                      }}>
                        {agent.skill}
                      </span>
                      {isLeader && (
                        <span className="badge badge-live" style={{ fontSize: '0.58rem' }}>
                          Leading
                        </span>
                      )}
                    </div>

                    {/* Score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="progress-track" style={{ flex: 1 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${agent.data?.score || 0}%`,
                            background: `linear-gradient(90deg, ${agent.color}, ${agent.color}80)`,
                          }}
                        />
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: '700',
                        fontSize: '1.1rem', color: agent.color, minWidth: '55px',
                      }}>
                        {agent.data?.score || 0}
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 80px)',
                    gap: '8px', flexShrink: 0,
                  }}>
                    {[
                      { label: 'Accuracy', value: `${acc.toFixed(1)}%`, color: acc >= 60 ? 'var(--buy)' : 'var(--sell)' },
                      { label: 'Signals', value: agent.data?.totalSignals || 0, color: 'var(--text-primary)' },
                      { label: 'Correct', value: agent.data?.correctSignals || 0, color: 'var(--buy)' },
                      { label: 'Payments', value: `${pay.toFixed(0)}%`, color: 'var(--accent)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{
                        background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)',
                        padding: '8px', border: '1px solid var(--border-subtle)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: '700', color }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Performance Chart ── */}
      <div className="card mb-6 reveal">
        <div className="card-header">
          <div>
            <div className="card-label">Last 30 Cycles</div>
            <div className="card-title">Signal Accuracy Timeline</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--buy)', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>Correct</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--sell)', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>Wrong</span>
            </div>
          </div>
        </div>

        {recentCycles.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">📊</span>
            <span className="empty-title">No performance data</span>
            <span className="empty-desc">Chart will populate as cycles complete</span>
          </div>
        ) : (
          <div>
            <div className="perf-bars">
              {recentCycles.map((cycle, i) => (
                <div
                  key={i}
                  className={`perf-bar ${cycle.signalWasCorrect ? 'perf-bar-correct' : 'perf-bar-wrong'}`}
                  style={{ height: `${cycle.signalWasCorrect ? 100 : 40}%` }}
                  title={`${cycle.finalDecision} — ${cycle.signalWasCorrect ? 'Correct' : 'Wrong'} — ${new Date(cycle.timestamp).toLocaleTimeString()}`}
                />
              ))}
            </div>
            <div style={{
              marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
              color: 'var(--text-muted)', textAlign: 'center',
            }}>
              Showing last {recentCycles.length} allocation cycles · hover bars for details
            </div>
          </div>
        )}
      </div>

      {/* ── Credit Score Breakdown ── */}
      <div className="card reveal">
        <div className="card-header">
          <div>
            <div className="card-label">Scoring Formula</div>
            <div className="card-title">How Credit Score Is Calculated</div>
          </div>
        </div>

        <div className="grid-2">
          {[
            {
              component: 'Signal Accuracy',
              weight: '70%',
              formula: 'correctSignals / totalSignals × 70',
              desc: 'Measures how often the agent\'s signal direction matched the actual market outcome after the trade. Higher accuracy = higher credit component.',
              color: 'var(--buy)',
            },
            {
              component: 'Payment Reliability',
              weight: '30%',
              formula: 'x402PaymentsOnTime / x402PaymentsMade × 30',
              desc: 'Measures x402 payment history between agents. Consistent payment behavior demonstrates agent reliability and contributes to overall credit score.',
              color: 'var(--accent)',
            },
          ].map(({ component, weight, formula, desc, color }) => (
            <div key={component} style={{
              padding: '16px', background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.82rem',
                  fontWeight: '700', color: 'var(--text-primary)',
                }}>
                  {component}
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                  fontWeight: '700', color,
                  background: `${color}12`, border: `1px solid ${color}25`,
                  padding: '2px 8px', borderRadius: '4px',
                }}>
                  {weight}
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: color, background: 'var(--bg-void)',
                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)', marginBottom: '10px',
              }}>
                {formula}
              </div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                color: 'var(--text-secondary)', lineHeight: '1.5',
              }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '14px', padding: '12px 16px',
          background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-soft)',
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          color: 'var(--primary-bright)',
        }}>
          Final Score = (Accuracy × 70) + (Payment Rate × 30) → range: 0–100
        </div>
      </div>

    </div>
  );
}