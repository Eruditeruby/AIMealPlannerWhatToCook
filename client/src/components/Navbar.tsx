'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Button from './ui/Button';
import { ChefHat, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/pantry', label: 'Pantry' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/favorites', label: 'Favorites' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[var(--accent)] font-bold text-lg">
          <ChefHat size={24} />
          What To Cook
          <span className="text-[10px] font-normal text-[var(--text-secondary)] self-end mb-0.5">v1.0.0</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated && navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.avatar && (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm text-[var(--text-secondary)]">{user?.name}</span>
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Button onClick={login}>Sign in with Google</Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-[var(--border)] overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              {isAuthenticated && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text)] py-2"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button variant="ghost" onClick={logout}>Logout</Button>
              ) : (
                <Button onClick={login}>Sign in with Google</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
