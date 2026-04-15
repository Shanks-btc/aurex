'use client';

/**
 * AUREX — NavBar Client Component
 * Handles mobile hamburger menu with useState
 * Must be client component because of onClick handlers
 */

import { useState } from 'react';

export default function NavBar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/agents', label: 'Agents' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/economy', label: 'Economy' },
    { href: '/registry', label: '+ Registry', accent: true },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo">AX</div>
          <span className="nav-wordmark">AUREX</span>
          <span className="nav-version">v1.0.0</span>
        </div>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link"
              style={link.accent ? { color: 'var(--accent)' } : {}}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <div className="chain-pill">
            <span className="chain-dot" />
            X Layer
          </div>
          <span className="hackathon-pill">OKX Build X</span>

          {/* Hamburger button — mobile only */}
          <button
            className="nav-menu-btn"
            onClick={() => setOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="nav-drawer open">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link"
              style={link.accent ? { color: 'var(--accent)' } : {}}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
