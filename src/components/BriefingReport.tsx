import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Briefcase,
  Copy,
  Printer,
  Download,
  ExternalLink,
  Plus,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Cpu,
  Users,
  Check,
  AlertTriangle,
  Newspaper,
  BookOpen,
  Info,
} from 'lucide-react';
import { MeetingBriefing, ResearchFinding } from '../types/briefing.js';
import {
  copyBriefingToClipboard,
  downloadBriefingAsFile,
  printBriefing,
} from '../utils/export.js';

interface BriefingReportProps {
  briefing: MeetingBriefing;
  onNewBriefing: () => void;
}

/**
 * Highlights concrete dates, dollar figures, percentages, and key numerical figures
 * present in verified briefing prose without altering the underlying text.
 */
function renderHighlightedText(text: string): React.ReactNode {
  if (!text) return text;
  const pattern =
    /(\$\d[\d,.]*(?:\s?(?:billion|million|trillion|B|M|K|bn|mn))?|\b\d{4}-\d{2}-\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?\b|\b\d+(?:\.\d+)?%|\b\d{1,3}(?:,\d{3})+\b)/g;

  const parts = text.split(pattern);
  if (parts.length === 1) return text;

  return parts.map((part, idx) => {
    if (!part) return null;
    if (idx % 2 === 1) {
      return (
        <span
          key={idx}
          className="font-semibold text-slate-950 dark:text-white bg-blue-50/90 dark:bg-blue-950/60 px-1 rounded-xs align-baseline"
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDisplayDate(raw: string | undefined | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const isoDateOnly = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoDateOnly) {
    const year = Number(isoDateOnly[1]);
    const month = Number(isoDateOnly[2]);
    const day = Number(isoDateOnly[3]);
    if (isValidCalendarDate(year, month, day)) {
      return `${pad2(day)}-${pad2(month)}-${year}`;
    }
    return trimmed;
  }

  const isoTimestamp = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}/);
  if (isoTimestamp) {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return `${pad2(parsed.getDate())}-${pad2(parsed.getMonth() + 1)}-${parsed.getFullYear()}`;
    }
    return trimmed;
  }

  const numericMatch = trimmed.match(/^(\d{1,2})([-/])(\d{1,2})\2(\d{4})$/);
  if (numericMatch) {
    const first = Number(numericMatch[1]);
    const second = Number(numericMatch[3]);
    const year = Number(numericMatch[4]);

    if (first > 12 && second <= 12 && isValidCalendarDate(year, second, first)) {
      return `${pad2(first)}-${pad2(second)}-${year}`;
    }
    if (first <= 12 && second > 12 && isValidCalendarDate(year, first, second)) {
      return `${pad2(second)}-${pad2(first)}-${year}`;
    }
    if (first === second && isValidCalendarDate(year, first, second)) {
      return `${pad2(first)}-${pad2(second)}-${year}`;
    }
    return trimmed;
  }

  const months: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };

  const monthFirst = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthFirst) {
    const m = months[monthFirst[1].toLowerCase()];
    const d = Number(monthFirst[2]);
    const y = Number(monthFirst[3]);
    if (m && isValidCalendarDate(y, m, d)) {
      return `${pad2(d)}-${pad2(m)}-${y}`;
    }
  }

  const dayFirst = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/);
  if (dayFirst) {
    const d = Number(dayFirst[1]);
    const m = months[dayFirst[2].toLowerCase()];
    const y = Number(dayFirst[3]);
    if (m && isValidCalendarDate(y, m, d)) {
      return `${pad2(d)}-${pad2(m)}-${y}`;
    }
  }

  return trimmed;
}

function formatGeneratedTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface FindingListSectionProps {
  sectionNumber: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: ResearchFinding[];
  relevanceLabel: string;
  showRelevance?: boolean;
}

