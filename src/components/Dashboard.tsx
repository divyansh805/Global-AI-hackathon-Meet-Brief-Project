import React from 'react';
import {
  FileText,
  Newspaper,
  Archive,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { MeetingBriefing, NewsIntelligenceReport } from '../types/briefing.js';
import { NavigationTab } from './Sidebar.js';

interface DashboardProps {
  onNavigate: (tab: NavigationTab) => void;
  recentBriefings: MeetingBriefing[];
  recentNews: NewsIntelligenceReport[];
  onOpenBriefing: (briefing: MeetingBriefing) => void;
  onOpenNews: (news: NewsIntelligenceReport) => void;
  onDeleteBriefing: (id: string) => void;
  apiStatus: {
    hasGeminiKey: boolean;
    hasGroqKey: boolean;
    hasOpenRouterKey: boolean;
    hasTavilyKey: boolean;
  } | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  recentBriefings,
  recentNews,
  onOpenBriefing,
  onOpenNews,
  onDeleteBriefing,
  apiStatus,
}) => {
  return (
    <div className="space-y-12 py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero Banner with premium navy, blue, and violet theme */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-[#0c1630] to-indigo-950 text-white p-8 sm:p-12 shadow-md border border-slate-800 dark:border-slate-800/80">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-xs font-semibold text-blue-300 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Walk Into Every Meeting Prepared</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans leading-tight">
            Prepare Smarter. <span className="text-blue-400">Meet Better.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            Get the latest intelligence about companies, people and industries before your next important meeting.
          </p>

          <p className="text-sm sm:text-[15px] text-slate-300 font-medium">
            Research smarter · Understand deeper · Connect better
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('meeting-briefing')}
              className="px-5 py-3 text-[15px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span>Create Meeting Briefing</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('news-intelligence')}
              className="px-5 py-3 text-[15px] font-medium text-slate-100 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <span>Explore News Intelligence</span>
            </button>
          </div>

          {/* Setup Alert if keys need checking */}
          {apiStatus &&
            (!apiStatus.hasTavilyKey ||
              (!apiStatus.hasGeminiKey && !apiStatus.hasGroqKey && !apiStatus.hasOpenRouterKey)) && (
            <div className="mt-4 p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-[13px] text-amber-200 flex items-start gap-3">
              <span className="font-semibold shrink-0 uppercase tracking-wider text-xs text-amber-300 pt-0.5">
                Setup Note:
              </span>
              <div className="space-y-1">
                {!apiStatus.hasTavilyKey && (
                  <p>
                    <span className="font-medium text-amber-200">TAVILY_API_KEY</span> is needed for live web search. Configure it in your project's environment or Settings.
                  </p>
                )}
                {!apiStatus.hasGeminiKey && !apiStatus.hasGroqKey && !apiStatus.hasOpenRouterKey && (
                  <p>
                    Configure at least one of <span className="font-medium text-amber-200">GEMINI_API_KEY</span>,{' '}
                    <span className="font-medium text-amber-200">GROQ_API_KEY</span>, or{' '}
                    <span className="font-medium text-amber-200">OPENROUTER_API_KEY</span> for AI synthesis.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-violet-600/10 to-transparent pointer-events-none" />
      </section>

      {/* THREE MAIN FEATURES SECTION - Clean headings, NO feature numbers */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white font-sans">
            Core Capabilities
          </h2>
          <p className="text-[15px] text-slate-600 dark:text-slate-300 mt-1">
            Autonomous research and intelligence tools built for high-stakes preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Meeting Briefing Card */}
          <div className="bg-white dark:bg-[#11192d] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-6 flex flex-col justify-between space-y-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Meeting Briefing
                </h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Research a company or person and generate a concise, source-backed meeting briefing using recent developments.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[14px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                  <span>30-day chronological timeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                  <span>Talking points & conversational openers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                  <span>5 strategic discussion questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                  <span>Optional competitor comparison</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('meeting-briefing')}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Create Briefing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* News Intelligence Card */}
          <div className="bg-white dark:bg-[#11192d] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-6 flex flex-col justify-between space-y-6 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Newspaper className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  News Intelligence
                </h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Explore recent news, launches, leadership updates, partnerships, hiring and important developments with original source links.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[14px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                  <span>Targeted company & market sweeps</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                  <span>Product launches & tech milestones</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                  <span>Leadership appointments & hiring</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                  <span>Verified original source links</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('news-intelligence')}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-600 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 active:bg-indigo-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Explore News</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Research Vault Card */}
          <div className="bg-white dark:bg-[#11192d] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-6 flex flex-col justify-between space-y-6 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md transition-all group">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Archive className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Research Vault
                </h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Save, search, revisit and manage previously generated research reports.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[14px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
                  <span>Local secure persistence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
                  <span>Instant full-text report search</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
                  <span>One-click report reopen & print</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
                  <span>Markdown & text export</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('research-vault')}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-violet-600 dark:bg-violet-600 rounded-lg hover:bg-violet-700 dark:hover:bg-violet-500 active:bg-violet-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Open Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Activity from Research Vault */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Recent Intelligence in Vault
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your recent meeting briefings and news sweeps
            </p>
          </div>

          {(recentBriefings.length > 0 || recentNews.length > 0) && (
            <button
              onClick={() => onNavigate('research-vault')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All in Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {recentBriefings.length === 0 && recentNews.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300">
              <Archive className="w-6 h-6" />
            </div>
            <p className="text-[15px] text-slate-600 dark:text-slate-300">
              No reports stored in your vault yet. Create your first meeting briefing or run a news search to populate the vault.
            </p>
            <button
              onClick={() => onNavigate('meeting-briefing')}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Start First Briefing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentBriefings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="p-5 bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3.5 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-blue-700 dark:text-blue-400">Meeting Briefing</span>
                    <span className="font-mono">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-950 dark:text-white truncate">
                    {b.request.companyName}
                  </h3>

                  {b.request.personName && (
                    <p className="text-[14px] text-slate-700 dark:text-slate-300 font-medium truncate">
                      With: {b.request.personName}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.request.meetingDate}</span>
                    <span aria-hidden="true">·</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.request.meetingTime}</span>
                  </div>

                  <p className="text-[14px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed pt-1">
                    {b.executiveSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                  <button
                    onClick={() => onOpenBriefing(b)}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Briefing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteBriefing(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer rounded"
                    title="Delete briefing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {recentNews.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className="p-5 bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3.5 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">News Intelligence</span>
                    <span className="font-mono">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-950 dark:text-white truncate">
                    {n.query}
                  </h3>

                  <p className="text-[14px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed pt-1">
                    {n.executiveBrief}
                  </p>

                  <div className="text-[13px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>{n.articles.length} verified news updates</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                  <button
                    onClick={() => onOpenNews(n)}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open News</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
