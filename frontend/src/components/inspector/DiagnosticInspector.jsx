import React from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { MultiStageLoadingIndicator } from './MultiStageLoadingIndicator';
import { ErrorDetailCard } from './ErrorDetailCard';
import { DebugStepList } from './DebugStepList';
import { ProgressiveHintList } from './ProgressiveHintList';
import { MentorChatPanel } from '../mentor/MentorChatPanel';
import {
  Sparkles,
  HelpCircle,
  ListChecks,
  Lightbulb,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

export function DiagnosticInspector() {
  const {
    currentSession,
    isAnalyzing,
    activeInspectorTab,
    setActiveInspectorTab,
    setIsDiffModalOpen,
  } = useDebugger();

  const tabs = [
    { id: 'explain', label: 'Diagnosis', icon: HelpCircle },
    { id: 'steps', label: 'Steps', icon: ListChecks },
    { id: 'hints', label: 'Hints', icon: Lightbulb },
    { id: 'mentor', label: 'Mentor', icon: Bot },
  ];

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-ide-panel border-l border-surface-200 dark:border-ide-border overflow-hidden select-none">
      {/* Tab Navigation Header */}
      <div className="h-10 border-b border-surface-200 dark:border-ide-border bg-zinc-100 dark:bg-surface-900 flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeInspectorTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveInspectorTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-surface-850 text-blue-600 dark:text-blue-400 shadow-subtle'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspector Body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {isAnalyzing ? (
          <MultiStageLoadingIndicator />
        ) : currentSession ? (
          <>
            {activeInspectorTab === 'explain' && <ErrorDetailCard session={currentSession} />}
            {activeInspectorTab === 'steps' && <DebugStepList session={currentSession} />}
            {activeInspectorTab === 'hints' && <ProgressiveHintList session={currentSession} />}
            {activeInspectorTab === 'mentor' && (
              <div className="h-full min-h-[460px]">
                <MentorChatPanel />
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center space-y-3 bg-white dark:bg-ide-editor rounded-2xl border border-surface-200 dark:border-ide-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mx-auto">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              AI Diagnostic Inspector Ready
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xs mx-auto">
              Click <strong>[Debug]</strong> in the top toolbar to initiate the deterministic AST and AI pedagogical reasoning pipeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
