/**
 * AUREX — Root Layout
 */

import './globals.css';

export const metadata = {
  title: 'AUREX — Autonomous Capital Allocation',
  description: 'Autonomous capital allocation system for agentic economy on X Layer. Credit scores built from real onchain accuracy determine capital allocation.',
  keywords: ['AUREX', 'X Layer', 'Onchain OS', 'AI Agents', 'OKX', 'DeFi', 'Credit Scoring'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>

        {/* Ticker Strip */}
        <div className="ticker-strip">
          <div className="ticker-content">
            {[...Array(2)].map((_, set) => (
              <span key={set} style={{ display: 'flex', gap: '48px' }}>
                <span className="ticker-item">
                  <span className="ticker-label">AUREX</span>
                  <span className="ticker-value">AUTONOMOUS CAPITAL ALLOCATION</span>
                  <span className="ticker-up">LIVE</span>
                </span>
                <span className="ticker-item">
                  <span className="ticker-label">NETWORK</span>
                  <span className="ticker-value">X LAYER</span>
                  <span className="ticker-label">CHAIN ID</span>
                  <span className="ticker-value">196</span>
                </span>
                <span className="ticker-item">
                  <span className="ticker-label">ONCHAIN OS</span>
                  <span className="ticker-up">DEX API + WALLET API + x402 + MCP</span>
                </span>
                <span className="ticker-item">
                  <span className="ticker-label">AGENTS</span>
                  <span className="ticker-value">3 AUTONOMOUS</span>
                  <span className="ticker-up">OPERATING</span>
                </span>
                <span className="ticker-item">
                  <span className="ticker-label">PROTOCOL</span>
                  <span className="ticker-value">SIGNAL TO CREDIT TO ALLOCATE TO EARN</span>
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-brand">
            <div className="nav-logo">AX</div>
            <span className="nav-wordmark">AUREX</span>
            <span className="nav-version">v1.0.0</span>
          </div>

          <div className="nav-links">
            <a href="/" className="nav-link">Dashboard</a>
            <a href="/agents" className="nav-link">Agents</a>
            <a href="/leaderboard" className="nav-link">Leaderboard</a>
            <a href="/economy" className="nav-link">Economy Loop</a>
            <a href="/registry" className="nav-link" style={{ color: 'var(--accent)' }}>
              + Registry
            </a>
          </div>

          <div className="nav-right">
            <div className="chain-pill">
              <span className="chain-dot" />
              X Layer · 196
            </div>
            <span className="hackathon-pill">OKX Build X S2</span>
          </div>
        </nav>

        {/* Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-left">
            <span className="footer-brand">AUREX</span>
            <span className="footer-desc">
              Autonomous Capital Allocation System for Agentic Economy
            </span>
          </div>
          <div className="footer-links">
            <a href="https://www.oklink.com/xlayer" target="_blank" rel="noopener noreferrer" className="footer-link">
              X Layer Explorer
            </a>
            <a href="https://www.okx.com/web3/build/docs" target="_blank" rel="noopener noreferrer" className="footer-link">
              Onchain OS Docs
            </a>
            <a href="https://github.com/Shanks-btc/aurex" target="_blank" rel="noopener noreferrer" className="footer-link">
              GitHub
            </a>
            <a href="/registry" className="footer-link" style={{ color: 'var(--accent)' }}>
              Register Agent
            </a>
          </div>
        </footer>

      </body>
    </html>
  );
}
