import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Loader2,
  Calendar,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  Bookmark,
  Share2,
  Check,
} from 'lucide-react';
import { NewsArticleItem, NewsIntelligenceReport } from '../types/briefing.js';

interface NewsIntelligenceProps {
  onSearch: (query: string) => Promise<NewsIntelligenceReport | null>;
  currentReport: NewsIntelligenceReport | null;
  isLoading: boolean;
  onSaveToVault: (report: NewsIntelligenceReport) => void;
  onConvertToMeeting: (companyName: string) => void;
  isSavedInVault: boolean;
}

type NewsCategoryFilter = 'All' | 'Launch' | 'Leadership' | 'Partnership' | 'Hiring' | 'Corporate';

const PRESETS = [
  'Anthropic',
  'Stripe',
  'Palantir',
  'Datadog',
  'Figma',
  'Snowflake',
];

export const NewsIntelligence: React.FC<NewsIntelligenceProps> = ({
  onSearch,
  currentReport,
  isLoading,
  onSaveToVault,
  onConvertToMeeting,
  isSavedInVault,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<NewsCategoryFilter>('All');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || isLoading) return;
    await onSearch(queryInput.trim());
  };

  const handleSelectPreset = (p: string) => {
    setQueryInput(p);
    onSearch(p);
  };

  const filteredArticles = currentReport?.articles.filter((art) => {
    if (activeCategory === 'All') return true;
    return art.category === activeCategory;
  }) || [];

  const handleCopyShare = () => {
    if (!currentReport) return;
    const text = `MeetBrief News Intelligence for ${currentReport.query}:\n${currentReport.executiveBrief}\n\nTop Update: ${currentReport.articles[0]?.headline || ''} (${currentReport.articles[0]?.sourceUrl || ''})`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white font-sans">
          News Intelligence
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Explore recent news, launches, leadership updates, partnerships, hiring and important developments with original source links.
        </p>
      </div>

      {/* Search Bar & Presets */}
      <div className="bg-white dark:bg-[#11192d] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search any company, organization, or tech leader..."
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !queryInput.trim()}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning 30 Days...</span>
              </>
            ) : (
              <>
                <span>Run Intelligence Sweep</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[13px] text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Popular Entities:</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSelectPreset(p)}
              disabled={isLoading}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-md transition-colors cursor-pointer text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700/60"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-12 text-center bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
          <Loader2 className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400 animate-spin" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Conducting 30-Day News Intelligence Sweep
            </h3>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Querying Tavily Search API for launches, leadership moves, partnerships, and executive updates...
            </p>
          </div>
        </div>
      )}

      {/* Report View */}
      {!isLoading && currentReport && (
        <div className="space-y-6">
          {/* Executive Brief Banner */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-white to-blue-50/90 dark:from-[#111a33] dark:via-[#131c38] dark:to-[#0f172a] border border-indigo-200/80 dark:border-indigo-900/60 rounded-xl p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Verified 30-Day Intelligence
                </div>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white font-sans mt-0.5">
                  {currentReport.query}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSaveToVault(currentReport)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border shadow-2xs ${
                    isSavedInVault
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : 'bg-white dark:bg-[#11192d] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {isSavedInVault ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Saved in Vault</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save to Vault</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#11192d] border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  onClick={() => onConvertToMeeting(currentReport.query)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Prepare Meeting</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {currentReport.executiveBrief}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>Window: {currentReport.dateRange}</span>
              <span aria-hidden="true">·</span>
              <span>{currentReport.articles.length} verified news items</span>
              <span aria-hidden="true">·</span>
              <span>{currentReport.sources.length} sources analyzed</span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg w-fit overflow-x-auto max-w-full">
            {(['All', 'Launch', 'Leadership', 'Partnership', 'Hiring', 'Corporate'] as NewsCategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-[#11192d] text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All Updates' : cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No {activeCategory} updates found</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select 'All Updates' or try searching another entity.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredArticles.map((art: NewsArticleItem) => (
                <div
                  key={art.id}
                  className="p-5 bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-400">{art.category}</span>
                      <span className="font-mono text-[13px]">{art.publishedDate}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-950 dark:text-white leading-snug">
                      {art.headline}
                    </h3>

                    <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {art.summary}
                    </p>

                    <div className="p-3 bg-slate-50 dark:bg-[#141e36] rounded-lg border border-slate-100 dark:border-slate-800 text-[14px] text-slate-700 dark:text-slate-200">
                      <span className="font-semibold text-slate-900 dark:text-white">Why it matters: </span>
                      <span>{art.whyItMatters}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{art.sourceTitle}</span>
                    <a
                      href={art.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>Read Original Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sources Section */}
          <div className="bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Primary Web Sources</span>
              <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">{currentReport.sources.length} citations</span>
            </div>
            <div className="space-y-2">
              {currentReport.sources.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-lg font-medium"
                  >
                    {s.title}
                  </a>
                  <span className="font-mono text-slate-400 dark:text-slate-500 text-xs shrink-0">{s.publishedDate}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 text-xs text-slate-400 dark:text-slate-500 text-center font-mono">
              Research powered by Tavily Search API · Synthesized by {currentReport.metadata.aiProvider} ({currentReport.metadata.aiModel})
            </div>
          </div>
        </div>
      )}

      {/* Initial Empty State */}
      {!isLoading && !currentReport && (
        <div className="p-12 text-center bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ready to sweep 30-day developments
            </h3>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Enter any company name above to inspect recent product launches, leadership moves, partnerships, and market events.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
