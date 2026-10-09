import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import { useDebugger } from '../contexts/DebuggerContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Lightbulb,
  CheckCircle2,
  Play,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react';

export function LearningRecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setLanguage, setSourceCode, setExpectedOutput } = useDebugger();

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const list = await analyticsService.getRecommendations();
      setRecommendations(list || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handlePracticeInDebugger = (rec) => {
    if (rec.samplePracticeProblem?.starterCode) {
      setLanguage(rec.samplePracticeProblem.language || 'python');
      setSourceCode(rec.samplePracticeProblem.starterCode);
      setExpectedOutput(rec.samplePracticeProblem.expectedOutput || '');
      navigate('/debugger');
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await analyticsService.completeRecommendation(id);
      setRecommendations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isCompleted: true } : r))
      );
    } catch (err) {
      alert('Failed to mark complete');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <span>Personalized Practice & Topics</span>
        </h1>
        <p className="text-xs text-zinc-500">
          Targeted micro-lessons and starter practice problems generated dynamically from your repeated mistake patterns.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Generating targeted micro-lessons..." />
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec._id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                rec.isCompleted
                  ? 'bg-zinc-50 dark:bg-ide-panel/40 border-surface-200 dark:border-ide-border opacity-70'
                  : 'bg-white dark:bg-ide-panel border-surface-200 dark:border-ide-border shadow-subtle hover:border-zinc-400 dark:hover:border-surface-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase">
                    {rec.category}
                  </span>
                  {rec.isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mastered</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{rec.topic}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">{rec.reason}</p>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong className="text-blue-600 dark:text-blue-400 block mb-0.5 text-[11px]">Recommended Rule:</strong>
                  <span>{rec.recommendedAction}</span>
                </div>

                {rec.samplePracticeProblem?.starterCode && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Starter Challenge:
                    </span>
                    <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-ide-editor border border-surface-200 dark:border-ide-border font-mono text-[11px] text-zinc-800 dark:text-zinc-200 overflow-x-auto">
                      <pre>{rec.samplePracticeProblem.starterCode}</pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
                {!rec.isCompleted ? (
                  <button
                    onClick={() => handleMarkComplete(rec._id)}
                    className="text-xs text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Mark as Mastered
                  </button>
                ) : (
                  <span className="text-xs text-zinc-400">Completed</span>
                )}

                {rec.samplePracticeProblem?.starterCode && (
                  <button
                    onClick={() => handlePracticeInDebugger(rec)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-subtle transition-all"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Open in Debugger</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-zinc-400 border border-surface-200 dark:border-ide-border rounded-xl bg-white dark:bg-ide-panel">
          No active practice recommendations. As you encounter bugs in the debugger, customized micro-lessons will generate here.
        </div>
      )}
    </div>
  );
}
