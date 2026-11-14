import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Briefcase,
  Search,
  Trash2,
  ExternalLink,
  Plus,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { MeetingBriefing } from '../types/briefing.js';

interface ResearchHistoryProps {
  briefings: MeetingBriefing[];
  onOpenBriefing: (briefing: MeetingBriefing) => void;
  onDeleteBriefing: (id: string) => void;
  onClearAll: () => void;
  onNewBriefing: () => void;
}

export const ResearchHistory: React.FC<ResearchHistoryProps> = ({
  briefings,
  onOpenBriefing,
  onDeleteBriefing,
  onClearAll,
  onNewBriefing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('All');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredBriefings = useMemo(() => {
    return briefings.filter((b) => {
      const matchesSearch =
        b.request.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.request.personName && b.request.personName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.executiveSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPurpose = selectedPurpose === 'All' || b.request.meetingPurpose === selectedPurpose;

      return matchesSearch && matchesPurpose;
    });
  }, [briefings, searchQuery, selectedPurpose]);

  const uniquePurposes = useMemo(() => {
    const set = new Set<string>();
    briefings.forEach((b) => set.add(b.request.meetingPurpose));
    return ['All', ...Array.from(set)];
  }, [briefings]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 font-sans">
            Research History
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access, review, and export all previously generated meeting briefings saved on this device.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {briefings.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              Clear History
            </button>
          )}

          <button
            onClick={onNewBriefing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Briefing</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Clear all stored research briefings?</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            This will permanently remove {briefings.length} saved briefing(s) from your local browser storage.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                onClearAll();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors cursor-pointer"
            >
              Yes, Delete All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {briefings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, person name, or key terms..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="purposeFilter" className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Purpose:
            </label>
            <select
              id="purposeFilter"
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {uniquePurposes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Briefings List or Empty State */}
      {briefings.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">No Research History Found</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your generated briefings will be preserved here so you can review talking points before every meeting.
            </p>
          </div>
          <div>
            <button
              onClick={onNewBriefing}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Generate First Briefing
            </button>
          </div>
        </div>
      ) : filteredBriefings.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-2">
          <p className="text-sm font-semibold text-slate-800">No matching briefings found</p>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or purpose filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBriefings.map((b) => (
            <div
              key={b.id}
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>{b.request.meetingPurpose}</span>
                  </div>
                  <span className="font-mono tabular-nums text-[11px]">
                    Created {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-950 truncate">
                  {b.request.companyName}
                </h3>

                {b.request.personName && (
                  <p className="text-xs font-semibold text-slate-700">
                    Meeting with: {b.request.personName}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.request.meetingDate}</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.request.meetingTime}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
                  {b.executiveSummary}
                </p>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <span>30-Day Window: {b.dateWindow.startDate} → {b.dateWindow.endDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>{b.sources.length} Sources</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenBriefing(b)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Full Briefing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteBriefing(b.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="Delete from history"
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
