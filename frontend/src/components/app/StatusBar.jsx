import React from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import {
  GitBranch,
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
} from 'lucide-react';

export function StatusBar() {
  const {
    language,
    currentSession,
    rawOutput,
    isExecuting,
    isAnalyzing,
    editorSettings,
  } = useDebugger();

  const errorCount = currentSession?.errors?.length || (currentSession?.aiAnalysis?.primaryErrorType && currentSession.aiAnalysis.primaryErrorType !== 'NONE' ? 1 : 0);
  const executionTime = rawOutput?.executionTimeMs || currentSession?.durationMs || 0;

  const languageLabels = {
    python: 'Python 3.11',
    java: 'Java 21 (HotSpot)',
    c: 'C11 (GCC)',
    cpp: 'C++17 (G++)',
    javascript: 'Node.js 20',
    typescript: 'TypeScript 5.0',
    go: 'Go 1.22',
    rust: 'Rust 1.76',
    php: 'PHP 8.2',
    csharp: 'C# (.NET 8)',
    sql: 'ANSI SQL',
  };

  const safeLang = language || 'python';

  return (
    <footer className="h-6 border-t border-surface-200 dark:border-ide-border bg-zinc-100 dark:bg-ide-bg flex items-center justify-between px-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 select-none shrink-0 z-20">
      {/* Left items */}
      <div className="flex items-center gap-3">
        {/* Branch */}
        <div className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 border-l border-surface-200 dark:border-ide-border pl-3">
          {errorCount > 0 ? (
            <div className="flex items-center gap-1 text-rose-500 font-bold">
              <AlertOctagon className="h-3 w-3" />
              <span>{errorCount} {errorCount === 1 ? 'Error' : 'Errors'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>0 Errors</span>
            </div>
          )}
        </div>

        {/* Sandbox Status */}
        <div className="hidden sm:flex items-center gap-1 text-blue-500 dark:text-blue-400 border-l border-surface-200 dark:border-ide-border pl-3">
          <ShieldCheck className="h-3 w-3" />
          <span>Sandbox: Isolated</span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        {/* Execution Timer */}
        {executionTime > 0 && (
          <div className="flex items-center gap-1 text-zinc-500">
            <Clock className="h-3 w-3" />
            <span>{executionTime}ms</span>
          </div>
        )}

        {/* Language Runtime */}
        <span className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer font-sans font-medium">
          {languageLabels[safeLang] || safeLang.toUpperCase()}
        </span>

        {/* Spacing */}
        <span className="hidden md:inline border-l border-surface-200 dark:border-ide-border pl-3">
          Spaces: {editorSettings?.tabSize || 4}
        </span>

        {/* Encoding */}
        <span className="hidden md:inline border-l border-surface-200 dark:border-ide-border pl-3">
          UTF-8
        </span>

        {/* Status Activity */}
        {(isExecuting || isAnalyzing) && (
          <span className="flex items-center gap-1 text-blue-500 font-bold animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Executing...'}</span>
          </span>
        )}
      </div>
    </footer>
  );
}
