/**
 * AUREX — Root Layout (Server Component)
 * Mobile nav extracted to client component to fix onClick error
 */

import './globals.css';
import NavBar from './NavBar';

export const metadata = {
  title: 'AUREX — Autonomous Capital Allocation',
  description: 'Autonomous capital allocation system for agentic economy on X Layer.',
  keywords: ['AUREX', 'X Layer', 'Onchain OS', 'AI Agents', 'OKX', 'DeFi'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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

        {/* Client-side navbar with mobile menu */}
        <NavBar />

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
