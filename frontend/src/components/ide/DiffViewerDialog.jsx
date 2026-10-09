import React from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from '../common/Modal';
import { Check, ShieldCheck, AlertTriangle, GitCompare } from 'lucide-react';

export function DiffViewerDialog() {
  const {
    isDiffModalOpen,
    setIsDiffModalOpen,
    language,
    sourceCode,
    currentSession,
    applyFix,
  } = useDebugger();
  const { theme } = useTheme();

  if (!currentSession?.aiAnalysis?.suggestedFix?.correctedCode) return null;

  const fix = currentSession.aiAnalysis.suggestedFix;
  const isGuaranteed = fix.isGuaranteed !== false;
  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'java' ? 'java' : 'python';

  return (
    <Modal
      isOpen={isDiffModalOpen}
      onClose={() => setIsDiffModalOpen(false)}
      title="Code Correction Diff Comparison"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        {/* Verification Banner */}
        <div
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${
            isGuaranteed
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
          }`}
        >
          {isGuaranteed ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          )}
          <div>
            <span className="font-bold">
              {isGuaranteed ? 'Verified Deterministic Correction' : 'Proposed Heuristic Fix'}:{' '}
            </span>
            <span>{fix.diffDescription || 'Proposed correction to resolve identified errors.'}</span>
          </div>
        </div>

        {/* Monaco Diff View */}
        <div className="h-[360px] rounded-xl overflow-hidden border border-surface-200 dark:border-ide-border bg-white dark:bg-ide-editor">
          <DiffEditor
            height="100%"
            language={monacoLanguage}
            original={sourceCode}
            modified={fix.correctedCode}
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            options={{
              readOnly: true,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              renderSideBySide: true,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-200 dark:border-ide-border">
          <span className="text-xs text-zinc-500">
            Applying this fix will update your active editor without saving automatically.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDiffModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-surface-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyFix}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-subtle transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Fix</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
