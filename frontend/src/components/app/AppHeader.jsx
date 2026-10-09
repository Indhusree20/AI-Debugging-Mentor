import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDebugger } from '../../contexts/DebuggerContext';
import {
  Bug,
  Search,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  Keyboard,
  ChevronDown,
  Terminal,
  ShieldAlert,
} from 'lucide-react';

export function AppHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, activeFileName, setIsCommandPaletteOpen } = useDebugger();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-12 border-b border-surface-200 dark:border-ide-border bg-white dark:bg-ide-bg flex items-center justify-between px-4 select-none shrink-0 z-30">
      {/* Left: Brand + Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm group-hover:bg-blue-500 transition-colors">
            <Bug className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
            <span>AI DEBUGGING MENTOR</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-500 dark:text-zinc-400 font-mono font-medium border border-zinc-200 dark:border-surface-700">
              v1.0
            </span>
          </div>
        </Link>

        {/* Workspace breadcrumb */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 border-l border-surface-200 dark:border-ide-border pl-4">
            <span className="hover:text-zinc-300 transition-colors">Workspace</span>
            <span>/</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">{activeFileName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 font-mono">
              {language.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      {user && (
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-surface-900 hover:bg-zinc-200 dark:hover:bg-surface-850 border border-surface-200 dark:border-ide-border text-xs text-zinc-500 dark:text-zinc-400 transition-all w-72 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search or jump to...</span>
          </div>
          <kbd className="font-mono text-[10px] bg-white dark:bg-surface-800 border border-zinc-200 dark:border-surface-700 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
            Ctrl K
          </kbd>
        </button>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-surface-850 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-2 py-1 pr-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-surface-850 border border-transparent hover:border-surface-200 dark:hover:border-ide-border transition-all"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[11px]">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-zinc-700 dark:text-zinc-200 max-w-[100px] truncate">
                {user.name}
              </span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border shadow-panel p-1.5 z-50 text-xs font-medium space-y-0.5">
                  <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-800 mb-1">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                    <div className="text-[10px] text-blue-500 dark:text-blue-400 font-mono mt-0.5 capitalize">
                      {user.experienceLevel?.toLowerCase()} Tier
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Profile & Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsCommandPaletteOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard className="h-3.5 w-3.5" />
                      <span>Shortcuts</span>
                    </div>
                    <kbd className="font-mono text-[9px] text-zinc-500">Ctrl+K</kbd>
                  </button>

                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-zinc-100 dark:hover:bg-surface-800 transition-colors"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Admin Telemetry</span>
                    </Link>
                  )}

                  <div className="border-t border-surface-200 dark:border-surface-800 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-surface-850 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
