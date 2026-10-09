import React from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { Modal } from '../common/Modal';
import { Check, AlertTriangle, ShieldCheck } from 'lucide-react';

export function DiffEditorModal() {
  const {
    isDiffModalOpen,
    setIsDiffModalOpen,
    language,
    sourceCode,
    currentSession,
    applyFix,
  } = useDebugger();

  if (!currentSession?.aiAnalysis?.suggestedFix?.correctedCode) return null;

  const fix = currentSession.aiAnalysis.suggestedFix;
  const isGuaranteed = fix.isGuaranteed !== false;
  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'java' ? 'java' : 'python';

  return (
    <Modal
      isOpen={isDiffModalOpen}
      onClose={() => setIsDiffModalOpen(false)}
      title="Code Correction & Diff Comparison"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs leading-relaxed ${
            isGuaranteed
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}
        >
          {isGuaranteed ? (
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          )}
          <div>
            <span className="font-bold">
              {isGuaranteed ? 'Verified Deterministic Fix' : 'Suggested Logical Correction'}:{' '}
            </span>
            <span>{fix.diffDescription || 'Proposed correction to resolve detected issues.'}</span>
          </div>
        </div>

        {/* Monaco Diff Editor */}
        <div className="h-[360px] rounded-xl overflow-hidden border border-slate-800 bg-[#0f172a]">
          <DiffEditor
            height="100%"
            language={monacoLanguage}
            original={sourceCode}
            modified={fix.correctedCode}
            theme="vs-dark"
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

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Clicking <strong>Apply Fix</strong> updates your active editor with the modified code.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDiffModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyFix}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all hover:scale-[1.02]"
            >
              <Check className="h-4 w-4" />
              <span>Apply Fix</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
