import React, { useState } from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { CheckCircle, Circle, ArrowRightCircle, ListChecks } from 'lucide-react';

export function StepGuidanceChecklist({ session }) {
  const { setActiveStepLine } = useDebugger();
  const steps = session?.aiAnalysis?.stepByStepGuidance || [];
  const [completedSteps, setCompletedSteps] = useState({});

  if (steps.length === 0) return null;

  const toggleStep = (idx) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
          <ListChecks className="h-5 w-5" />
          <span>Step-by-Step Resolution Guide</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {Object.values(completedSteps).filter(Boolean).length} / {steps.length} Completed
        </span>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = Boolean(completedSteps[idx]);

          return (
            <div
              key={idx}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-400 opacity-80'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              {/* Checkbox and Step Content */}
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleStep(idx)}>
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {isDone ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                <div>
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">
                    Step {step.stepNumber || idx + 1}
                  </span>
                  <p className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {step.instruction}
                  </p>
                </div>
              </div>

              {/* Jump to Line Button in Monaco Editor */}
              {step.targetLine && (
                <button
                  onClick={() => setActiveStepLine(step.targetLine)}
                  className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-700 text-slate-300 text-[11px] font-mono font-medium transition-all"
                  title={`Jump to line ${step.targetLine} in editor`}
                >
                  <span>Line {step.targetLine}</span>
                  <ArrowRightCircle className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
