import React, { useState } from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { ProblemsTab } from './ProblemsTab';
import { TestCaseRunnerTab } from './TestCaseRunnerTab';
import {
  Terminal,
  AlertOctagon,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export function BottomPanel() {
  const {
    rawOutput,
    currentSession,
    activeBottomTab,
    setActiveBottomTab,
  } = useDebugger();

  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const stdout = rawOutput?.stdout || '';
  const stderr = rawOutput?.stderr || '';
  const exitCode = rawOutput?.exitCode;

  const errorTally = (currentSession?.aiAnalysis?.primaryErrorType && currentSession.aiAnalysis.primaryErrorType !== 'NONE') ? 1 : 0;

  const handleCopy = () => {
    const content = activeBottomTab === 'output' ? stdout : stderr;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`border-t border-surface-200 dark:border-ide-border bg-white dark:bg-ide-panel flex flex-col transition-all duration-150 ${
        isExpanded ? 'h-80' : 'h-48'
      }`}
    >
      {/* Tab bar header */}
      <div className="h-9 border-b border-surface-200 dark:border-ide-border bg-zinc-100 dark:bg-surface-900 flex items-center justify-between px-3 select-none shrink-0">
        <div className="flex items-center gap-1">
          {/* Output Tab */}
          <button
            onClick={() => setActiveBottomTab('output')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeBottomTab === 'output'
                ? 'bg-white dark:bg-surface-850 text-blue-600 dark:text-blue-400 shadow-subtle'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Output</span>
            {stdout && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
          </button>

          {/* Problems Tab */}
          <button
            onClick={() => setActiveBottomTab('problems')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeBottomTab === 'problems'
                ? 'bg-white dark:bg-surface-850 text-rose-600 dark:text-rose-400 shadow-subtle'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>Problems</span>
            {errorTally > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {errorTally}
              </span>
            )}
          </button>

          {/* Test Cases Tab */}
          <button
            onClick={() => setActiveBottomTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeBottomTab === 'tests'
                ? 'bg-white dark:bg-surface-850 text-indigo-600 dark:text-indigo-400 shadow-subtle'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Test Cases</span>
          </button>

          {/* Raw Terminal / Stderr Tab */}
          <button
            onClick={() => setActiveBottomTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeBottomTab === 'terminal'
                ? 'bg-white dark:bg-surface-850 text-zinc-900 dark:text-zinc-100 shadow-subtle'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>Terminal Traceback</span>
            {stderr && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
          </button>
        </div>

        {/* Right Tab Controls */}
        <div className="flex items-center gap-2">
          {exitCode !== null && exitCode !== undefined && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                exitCode === 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              Exit Code: {exitCode}
            </span>
          )}

          <button
            onClick={handleCopy}
            title="Copy Output"
            className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-surface-800 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? 'Collapse Panel' : 'Expand Panel'}
            className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-surface-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-ide-editor p-3 font-mono text-xs">
        {activeBottomTab === 'output' && (
          stdout ? (
            <pre className="whitespace-pre-wrap text-zinc-800 dark:text-emerald-400/90 leading-relaxed font-mono">
              {stdout}
            </pre>
          ) : (
            <div className="text-zinc-400 dark:text-zinc-500 italic font-sans text-xs">
              Program has not generated standard output. Click [Run] or press Ctrl+Enter to execute.
            </div>
          )
        )}

        {activeBottomTab === 'problems' && <ProblemsTab />}

        {activeBottomTab === 'tests' && <TestCaseRunnerTab />}

        {activeBottomTab === 'terminal' && (
          stderr ? (
            <pre className="whitespace-pre-wrap text-rose-600 dark:text-rose-400 font-mono text-xs leading-relaxed font-semibold">
              {stderr}
            </pre>
          ) : (
            <div className="text-zinc-400 dark:text-zinc-500 italic font-sans text-xs">
              No errors or exceptions recorded in stderr stream.
            </div>
          )
        )}
      </div>
    </div>
  );
}
