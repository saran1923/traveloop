import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AICopilot from '../ai/AICopilot';

/* ── SVG Icons — no emojis ── */
const IconHome = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
  </svg>
);
const IconGlobe = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8M3.6 15h16.8" />
    <path d="M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
  </svg>
);
const IconCompass = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);
const IconUser = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconSparkle = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', Icon: IconHome },
  { name: 'My Trips',  path: '/trips',     Icon: IconGlobe },
  { name: 'Explore',   path: '/explore',   Icon: IconCompass },
  { name: 'Profile',   path: '/profile',   Icon: IconUser },
];

export default function AppShell() {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-primary" style={{ background: 'var(--bg-base)' }}>

      {/* ── Mobile Header ── */}
      <div
        className="md:hidden flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 z-40"
        style={{ background: 'hsla(220,18%,7%,0.9)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-sig flex items-center justify-center" style={{ boxShadow: 'var(--glow-xs)' }}>
            <span className="text-black text-xs font-black">T</span>
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight" style={{ color: 'var(--sig)' }}>raveloop</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center">
          <IconUser className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex w-64 border-r border-border flex-col sticky top-0 h-screen relative overflow-hidden"
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Ambient amber orb */}
        <div
          className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, hsla(38,92%,58%,0.09) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative z-10 px-8 pt-8 pb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg bg-sig flex items-center justify-center shrink-0"
              style={{ boxShadow: 'var(--glow-xs)' }}
            >
              <span className="text-black text-sm font-black">T</span>
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight" style={{ color: 'var(--sig)' }}>
              raveloop
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted mt-1.5 ml-[2.4rem]">
            Plan Smarter.
          </p>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-4 py-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-muted px-4 mb-3">Navigation</p>
          <ul className="space-y-0.5">
            {navLinks.map(({ name, path, Icon }) => (
              <li key={name}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 relative overflow-hidden group ${
                      isActive ? 'text-sig' : 'text-secondary hover:text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'hsla(38,92%,58%,0.08)',
                            border: '1px solid hsla(38,92%,58%,0.18)',
                          }}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                             style={{ background: 'hsla(220,10%,100%,0.03)' }} />
                      )}
                      <Icon className="w-[18px] h-[18px] relative z-10 shrink-0" />
                      <span className="font-medium text-sm relative z-10">{name}</span>
                      {isActive && (
                        <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-sig" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="relative z-10 p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-elevated cursor-pointer transition-colors duration-200">
            <div
              className="w-9 h-9 rounded-full bg-elevated border border-border flex items-center justify-center shrink-0"
            >
              <IconUser className="w-4 h-4 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary truncate">Santhosh</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Explorer</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 relative overflow-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>

        {/* Floating AI Copilot button — SVG icon, no emoji */}
        <motion.button
          onClick={() => setIsAiOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 rounded-full flex items-center justify-center z-50 cursor-pointer"
          style={{ background: 'var(--sig)', boxShadow: 'var(--glow-md)' }}
          title="Open AI Copilot"
          aria-label="Open AI Copilot"
        >
          <IconSparkle className="w-6 h-6 text-black" />
        </motion.button>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-2 border-t border-border"
        style={{ background: 'hsla(220,14%,9%,0.95)', backdropFilter: 'blur(20px)' }}
      >
        {navLinks.map(({ name, path, Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-sig' : 'text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-sig' : 'text-secondary'}`} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <AICopilot isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
