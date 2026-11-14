import React from 'react';
import {
  Search,
  Brain,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ActiveTab } from './Header.js';

interface HowItWorksProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
          Architecture & Methodology
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 font-sans">
          How MeetBrief Works
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          MeetBrief addresses the Tavily hackathon challenge: building an autonomous research agent that prepares a concise, source-grounded meeting briefing based strictly on developments from the 30 days preceding the meeting.
        </p>
      </div>

      {/* Visual System Architecture Flow */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2>End-to-End System Architecture</h2>
        </div>

        {/* Diagram Flow */}
        <div className="p-6 bg-slate-50 border border-slate-200/90 rounded-xl overflow-x-auto">
          <div className="min-w-[700px] flex items-center justify-between gap-3 text-center text-xs">
            {/* Step A */}
            <div className="flex-1 p-3.5 bg-white border border-slate-300 rounded-lg shadow-2xs space-y-1">
              <div className="w-7 h-7 mx-auto rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                1
              </div>
              <p className="font-semibold text-slate-900">User Details</p>
              <p className="text-[11px] text-slate-500">Target, Person, Time, Purpose</p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step B */}
            <div className="flex-1 p-3.5 bg-white border border-slate-300 rounded-lg shadow-2xs space-y-1">
              <div className="w-7 h-7 mx-auto rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <p className="font-semibold text-slate-900">React Client</p>
              <p className="text-[11px] text-slate-500">Validation & Scope Preview</p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step C */}
            <div className="flex-1 p-3.5 bg-white border border-slate-300 rounded-lg shadow-2xs space-y-1">
              <div className="w-7 h-7 mx-auto rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <p className="font-semibold text-slate-900">Express Backend</p>
              <p className="text-[11px] text-slate-500">Window Math & Query Engine</p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step D */}
            <div className="flex-1 p-3.5 bg-blue-600 text-white rounded-lg shadow-sm space-y-1">
              <div className="w-7 h-7 mx-auto rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs">
                4
              </div>
              <p className="font-semibold">Tavily Search API</p>
              <p className="text-[11px] text-blue-100">Targeted Multi-query Web Sweep</p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step E */}
            <div className="flex-1 p-3.5 bg-white border border-slate-300 rounded-lg shadow-2xs space-y-1">
              <div className="w-7 h-7 mx-auto rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                5
              </div>
              <p className="font-semibold text-slate-900">Evidence Isolator</p>
              <p className="text-[11px] text-slate-500">Date Check & Deduplication</p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step F */}
            <div className="flex-1 p-3.5 bg-white border border-slate-300 rounded-lg shadow-2xs space-y-1">
              <div className="w-7 h-7 mx-auto rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                6
              </div>
              <p className="font-semibold text-slate-900">AI Provider Chain</p>
              <p className="text-[11px] text-slate-500">Gemini → Groq → OpenRouter</p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step G */}
            <div className="flex-1 p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg shadow-2xs space-y-1">
              <div className="w-7 h-7 mx-auto rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                7
              </div>
              <p className="font-semibold text-emerald-950">Meeting Briefing</p>
              <p className="text-[11px] text-emerald-700">1-Page Source-Backed Report</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center font-mono">
          User → React Frontend → Express Backend → Tavily Search API → Research Evidence → Gemini Analysis → Meeting Briefing
        </p>
      </section>

      {/* 5 Core Workflow Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Step-by-Step Research Methodology
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                User Enters Meeting Details
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The user inputs the target organization, optional counterparty name, scheduled date & time, and meeting objective (e.g. Job Interview, Client Meeting, Partnership Discussion).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                Tavily Searches Relevant Web Information
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The backend calculates the exact 30-day window anchored to the meeting date and executes targeted queries for company news, product launches, executive moves, and interview quotes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                Research Results are Collected & Organised
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Retrieved web documents are deduplicated and filtered by confirmed publication dates. Third-party content is safely isolated as untrusted evidence to prevent prompt tampering.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                AI Providers Analyze Retrieved Evidence
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini is the primary synthesis provider, followed by Groq and then eligible free OpenRouter models. Each provider receives the same Tavily evidence; unsupported claims and fabricated citations are excluded.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                MeetBrief Generates an Actionable Meeting Briefing
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The user receives a clean, print-friendly one-page intelligence report complete with an executive summary, chronological timeline, talking points, questions to ask, and clickable primary source links.
            </p>
          </div>
        </div>
      </section>

      {/* Key Architectural Highlights */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Core Principles & Accuracy Standards
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>30-Day Calendar Lookback</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We do not assume today is the meeting date. If your meeting is on Nov 25, MeetBrief searches the 30 calendar days preceding Nov 25 to capture true pre-meeting momentum.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-sm">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Targeted Tavily Decompositions</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rather than a naive single search, we run targeted searches covering announcements, technology, leadership, and personal quotes to build a complete intelligence profile.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Strict Anti-Hallucination</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every single factual claim must map to a retrieved Tavily source URL. When evidence is scarce, MeetBrief honestly reports the limitation rather than fabricating filler stories.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('new-briefing')}
          className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          Create Your Meeting Briefing Now
        </button>
      </div>
    </div>
  );
};
