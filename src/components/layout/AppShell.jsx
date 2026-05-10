import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AICopilot from '../ai/AICopilot';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'My Trips',  path: '/trips',     icon: '🌍' },
  { name: 'Explore',   path: '/explore',   icon: '🧭' },
  { name: 'Profile',   path: '/profile',   icon: '👤' },
];

export default function AppShell() {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-base text-primary">

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 z-40"
           style={{ background: 'hsla(220,18%,7%,0.88)', backdropFilter: 'blur(16px)' }}>
        <span className="font-display text-xl font-extrabold text-sig tracking-tight">Traveloop</span>
        <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center">
          <span className="text-sm">👤</span>
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 border-r border-border flex-col sticky top-0 h-screen relative overflow-hidden">

        {/* Ambient amber orb at top of sidebar */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none animate-glow-pulse"
             style={{ background: 'radial-gradient(circle, hsla(38,92%,58%,0.1) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 px-8 pt-8 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sig flex items-center justify-center shrink-0"
                 style={{ boxShadow: 'var(--glow-xs)' }}>
              <span className="text-black text-sm font-black">T</span>
            </div>
            <span className="font-display text-2xl font-extrabold text-sig tracking-tight">raveloop</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted mt-1 ml-9">Plan Smarter.</p>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-4 py-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-muted px-4 mb-3">Navigation</p>
          <ul className="space-y-1">
            {navLinks.map(link => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-body transition-all duration-300 relative overflow-hidden group ${
                      isActive
                        ? 'text-sig'
                        : 'text-secondary hover:text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator line */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 rounded-xl"
                          style={{ background: 'hsla(38,92%,58%,0.08)', border: '1px solid hsla(38,92%,58%,0.2)' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      {/* Hover shimmer */}
                      {!isActive && (
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                             style={{ background: 'hsla(220,14%,11%,0.8)' }} />
                      )}
                      <span className="text-lg relative z-10">{link.icon}</span>
                      <span className="font-medium text-sm relative z-10">{link.name}</span>
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

        {/* Bottom divider + user info */}
        <div className="relative z-10 p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-elevated transition-colors duration-200 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-elevated border border-border flex items-center justify-center shrink-0"
                 style={{ boxShadow: 'var(--glow-xs)' }}>
              <span className="text-base">👤</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary truncate">Santhosh</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Explorer</p>
            </div>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 relative overflow-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>

        {/* Floating AI Copilot button */}
        <motion.button
          onClick={() => setIsAiOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-sig rounded-full flex items-center justify-center text-2xl z-50 cursor-pointer"
          style={{ boxShadow: 'var(--glow-md)' }}
          title="Open AI Copilot"
        >
          ✨
        </motion.button>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around p-2 pb-[env(safe-area-inset-bottom,0.5rem)] border-t border-border"
        style={{ background: 'hsla(220,14%,11%,0.92)', backdropFilter: 'blur(16px)' }}
      >
        {navLinks.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-sig' : 'text-secondary hover:text-primary'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[10px] font-bold">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* AI Copilot */}
      <AICopilot isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
