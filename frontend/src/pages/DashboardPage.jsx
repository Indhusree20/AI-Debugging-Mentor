import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import emptyIllustration from '../assets/empty-state.svg';
import {
  Terminal,
  Bug,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Clock,
  Code2,
  BookOpen,
  Target,
  Sparkles,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await analyticsService.getDashboardAnalytics();
        setData(stats);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard telemetry..." />;
  }

  const totalSessions = data?.totalSessions ?? 0;
  const errorsDetected = data?.errorsDetected ?? 0;
  const problemsAttempted = data?.problemsAttempted ?? 0;
  const problemsSolved = data?.problemsSolved ?? 0;
  const recentSessions = data?.recentSessions || [];
  const languageChartData = data?.languageChartData || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border flex flex-wrap items-center justify-between gap-4 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Dashboard
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase">
              {user?.experienceLevel || 'Developer'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 max-w-lg">
            Track your debugging and practice progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/debugger"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all hover:scale-[1.02]"
          >
            <Terminal className="h-4 w-4" />
            <span>Open Debugger</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/practice"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-surface-800 hover:bg-zinc-200 dark:hover:bg-surface-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs border border-surface-200 dark:border-surface-700 transition-all"
          >
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <span>Practice</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="p-4 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Total Sessions</span>
            <Terminal className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{totalSessions}</div>
          <span className="text-[11px] text-zinc-400">Total debugging sessions</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Errors Analyzed</span>
            <Bug className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{errorsDetected}</div>
          <span className="text-[11px] text-zinc-400">Diagnostic findings</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Problems Attempted</span>
            <Target className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{problemsAttempted}</div>
          <span className="text-[11px] text-zinc-400">Practice problem runs</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold">Problems Solved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{problemsSolved}</div>
          <span className="text-[11px] text-zinc-400">All tests passed</span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions Table (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-4 shadow-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Recent Activity</span>
              </h3>
              <Link to="/history" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View History →
              </Link>
            </div>

            <div className="divide-y divide-surface-200 dark:divide-surface-850">
              {recentSessions.length > 0 ? (
                recentSessions.map((sess) => (
                  <Link
                    key={sess._id}
                    to={`/session/${sess._id}`}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-surface-850/50 px-2 rounded-lg transition-colors group"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors truncate">
                          {sess.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase shrink-0">
                          {sess.language}
                        </span>
                        {sess.aiAnalysis?.primaryErrorType && sess.aiAnalysis.primaryErrorType !== 'NONE' && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shrink-0">
                            {sess.aiAnalysis.primaryErrorType.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1">
                        {sess.aiAnalysis?.summary || 'Session recorded'}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {new Date(sess.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="py-10 text-center space-y-3">
                  <img
                    src={emptyIllustration}
                    alt="No activity"
                    className="h-20 w-20 mx-auto opacity-70 dark:opacity-60"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      No debugging sessions yet
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Start by analyzing your code in the Debug workspace.
                    </p>
                  </div>
                  <Link
                    to="/debugger"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors"
                  >
                    Launch Debugger
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Languages & Recommendations Column */}
        <div className="space-y-6">
          {/* Frequently Used Languages */}
          <div className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-3 shadow-subtle">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-indigo-500" />
              <span>Language Activity</span>
            </h3>

            {languageChartData.length > 0 ? (
              <div className="space-y-2">
                {languageChartData.map((item) => (
                  <div key={item.language} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{item.language}</span>
                    <span className="text-[11px] font-mono text-zinc-400">{item.count} session{item.count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-500">
                <p className="text-[11px] text-zinc-400 mb-2">Supported execution environments:</p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-700 dark:text-zinc-300">Python 3</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-700 dark:text-zinc-300">Java</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-700 dark:text-zinc-300">C</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-700 dark:text-zinc-300">C++</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-surface-800 text-zinc-700 dark:text-zinc-300">JavaScript</span>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Practice */}
          <div className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-3 shadow-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                <span>Recommended Practice</span>
              </h3>
              <Link to="/practice" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Explore →
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-1">
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Loop Boundaries & Invariants</div>
                <p className="text-[11px] text-zinc-500">Prevent off-by-one errors and infinite loops.</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-1">
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Arrays & Memory Safety</div>
                <p className="text-[11px] text-zinc-500">Defensive bounds checking and null reference handling.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
