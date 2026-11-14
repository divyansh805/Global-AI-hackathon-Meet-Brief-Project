import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ResearchRequest } from '../types/briefing.js';

interface ResearchLoadingProps {
  request: ResearchRequest;
}

const STAGES = [
  {
    title: 'Anchoring 30-Day Research Window',
    description: 'Calculating calendar window from meeting date and sanitizing parameters.',
  },
  {
    title: 'Executing Targeted Tavily Searches',
    description: 'Querying official Tavily Search API for news, product updates, and executive developments.',
  },
  {
    title: 'Validating Publication Dates & Sources',
    description: 'Eliminating out-of-range articles, isolating untrusted web content, and preserving URLs.',
  },
  {
    title: 'AI Provider Strategic Synthesis',
    description: 'Grounding the briefing in preserved evidence with automatic provider fallback if needed.',
  },
  {
    title: 'Assembling One-Page Meeting Briefing',
    description: 'Formatting timeline developments, discussion openers, and clickable citations.',
  },
];

export const ResearchLoading: React.FC<ResearchLoadingProps> = ({ request }) => {
  const isPreservedRetry = Boolean(
    request.cachedEvidence && Array.isArray(request.cachedEvidence) && request.cachedEvidence.length > 0
  );
  const [currentStage, setCurrentStage] = useState(isPreservedRetry ? 3 : 0);

  useEffect(() => {
    if (isPreservedRetry) {
      const timer = setTimeout(() => setCurrentStage(4), 3000);
      return () => clearTimeout(timer);
    }

    const timer1 = setTimeout(() => setCurrentStage(1), 1800);
    const timer2 = setTimeout(() => setCurrentStage(2), 4800);
    const timer3 = setTimeout(() => setCurrentStage(3), 8500);
    const timer4 = setTimeout(() => setCurrentStage(4), 12500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isPreservedRetry]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
      {/* Central Spinner & Icon */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-950 border-t-blue-600 animate-spin" />
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
          <Search className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Target Details */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isPreservedRetry ? `Re-analyzing ${request.companyName}` : `Researching ${request.companyName}`}
        </h2>
        {isPreservedRetry && (
          <p className="text-[14px] text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ Tavily web research preserved ({request.cachedEvidence?.length} sources) · Synthesizing briefing
          </p>
        )}
        {request.personName && (
          <p className="text-[15px] text-slate-700 dark:text-slate-300 font-medium">
            Including executive background for: {request.personName}
          </p>
        )}
        <div className="text-[14px] text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 pt-1">
          <span>Scheduled: {request.meetingDate} at {request.meetingTime}</span>
          <span aria-hidden="true">·</span>
          <span>Purpose: {request.meetingPurpose}</span>
        </div>
      </div>

      {/* Stage Progression Card */}
      <div className="bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-left space-y-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Intelligence Pipeline</span>
          <span className="font-mono text-blue-600 dark:text-blue-400">
            Step {Math.min(currentStage + 1, STAGES.length)} of {STAGES.length}
          </span>
        </div>

        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={stage.title}
                className={`p-3.5 rounded-lg border transition-all flex items-start gap-3.5 ${
                  isCurrent
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 text-slate-900 dark:text-slate-100'
                    : isCompleted
                    ? 'bg-slate-50/80 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    : 'opacity-40 border-transparent text-slate-400 dark:text-slate-500'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  ) : isCurrent ? (
                    <Loader2 className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-600" />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[14px] font-semibold">{stage.title}</p>
                  <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[13px] text-slate-500 dark:text-slate-400">
        Live search powered by Tavily Search API · AI synthesis by Gemini, Groq, or free OpenRouter models
      </p>
    </div>
  );
};
