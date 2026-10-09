import React from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import {
  Play,
  Sparkles,
  RotateCcw,
  Upload,
  Download,
  GitCompare,
  FileCode,
  Check,
  ChevronDown,
} from 'lucide-react';

export function EditorTabHeader() {
  const {
    activeFileKey,
    activeFileName,
    language,
    setLanguage,
    sourceCode,
    setSourceCode,
    loadSample,
    isExecuting,
    isAnalyzing,
    runCode,
    analyzeCode,
    currentSession,
    setIsDiffModalOpen,
    SAMPLE_FILES,
  } = useDebugger();

  const handleClear = () => {
    if (window.confirm('Clear editor content?')) {
      setSourceCode('');
    }
  };

  const handleDownload = () => {
    const extensions = { python: 'py', java: 'java', c: 'c', cpp: 'cpp' };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([sourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFileName || `solution.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceCode(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-10 border-b border-surface-200 dark:border-ide-border bg-zinc-100 dark:bg-ide-panel flex items-center justify-between px-2 select-none shrink-0 overflow-x-auto">
      {/* Left: Active File Tab & Sample Selector */}
      <div className="flex items-center gap-1">
        {/* Active Tab */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-white dark:bg-ide-editor border-t border-x border-surface-200 dark:border-ide-border text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 shadow-subtle">
          <FileCode className="h-3.5 w-3.5 text-blue-500" />
          <span>{activeFileName}</span>
        </div>

        {/* Preset Sample Picker */}
        <div className="relative pl-1">
          <select
            value={activeFileKey}
            onChange={(e) => loadSample(e.target.value)}
            className="bg-transparent hover:bg-zinc-200 dark:hover:bg-surface-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs rounded-md px-2 py-1 font-medium focus:outline-none cursor-pointer"
          >
            <option value="python" className="bg-white dark:bg-surface-900">Python: Missing Colon Syntax</option>
            <option value="python_logic" className="bg-white dark:bg-surface-900">Python: Off-by-one Sum Logic</option>
            <option value="java" className="bg-white dark:bg-surface-900">Java: Missing Semicolon Syntax</option>
            <option value="java_runtime" className="bg-white dark:bg-surface-900">Java: NullPointerException</option>
            <option value="c" className="bg-white dark:bg-surface-900">C: Semicolon Compilation Error</option>
            <option value="cpp" className="bg-white dark:bg-surface-900">C++: Vector Out of Bounds</option>
          </select>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Language Switcher */}
        <select
          value={language}
          onChange={(e) => {
            const nextLang = e.target.value;
            setLanguage(nextLang);
            loadSample(nextLang);
          }}
          className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-ide-border text-zinc-700 dark:text-zinc-300 text-[11px] rounded-lg px-2 py-1 font-mono font-medium focus:outline-none"
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>

        {/* Diff Review Button */}
        {currentSession?.aiAnalysis?.suggestedFix?.correctedCode && (
          <button
            onClick={() => setIsDiffModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>Diff Fix</span>
          </button>
        )}

        {/* Clear */}
        <button
          onClick={handleClear}
          title="Clear Editor"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-surface-800 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Upload file */}
        <label
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-surface-800 cursor-pointer transition-colors"
          title="Upload Source File"
        >
          <Upload className="h-3.5 w-3.5" />
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>

        {/* Download file */}
        <button
          onClick={handleDownload}
          title="Download File"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-surface-800 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
        </button>

        {/* Run Code Button */}
        <button
          onClick={runCode}
          disabled={isExecuting || isAnalyzing}
          title="Run Code in Sandbox (Ctrl+Enter)"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-200 dark:bg-surface-800 hover:bg-zinc-300 dark:hover:bg-surface-700 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-surface-200 dark:border-surface-700 transition-all disabled:opacity-50"
        >
          <Play className={`h-3 w-3 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Running...' : 'Run'}</span>
        </button>

        {/* Debug Code Button */}
        <button
          onClick={analyzeCode}
          disabled={isAnalyzing || isExecuting}
          title="Run Full AI Debugging Pipeline (Ctrl+Shift+Enter)"
          className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          <Sparkles className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Debugging...' : 'Debug'}</span>
        </button>
      </div>
    </div>
  );
}
