import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { debugService } from '../services/debugService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  History,
  Search,
  Trash2,
  Clock,
  FileCode,
  ExternalLink,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';

import emptyIllustration from '../assets/empty-state.svg';

export function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [errorType, setErrorType] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await debugService.getHistory({
        search,
        language: language || undefined,
        errorType: errorType || undefined,
      });
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [language, errorType]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this debugging record?')) {
      try {
        await debugService.deleteSession(id);
        setSessions((prev) => prev.filter((s) => s._id !== id));
      } catch (err) {
        alert('Failed to delete session');
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            <span>Debugging History</span>
          </h1>
          <p className="text-xs text-zinc-500">
            Recorded compiler tracebacks, diagnoses, and resolution outcomes across sessions.
          </p>
        </div>

        <button
          onClick={() => navigate('/debugger')}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          + New Debug Session
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border flex flex-wrap items-center gap-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchHistory();
          }}
          className="flex-1 min-w-[200px] relative"
        >
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions or error messages..."
            className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="">All Languages</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>

        <select
          value={errorType}
          onChange={(e) => setErrorType(e.target.value)}
          className="bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="">All Error Types</option>
          <option value="SYNTAX_ERROR">Syntax Error</option>
          <option value="LOGICAL_ERROR">Logical Error</option>
          <option value="RUNTIME_ERROR">Runtime Error</option>
          <option value="INDEX_ERROR">Index Error</option>
          <option value="NULL_REFERENCE">Null Reference</option>
          <option value="INFINITE_LOOP">Infinite Loop</option>
        </select>
      </div>

      {/* History Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving session telemetry..." />
      ) : sessions.length > 0 ? (
        <div className="border border-surface-200 dark:border-ide-border rounded-xl overflow-hidden bg-white dark:bg-ide-panel">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-surface-900 border-b border-surface-200 dark:border-ide-border text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Session Name / File</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Diagnosis</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-850">
              {sessions.map((sess) => (
                <tr
                  key={sess._id}
                  onClick={() => navigate(`/session/${sess._id}`)}
                  className="hover:bg-zinc-50 dark:hover:bg-surface-850/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
                        {sess.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase">
                      {sess.language}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    {sess.aiAnalysis?.primaryErrorType && sess.aiAnalysis.primaryErrorType !== 'NONE' ? (
                      <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 font-semibold truncate block">
                        {sess.aiAnalysis.primaryErrorType.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        Clean Run
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        sess.status === 'FIXED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-200 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {sess.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => handleDelete(sess._id, e)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 border border-surface-200 dark:border-ide-border rounded-2xl bg-white dark:bg-ide-panel shadow-subtle">
          <img
            src={emptyIllustration}
            alt="No debugging history"
            className="h-24 w-24 mx-auto opacity-70 dark:opacity-60"
          />
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No debugging history found
            </h3>
            <p className="text-xs text-zinc-400">
              Analyze code in the Debug workspace to automatically record diagnostic logs, compiler tracebacks, and error insights.
            </p>
          </div>
          <button
            onClick={() => navigate('/debugger')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all"
          >
            Launch Debugger
          </button>
        </div>
      )}
    </div>
  );
}
