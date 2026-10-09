import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { ShieldCheck, Users, Activity, Lock, Layers, BarChart2 } from 'lucide-react';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminStats() {
      try {
        const data = await analyticsService.getAdminStatistics();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating privacy-safe platform telemetry..." />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span>Privacy-Aware Platform Administration</span>
        </h1>
        <p className="text-xs text-slate-400">
          High-level operational metrics and system telemetry. User source code and private tokens are strictly shielded.
        </p>
      </div>

      {/* Privacy Guarantee Alert */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-emerald-500/20 text-xs text-emerald-300">
        <Lock className="h-5 w-5 text-emerald-400 shrink-0" />
        <div>
          <strong className="block font-bold">Privacy Architecture Notice:</strong>
          <span>{stats?.privacyNote || 'User source code and session contents are strictly protected and omitted from admin telemetry.'}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">
            {stats?.totalUsers ?? 1}
          </div>
          <div className="text-[11px] text-slate-500">{stats?.activeUsers24h ?? 1} active in last 24h</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Debugging Runs</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">
            {stats?.totalSessions ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Recorded across all languages</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Supported Adapters</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            4
          </div>
          <div className="text-[11px] text-slate-500">Python, Java, C, C++ Active</div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language volume */}
        <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Execution Runs by Language</h3>
          <div className="space-y-2">
            {stats?.sessionsByLanguage?.length ? (
              stats.sessionsByLanguage.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-xs">
                  <span className="font-bold text-slate-200 uppercase">{item._id}</span>
                  <span className="font-mono text-blue-400">{item.count} sessions</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic">No runs recorded yet.</div>
            )}
          </div>
        </div>

        {/* Errors Breakdown */}
        <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Global Error Types Frequency</h3>
          <div className="space-y-2">
            {stats?.errorTypeFrequency?.length ? (
              stats.errorTypeFrequency.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-xs">
                  <span className="font-bold text-slate-200">{item._id.replace('_', ' ')}</span>
                  <span className="font-mono text-rose-400">{item.count} detections</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic">No errors logged yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
