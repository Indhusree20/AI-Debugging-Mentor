import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { practiceService } from '../services/practiceService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Code2,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
  Layers,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export function PracticeDashboardPage() {
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const topics = [
    'All',
    'Basic Mathematics',
    'Conditions',
    'Loops',
    'Number Theory',
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const languages = ['All', 'python', 'java', 'c', 'cpp', 'javascript'];

  const languageLabels = {
    All: 'All Languages',
    python: 'Python',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    javascript: 'JavaScript',
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [problemsData, progressData] = await Promise.all([
        practiceService.getProblems({
          difficulty: selectedDifficulty,
          topic: selectedTopic,
          language: selectedLanguage !== 'All' ? selectedLanguage : undefined,
          search: search.trim() || undefined,
        }),
        practiceService.getProgress().catch(() => null),
      ]);
      setProblems(problemsData || []);
      setProgress(progressData || null);
    } catch (err) {
      console.error('Failed to load practice data:', err);
      setError('Unable to load practice problems. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDifficulty, selectedTopic, selectedLanguage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const difficultyColors = {
    Easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Hard: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-200 dark:border-ide-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Practice Problems
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Improve your programming skills through hands-on practice.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Debugger Shortcut */}
        <Link
          to="/debugger"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-surface-850 hover:bg-zinc-200 dark:hover:bg-surface-800 border border-surface-200 dark:border-ide-border text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all self-start md:self-auto"
        >
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Open AI Debugger</span>
        </Link>
      </div>

      {/* Progress Summary Cards */}
      {progress && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Problems Solved
              </span>
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {progress.solvedCount || 0}
              </span>
              <span className="text-xs text-zinc-400">
                / {progress.totalProblems || 7} total
              </span>
            </div>
            <div className="mt-3 w-full bg-zinc-100 dark:bg-surface-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.completionPercentage || 0}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Attempted
              </span>
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {progress.attemptedCount || 0}
              </span>
              <span className="text-xs text-zinc-400">problems</span>
            </div>
            <div className="mt-3 text-[11px] text-zinc-400">
              {progress.attemptedCount > 0 ? 'Active learning in progress' : 'Ready for your first attempt'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Completion Rate
              </span>
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {progress.completionPercentage || 0}%
              </span>
            </div>
            <div className="mt-3 text-[11px] text-zinc-400">
              {progress.completionPercentage === 100 ? 'All 7 problems mastered!' : `${7 - (progress.solvedCount || 0)} problems remaining`}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Skill Level
              </span>
              <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {progress.solvedCount >= 7 ? 'Advanced Beginner' : progress.solvedCount >= 3 ? 'Intermediate' : 'Novice'}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-zinc-400">
              Fundamental Algorithms
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search problems by title, topic, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-24 py-2 rounded-lg bg-zinc-50 dark:bg-surface-850 border border-surface-200 dark:border-ide-border text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Topic Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-surface-850 border border-surface-200 dark:border-ide-border text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Topics' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-surface-850 border border-surface-200 dark:border-ide-border text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {languageLabels[l]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Difficulty Tabs */}
        <div className="flex items-center gap-2 border-t border-surface-200 dark:border-ide-border pt-3">
          <span className="text-xs text-zinc-400 mr-2">Difficulty:</span>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedDifficulty === diff
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-surface-850 hover:bg-zinc-200 dark:hover:bg-surface-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problem List */}
      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner text="Loading practice problems..." />
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : problems.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border p-8">
          <BookOpen className="h-10 w-10 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No problems found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No practice problems matched your search or filters. Try adjusting your filters or search keywords.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDifficulty('All');
              setSelectedTopic('All');
              setSelectedLanguage('All');
            }}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-surface-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-surface-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Problem ({problems.length})</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-surface-200 dark:divide-ide-border rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border shadow-sm overflow-hidden">
            {problems.map((prob, idx) => (
              <div
                key={prob._id || prob.slug}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-surface-850/50 transition-colors"
              >
                {/* Left: Status + Title + Meta */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* Status icon */}
                  <div className="pt-0.5 sm:pt-0 shrink-0">
                    {prob.isSolved ? (
                      <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500" title="Solved">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : prob.isAttempted ? (
                      <div className="p-1 rounded-full bg-amber-500/10 text-amber-500" title="Attempted">
                        <Clock className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-300 dark:border-surface-700 mx-1" title="Unsolved" />
                    )}
                  </div>

                  {/* Title & Topic */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/practice/${prob.slug}`}
                        className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {idx + 1}. {prob.title}
                      </Link>

                      {/* Difficulty Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          difficultyColors[prob.difficulty] || difficultyColors.Easy
                        }`}
                      >
                        {prob.difficulty}
                      </span>

                      {/* Topic Badge */}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 border border-surface-200 dark:border-surface-700">
                        {prob.topic}
                      </span>
                    </div>

                    {/* Supported Languages */}
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <span>Supported in:</span>
                      <span className="font-mono text-zinc-600 dark:text-zinc-300">
                        {prob.supportedLanguages ? prob.supportedLanguages.join(', ') : 'Python, Java, C, C++, JavaScript'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: CTA Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    to={`/practice/${prob.slug}`}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      prob.isSolved
                        ? 'bg-zinc-100 dark:bg-surface-800 hover:bg-zinc-200 dark:hover:bg-surface-700 text-zinc-800 dark:text-zinc-200'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    }`}
                  >
                    <span>{prob.isSolved ? 'Practice Again' : prob.isAttempted ? 'Resume' : 'Solve Problem'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
