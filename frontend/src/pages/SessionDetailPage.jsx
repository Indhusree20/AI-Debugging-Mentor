import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { debugService } from '../services/debugService';
import { useDebugger } from '../contexts/DebuggerContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { ErrorSummaryCard } from '../components/debugging/ErrorSummaryCard';
import { PedagogicalExplanation } from '../components/debugging/PedagogicalExplanation';
import { StepGuidanceChecklist } from '../components/debugging/StepGuidanceChecklist';
import { ProgressiveHintPanel } from '../components/debugging/ProgressiveHintPanel';
import { CodeQualityScoreCard } from '../components/debugging/CodeQualityScoreCard';
import {
  ArrowLeft,
  Terminal,
  Code2,
  CheckCircle,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

export function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLanguage, setSourceCode, setCurrentSession } = useDebugger();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await debugService.getSessionById(id);
        setSession(data);
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading session details..." />;
  }

  if (!session) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-slate-400">Debugging session not found.</p>
        <Link to="/history" className="text-blue-400 font-semibold text-xs hover:underline">
          ← Back to History
        </Link>
      </div>
    );
  }

  const handleResumeInDebugger = () => {
    setLanguage(session.language);
    setSourceCode(session.sourceCode);
    setCurrentSession(session);
    navigate('/debugger');
  };

  const handleMarkFixed = async () => {
    try {
      const updated = await debugService.updateSessionStatus(session._id, 'FIXED');
      setSession(updated);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to History</span>
        </button>

        <div className="flex items-center gap-2">
          {session.status !== 'FIXED' && (
            <button
              onClick={handleMarkFixed}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/30 transition-all"
            >
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Mark as Fixed</span>
            </button>
          )}

          <button
            onClick={handleResumeInDebugger}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Terminal className="h-4 w-4" />
            <span>Open in Live Debugger</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100">{session.title}</h1>
            <Badge variant="primary">{session.language.toUpperCase()}</Badge>
            <Badge variant={session.status === 'FIXED' ? 'success' : 'default'}>
              {session.status}
            </Badge>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Recorded {new Date(session.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Source Code Box */}
      <div className="rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Code2 className="h-4 w-4 text-blue-400" />
            <span>Snapshot Source Code</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          {session.sourceCode}
        </pre>
      </div>

      {/* Diagnostics */}
      <div className="space-y-4">
        <ErrorSummaryCard session={session} />
        <PedagogicalExplanation session={session} />
        <StepGuidanceChecklist session={session} />
        <ProgressiveHintPanel session={session} />
        <CodeQualityScoreCard session={session} />
      </div>
    </div>
  );
}
