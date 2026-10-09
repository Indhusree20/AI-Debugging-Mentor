import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Terminal,
  History,
  BarChart3,
  Lightbulb,
  User,
  ShieldAlert,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/debugger', label: 'Code Debugger', icon: Terminal, highlight: true },
    { to: '/history', label: 'History & Sessions', icon: History },
    { to: '/analytics', label: 'Learning Analytics', icon: BarChart3 },
    { to: '/recommendations', label: 'Recommended Topics', icon: Lightbulb },
    { to: '/profile', label: 'Profile & Settings', icon: User },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/admin', label: 'Admin Telemetry', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0b0f19] flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${item.highlight ? 'relative' : ''}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Experience Level Scaffolding Badge */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-2 mb-2 text-indigo-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Adaptive Mode</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Mentoring explanations dynamically calibrate to your <strong className="text-slate-200">{user?.experienceLevel || 'Beginner'}</strong> tier.
        </p>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              user?.experienceLevel === 'ADVANCED'
                ? 'w-full bg-indigo-500'
                : user?.experienceLevel === 'INTERMEDIATE'
                ? 'w-2/3 bg-blue-500'
                : 'w-1/3 bg-emerald-500'
            }`}
          />
        </div>
      </div>
    </aside>
  );
}
