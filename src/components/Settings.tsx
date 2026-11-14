import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Shield,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';
import { ThemeMode } from '../utils/theme.js';

interface SettingsProps {
  apiStatus: {
    hasGeminiKey: boolean;
    hasGroqKey: boolean;
    hasOpenRouterKey: boolean;
    hasTavilyKey: boolean;
  } | null;
  onRefreshStatus: () => Promise<void>;
  vaultBriefingCount: number;
  vaultNewsCount: number;
  onClearVault: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  apiStatus,
  onRefreshStatus,
  vaultBriefingCount,
  vaultNewsCount,
  onClearVault,
  theme,
  onToggleTheme,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshStatus();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleClear = () => {
    onClearVault();
    setConfirmClear(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white font-sans">
          Settings & Environment
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-300">
          Inspect API integration health, research scope parameters, appearance theme, and local data storage.
        </p>
      </div>

      {/* Appearance Theme Switcher */}
      <div className="bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Interface Theme</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between Light Mode and Dark Mode</p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => {
                if (theme !== 'light') onToggleTheme();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => {
                if (theme !== 'dark') onToggleTheme();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#11192d] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status Section */}
      <div className="bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Integration Health</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live operational status of backend services</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tavily Status */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-[#141e36] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-900 dark:text-white font-bold text-[14px]">Tavily Search API</span>
              {apiStatus?.hasTavilyKey ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Key Pending</span>
                </span>
              )}
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Provides real-time 30-day web search across company news, launches, and leadership developments.
            </p>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
              Env: <code className="bg-slate-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">TAVILY_API_KEY</code>
            </div>
          </div>

          {/* Gemini Status */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-[#141e36] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-900 dark:text-white font-bold text-[14px]">Google Gemini</span>
              {apiStatus?.hasGeminiKey ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Missing Key</span>
                </span>
              )}
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Synthesizes retrieved evidence into executive talking points, chronological updates, and 5 questions.
            </p>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
              Env: <code className="bg-slate-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">GEMINI_API_KEY</code>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-[#141e36] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-900 dark:text-white font-bold text-[14px]">Groq</span>
              {apiStatus?.hasGroqKey ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Key Pending</span>
                </span>
              )}
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
              First AI fallback; model availability is discovered from Groq when synthesis is needed.
            </p>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
              Env: <code className="bg-slate-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">GROQ_API_KEY</code>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-[#141e36] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-900 dark:text-white font-bold text-[14px]">OpenRouter</span>
              {apiStatus?.hasOpenRouterKey ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Key Pending</span>
                </span>
              )}
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Second fallback; only available free chat models are eligible for synthesis.
            </p>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
              Env: <code className="bg-slate-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">OPENROUTER_API_KEY</code>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Scope Parameters */}
      <div className="bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Research Scope Guardrails</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Fixed standards enforced across all MeetBrief research workflows</p>
        </div>

        <div className="space-y-3 text-[14px]">
          <div className="p-3.5 bg-slate-50 dark:bg-[#141e36] rounded-lg flex items-start gap-3">
            <Shield className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">30-Day Lookback Window Guarantee</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                All research queries are anchored to the 30 calendar days preceding the user-specified meeting date (not assuming today is the meeting date).
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#141e36] rounded-lg flex items-start gap-3">
            <Layers className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">Anti-Hallucination & Primary Citations</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Every claim must map to a verified source URL returned by the Tavily Search API. Inferred or unverified items are marked with explicit confidence flags.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage and Vault Management */}
      <div className="bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Research Vault Storage</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage client-side cached reports and intelligence data</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#141e36] rounded-xl">
          <div className="text-[14px] space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">Current Storage Footprint:</p>
            <p className="text-slate-600 dark:text-slate-300">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{vaultBriefingCount}</span> Meeting Briefings ·{' '}
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{vaultNewsCount}</span> News Intelligence Reports
            </p>
          </div>

          <div className="flex items-center gap-2">
            {confirmClear ? (
              <>
                <button
                  onClick={handleClear}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#11192d] border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors cursor-pointer border border-rose-200 dark:border-rose-800/60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Vault Storage</span>
              </button>
            )}
          </div>
        </div>

        {clearedNotice && (
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            ✓ Research Vault cache cleared successfully.
          </p>
        )}
      </div>
    </div>
  );
};
