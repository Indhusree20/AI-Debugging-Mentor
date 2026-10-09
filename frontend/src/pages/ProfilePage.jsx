import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDebugger } from '../contexts/DebuggerContext';
import { User, Settings, CheckCircle2, Save, Sun, Moon, Sparkles } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { editorSettings, setEditorSettings } = useDebugger();

  const [name, setName] = useState(user?.name || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'BEGINNER');
  const [preferredLanguages, setPreferredLanguages] = useState(user?.preferredLanguages || ['python']);
  const [fontSize, setFontSize] = useState(editorSettings.fontSize || 13);
  const [tabSize, setTabSize] = useState(editorSettings.tabSize || 4);
  const [saved, setSaved] = useState(false);
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
    setLoading(true);
    setSaved(false);

    try {
      await updateProfile({
        name,
        experienceLevel,
        preferredLanguages,
      });

      setEditorSettings((prev) => ({
        ...prev,
        fontSize: parseInt(fontSize, 10),
        tabSize: parseInt(tabSize, 10),
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          <span>Profile & Developer Preferences</span>
        </h1>
        <p className="text-xs text-zinc-500">
          Configure editor behavior, theme, focus languages, and adaptive AI explanation depth.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Settings and mentoring calibrations updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information */}
        <div className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-4 shadow-subtle">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Account Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-zinc-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-lg px-3 py-2 text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI Scaffolding Depth */}
        <div className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-3 shadow-subtle">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Adaptive AI Scaffolding Level</h3>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'BEGINNER', label: 'Beginner', desc: 'Plain-language, visual analogies, step-by-step guidance' },
              { id: 'INTERMEDIATE', label: 'Intermediate', desc: 'Algorithm invariants, edge cases, boundaries' },
              { id: 'ADVANCED', label: 'Advanced', desc: 'Memory safety, asymptotic complexity, architectural best practices' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setExperienceLevel(lvl.id)}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                  experienceLevel === lvl.id
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-subtle'
                    : 'bg-zinc-50 dark:bg-surface-950 border-surface-200 dark:border-surface-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <div className="font-bold text-xs">{lvl.label}</div>
                <div className="text-[10px] text-zinc-500 leading-tight">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Preferences */}
        <div className="p-5 rounded-2xl bg-white dark:bg-ide-panel border border-surface-200 dark:border-ide-border space-y-4 shadow-subtle">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Editor Configuration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Theme</label>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-zinc-800 dark:text-zinc-200"
              >
                <span>{theme === 'dark' ? 'Dark (Zinc)' : 'Light (Clean)'}</span>
                {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-zinc-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Font Size (px)</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="12">12px (Compact)</option>
                <option value="13">13px (Default)</option>
                <option value="14">14px (Comfortable)</option>
                <option value="16">16px (Large)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Tab Size</label>
              <select
                value={tabSize}
                onChange={(e) => setTabSize(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving Changes...' : 'Save All Preferences'}</span>
        </button>
      </form>
    </div>
  );
}
