import React from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { Check, Loader2, Sparkles } from 'lucide-react';

export function MultiStageLoadingIndicator() {
  const { analysisStage } = useDebugger();

  const stages = [
    { id: 'ast_syntax', label: 'AST & Deterministic Syntax Parsing' },
    { id: 'sandbox_runtime', label: 'Isolated Sandbox Execution' },
    { id: 'ai_reasoning', label: 'AI Error Diagnosis & Root Cause Reasoning' },
    { id: 'completed', label: 'Generating Step Guidance & Fix' },
  ];

  const getStageIndex = (stage) => {
    switch (stage) {
      case 'ast_syntax': return 0;
      case 'sandbox_runtime': return 1;
      case 'ai_reasoning': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(analysisStage);

  return (
    <div className="p-5 space-y-4 bg-white dark:bg-ide-panel rounded-2xl border border-surface-200 dark:border-ide-border shadow-panel">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
        <Sparkles className="h-4 w-4 animate-spin" />
        <span>Multi-Stage Debugging Pipeline Active</span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {stages.map((st, idx) => {
          const isDone = idx < currentIndex || analysisStage === 'completed';
          const isCurrent = idx === currentIndex && analysisStage !== 'completed';

          return (
            <div
              key={st.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-blue-50 dark:bg-surface-850 text-blue-600 dark:text-blue-300 font-bold'
                  : isDone
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-400 dark:text-zinc-600'
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : isCurrent
                    ? 'bg-blue-500/20 text-blue-500 animate-pulse'
                    : 'bg-zinc-200 dark:bg-surface-800 text-zinc-400'
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : isCurrent ? <Loader2 className="h-3 w-3 animate-spin" /> : idx + 1}
              </div>
              <span className="truncate">{st.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
