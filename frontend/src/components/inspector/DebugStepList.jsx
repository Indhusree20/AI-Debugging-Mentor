import React, { useState } from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { CheckCircle2, Circle, ArrowRight, ListChecks } from 'lucide-react';

export function DebugStepList({ session }) {
  const { setActiveStepLine } = useDebugger();
  const steps = session?.aiAnalysis?.stepByStepGuidance || [];
  const [completed, setCompleted] = useState({});

  if (steps.length === 0) return null;

  const toggle = (idx) => {
    setCompleted((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <ListChecks className="h-4 w-4 text-blue-500" />
          <span>Interactive Resolution Steps</span>
        </span>
        <span className="font-mono text-[11px] text-zinc-500">
          {Object.values(completed).filter(Boolean).length}/{steps.length} Done
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isDone = Boolean(completed[idx]);

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                isDone
                  ? 'bg-zinc-100/60 dark:bg-surface-900/40 border-surface-200 dark:border-ide-border opacity-70'
                  : 'bg-white dark:bg-ide-editor border-surface-200 dark:border-ide-border hover:border-zinc-300 dark:hover:border-surface-700 shadow-subtle'
              }`}
            >
              <div className="flex items-start gap-2.5 cursor-pointer" onClick={() => toggle(idx)}>
                <button type="button" className="mt-0.5 text-zinc-400 hover:text-blue-500 transition-colors">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-400" />
                  )}
                </button>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    Step {step.stepNumber || idx + 1}
                  </span>
                  <p className={`text-xs leading-relaxed ${isDone ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                    {step.instruction}
                  </p>
                </div>
              </div>

              {step.targetLine && (
                <button
                  onClick={() => setActiveStepLine(step.targetLine)}
                  className="shrink-0 px-2 py-1 rounded bg-zinc-100 dark:bg-surface-850 hover:bg-blue-600 hover:text-white text-zinc-600 dark:text-zinc-300 text-[10px] font-mono transition-colors"
                  title={`Focus line ${step.targetLine}`}
                >
                  Line {step.targetLine} →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