const FindingListSection: React.FC<FindingListSectionProps> = ({
  sectionNumber,
  title,
  subtitle,
  icon,
  items,
  relevanceLabel,
  showRelevance = true,
}) => {
  if (items.length === 0) return null;

  return (
    <section className="px-6 sm:px-10 py-8 space-y-5">
      <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
            {sectionNumber}
          </span>
          <span className="text-blue-600 dark:text-blue-400">{icon}</span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            {title}
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          {items.length} {items.length === 1 ? 'update' : 'updates'} · {subtitle}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="report-item-avoid flex flex-col justify-between space-y-3 pb-5 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 md:last:border-b"
          >
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                  {formatDisplayDate(item.publishedDate)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {item.category}
                </span>
                <span aria-hidden="true">·</span>
                <span>Confidence: {item.evidenceQuality}</span>
              </div>

              <h3 className="text-[16px] font-bold text-slate-950 dark:text-white leading-snug">
                {item.headline}
              </h3>

              <p className="text-[14.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {renderHighlightedText(item.summary)}
              </p>

              <div className="pt-1 space-y-1.5 text-[13.5px] leading-relaxed">
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Why it matters:{' '}
                  </span>
                  {renderHighlightedText(item.whyItMatters)}
                </p>
                {showRelevance && item.relevanceToMeeting && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {relevanceLabel}:{' '}
                    </span>
                    {renderHighlightedText(item.relevanceToMeeting)}
                  </p>
                )}
              </div>
            </div>

            {item.sourceUrl && (
              <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline min-w-0"
                >
                  <span className="truncate">{item.sourceTitle || getHostname(item.sourceUrl)}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 no-print" />
                </a>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                  {getHostname(item.sourceUrl)}
                </span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export const BriefingReport: React.FC<BriefingReportProps> = ({ briefing, onNewBriefing }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyBriefingToClipboard(briefing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy briefing:', err);
    }
  };

  const {
    request,
    dateWindow,
    executiveSummary,
    latestDevelopments = [],
    purposeBackground = [],
    companyNews = [],
    productTechUpdates = [],
    peopleLeadershipUpdates = [],
    keyInsights = [],
    risks = [],
    meetingDiscussionPoints = [],
    questionsToAsk = [],
    competitorAnalysis = [],
    sources = [],
    researchMetadata,
  } = briefing;

  const omittedSections = useMemo(() => {
    const missing: string[] = [];
    if (latestDevelopments.length === 0) missing.push('Latest Developments');
    if (companyNews.length === 0) missing.push('Company News');
    if (productTechUpdates.length === 0) missing.push('Product & Technology Updates');
    if (peopleLeadershipUpdates.length === 0) missing.push('Leadership Updates');
    if (keyInsights.length === 0) missing.push('Strategic Insights');
    if (risks.length === 0) missing.push('Risks & Watch Items');
    return missing;
  }, [
    latestDevelopments.length,
    companyNews.length,
    productTechUpdates.length,
    peopleLeadershipUpdates.length,
    keyInsights.length,
    risks.length,
  ]);

  let sectionCounter = 0;
  const nextSectionNum = () => {
    sectionCounter += 1;
    return String(sectionCounter).padStart(2, '0');
  };

  const totalFindingsCount =
    companyNews.length + productTechUpdates.length + peopleLeadershipUpdates.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 print-container space-y-5">
      {/* Top Action Toolbar (Screen only) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Briefing ready</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {researchMetadata.aiProvider || 'AI provider'} ({researchMetadata.aiModel || 'Model unavailable'})
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{sources.length} sources</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#11192d] border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
          </button>

          <button
            type="button"
            onClick={printBriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#11192d] border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => downloadBriefingAsFile(briefing)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#11192d] border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>

          <button
            type="button"
            onClick={onNewBriefing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Briefing</span>
          </button>
        </div>
      </div>

      {/* Main Executive Intelligence Dossier Document */}
      <article className="report-document bg-white dark:bg-[#11192d] border border-slate-200/95 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden divide-y divide-slate-200/85 dark:divide-slate-800/90">
        {/* 1. REPORT HEADER */}
        <header className="px-6 sm:px-10 py-7 sm:py-9 bg-slate-50/70 dark:bg-[#0d1527] space-y-6 report-item-avoid">
          {/* MeetBrief Institutional Masthead */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-bold text-sm tracking-tight text-slate-950 dark:text-white">
                  MeetBrief
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                  ·
                </span>
                <span className="font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Meeting Intelligence Report
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              <span>Generated: {formatDisplayDate(briefing.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">ID: {briefing.id}</span>
            </div>
          </div>

          {/* Primary Target Title */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight [text-wrap:balance]">
              {request.companyName}
            </h1>
            {request.personName && (
              <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300">
                Prepared for meeting with{' '}
                <span className="font-semibold text-slate-950 dark:text-white">
                  {request.personName}
                </span>
              </p>
            )}
          </div>

          {/* Structured Briefing Metadata Grid */}
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-sm">
            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Meeting Date</span>
              </dt>
              <dd className="font-semibold text-slate-950 dark:text-white tabular-nums">
                {formatDisplayDate(request.meetingDate)}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Meeting Time</span>
              </dt>
              <dd className="font-semibold text-slate-950 dark:text-white tabular-nums">
                {request.meetingTime}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Purpose</span>
              </dt>
              <dd className="font-semibold text-slate-950 dark:text-white">
                {request.meetingPurpose}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Research Period</span>
              </dt>
              <dd className="font-semibold text-slate-950 dark:text-white tabular-nums text-[13px]">
                {formatDisplayDate(dateWindow.startDate)} → {formatDisplayDate(dateWindow.endDate)}
              </dd>
            </div>
          </dl>

          {/* Optional User Focus & Status Note */}
          {(request.targetRole || request.additionalContext || researchMetadata.statusNote) && (
            <div className="space-y-2 pt-2">
              {request.targetRole && (
                <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Target Role / Domain:{' '}
                  </span>
                  <span>{request.targetRole}</span>
                </p>
              )}

              {request.additionalContext && (
                <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Meeting Focus:{' '}
                  </span>
                  <span>{request.additionalContext}</span>
                </p>
              )}

              {researchMetadata.statusNote && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-[13px] text-amber-900 dark:text-amber-200">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{researchMetadata.statusNote}</span>
                </div>
              )}
            </div>
          )}
        </header>

        {/* 2.1 EXECUTIVE SUMMARY */}
        <section className="px-6 sm:px-10 py-8 space-y-5 report-item-avoid">
          <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {nextSectionNum()}
              </span>
              <TrendingUp className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                Executive Summary
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {dateWindow.daysLookback}-day intelligence window
            </span>
          </div>

          <p className="text-[15.5px] sm:text-base text-slate-800 dark:text-slate-200 leading-[1.75]">
            {renderHighlightedText(executiveSummary)}
          </p>

          {/* Compact Verified Evidence Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#141e36] border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sources Verified
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-950 dark:text-white mt-0.5">
                {sources.length}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#141e36] border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Timeline Events
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-950 dark:text-white mt-0.5">
                {latestDevelopments.length}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#141e36] border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Key Developments
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-950 dark:text-white mt-0.5">
                {totalFindingsCount}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#141e36] border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Watch Items
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-950 dark:text-white mt-0.5">
                {risks.length}
              </div>
            </div>
          </div>

          {omittedSections.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Coverage note:
              </span>{' '}
              No source-backed updates were found in this {dateWindow.daysLookback}-day window for{' '}
              {omittedSections.join(', ')}; empty sections are omitted.
            </p>
          )}
        </section>

        {/* 2.2 LATEST DEVELOPMENTS */}
        {latestDevelopments.length > 0 && (
          <section className="px-6 sm:px-10 py-8 space-y-5">
            <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {nextSectionNum()}
                </span>
                <Calendar className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Latest Developments
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {latestDevelopments.length}{' '}
                {latestDevelopments.length === 1 ? 'milestone' : 'milestones'} · Chronological
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {latestDevelopments.map((event, idx) => (
                <article
                  key={`${event.sourceUrl}-${idx}`}
                  className="report-item-avoid py-4 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-[165px_1fr] gap-2 sm:gap-6 items-baseline"
                >
                  <div className="space-y-1">
                    <div className="text-[13px] font-semibold tracking-normal leading-snug tabular-nums text-blue-700 dark:text-blue-400">
                      {formatDisplayDate(event.date)}
                    </div>
                    <div className="text-xs font-medium leading-snug text-slate-500 dark:text-slate-400">
                      {event.category}
                    </div>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-[15.5px] font-bold text-slate-950 dark:text-white leading-snug">
                      {event.headline}
                    </h3>
                    <p className="text-[14.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {renderHighlightedText(event.summary)}
                    </p>
                    {event.sourceUrl && (
                      <div className="pt-0.5">
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                          <span>{getHostname(event.sourceUrl)}</span>
                          <ExternalLink className="w-3 h-3 no-print" />
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* PURPOSE-RELEVANT BACKGROUND (Evergreen career, role, programme, or technical prep context) */}
        {purposeBackground.length > 0 && (
          <section className="px-6 sm:px-10 py-8 space-y-5">
            <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {nextSectionNum()}
                </span>
                <Briefcase className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Purpose-Relevant Background
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {purposeBackground.length}{' '}
                {purposeBackground.length === 1 ? 'resource' : 'resources'} ·{' '}
                {request.meetingPurpose} reference
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {purposeBackground.map((item) => (
                <article
                  key={item.id}
                  className="report-item-avoid flex flex-col justify-between space-y-3 pb-5 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 md:last:border-b"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                        {formatDisplayDate(item.publishedDate) || 'Date unavailable'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                      {item.listingStatus && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {item.listingStatus}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-[16px] font-bold text-slate-950 dark:text-white leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-[14.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {renderHighlightedText(item.summary)}
                    </p>

                    {item.keyDetails.length > 0 && (
                      <ul className="space-y-1 text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4">
                        {item.keyDetails.map((detail, idx) => (
                          <li key={idx}>{renderHighlightedText(detail)}</li>
                        ))}
                      </ul>
                    )}

                    <div className="pt-1 text-[13.5px] leading-relaxed">
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          Prep relevance:{' '}
                        </span>
                        {renderHighlightedText(item.relevanceToMeeting)}
                      </p>
                    </div>
                  </div>

                  {item.sourceUrl && (
                    <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline min-w-0"
                      >
                        <span className="truncate">{item.sourceTitle || getHostname(item.sourceUrl)}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 no-print" />
                      </a>
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                        {getHostname(item.sourceUrl)}
                      </span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2.3 COMPANY NEWS */}
        <FindingListSection
          sectionNumber={companyNews.length > 0 ? nextSectionNum() : ''}
          title="Company News"
          subtitle="Announcements & strategy"
          icon={<Newspaper className="w-4.5 h-4.5" />}
          items={companyNews}
          relevanceLabel="Meeting relevance"
        />

        {/* 2.4 PRODUCT & TECHNOLOGY UPDATES */}
        <FindingListSection
          sectionNumber={productTechUpdates.length > 0 ? nextSectionNum() : ''}
          title="Product & Technology Updates"
          subtitle="Releases & engineering"
          icon={<Cpu className="w-4.5 h-4.5" />}
          items={productTechUpdates}
          relevanceLabel="Meeting relevance"
        />

        {/* 2.5 LEADERSHIP UPDATES */}
        <FindingListSection
          sectionNumber={peopleLeadershipUpdates.length > 0 ? nextSectionNum() : ''}
          title="Leadership Updates"
          subtitle="People & executive moves"
          icon={<Users className="w-4.5 h-4.5" />}
          items={peopleLeadershipUpdates}
          relevanceLabel="Conversational value"
        />

        {/* 2.6 STRATEGIC INSIGHTS */}
        {keyInsights.length > 0 && (
          <section className="px-6 sm:px-10 py-8 space-y-5">
            <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {nextSectionNum()}
                </span>
                <Lightbulb className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Strategic Insights
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {keyInsights.length} takeaways
              </span>
            </div>

            <ol className="space-y-3.5">
              {keyInsights.map((insight, idx) => (
                <li
                  key={idx}
                  className="report-item-avoid flex items-start gap-3.5 text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-800/70 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p>{renderHighlightedText(insight)}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 2.7 RISKS & WATCH ITEMS */}
        {risks.length > 0 && (
          <section className="px-6 sm:px-10 py-8 space-y-5 bg-amber-50/30 dark:bg-amber-950/10">
            <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-amber-200/80 dark:border-amber-900/50">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                  {nextSectionNum()}
                </span>
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Risks &amp; Watch Items
                </h2>
              </div>
              <span className="text-xs font-mono text-amber-800/80 dark:text-amber-300/80 tabular-nums">
                {risks.length} {risks.length === 1 ? 'item' : 'items'} requiring diligence
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {risks.map((risk, idx) => (
                <article
                  key={`${risk.sourceUrl}-${idx}`}
                  className="report-item-avoid p-4 sm:p-5 bg-white dark:bg-[#141e36] border border-amber-200/90 dark:border-amber-900/60 rounded-lg space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Watch Item {String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="text-[15.5px] font-bold text-slate-950 dark:text-white leading-snug">
                      {risk.risk}
                    </h3>
                    <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {renderHighlightedText(risk.rationale)}
                    </p>
                  </div>

                  {risk.sourceUrl && (
                    <div className="pt-1 border-t border-amber-100 dark:border-amber-900/40">
                      <a
                        href={risk.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline max-w-full"
                      >
                        <span className="truncate">{risk.sourceTitle || getHostname(risk.sourceUrl)}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 no-print" />
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2.8 MEETING DISCUSSION POINTS */}
        {meetingDiscussionPoints.length > 0 && (
          <section className="px-6 sm:px-10 py-8 space-y-5">
            <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {nextSectionNum()}
                </span>
                <MessageSquare className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Meeting Discussion Points
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tailored for {request.meetingPurpose}
              </span>
            </div>

            <div className="space-y-4">
              {meetingDiscussionPoints.map((dp, idx) => (
                <article
                  key={idx}
                  className="report-item-avoid p-5 bg-slate-50/75 dark:bg-[#141e36] border border-slate-200/90 dark:border-slate-800 rounded-lg space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums pt-0.5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-950 dark:text-white leading-snug">
                        {dp.point}
                      </h3>
                      <p className="text-[14.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        {renderHighlightedText(dp.context)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-[14px] text-slate-900 dark:text-slate-100 leading-relaxed">
                    <span className="font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider text-xs mr-2">
                      Suggested Opener
                    </span>
                    <span className="italic">&ldquo;{dp.suggestedOpener}&rdquo;</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2.9 QUESTIONS TO ASK */}
        {questionsToAsk.length > 0 && (
          <section className="px-6 sm:px-10 py-8 space-y-5">
            <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {nextSectionNum()}
                </span>
                <HelpCircle className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Questions to Ask
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {questionsToAsk.length} strategic questions
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {questionsToAsk.map((q) => (
                <article
                  key={q.number}
                  className="report-item-avoid py-4 first:pt-0 last:pb-0 flex items-start gap-3.5"
                >
                  <span className="print-badge w-7 h-7 rounded-md bg-blue-600 text-white font-mono text-xs font-bold tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                    {q.number}
                  </span>
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      {q.topic}
                    </div>
                    <p className="text-[15.5px] font-bold text-slate-950 dark:text-white leading-snug">
                      {q.question}
                    </p>
                    <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Rationale:{' '}
                      </span>
                      {renderHighlightedText(q.rationale)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* OPTIONAL COMPETITOR COMPARISON (Only if included & non-empty) */}
        {competitorAnalysis.length > 0 && (
          <section className="px-6 sm:px-10 py-8 space-y-5">
            <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {nextSectionNum()}
                </span>
                <TrendingUp className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Competitor Comparison
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Verified market context
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {competitorAnalysis.map((c, idx) => (
                <article
                  key={`${c.competitor}-${idx}`}
                  className="report-item-avoid p-4.5 bg-slate-50/80 dark:bg-[#141e36] border border-slate-200/90 dark:border-slate-800 rounded-lg space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-950 dark:text-white">
                      {c.competitor}
                    </h3>
                    <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Recent move:{' '}
                      </span>
                      {renderHighlightedText(c.recentMove)}
                    </p>
                    <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Differentiator:{' '}
                      </span>
                      {renderHighlightedText(c.differentiator)}
                    </p>
                    <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                        Talk track:{' '}
                      </span>
                      <span className="italic">&ldquo;{c.talkTrack}&rdquo;</span>
                    </p>
                  </div>

                  {c.sourceUrl && (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline max-w-full"
                      >
                        <span className="truncate">{c.sourceTitle || getHostname(c.sourceUrl)}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 no-print" />
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2.10 SOURCES & REFERENCES */}
        <section className="px-6 sm:px-10 py-8 space-y-5 bg-slate-50/40 dark:bg-[#0d1527]/70">
          <div className="report-section-heading flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {nextSectionNum()}
              </span>
              <BookOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                Sources &amp; References
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {sources.length} {sources.length === 1 ? 'verified citation' : 'verified citations'}
            </span>
          </div>

          {sources.length === 0 ? (
            <p className="text-[14px] text-slate-600 dark:text-slate-300">
              No external web sources were returned for this 30-day date window.
            </p>
          ) : (
            <ol className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
              {sources.map((s, idx) => (
                <li
                  key={`${s.url}-${idx}`}
                  className="report-item-avoid py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-6"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums pt-0.5 shrink-0">
                      [{idx + 1}]
                    </span>
                    <div className="space-y-1 min-w-0">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[14px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1.5 max-w-full"
                      >
                        <span className="break-words">{s.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 no-print" />
                      </a>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all">
                        {s.url}
                      </div>
                      {s.snippet && (
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 print:line-clamp-none">
                          {s.snippet}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums shrink-0 pl-7 sm:pl-0">
                    {formatDisplayDate(s.publishedDate)}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Report Footer Attribution */}
          <footer className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                MeetBrief Intelligence Dossier
              </span>
              <span aria-hidden="true" className="mx-1.5">
                ·
              </span>
              <span>
                Web research powered by Tavily Search API · Synthesized by{' '}
                {researchMetadata.aiProvider || 'AI provider'} (
                {researchMetadata.aiModel || 'model unavailable'})
              </span>
            </div>
            <div className="tabular-nums shrink-0">
              Completed {formatDisplayDate(researchMetadata.completedAt)}{' '}
              {formatGeneratedTime(researchMetadata.completedAt)}
            </div>
          </footer>
        </section>
      </article>
    </div>
  );
};
