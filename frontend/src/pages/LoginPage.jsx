import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles, Terminal } from 'lucide-react';
import authIllustration from '../assets/auth-illustration.svg';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      await login({ email, password });
      // Mandatory requirement: Direct to /debugger upon successful login
      navigate('/debugger');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-ide-border shadow-xl overflow-hidden">
        {/* Left: Illustration & Hero Brand (Hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-blue-900/10 via-zinc-900/5 to-transparent border-r border-surface-200 dark:border-ide-border">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Code Error Intelligence</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
              Understand your errors. Fix your code.
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Analyze multi-language source code with deterministic compiler diagnostics and AI error reasoning.
            </p>
          </div>

          <div className="my-auto py-4 flex justify-center">
            <img
              src={authIllustration}
              alt="AI Debugging Mentor Code Analysis Illustration"
              className="w-full max-w-xs drop-shadow-md"
            />
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Terminal className="h-3 w-3 text-emerald-500" />
              <span>Python, JS, TS, Java, C, C++</span>
            </span>
            <span>•</span>
            <span>Zero Mock Results</span>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="p-6 md:p-8 flex flex-col justify-center space-y-5">
          <div className="space-y-1">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-1">
              <Bug className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Welcome Back</h2>
            <p className="text-xs text-zinc-500">Sign in to your debugging workspace</p>
          </div>

          {infoMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg pl-9 pr-10 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Debug'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-xs text-zinc-500 pt-2 border-t border-surface-200 dark:border-ide-border">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

