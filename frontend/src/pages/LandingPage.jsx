import React from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Bug,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GitCompare,
  Lightbulb,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';

export function LandingPage() {
  const capabilities = [
    {
      icon: Terminal,
      title: 'Deterministic Sandbox Execution',
      desc: 'AST syntax trees and isolated process sandboxes with timeout ceilings, memory caps, and zero network leakage.',
    },
    {
      icon: Brain,
      title: 'AI Root-Cause Reasoning',
      desc: 'Explains What, Where, Why, and How to Fix instead of guessing or providing hallucinated code.',
    },
    {
      icon: GitCompare,
      title: 'Side-by-Side Unified Diffs',
      desc: 'Inspect exact line additions and deletions before choosing to apply verified fixes.',
    },
    {
      icon: Lightbulb,
      title: '3-Tier Progressive Hints',
      desc: 'Tier 1 Direction ➔ Tier 2 Clue ➔ Tier 3 Solution. Promotes active recall and genuine algorithmic learning.',
    },
    {
      icon: Layers,
      title: 'Multi-Language Architecture',
      desc: 'Modular compiler and interpreter adapters for Python 3.11, Java 21, C11 (GCC), and C++17.',
    },
    {
      icon: ShieldCheck,
      title: 'Empirical Learning Analytics',
      desc: 'Tracks error frequencies over time, calculates topic mastery, and generates targeted practice problems.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-ide-bg text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Hero Section */}
      <section className="pt-20 pb-20 border-b border-surface-200 dark:border-ide-border px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>IEEE Research Project • Intelligent Error Detection & Mentoring</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Understand your errors.{' '}
            <span className="text-blue-600 dark:text-blue-400">Fix your code.</span>{' '}
            Become a better programmer.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A developer platform combining deterministic AST analysis, isolated sandboxes, and AI pedagogical guidance to help engineers master debugging.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
            >
              <span>Start Debugging</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/debugger"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-surface-850 hover:bg-zinc-200 dark:hover:bg-surface-800 border border-surface-200 dark:border-ide-border text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all"
            >
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span>Explore Live IDE</span>
            </Link>
          </div>

          {/* Realistic Product Mockup Window */}
          <div className="mt-12 rounded-2xl border border-surface-200 dark:border-ide-border bg-white dark:bg-ide-panel shadow-2xl overflow-hidden text-left font-mono text-xs max-w-4xl mx-auto">
            {/* Window Header */}
            <div className="h-9 bg-zinc-100 dark:bg-surface-900 border-b border-surface-200 dark:border-ide-border flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-green-400/80 inline-block" />
                <span className="text-[11px] text-zinc-500 font-sans font-semibold pl-2">AI Debugging Mentor IDE</span>
              </div>
              <span className="text-[10px] text-zinc-400">main.py • Python 3.11</span>
            </div>

            {/* Split Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[260px]">
              {/* Code pane */}
              <div className="md:col-span-7 p-4 bg-zinc-50 dark:bg-ide-editor border-r border-surface-200 dark:border-ide-border text-zinc-800 dark:text-zinc-200 space-y-1">
                <div className="text-zinc-400"><span className="text-zinc-500 mr-3">1</span>def sum_numbers(n):</div>
                <div className="text-zinc-400"><span className="text-zinc-500 mr-3">2</span>    total = 0</div>
                <div className="bg-rose-500/10 border-l-2 border-rose-500 pl-2 text-rose-600 dark:text-rose-400 font-bold">
                  <span className="text-zinc-500 mr-2">3</span>    for i in range(n):  # Logical off-by-one
                </div>
                <div className="text-zinc-400"><span className="text-zinc-500 mr-3">4</span>        total += i</div>
                <div className="text-zinc-400"><span className="text-zinc-500 mr-3">5</span>    return total</div>
              </div>

              {/* Inspector Pane */}
              <div className="md:col-span-5 p-4 bg-white dark:bg-ide-panel font-sans space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <Bug className="h-4 w-4" />
                  <span>Logical Error Detected (96%)</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <strong>What:</strong> Output was 10, but expected was 15.<br />
                  <strong>Why:</strong> <code className="font-mono text-blue-500">range(n)</code> stops at <code className="font-mono text-blue-500">n-1</code>.<br />
                  <strong>Fix:</strong> Use <code className="font-mono text-emerald-500">range(1, n + 1)</code>.
                </p>
                <div className="pt-2 flex items-center gap-2 font-mono text-[10px]">
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                    [Apply Fix]
                  </span>
                  <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-500">
                    [View Diff]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Designed for Real Engineering Education
          </h2>
          <p className="text-xs text-zinc-500">
            A comprehensive pipeline bridging compilers, sandboxing, and pedagogical scaffolding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-2 shadow-subtle hover:border-zinc-400 dark:hover:border-surface-700 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{cap.title}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-surface-200 dark:border-ide-border text-center text-xs text-zinc-500">
        AI Debugging Mentor • An Intelligent System for Code Error Detection and Guidance
      </footer>
    </div>
  );
}
