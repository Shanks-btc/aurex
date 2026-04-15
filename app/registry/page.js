'use client';

/**
 * AUREX — Agent Registry with Wallet Connect
 * Hackathon: AI Interactive Experience (25% score)
 */

import { useState, useEffect } from 'react';

const DEMO_AGENTS = [
  {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    name: 'Alpha Signal Bot',
    type: 'Price Momentum',
    creditScore: 74,
    signals: 42,
    accuracy: 71.4,
    status: 'active',
    earnings: '0.0084',
  },
  {
    address: '0x8ba1f109551bD432803012645Ac136cc1836bA',
    name: 'Flow Tracker v2',
    type: 'Wallet Flow',
    creditScore: 61,
    signals: 38,
    accuracy: 63.2,
    status: 'active',
    earnings: '0.0062',
  },
  {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    name: 'Sentiment Agent',
    type: 'Social Signal',
    creditScore: 45,
    signals: 21,
    accuracy: 52.3,
    status: 'pending',
    earnings: '0.0021',
  },
];

function scoreColor(s) {
  if (s >= 70) return '#10b981';
  if (s >= 50) return '#f59e0b';
  return '#f43f5e';
}

function shortAddr(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function RegistryPage() {
  const [agents, setAgents] = useState(DEMO_AGENTS);
  const [walletAddress, setWalletAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Price Momentum' });
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [networkOk, setNetworkOk] = useState(null);

  // Check if already connected on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) setWalletAddress(accounts[0]);
        }).catch(() => {});
    }
  }, []);

  async function connectWallet() {
    setError(null);
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not found. Please install MetaMask to connect your wallet.');
      return;
    }

    setConnecting(true);
    try {
      // Request wallet connection
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = accounts[0];
      setWalletAddress(address);

      // Check network — X Layer chain ID is 196 (0xc4)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isXLayer = chainId === '0xc4';
      setNetworkOk(isXLayer);

      if (!isXLayer) {
        // Prompt to switch to X Layer
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xc4' }],
          });
          setNetworkOk(true);
        } catch (switchErr) {
          // X Layer not added yet — add it
          if (switchErr.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xc4',
                  chainName: 'X Layer Mainnet',
                  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
                  rpcUrls: ['https://xlayer.drpc.org'],
                  blockExplorerUrls: ['https://www.oklink.com/xlayer'],
                }],
              });
              setNetworkOk(true);
            } catch (addErr) {
              setNetworkOk(false);
            }
          }
        }
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the MetaMask request.');
      } else {
        setError(`Connection failed: ${err.message}`);
      }
    } finally {
      setConnecting(false);
    }
  }

  function disconnectWallet() {
    setWalletAddress(null);
    setNetworkOk(null);
    setSuccess(null);
    setError(null);
  }

  async function handleRegister() {
    setError(null);
    setSuccess(null);

    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!form.name.trim()) {
      setError('Please enter an agent name');
      return;
    }

    if (agents.find(a => a.address.toLowerCase() === walletAddress.toLowerCase())) {
      setError('This wallet is already registered as an agent');
      return;
    }

    setRegistering(true);
    await new Promise(r => setTimeout(r, 2000));

    const newAgent = {
      address: walletAddress,
      name: form.name,
      type: form.type,
      creditScore: 50,
      signals: 0,
      accuracy: 0,
      status: 'pending',
      earnings: '0.0000',
    };

    setAgents(prev => [newAgent, ...prev]);
    setSuccess(`Agent "${form.name}" registered! Starting credit score: 50/100. You will earn x402 fees as you submit accurate signals.`);
    setForm({ name: '', type: 'Price Momentum' });
    setRegistering(false);
  }

  const isAlreadyRegistered = walletAddress &&
    agents.find(a => a.address.toLowerCase() === walletAddress.toLowerCase());

  return (
    <div className="page">

      {/* Hero */}
      <div className="page-hero">
        <div className="page-eyebrow">Open Infrastructure - Agent Plugin System</div>
        <h1 className="page-title">Agent <em>Registry</em></h1>
        <p className="page-desc">
          AUREX is open credit infrastructure. Connect your wallet, register as
          an agent, receive a verifiable onchain credit score, and earn x402 fees
          proportional to your signal accuracy — automatically.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6">
        {[
          { label: 'Registered Agents', value: agents.length, color: 'var(--primary-bright)' },
          { label: 'Active Agents', value: agents.filter(a => a.status === 'active').length, color: 'var(--buy)' },
          { label: 'Avg Credit Score', value: `${Math.round(agents.reduce((s, a) => s + a.creditScore, 0) / agents.length)}/100`, color: 'var(--accent)' },
          { label: 'Total Earned', value: `${agents.reduce((s, a) => s + parseFloat(a.earnings), 0).toFixed(4)} OKB`, color: '#a78bfa' },
        ].map(({ label, value, color }, i) => (
          <div key={label} className={`stat-card reveal stagger-${i + 1}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color, fontSize: '1.5rem' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-6">

        {/* Connect + Register Panel */}
        <div className="card card-glow reveal">
          <div className="card-header">
            <div>
              <div className="card-label">Step 1 of 2</div>
              <div className="card-title">Connect Your Wallet</div>
            </div>
            {walletAddress && (
              <span className="badge badge-live">Connected</span>
            )}
          </div>

          {/* Wallet connect button */}
          {!walletAddress ? (
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                Connect your MetaMask wallet to register as an AUREX signal agent.
                Your wallet becomes your onchain identity — no signup, no email, no password.
              </p>

              <button
                onClick={connectWallet}
                disabled={connecting}
                style={{
                  width: '100%', padding: '14px 24px',
                  background: connecting
                    ? 'var(--border-medium)'
                    : 'linear-gradient(135deg, #f6851b, #e2761b)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  color: 'white', fontFamily: 'var(--font-display)',
                  fontWeight: '700', fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  cursor: connecting ? 'not-allowed' : 'pointer',
                  boxShadow: connecting ? 'none' : '0 4px 20px rgba(246,133,27,0.3)',
                  marginBottom: '12px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🦊</span>
                {connecting ? 'Connecting...' : 'Connect MetaMask'}
              </button>

              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                color: 'var(--text-muted)', textAlign: 'center',
              }}>
                Requires MetaMask browser extension
              </div>
            </div>
          ) : (
            <div>
              {/* Connected wallet info */}
              <div style={{
                padding: '14px', background: 'var(--bg-void)',
                borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.3)',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--buy)', marginBottom: '4px', letterSpacing: '0.1em' }}>
                      WALLET CONNECTED
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {shortAddr(walletAddress)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {walletAddress}
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    style={{
                      padding: '4px 10px', background: 'transparent',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '4px', color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                      cursor: 'pointer',
                    }}
                  >
                    Disconnect
                  </button>
                </div>

                {/* Network status */}
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: networkOk ? 'var(--buy)' : 'var(--sell)',
                    boxShadow: networkOk ? '0 0 6px var(--buy)' : 'none',
                  }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: networkOk ? 'var(--buy)' : 'var(--sell)' }}>
                    {networkOk ? 'X Layer Network' : 'Wrong network — please switch to X Layer'}
                  </span>
                </div>
              </div>

              {/* Already registered notice */}
              {isAlreadyRegistered ? (
                <div style={{
                  padding: '14px', background: 'var(--primary-dim)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-bright)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--primary-bright)',
                }}>
                  This wallet is already registered as an agent.
                  Check the table below to see your credit score and earnings.
                </div>
              ) : (
                <div>
                  {/* Step 2: Register form */}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Step 2 — Register Your Agent
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Agent Name
                      </div>
                      <input
                        type="text"
                        placeholder="My Signal Agent"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 14px',
                          background: 'var(--bg-void)', border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                          fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Signal Type
                      </div>
                      <select
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 14px',
                          background: 'var(--bg-void)', border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                          fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                          outline: 'none', cursor: 'pointer',
                        }}
                      >
                        <option>Price Momentum</option>
                        <option>Wallet Flow</option>
                        <option>Social Signal</option>
                        <option>On-chain Analytics</option>
                        <option>MEV Detection</option>
                        <option>Custom Signal</option>
                      </select>
                    </div>

                    {error && (
                      <div style={{ padding: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--sell)' }}>
                        {error}
                      </div>
                    )}

                    {success && (
                      <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--buy)', lineHeight: '1.5' }}>
                        {success}
                      </div>
                    )}

                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      style={{
                        padding: '12px 24px',
                        background: registering
                          ? 'var(--border-medium)'
                          : 'linear-gradient(135deg, var(--primary), #4f46e5)',
                        border: 'none', borderRadius: 'var(--radius-sm)',
                        color: 'white', fontFamily: 'var(--font-display)',
                        fontWeight: '700', fontSize: '0.82rem',
                        letterSpacing: '0.05em',
                        cursor: registering ? 'not-allowed' : 'pointer',
                        boxShadow: registering ? 'none' : '0 4px 16px var(--primary-glow)',
                      }}
                    >
                      {registering ? 'Registering on AUREX...' : 'Register Agent →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card reveal stagger-2">
            <div className="card-label">Value Proposition</div>
            <div className="card-title" style={{ marginBottom: '14px' }}>Why Plug Into AUREX?</div>
            {[
              { icon: '📈', title: 'Verifiable Credit Score', desc: 'Trustless credit score built from real onchain signal accuracy — not self-reported.' },
              { icon: '💳', title: 'Earn x402 Fees', desc: 'Every cycle your signal influences allocation, you earn x402 micro-payments automatically.' },
              { icon: '⚖️', title: 'Merit-Based Capital', desc: 'Better signals = higher score = more capital allocated = more fees. Pure performance.' },
              { icon: '📡', title: 'MCP Audit Trail', desc: 'Every decision logged onchain via MCP. Your accuracy history is permanently verifiable.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '3px' }}>{title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card reveal stagger-3">
            <div className="card-label">Credit Score Formula</div>
            <div className="card-title" style={{ marginBottom: '10px' }}>How Your Score Is Calculated</div>
            <div style={{ background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)', padding: '12px', border: '1px solid var(--border-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--primary-bright)', lineHeight: '1.8' }}>
              {`score = (accuracy  x 70)\n      + (payment_rate x 30)\n\nRange: 0 - 100\nStart: 50 (new agents)\n\nHigher score = more capital weight\nMore capital = more x402 earnings`}
            </div>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="card reveal">
        <div className="card-header">
          <div>
            <div className="card-label">Live Registry - X Layer</div>
            <div className="card-title">Registered Agents</div>
          </div>
          <span className="badge badge-live">{agents.length} agents</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Wallet</th>
                <th>Type</th>
                <th>Credit Score</th>
                <th>Accuracy</th>
                <th>Signals</th>
                <th>Earned (OKB)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, i) => {
                const isMe = walletAddress &&
                  agent.address.toLowerCase() === walletAddress.toLowerCase();
                return (
                  <tr key={i} style={isMe ? { background: 'var(--primary-dim)' } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                          {agent.name}
                        </span>
                        {isMe && (
                          <span className="badge badge-live" style={{ fontSize: '0.55rem' }}>YOU</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <a
                        href={`https://www.oklink.com/xlayer/address/${agent.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-link"
                      >
                        {shortAddr(agent.address)}
                      </a>
                    </td>
                    <td><span className="skill-pill">{agent.type}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '48px' }}>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{ width: `${agent.creditScore}%`, background: scoreColor(agent.creditScore) }}
                            />
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: scoreColor(agent.creditScore) }}>
                          {agent.creditScore}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: agent.accuracy >= 60 ? 'var(--buy)' : agent.accuracy === 0 ? 'var(--text-muted)' : 'var(--sell)' }}>
                      {agent.accuracy > 0 ? `${agent.accuracy.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td>{agent.signals}</td>
                    <td style={{ color: 'var(--accent)' }}>{agent.earnings}</td>
                    <td>
                      <span className={`badge ${agent.status === 'active' ? 'badge-live' : 'badge-hold'}`}>
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
