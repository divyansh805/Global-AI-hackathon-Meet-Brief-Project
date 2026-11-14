import React, { useState, useMemo } from 'react';
import {
  Archive,
  Search,
  FileText,
  Newspaper,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { MeetingBriefing, NewsIntelligenceReport } from '../types/briefing.js';

interface ResearchVaultProps {
  briefings: MeetingBriefing[];
  newsReports: NewsIntelligenceReport[];
  onOpenBriefing: (briefing: MeetingBriefing) => void;
  onOpenNews: (news: NewsIntelligenceReport) => void;
  onDeleteBriefing: (id: string) => void;
  onDeleteNews: (id: string) => void;
  onClearAll: () => void;
  onCreateBriefing: () => void;
}

type VaultFilter = 'all' | 'briefings' | 'news';

export const ResearchVault: React.FC<ResearchVaultProps> = ({
  briefings,
  newsReports,
  onOpenBriefing,
  onOpenNews,
  onDeleteBriefing,
  onDeleteNews,
  onClearAll,
  onCreateBriefing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<VaultFilter>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Combine and sort by createdAt desc
  const allItems = useMemo(() => {
    const list: Array<
      | { type: 'briefing'; id: string; date: string; title: string; subtitle: string; summary: string; data: MeetingBriefing }
      | { type: 'news'; id: string; date: string; title: string; subtitle: string; summary: string; data: NewsIntelligenceReport }
    > = [];

    briefings.forEach((b) => {
      list.push({
        type: 'briefing',
        id: b.id,
        date: b.createdAt,
        title: b.request.companyName,
        subtitle: `Meeting with ${b.request.personName || 'Team'} · ${b.request.meetingPurpose}`,
        summary: b.executiveSummary,
        data: b,
      });
    });

    newsReports.forEach((n) => {
      list.push({
        type: 'news',
        id: n.id,
        date: n.createdAt,
        title: n.query,
        subtitle: `${n.articles.length} news items · ${n.dateRange}`,
        summary: n.executiveBrief,
        data: n,
      });
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [briefings, newsReports]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'briefings' && item.type === 'briefing') ||
        (activeFilter === 'news' && item.type === 'news');

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [allItems, activeFilter, searchQuery]);

  const handleExportAll = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      briefings,
      newsReports,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meetbrief_vault_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalCount = allItems.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white font-sans">
            Research Vault
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-300">
            Save, search, revisit and manage previously generated research reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {totalCount > 0 && (
            <>
              <button
                onClick={handleExportAll}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#11192d] border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Vault</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors cursor-pointer border border-rose-200 dark:border-rose-800/60"
              >
                Clear All
              </button>
            </>
          )}

          <button
            onClick={onCreateBriefing}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
          >
            Create Briefing
          </button>
        </div>
      </div>

      {/* Clear Confirmation Prompt */}
      {showClearConfirm && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-[15px]">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
            <span>Clear entire research vault?</span>
          </div>
          <p className="text-[14px] text-rose-800 dark:text-rose-300 leading-relaxed">
            This will permanently remove all {totalCount} saved meeting briefing(s) and news reports from your browser storage.
          </p>
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={() => {
                onClearAll();
                setShowClearConfirm(false);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors cursor-pointer"
            >
              Yes, Delete All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#11192d] border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, person or topic in vault..."
              className="w-full pl-10 pr-4 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 text-[13px] sm:text-[14px] font-medium rounded-md transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-[#11192d] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Reports ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter('briefings')}
              className={`px-3.5 py-1.5 text-[13px] sm:text-[14px] font-medium rounded-md transition-colors cursor-pointer ${
                activeFilter === 'briefings'
                  ? 'bg-white dark:bg-[#11192d] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Meeting Briefings ({briefings.length})
            </button>
            <button
              onClick={() => setActiveFilter('news')}
              className={`px-3.5 py-1.5 text-[13px] sm:text-[14px] font-medium rounded-md transition-colors cursor-pointer ${
                activeFilter === 'news'
                  ? 'bg-white dark:bg-[#11192d] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              News Intelligence ({newsReports.length})
            </button>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      {totalCount === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300">
            <Archive className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Research Vault is Empty</h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Whenever you generate a Meeting Briefing or save a News Intelligence sweep, it will appear here for fast retrieval.
            </p>
          </div>
          <div>
            <button
              onClick={onCreateBriefing}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Generate First Briefing
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No matching reports found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your search query or switching filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold">
                    {item.type === 'briefing' ? (
                      <>
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-blue-700 dark:text-blue-400">Meeting Briefing</span>
                      </>
                    ) : (
                      <>
                        <Newspaper className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-indigo-700 dark:text-indigo-400">News Intelligence</span>
                      </>
                    )}
                  </div>
                  <span className="font-mono tabular-nums text-xs">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-950 dark:text-white truncate">
                  {item.title}
                </h3>

                <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300 truncate">
                  {item.subtitle}
                </p>

                {item.type === 'briefing' && (
                  <div className="flex items-center gap-3 text-[13px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.data.request.meetingDate}</span>
                    </div>
                    <span aria-hidden="true">·</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.data.request.meetingTime}</span>
                    </div>
                  </div>
                )}

                <p className="text-[14px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed pt-1">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (item.type === 'briefing') {
                      onOpenBriefing(item.data);
                    } else {
                      onOpenNews(item.data);
                    }
                  }}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Report</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (item.type === 'briefing') {
                      onDeleteBriefing(item.id);
                    } else {
                      onDeleteNews(item.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                  title="Delete from vault"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
