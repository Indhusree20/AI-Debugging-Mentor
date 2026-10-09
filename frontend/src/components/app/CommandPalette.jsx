import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebugger } from '../../contexts/DebuggerContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Search,
  Terminal,
  Play,
  Sparkles,
  LayoutDashboard,
  History,
  BarChart2,
  Lightbulb,
  Sun,
  Moon,
  FileCode,
  X,
} from 'lucide-react';

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    loadSample,
    runCode,
    analyzeCode,
    SAMPLE_FILES,
  } = useDebugger();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      category: 'Actions',
      items: [
        {
          id: 'run-code',
          label: 'Run Code in Sandbox',
          shortcut: 'Ctrl+Enter',
          icon: Play,
          action: () => {
            navigate('/debugger');
            runCode();
          },
        },
        {
          id: 'debug-code',
          label: 'Debug Code with AI Mentor',
          shortcut: 'Ctrl+Shift+Enter',
          icon: Sparkles,
          action: () => {
            navigate('/debugger');
            analyzeCode();
          },
        },
        {
          id: 'toggle-theme',
          label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
          icon: theme === 'dark' ? Sun : Moon,
          action: toggleTheme,
        },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
        { id: 'nav-debugger', label: 'Go to Code Debugger', icon: Terminal, action: () => navigate('/debugger') },
        { id: 'nav-history', label: 'Go to Debugging History', icon: History, action: () => navigate('/history') },
        { id: 'nav-analytics', label: 'Go to Learning Analytics', icon: BarChart2, action: () => navigate('/analytics') },
        { id: 'nav-practice', label: 'Go to Recommended Practice', icon: Lightbulb, action: () => navigate('/recommendations') },
      ],
    },
    {
      category: 'Load Bug Demo Samples',
      items: Object.entries(SAMPLE_FILES).map(([key, sample]) => ({
        id: `sample-${key}`,
        label: `Load ${sample.title}`,
        icon: FileCode,
        action: () => {
          navigate('/debugger');
          loadSample(key);
        },
      })),
    },
  ];

  // Filter items by query
  const filteredGroups = actions
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const handleSelect = (itemAction) => {
    setIsCommandPaletteOpen(false);
    itemAction();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={() => setIsCommandPaletteOpen(false)} />

      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border shadow-2xl overflow-hidden flex flex-col max-h-[70vh] z-10">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-800">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <kbd className="font-mono text-[10px] text-zinc-400 bg-zinc-100 dark:bg-surface-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-surface-700">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-3 text-xs">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {group.category}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.action)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-surface-800 text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <kbd className="font-mono text-[10px] text-zinc-400 bg-zinc-100 dark:bg-surface-850 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-surface-700">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-zinc-400">
              No matching commands found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
