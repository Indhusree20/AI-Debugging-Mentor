import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useDebugger } from '../contexts/DebuggerContext';
import {
  Bug,
  Sparkles,
  Play,
  Copy,
  Trash2,
  Check,
  AlertOctagon,
  AlertTriangle,
  Info,
  MapPin,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Code2,
} from 'lucide-react';

const SUPPORTED_LANG_OPTIONS = [
  { value: 'auto', label: '⚡ Auto Detect Language' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'sql', label: 'SQL' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'csharp', label: 'C#' },
];

export function DebuggerWorkspacePage() {
  const {
    sourceCode,
    setSourceCode,
    selectedLanguage,
    setSelectedLanguage,
    detectedLanguage,
    activeLanguage,
    analysisStatus,
    statusMessage,
    errorsList,
    editorMarkers,
    activeStepLine,
    setActiveStepLine,
    copyFeedback,
    analyzeCode,
    clearCode,
    copyCode,
  } = useDebugger();

  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Apply markers whenever editorMarkers changes
    if (editorMarkers && editorMarkers.length > 0) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelMarkers(model, 'ai-mentor', editorMarkers);
      }
    }
  };

  const jumpToLine = (lineNumber) => {
    if (!lineNumber) return;
    setActiveStepLine(lineNumber);
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(lineNumber);
      editorRef.current.setPosition({ lineNumber, column: 1 });
      editorRef.current.focus();
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'LOW':
      case 'INFO':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  // Map language to Monaco syntax identifier
  const getMonacoLanguage = (lang) => {
    const map = {
      python: 'python',
      javascript: 'javascript',
      typescript: 'typescript',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      sql: 'sql',
      go: 'go',
      rust: 'rust',
      php: 'php',
      csharp: 'csharp',
    };
    return map[lang] || 'python';
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50 dark:bg-ide-bg text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Top Header Banner */}
      <header className="border-b border-surface-200 dark:border-ide-border bg-white dark:bg-ide-panel px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Bug className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                AI DEBUGGING MENTOR
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Understand your errors. Fix your code. Learn from every bug.
              </p>
            </div>
          </div>

          {/* Controls toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Language Selector / Auto Detection status */}
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-lg px-2.5 py-1.5 text-xs font-mono">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-surface-900 text-zinc-900 dark:text-zinc-100">
                    {opt.label}
                  </option>
                ))}
              </select>

              {selectedLanguage === 'auto' && detectedLanguage?.name && (
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 pl-1 border-l border-zinc-300 dark:border-zinc-700">
                  {detectedLanguage.status === 'AMBIGUOUS' ? '⚠️ Ambiguous: ' : '⚡ '}
                  {detectedLanguage.name.toUpperCase()} ({Math.round((detectedLanguage.confidence || 0.9) * 100)}%)
                </span>
              )}
            </div>

            <button
              onClick={copyCode}
              title="Copy source code to clipboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:bg-zinc-100 dark:hover:bg-surface-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {copyFeedback ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copyFeedback ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={clearCode}
              title="Clear code editor"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={analyzeCode}
              disabled={analysisStatus === 'ANALYZING'}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{analysisStatus === 'ANALYZING' ? 'Analyzing...' : 'Analyze Code'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col gap-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-500">Analysis Status:</span>
            <span className={`font-bold ${
              analysisStatus === 'ANALYZING'
                ? 'text-amber-600 dark:text-amber-400'
                : analysisStatus === 'ERROR'
                ? 'text-rose-600 dark:text-rose-400'
                : errorsList.length > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {statusMessage}
            </span>
          </div>

          <div className="text-zinc-500 text-[11px]">
            Target Analyzer: <strong className="text-zinc-800 dark:text-zinc-200">{activeLanguage.toUpperCase()}</strong>
          </div>
        </div>

        {/* Code Input & Editor Section */}
        <div className="rounded-2xl bg-white dark:bg-ide-editor border border-surface-200 dark:border-ide-border overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-2.5 border-b border-surface-200 dark:border-ide-border bg-zinc-100 dark:bg-surface-900 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-blue-500" />
              <span>Paste Your Source Code</span>
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Auto-detects language • Python, Java, C, C++, JS, TS, SQL, Go, Rust, PHP, C#
            </span>
          </div>

          <div className="h-80 sm:h-96 w-full">
            <Editor
              height="100%"
              language={getMonacoLanguage(activeLanguage)}
              value={sourceCode}
              onChange={(value) => setSourceCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                minimap: { enabled: false },
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* ============================================================
            ERRORS ONLY RESULTS DISPLAY
           ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-surface-200 dark:border-ide-border pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-500" />
              <span>ERRORS & EXPLANATIONS ({errorsList.length})</span>
            </h2>
            <span className="text-xs text-zinc-500">
              {errorsList.length === 0 ? 'No issues detected' : `${errorsList.length} detectable issues reported`}
            </span>
          </div>

          {/* Empty / Clean / Initial States */}
          {errorsList.length === 0 && analysisStatus === 'COMPLETED' && (
            <div className="p-8 text-center rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                ✓ No Issues Detected
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                No syntax errors, compilation crashes, or static risks were detected by the active {activeLanguage.toUpperCase()} analyzer.
              </p>
            </div>
          )}

          {errorsList.length === 0 && analysisStatus === 'IDLE' && (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mx-auto">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Ready to Analyze
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Paste your code in the editor above and click <strong>[Analyze Code]</strong> to run deterministic parsers and error explanations.
              </p>
            </div>
          )}

          {/* Errors List */}
          {errorsList.length > 0 && (
            <div className="space-y-4">
              {errorsList.map((err, index) => (
                <div
                  key={err.id || index}
                  className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-3.5 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700"
                >
                  {/* Error Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-200 dark:border-ide-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 dark:bg-surface-800 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                        {err.type ? err.type.replace('_', ' ') : 'Syntax Error'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getSeverityBadge(err.severity || 'HIGH')}`}>
                        {err.severity || 'HIGH'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 border border-surface-200 dark:border-surface-700">
                        {err.source || 'PARSER'}
                      </span>
                      {err.classification && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {err.classification}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location with Click-to-Jump */}
                  {err.line && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-zinc-500">Location:</span>
                      <button
                        onClick={() => jumpToLine(err.line)}
                        className="inline-flex items-center gap-1.5 font-mono text-blue-600 dark:text-blue-400 font-bold hover:underline bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/50"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Line {err.line}{err.column ? `, Column ${err.column}` : ''}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Short Error Message */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Error:
                    </span>
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 font-mono bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
                      {err.message}
                    </p>
                  </div>

                  {/* Simple English Explanation */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                      <span>Explanation:</span>
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal bg-zinc-50 dark:bg-surface-900 p-3 rounded-lg border border-surface-200 dark:border-surface-800">
                      {err.explanation || 'Review the structure around the reported line to ensure valid syntax and variable declaration.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
