/**
 * AUREX — Root Layout
 */

import './globals.css';

export const metadata = {
  title: 'AUREX — Autonomous Capital Allocation',
  description: 'Autonomous capital allocation system for agentic economy on X Layer.',
  keywords: ['AUREX', 'X Layer', 'Onchain OS', 'AI Agents', 'OKX', 'DeFi'],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            function toggleNav() {
              var drawer = document.getElementById('nav-drawer');
              drawer.classList.toggle('open');
            }
            document.addEventListener('click', function(e) {
              var drawer = document.getElementById('nav-drawer');
              var btn = document.getElementById('nav-menu-btn');
              if (drawer && btn && !drawer.contains(e.target) && !btn.contains(e.target)) {
                drawer.classList.remove('open');
              }
            });
          `
        }} />
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
                  <span className="ticker-value">X LAYER 196</span>
                </span>
                <span className="ticker-item">
                  <span className="ticker-label">ONCHAIN OS</span>
                  <span className="ticker-up">DEX + WALLET + x402 + MCP</span>
                </span>
                <span className="ticker-item">
                  <span className="ticker-label">AGENTS</span>
                  <span className="ticker-value">3 AUTONOMOUS OPERATING</span>
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

          {/* Desktop links */}
          <div className="nav-links">
            <a href="/" className="nav-link">Dashboard</a>
            <a href="/agents" className="nav-link">Agents</a>
            <a href="/leaderboard" className="nav-link">Leaderboard</a>
            <a href="/economy" className="nav-link">Economy</a>
            <a href="/registry" className="nav-link" style={{ color: 'var(--accent)' }}>
              + Registry
            </a>
          </div>

          <div className="nav-right">
            <div className="chain-pill">
              <span className="chain-dot" />
              X Layer
            </div>
            <span className="hackathon-pill">OKX Build X</span>

            {/* Mobile hamburger */}
            <button
              id="nav-menu-btn"
              className="nav-menu-btn"
              onClick={() => {
                const drawer = document.getElementById('nav-drawer');
                if (drawer) drawer.classList.toggle('open');
              }}
            >
              ☰
            </button>
          </div>
        </nav>

        {/* Mobile nav drawer */}
        <div id="nav-drawer" className="nav-drawer">
          <a href="/" className="nav-link" onClick={() => document.getElementById('nav-drawer').classList.remove('open')}>Dashboard</a>
          <a href="/agents" className="nav-link" onClick={() => document.getElementById('nav-drawer').classList.remove('open')}>Agents</a>
          <a href="/leaderboard" className="nav-link" onClick={() => document.getElementById('nav-drawer').classList.remove('open')}>Leaderboard</a>
          <a href="/economy" className="nav-link" onClick={() => document.getElementById('nav-drawer').classList.remove('open')}>Economy Loop</a>
          <a href="/registry" className="nav-link" style={{ color: 'var(--accent)' }} onClick={() => document.getElementById('nav-drawer').classList.remove('open')}>+ Registry</a>
        </div>

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
            <a href="https://www.oklink.com/xlayer" target="_blank" rel="noopener noreferrer" className="footer-link">X Layer Explorer</a>
            <a href="https://www.okx.com/web3/build/docs" target="_blank" rel="noopener noreferrer" className="footer-link">Onchain OS Docs</a>
            <a href="https://github.com/Shanks-btc/aurex" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            <a href="/registry" className="footer-link" style={{ color: 'var(--accent)' }}>Register Agent</a>
          </div>
        </footer>

      </body>
    </html>
  );
}
