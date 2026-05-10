import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AICopilot from '../ai/AICopilot';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'My Trips', path: '/trips', icon: '🌍' },
  { name: 'Explore', path: '/explore', icon: '🧭' },
  { name: 'Profile', path: '/profile', icon: '👤' },
];

export default function AppShell() {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-base text-primary">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-base/80 backdrop-blur-md sticky top-0 z-40">
        <span className="font-display text-xl font-extrabold text-sig tracking-tight">
          Traveloop
        </span>
        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
           <span className="text-sm">👤</span>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border flex-col sticky top-0 h-screen">
        <div className="p-8">
          <span className="font-display text-2xl font-extrabold text-sig tracking-tight">
            Traveloop
          </span>
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-body transition-all duration-200 ${
                      isActive
                        ? 'bg-sig/10 text-sig border border-sig/20 shadow-sig-glow'
                        : 'text-secondary hover:bg-surface hover:text-primary'
                    }`
                  }
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
               <span className="text-lg">👤</span>
            </div>
            <div>
              <p className="text-sm font-medium">Santhosh</p>
              <p className="text-xs text-muted">Explorer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>

        {/* Floating AI Copilot Trigger */}
        <motion.button
          onClick={() => setIsAiOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-sig rounded-full shadow-sig-glow flex items-center justify-center text-2xl z-50 cursor-pointer"
        >
          ✨
        </motion.button>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border z-40 flex justify-around p-2 pb-[env(safe-area-inset-bottom)]">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive ? 'text-sig' : 'text-secondary hover:text-primary'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[10px] font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* AI Sidebar */}
      <AICopilot isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
