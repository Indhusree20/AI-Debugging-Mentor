import React, { useState } from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { debugService } from '../../services/debugService';
import { CheckCircle2, XCircle, Plus, Trash2, Play, Clock } from 'lucide-react';

export function TestCaseRunnerTab() {
  const { language, sourceCode, testCases, setTestCases, currentSession } = useDebugger();
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const handleAddTestCase = () => {
    setTestCases((prev) => [...prev, { input: '', expectedOutput: '' }]);
  };

  const handleDeleteTestCase = (index) => {
    if (testCases.length > 1) {
      setTestCases((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateTestCase = (index, field, value) => {
    setTestCases((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await debugService.runTestCases({
        language,
        sourceCode,
        testCases,
      });
      setTestResults(results);
    } catch (err) {
      console.error('Failed to run test cases:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const activeResults = testResults || currentSession?.testCases;

  return (
    <div className="p-3 space-y-3">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Define inputs and expected outputs to verify logic correctness:
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddTestCase}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-surface-850 hover:bg-zinc-200 dark:hover:bg-surface-800 border border-surface-200 dark:border-ide-border text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Test Case</span>
          </button>
          <button
            onClick={handleRunAllTests}
            disabled={isRunningTests}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-subtle transition-all disabled:opacity-50"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>{isRunningTests ? 'Running...' : 'Run All Tests'}</span>
          </button>
        </div>
      </div>

      {/* Test Matrix Table */}
      <div className="border border-surface-200 dark:border-ide-border rounded-xl overflow-hidden bg-white dark:bg-ide-editor">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-100 dark:bg-surface-900 border-b border-surface-200 dark:border-ide-border text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              <th className="py-2 px-3 w-16">#</th>
              <th className="py-2 px-3">Input (stdin)</th>
              <th className="py-2 px-3">Expected Output</th>
              <th className="py-2 px-3">Actual Output</th>
              <th className="py-2 px-3 w-28">Status</th>
              <th className="py-2 px-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-850 font-mono">
            {testCases.map((tc, idx) => {
              const res = activeResults?.[idx];
              const passed = res?.passed;

              return (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-surface-900/50 transition-colors">
                  <td className="py-2 px-3 text-zinc-400 font-sans font-semibold">
                    Case {idx + 1}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={tc.input || ''}
                      onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                      placeholder="(none)"
                      className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={tc.expectedOutput || ''}
                      onChange={(e) => handleUpdateTestCase(idx, 'expectedOutput', e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                    {res ? (
                      res.error ? (
                        <span className="text-rose-500 text-[11px] truncate block">{res.error}</span>
                      ) : (
                        <span>{res.actualOutput || '(empty)'}</span>
                      )
                    ) : (
                      <span className="text-zinc-400 italic font-sans text-[11px]">Not run</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {res ? (
                      passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <XCircle className="h-3 w-3" />
                          <span>FAIL</span>
                        </span>
                      )
                    ) : (
                      <span className="text-zinc-400 text-[11px] font-sans">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {testCases.length > 1 && (
                      <button
                        onClick={() => handleDeleteTestCase(idx)}
                        className="text-zinc-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
