import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDebugger } from '../../contexts/DebuggerContext';
import {
  LayoutDashboard,
  Terminal,
  History,
  BarChart2,
  Lightbulb,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
} from 'lucide-react';

export function AppSidebar() {
  const { user } = useAuth();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useDebugger();

  const primaryNav = [
    { to: '/debugger', label: 'Debug', icon: Terminal, highlight: true },
    { to: '/practice', label: 'Practice', icon: Lightbulb },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'History', icon: History },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const secondaryNav = [
    { to: '/profile', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    secondaryNav.unshift({ to: '/admin', label: 'Admin', icon: ShieldAlert });
  }

  return (
    <aside
      className={`border-r border-surface-200 dark:border-ide-border bg-zinc-50/50 dark:bg-ide-sidebar flex flex-col justify-between shrink-0 select-none transition-all duration-200 z-20 ${
        isSidebarCollapsed ? 'w-14' : 'w-52'
      }`}
    >
      {/* Top Nav Items */}
      <div className="p-2 space-y-1">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all relative group ${
                  isActive
                    ? 'bg-white dark:bg-surface-850 text-blue-600 dark:text-blue-400 border border-surface-200 dark:border-surface-700 shadow-subtle'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-surface-850/50 border border-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}

              {/* Active / Running Indicator Badge */}
              {item.highlight && !isSidebarCollapsed && (
                <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-blue-500" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Nav & Collapse Control */}
      <div className="p-2 space-y-1 border-t border-surface-200 dark:border-ide-border">
        {secondaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-white dark:bg-surface-850 text-blue-600 dark:text-blue-400 border border-surface-200 dark:border-surface-700 shadow-subtle'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-surface-850/50 border border-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-surface-850 transition-colors"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
