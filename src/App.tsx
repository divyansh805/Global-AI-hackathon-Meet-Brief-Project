/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar.js';
import { Dashboard } from './components/Dashboard.js';
import { ResearchForm } from './components/ResearchForm.js';
import { ResearchLoading } from './components/ResearchLoading.js';
import { BriefingReport } from './components/BriefingReport.js';
import { NewsIntelligence } from './components/NewsIntelligence.js';
import { ResearchVault } from './components/ResearchVault.js';
import { Settings } from './components/Settings.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import {
  ApiErrorType,
  BriefingApiErrorResponse,
  MeetingBriefing,
  NewsIntelligenceReport,
  ResearchRequest,
  SourceReference,
} from './types/briefing.js';
import { safeFetchJson } from './utils/apiClient.js';
import { BriefingStorage } from './utils/storage.js';
import { getInitialTheme, applyTheme, ThemeMode } from './utils/theme.js';
import { AlertCircle, Menu, Plus, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [currentBriefing, setCurrentBriefing] = useState<MeetingBriefing | null>(null);
  const [currentNewsReport, setCurrentNewsReport] = useState<NewsIntelligenceReport | null>(null);

  const [savedBriefings, setSavedBriefings] = useState<MeetingBriefing[]>([]);
  const [savedNewsReports, setSavedNewsReports] = useState<NewsIntelligenceReport[]>([]);

  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const briefingRequestInFlight = useRef(false);
  const newsRequestInFlight = useRef(false);
  const [currentRequest, setCurrentRequest] = useState<ResearchRequest | null>(null);
  const [prefilledCompany, setPrefilledCompany] = useState<string | undefined>(undefined);

  const [error, setError] = useState<string | null>(null);
  const [apiErrorType, setApiErrorType] = useState<ApiErrorType | null>(null);
  const [preservedResearch, setPreservedResearch] = useState<{
    request: ResearchRequest;
    cachedEvidence: unknown[];
    dateWindow?: {
      startDate: string;
      endDate: string;
      daysLookback: number;
    };
    queriesRun?: string[];
    sources?: SourceReference[];
  } | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [apiStatus, setApiStatus] = useState<{
    hasGeminiKey: boolean;
    hasGroqKey: boolean;
    hasOpenRouterKey: boolean;
    hasTavilyKey: boolean;
  } | null>(null);

  // Apply theme on mount and changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const refreshStatus = async () => {
    try {
      const result = await safeFetchJson<{
        hasGeminiKey: boolean;
        hasGroqKey: boolean;
        hasOpenRouterKey: boolean;
        hasTavilyKey: boolean;
      }>('/api/status');
      if (result.ok) {
        setApiStatus({
          hasGeminiKey: Boolean(result.data.hasGeminiKey),
          hasGroqKey: Boolean(result.data.hasGroqKey),
          hasOpenRouterKey: Boolean(result.data.hasOpenRouterKey),
          hasTavilyKey: Boolean(result.data.hasTavilyKey),
        });
      }
    } catch (err) {
      console.warn('Could not reach /api/status:', err);
    }
  };

  useEffect(() => {
    setSavedBriefings(BriefingStorage.getAll());
    setSavedNewsReports(BriefingStorage.getAllNews());
    refreshStatus();
  }, []);

  const handleNavigate = (tab: NavigationTab) => {
    setError(null);
    setApiErrorType(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Meeting Briefing Workflow ---
  const handleGenerateBriefing = async (request: ResearchRequest) => {
    if (briefingRequestInFlight.current) return;
    briefingRequestInFlight.current = true;
    setIsBriefingLoading(true);
    setCurrentRequest(request);
    setError(null);
    setApiErrorType(null);

    try {
      const result = await safeFetchJson<MeetingBriefing>('/api/research/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!result.ok) {
        const rawObj = result.raw as BriefingApiErrorResponse | undefined;
        const errorType = (result.errorType || rawObj?.errorType || 'UNKNOWN') as ApiErrorType;

        if (
          result.status === 503 ||
          errorType === 'AI_PROVIDER_ERROR' ||
          errorType === 'GEMINI_UNAVAILABLE' ||
          errorType === 'GEMINI_ERROR'
        ) {
          setApiErrorType(errorType === 'AI_PROVIDER_ERROR' ? 'AI_PROVIDER_ERROR' : errorType);
          if (Array.isArray(rawObj?.cachedEvidence)) {
            setPreservedResearch({
              request,
              cachedEvidence: rawObj.cachedEvidence,
              dateWindow: rawObj.dateWindow,
              queriesRun: rawObj.queriesRun,
              sources: rawObj.sources,
            });
          }
          throw new Error(
            result.error || 'All configured AI providers are temporarily unavailable. Your Tavily research is safe; retry analysis to reuse it.'
          );
        }

        if (result.status === 502 || errorType === 'TAVILY_ERROR') {
          setApiErrorType('TAVILY_ERROR');
          throw new Error(result.error || 'Tavily web search could not be completed. Please verify your Tavily credentials.');
        }

        setApiErrorType(errorType);
        throw new Error(result.error);
      }

      const briefing = result.data;

      // Clear any temporary error and preserved research upon success
      setPreservedResearch(null);
      setApiErrorType(null);
      setError(null);

      // Persist in Research Vault
      BriefingStorage.save(briefing);
      setSavedBriefings(BriefingStorage.getAll());

      setCurrentBriefing(briefing);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Failed to generate briefing:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Our AI research engine is temporarily busy. Your research is safe. Please retry in a moment.'
      );
    } finally {
      briefingRequestInFlight.current = false;
      setIsBriefingLoading(false);
    }
  };

  // --- Retry Analysis with Preserved Research ---
  const handleRetryAnalysis = () => {
    if (!preservedResearch || isBriefingLoading) return;
    const retryPayload: ResearchRequest = {
      ...preservedResearch.request,
      cachedEvidence: preservedResearch.cachedEvidence,
      cachedDateWindow: preservedResearch.dateWindow,
      cachedQueriesRun: preservedResearch.queriesRun,
    };
    handleGenerateBriefing(retryPayload);
  };

  // --- News Intelligence Workflow ---
  const handleSearchNews = async (query: string): Promise<NewsIntelligenceReport | null> => {
    if (newsRequestInFlight.current) return null;
    newsRequestInFlight.current = true;
    setIsNewsLoading(true);
    setError(null);

    try {
      const result = await safeFetchJson<NewsIntelligenceReport>('/api/research/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      const report = result.data;
      setCurrentNewsReport(report);
      return report;
    } catch (err: unknown) {
      console.error('Failed to fetch news intelligence:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not complete news research. Please check API credentials and connection.'
      );
      return null;
    } finally {
      newsRequestInFlight.current = false;
      setIsNewsLoading(false);
    }
  };

  const handleSaveNewsToVault = (report: NewsIntelligenceReport) => {
    BriefingStorage.saveNews(report);
    setSavedNewsReports(BriefingStorage.getAllNews());
  };

  const handleConvertToMeeting = (company: string) => {
    setPrefilledCompany(company);
    setCurrentBriefing(null);
    setActiveTab('meeting-briefing');
  };

  // --- Research Vault Handlers ---
  const handleOpenBriefing = (briefing: MeetingBriefing) => {
    setCurrentBriefing(briefing);
    setActiveTab('meeting-briefing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNews = (news: NewsIntelligenceReport) => {
    setCurrentNewsReport(news);
    setActiveTab('news-intelligence');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBriefing = (id: string) => {
    BriefingStorage.delete(id);
    setSavedBriefings(BriefingStorage.getAll());
    if (currentBriefing?.id === id) {
      setCurrentBriefing(null);
    }
  };

  const handleDeleteNews = (id: string) => {
    BriefingStorage.deleteNews(id);
    setSavedNewsReports(BriefingStorage.getAllNews());
    if (currentNewsReport?.id === id) {
      setCurrentNewsReport(null);
    }
  };

  const handleClearAllVault = () => {
    BriefingStorage.clearAll();
    setSavedBriefings([]);
    setSavedNewsReports([]);
    setCurrentBriefing(null);
    setCurrentNewsReport(null);
  };

  const vaultCount = savedBriefings.length + savedNewsReports.length;
  const isCurrentNewsSaved = Boolean(
    currentNewsReport && savedNewsReports.some((n) => n.id === currentNewsReport.id)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090e1a] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        vaultCount={vaultCount}
        isOpenMobile={isMobileMenuOpen}
        onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="no-print sticky top-0 z-30 bg-white/95 dark:bg-[#0c1324]/95 backdrop-blur-sm border-b border-slate-200/90 dark:border-slate-800/90 h-16 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white lg:hidden cursor-pointer rounded-md"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[15px]">
              <span className="font-semibold text-slate-900 dark:text-white capitalize font-sans">
                {activeTab === 'overview'
                  ? 'Overview'
                  : activeTab === 'meeting-briefing'
                  ? 'Meeting Briefing'
                  : activeTab === 'news-intelligence'
                  ? 'News Intelligence'
                  : activeTab === 'research-vault'
                  ? 'Research Vault'
                  : 'Settings'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle (Clearly visible in header) */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <button
              onClick={() => {
                setCurrentBriefing(null);
                setPrefilledCompany(undefined);
                setActiveTab('meeting-briefing');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Briefing</span>
            </button>
          </div>
        </header>

        {/* AI provider recovery banner */}
        {(apiErrorType === 'AI_PROVIDER_ERROR' ||
          apiErrorType === 'GEMINI_UNAVAILABLE' ||
          apiErrorType === 'GEMINI_ERROR') && (
          <div className="no-print max-w-5xl mx-auto w-full px-4 pt-4">
            <div className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950 dark:text-amber-100 shadow-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-amber-950 dark:text-amber-100 text-[15px]">
                      {apiErrorType === 'GEMINI_UNAVAILABLE' ? 'AI Engine Temporarily Busy' : 'AI Analysis Failed'}
                    </p>
                    {preservedResearch?.cachedEvidence && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 font-medium text-amber-900 dark:text-amber-200">
                        {preservedResearch.cachedEvidence.length} web sources preserved
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    {error || 'All configured AI providers failed to analyze the retrieved research.'}
                  </p>
                  {preservedResearch?.cachedEvidence && (
                    <p className="text-[13px] text-amber-800/80 dark:text-amber-300/80">
                      Tavily search has already completed. Clicking &ldquo;Retry Analysis&rdquo; will re-run intelligence synthesis without repeating web searches.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 sm:self-center">
                <button
                  type="button"
                  onClick={handleRetryAnalysis}
                  disabled={isBriefingLoading}
                  className="flex items-center gap-2 px-4 py-2 text-[14px] font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-4 h-4 ${isBriefingLoading ? 'animate-spin' : ''}`} />
                  <span>{isBriefingLoading ? 'Retrying...' : 'Retry Analysis'}</span>
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setApiErrorType(null);
                  }}
                  className="text-amber-700 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white p-2 rounded-lg cursor-pointer"
                  aria-label="Dismiss message"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Standard Error Banner for Non-Gemini or Tavily Errors */}
        {error &&
          apiErrorType !== 'AI_PROVIDER_ERROR' &&
          apiErrorType !== 'GEMINI_UNAVAILABLE' &&
          apiErrorType !== 'GEMINI_ERROR' && (
          <div className="no-print max-w-5xl mx-auto w-full px-4 pt-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start justify-between gap-3 text-rose-900 dark:text-rose-200 text-xs shadow-xs">
              <div className="flex items-start gap-2.5 min-w-0">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-rose-950 dark:text-rose-100 text-[14px]">
                    {apiErrorType === 'TAVILY_ERROR' ? 'Search Service Notice' : 'Notice'}
                  </p>
                  <p className="text-rose-800 dark:text-rose-300 leading-relaxed text-[13px]">{error}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setApiErrorType(null);
                }}
                className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Body Content */}
        <main className="flex-1 pb-16">
          {activeTab === 'overview' && (
            <Dashboard
              onNavigate={handleNavigate}
              recentBriefings={savedBriefings}
              recentNews={savedNewsReports}
              onOpenBriefing={handleOpenBriefing}
              onOpenNews={handleOpenNews}
              onDeleteBriefing={handleDeleteBriefing}
              apiStatus={apiStatus}
            />
          )}

          {activeTab === 'meeting-briefing' && (
            <>
              {isBriefingLoading && currentRequest ? (
                <ResearchLoading request={currentRequest} />
              ) : currentBriefing ? (
                <div className="space-y-4">
                  <div className="no-print max-w-5xl mx-auto px-4 pt-4">
                    <button
                      onClick={() => setCurrentBriefing(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Briefing Form</span>
                    </button>
                  </div>
                  <BriefingReport
                    briefing={currentBriefing}
                    onNewBriefing={() => setCurrentBriefing(null)}
                  />
                </div>
              ) : (
                <ResearchForm
                  onSubmit={handleGenerateBriefing}
                  isLoading={isBriefingLoading}
                  initialCompanyName={prefilledCompany}
                />
              )}
            </>
          )}

          {activeTab === 'news-intelligence' && (
            <NewsIntelligence
              onSearch={handleSearchNews}
              currentReport={currentNewsReport}
              isLoading={isNewsLoading}
              onSaveToVault={handleSaveNewsToVault}
              onConvertToMeeting={handleConvertToMeeting}
              isSavedInVault={isCurrentNewsSaved}
            />
          )}

          {activeTab === 'research-vault' && (
            <ResearchVault
              briefings={savedBriefings}
              newsReports={savedNewsReports}
              onOpenBriefing={handleOpenBriefing}
              onOpenNews={handleOpenNews}
              onDeleteBriefing={handleDeleteBriefing}
              onDeleteNews={handleDeleteNews}
              onClearAll={handleClearAllVault}
              onCreateBriefing={() => {
                setCurrentBriefing(null);
                setActiveTab('meeting-briefing');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              apiStatus={apiStatus}
              onRefreshStatus={refreshStatus}
              vaultBriefingCount={savedBriefings.length}
              vaultNewsCount={savedNewsReports.length}
              onClearVault={handleClearAllVault}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
