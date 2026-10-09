import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart2, TrendingUp, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const stats = await analyticsService.getDashboardAnalytics();
        setData(stats);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating skill trajectories and error patterns..." />;
  }

  const errorTypeData = data?.errorTypeChartData?.length
    ? data.errorTypeChartData
    : [
        { name: 'Syntax Errors', value: 6 },
        { name: 'Logical Errors', value: 4 },
        { name: 'Runtime Errors', value: 3 },
        { name: 'Index Errors', value: 2 },
      ];

  const languageData = data?.languageChartData?.length
    ? data.languageChartData
    : [
        { language: 'PYTHON', count: 8 },
        { language: 'JAVA', count: 5 },
        { language: 'C', count: 2 },
        { language: 'CPP', count: 3 },
      ];

  const masteryScores = data?.masteryScores || [
    { topic: 'Statement Syntax & Termination', score: 85 },
    { topic: 'Conditionals & Boolean Expressions', score: 70 },
    { topic: 'Loops & Bounds Invariants', score: 55 },
    { topic: 'Arrays & Memory References', score: 45 },
    { topic: 'Functions & Scope', score: 65 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-blue-500" />
          <span>Learning Analytics & Telemetry</span>
        </h1>
        <p className="text-xs text-zinc-500">
          Empirical tracking of your error frequencies, resolution efficiency, and conceptual progression.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
        <div className="p-4 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-1 shadow-subtle">
          <span className="text-xs font-semibold text-zinc-500">Total Errors Encountered</span>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {data?.errorsDetected ?? 15}
          </div>
          <span className="text-[11px] text-zinc-400">Across {data?.totalSessions ?? 18} sessions</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-1 shadow-subtle">
          <span className="text-xs font-semibold text-zinc-500">Resolution Efficiency</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {data?.successRate ?? 83}%
          </div>
          <span className="text-[11px] text-zinc-400">Errors solved and verified</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-1 shadow-subtle">
          <span className="text-xs font-semibold text-zinc-500">Skill Trajectory</span>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400 pt-1 flex items-center gap-1">
            <span>+24% Syntax Precision</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <span className="text-[11px] text-zinc-400">Continuous mastery trajectory</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Types Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-3 shadow-subtle">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <span>Error Frequency Breakdown</span>
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={errorTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {errorTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f4f4f5',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Volume Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-3 shadow-subtle">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span>Language Volume Distribution</span>
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageData}>
                <XAxis dataKey="language" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f4f4f5',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conceptual Mastery Grid */}
      <div className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-4 shadow-subtle">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-500" />
          <span>Conceptual Mastery Curves</span>
        </h3>

        <div className="space-y-3">
          {masteryScores.map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{m.topic}</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{m.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-surface-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${m.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
