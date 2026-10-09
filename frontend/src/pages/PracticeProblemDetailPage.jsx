import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { practiceService } from '../services/practiceService';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Copy,
  Check,
} from 'lucide-react';

export function PracticeProblemDetailPage() {
  const { slug } = useParams();
  const { theme } = useTheme();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor State
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results State
  const [activeResultTab, setActiveResultTab] = useState('sample'); // 'sample' | 'verdict' | 'diagnostics'
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const editorRef = useRef(null);

  const languageLabels = {
    python: 'Python 3.11',
    java: 'Java 21 (Main.java)',
    c: 'C11 (GCC)',
    cpp: 'C++17 (G++)',
    javascript: 'JavaScript (Node.js)',
  };

  const monacoLanguageMap = {
    python: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    javascript: 'javascript',
  };

  useEffect(() => {
    async function fetchProblem() {
      setLoading(true);
      setError(null);
      try {
        const data = await practiceService.getProblemBySlug(slug);
        if (!data) {
          setError(`Problem "${slug}" could not be found.`);
        } else {
          setProblem(data);
          const defaultLang = data.supportedLanguages?.[0] || 'python';
          setSelectedLanguage(defaultLang);
          const starter = data.starterCode?.[defaultLang] || '';
          setCode(starter);
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load problem details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [slug]);

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    if (problem?.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const handleResetStarter = () => {
    if (problem?.starterCode?.[selectedLanguage]) {
      setCode(problem.starterCode[selectedLanguage]);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim() || isExecuting || isSubmitting) return;

    setIsExecuting(true);
    setActiveResultTab('sample');
    setRunResult(null);

    try {
      const result = await practiceService.runCode(slug, {
        language: selectedLanguage,
        sourceCode: code,
      });
      setRunResult(result);
      if (result.diagnostics?.length > 0) {
        setDiagnosticsList(result.diagnostics);
      }
    } catch (err) {
      setRunResult({
        status: 'Error',
        allPassed: false,
        error: err.response?.data?.message || err.message || 'Execution failed.',
        sampleResults: [],
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim() || isExecuting || isSubmitting) return;

    setIsSubmitting(true);
    setActiveResultTab('verdict');
    setSubmitResult(null);

    try {
      const result = await practiceService.submitCode(slug, {
        language: selectedLanguage,
        sourceCode: code,
      });
      setSubmitResult(result);
      if (result.diagnostics?.length > 0) {
        setDiagnosticsList(result.diagnostics);
      }
      if (result.status === 'Accepted' && problem) {
        setProblem((prev) => ({ ...prev, isSolved: true }));
      }
    } catch (err) {
      setSubmitResult({
        status: 'Submission Failed',
        error: err.response?.data?.message || err.message || 'Submission failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInput = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const difficultyColors = {
    Easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Hard: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <LoadingSpinner text="Loading practice problem..." />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 font-sans">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 w-12 h-12 mx-auto flex items-center justify-center">
          <AlertOctagon className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Problem Not Found</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{error || 'Could not find this problem.'}</p>
        <Link
          to="/practice"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Problems</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-ide-bg font-sans select-none">
      {/* Top Navbar */}
      <div className="h-11 border-b border-surface-200 dark:border-ide-border bg-zinc-50 dark:bg-ide-sidebar px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/practice"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Problems</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
            {problem.title}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
              difficultyColors[problem.difficulty] || difficultyColors.Easy
            }`}
          >
            {problem.difficulty}
          </span>
          {problem.isSolved && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.2 rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-3 w-3" />
              <span>Solved</span>
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={isExecuting || isSubmitting}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-surface-850 border border-surface-200 dark:border-ide-border text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {(problem.supportedLanguages || ['python', 'java', 'c', 'cpp', 'javascript']).map((lang) => (
              <option key={lang} value={lang}>
                {languageLabels[lang] || lang.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Reset button */}
          <button
            onClick={handleResetStarter}
            title="Reset code to starter template"
            disabled={isExecuting || isSubmitting}
            className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-surface-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isExecuting || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-200 dark:bg-surface-800 hover:bg-zinc-300 dark:hover:bg-surface-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 fill-current text-emerald-500 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmitCode}
            disabled={isExecuting || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Send className={`h-3.5 w-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Panel Content */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
        {/* LEFT PANEL: Problem Description */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-surface-200 dark:border-ide-border bg-white dark:bg-ide-bg overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{problem.title}</h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  difficultyColors[problem.difficulty] || difficultyColors.Easy
                }`}
              >
                {problem.difficulty}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 border border-surface-200 dark:border-surface-700">
                {problem.topic}
              </span>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Statement</h3>
            <div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
              {problem.statement}
            </div>
          </div>

          {/* Input & Output Formats */}
          <div className="space-y-3 border-t border-surface-200 dark:border-ide-border pt-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Input Format</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{problem.inputFormat}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Output Format</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{problem.outputFormat}</p>
            </div>

            {problem.constraints && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Constraints</h4>
                <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-surface-900 p-2 rounded-md border border-surface-200 dark:border-ide-border">
                  {problem.constraints}
                </div>
              </div>
            )}
          </div>

          {/* Examples */}
          {problem.exampleCases?.length > 0 && (
            <div className="space-y-3 border-t border-surface-200 dark:border-ide-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Examples</h3>
              {problem.exampleCases.map((eg, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-zinc-50 dark:bg-surface-900 border border-surface-200 dark:border-ide-border p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                    <span>Example {idx + 1}</span>
                    <button
                      onClick={() => handleCopyInput(eg.input, idx)}
                      className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Input</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Input</span>
                      <pre className="p-2 rounded bg-white dark:bg-surface-950 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 border border-surface-200 dark:border-surface-800 overflow-x-auto">
                        {eg.input}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Output</span>
                      <pre className="p-2 rounded bg-white dark:bg-surface-950 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 border border-surface-200 dark:border-surface-800 overflow-x-auto">
                        {eg.output}
                      </pre>
                    </div>
                  </div>

                  {eg.explanation && (
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Explanation: </span>
                      {eg.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Editor + Bottom Results */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0 bg-white dark:bg-ide-bg">
          {/* Top Half: Code Editor */}
          <div className="flex-1 min-h-[300px] flex flex-col bg-white dark:bg-ide-bg">
            <Editor
              height="100%"
              language={monacoLanguageMap[selectedLanguage] || 'python'}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(newVal) => setCode(newVal || '')}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                renderWhitespace: 'selection',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Bottom Half: Results Pane */}
          <div className="h-64 border-t border-surface-200 dark:border-ide-border bg-zinc-50 dark:bg-ide-sidebar flex flex-col min-h-0">
            {/* Results Tab Header */}
            <div className="h-9 border-b border-surface-200 dark:border-ide-border flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveResultTab('sample')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeResultTab === 'sample'
                      ? 'bg-white dark:bg-surface-850 text-blue-600 dark:text-blue-400 border border-surface-200 dark:border-surface-700 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>Sample Results</span>
                  {runResult && (
                    <span className={`ml-1.5 text-[10px] px-1 rounded ${runResult.allPassed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                      {runResult.status}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveResultTab('verdict')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeResultTab === 'verdict'
                      ? 'bg-white dark:bg-surface-850 text-blue-600 dark:text-blue-400 border border-surface-200 dark:border-surface-700 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>Submission Verdict</span>
                  {submitResult && (
                    <span className={`ml-1.5 text-[10px] px-1 rounded ${submitResult.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                      {submitResult.status}
                    </span>
                  )}
                </button>

                {diagnosticsList.length > 0 && (
                  <button
                    onClick={() => setActiveResultTab('diagnostics')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeResultTab === 'diagnostics'
                        ? 'bg-white dark:bg-surface-850 text-blue-600 dark:text-blue-400 border border-surface-200 dark:border-surface-700 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span>Diagnostics ({diagnosticsList.length})</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] font-mono text-zinc-400">
                {isExecuting ? 'Running tests...' : isSubmitting ? 'Evaluating solution...' : 'Ready'}
              </div>
            </div>

            {/* Results Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
              {/* TAB 1: Sample Results */}
              {activeResultTab === 'sample' && (
                <div>
                  {!runResult ? (
                    <div className="text-center py-8 text-xs text-zinc-400 space-y-1">
                      <Terminal className="h-6 w-6 mx-auto text-zinc-300 dark:text-zinc-600" />
                      <p>Click "Run Code" to test your solution against visible example cases.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Status Banner */}
                      <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                        runResult.allPassed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        <div className="flex items-center gap-2 font-bold">
                          {runResult.allPassed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          <span>{runResult.status}</span>
                          <span className="font-normal text-[11px] opacity-80">
                            ({runResult.passedTestCases || 0} / {runResult.totalTestCases || 0} Passed)
                          </span>
                        </div>
                        {runResult.executionTimeMs !== undefined && (
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Clock className="h-3 w-3" />
                            <span>{runResult.executionTimeMs}ms</span>
                          </div>
                        )}
                      </div>

                      {/* Sample Test Case Cards */}
                      {runResult.sampleResults?.map((res, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-zinc-700 dark:text-zinc-300">Case {res.testCaseIndex}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              res.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {res.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400">INPUT:</span>
                              <pre className="p-1.5 rounded bg-zinc-50 dark:bg-surface-950 text-zinc-800 dark:text-zinc-200 overflow-x-auto">
                                {res.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400">EXPECTED:</span>
                              <pre className="p-1.5 rounded bg-zinc-50 dark:bg-surface-950 text-emerald-600 dark:text-emerald-400 overflow-x-auto">
                                {res.expectedOutput}
                              </pre>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400">YOUR OUTPUT:</span>
                              <pre className={`p-1.5 rounded bg-zinc-50 dark:bg-surface-950 overflow-x-auto ${
                                res.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 font-semibold'
                              }`}>
                                {res.actualOutput || '(No output)'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Submission Verdict */}
              {activeResultTab === 'verdict' && (
                <div>
                  {!submitResult ? (
                    <div className="text-center py-8 text-xs text-zinc-400 space-y-1">
                      <Send className="h-6 w-6 mx-auto text-zinc-300 dark:text-zinc-600" />
                      <p>Click "Submit" to evaluate your solution against the complete test suite.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Large Verdict Card */}
                      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        submitResult.status === 'Accepted'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${submitResult.status === 'Accepted' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {submitResult.status === 'Accepted' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="text-base font-bold">{submitResult.status}</h3>
                            <p className="text-xs opacity-90">
                              {submitResult.status === 'Accepted'
                                ? 'Congratulations! Your solution passed all test cases.'
                                : `Passed ${submitResult.passedTestCases || 0} of ${submitResult.totalTestCases || 0} total test cases.`}
                            </p>
                          </div>
                        </div>

                        {submitResult.executionTimeMs !== undefined && (
                          <div className="flex items-center gap-2 font-mono text-xs self-end sm:self-center">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Runtime: {submitResult.executionTimeMs}ms</span>
                          </div>
                        )}
                      </div>

                      {submitResult.status === 'Accepted' && (
                        <div className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <Sparkles className="h-4 w-4 text-blue-500" />
                              <span>Ready for the next challenge?</span>
                            </h4>
                            <p className="text-[11px] text-zinc-500">Explore more problems to continue practicing.</p>
                          </div>
                          <Link
                            to="/practice"
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                          >
                            Next Problem
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Diagnostics */}
              {activeResultTab === 'diagnostics' && (
                <div className="space-y-3">
                  {diagnosticsList.length === 0 ? (
                    <p className="text-xs text-zinc-400">No active compiler diagnostics.</p>
                  ) : (
                    diagnosticsList.map((diag, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-white dark:bg-surface-900 border border-amber-500/30 p-3 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>{diag.type || 'SYNTAX_ERROR'}</span>
                          </span>
                          {diag.line && (
                            <span className="font-mono text-[11px] text-zinc-500">
                              Line {diag.line}{diag.column ? `, Col ${diag.column}` : ''}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{diag.message}</p>
                        {diag.explanation && (
                          <div className="p-2 rounded bg-zinc-50 dark:bg-surface-950 text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                            {diag.explanation}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
