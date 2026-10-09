import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bug, ArrowRight, AlertCircle, CheckCircle2, Sparkles, Terminal, Lock, Mail, User } from 'lucide-react';
import authIllustration from '../assets/auth-illustration.svg';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('BEGINNER');
  const [preferredLanguages, setPreferredLanguages] = useState(['python']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLanguage = (lang) => {
    if (preferredLanguages.includes(lang)) {
      if (preferredLanguages.length > 1) {
        setPreferredLanguages(preferredLanguages.filter((l) => l !== lang));
      }
    } else {
      setPreferredLanguages([...preferredLanguages, lang]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        confirmPassword,
        experienceLevel,
        preferredLanguages,
      });

      setSuccessMsg('Account created successfully. Redirecting to workspace...');
      setTimeout(() => {
        navigate('/debugger');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
              Master debugging with pedagogical AI guidance.
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Create your account once and debug across all supported languages with persistent session history.
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
              <span>Zero Mock Results</span>
            </span>
            <span>•</span>
            <span>Real Compiler Checks</span>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
          <div className="space-y-1">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-1">
              <Bug className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Create Account</h2>
            <p className="text-xs text-zinc-500">Configure your debugging preferences</p>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              {error.toLowerCase().includes('already exists') && (
                <div className="pt-1">
                  <Link
                    to="/login"
                    state={{ registeredEmail: email }}
                    className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Go to Login page</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 chars"
                    className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Experience level pills */}
            <div className="space-y-1 pt-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Experience Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      experienceLevel === lvl
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-zinc-50 dark:bg-surface-950 border-surface-200 dark:border-surface-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Register & Start Debugging'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-xs text-zinc-500 pt-2 border-t border-surface-200 dark:border-ide-border">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


