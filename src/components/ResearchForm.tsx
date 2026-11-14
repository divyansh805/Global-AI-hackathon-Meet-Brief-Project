import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Info,
  Building,
  User,
  Briefcase,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { MeetingPurpose, ResearchRequest } from '../types/briefing.js';

interface ResearchFormProps {
  onSubmit: (request: ResearchRequest) => Promise<void>;
  isLoading: boolean;
  initialCompanyName?: string;
}

const PURPOSES: MeetingPurpose[] = [
  'Job Interview',
  'Internship Discussion',
  'Business Meeting',
  'Client Meeting',
  'Partnership Discussion',
  'Investor Meeting',
  'Networking',
  'Academic Meeting',
  'Other',
];

const SUGGESTED_CONTEXTS = [
  'Discuss internship opportunities and technical projects.',
  'Explore a strategic business and technology partnership.',
  'Understand the company’s latest product launches and roadmap.',
  'Prepare for a senior technical interview and team dynamics.',
  'Discuss enterprise evaluation and pilot deployment.',
];

export const ResearchForm: React.FC<ResearchFormProps> = ({
  onSubmit,
  isLoading,
  initialCompanyName,
}) => {
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [companyName, setCompanyName] = useState(initialCompanyName || '');
  const [personName, setPersonName] = useState('');
  const [meetingDate, setMeetingDate] = useState(defaultDate);
  const [meetingTime, setMeetingTime] = useState('10:00 AM');
  const [meetingPurpose, setMeetingPurpose] = useState<MeetingPurpose>('Business Meeting');
  const [targetRole, setTargetRole] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [includeCompetitors, setIncludeCompetitors] = useState(false);

  const showTargetRole =
    meetingPurpose === 'Job Interview' || meetingPurpose === 'Internship Discussion';

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialCompanyName) {
      setCompanyName(initialCompanyName);
    }
  }, [initialCompanyName]);

  const windowPreview = useMemo(() => {
    if (!meetingDate) return null;
    const mDate = new Date(meetingDate + 'T00:00:00Z');
    if (isNaN(mDate.getTime())) return null;

    const endDate = new Date(mDate.getTime() - 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000);
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, [meetingDate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!companyName.trim()) {
      errs.companyName = 'Company or Organisation name is required.';
    }
    if (!meetingDate) {
      errs.meetingDate = 'Meeting date is required.';
    }
    if (!meetingTime.trim()) {
      errs.meetingTime = 'Meeting time is required.';
    }
    if (!meetingPurpose) {
      errs.meetingPurpose = 'Please select a meeting purpose.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        companyName: companyName.trim(),
        personName: personName.trim() || undefined,
        meetingDate,
        meetingTime: meetingTime.trim(),
        meetingPurpose,
        targetRole: showTargetRole && targetRole.trim() ? targetRole.trim() : undefined,
        additionalContext: additionalContext.trim() || undefined,
        includeCompetitors,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (preset: {
    company: string;
    person?: string;
    purpose: MeetingPurpose;
    targetRole?: string;
    context: string;
  }) => {
    setCompanyName(preset.company);
    setPersonName(preset.person || '');
    setMeetingPurpose(preset.purpose);
    setTargetRole(preset.targetRole || '');
    setAdditionalContext(preset.context);
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white font-sans">
          Meeting Briefing
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Research a company or person and generate a concise, source-backed meeting briefing using recent developments.
        </p>
      </div>

      {/* Quick Test Presets */}
      <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-xl space-y-2.5">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-blue-900 dark:text-blue-300">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Quick Inspiration Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                company: 'Anthropic',
                person: 'Dario Amodei',
                purpose: 'Job Interview',
                targetRole: 'AI Safety Research Engineer',
                context: 'Discuss AI safety research engineering roles and recent Claude model developments.',
              })
            }
            className="px-3 py-1.5 text-[13px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            Anthropic · Job Interview
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                company: 'Stripe',
                person: 'Patrick Collison',
                purpose: 'Partnership Discussion',
                context: 'Explore payments orchestration and global enterprise settlement integration.',
              })
            }
            className="px-3 py-1.5 text-[13px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            Stripe · Partnership
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                company: 'Figma',
                person: 'Dylan Field',
                purpose: 'Client Meeting',
                context: 'Evaluate enterprise design systems and AI workflow integration for our engineering group.',
              })
            }
            className="px-3 py-1.5 text-[13px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            Figma · Client Meeting
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#11192d] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="companyName" className="block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            Company / Organisation Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Building className="w-4.5 h-4.5" />
            </div>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: '' }));
              }}
              placeholder="e.g. OpenAI, Snowflake, Datadog, Siemens"
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-slate-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                errors.companyName ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.companyName && (
            <p className="text-[13px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.companyName}</span>
            </p>
          )}
        </div>

        {/* Person Name (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="personName" className="block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              Person to Meet <span className="text-[13px] text-slate-500 dark:text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[13px] text-slate-500 dark:text-slate-400">Enables person-specific background research</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <User className="w-4.5 h-4.5" />
            </div>
            <input
              id="personName"
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Dario Amodei, Patrick Collison, Head of Partnerships"
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Meeting Date & Time (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="meetingDate" className="block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              Meeting Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <input
                id="meetingDate"
                type="date"
                value={meetingDate}
                onChange={(e) => {
                  setMeetingDate(e.target.value);
                  if (errors.meetingDate) setErrors((prev) => ({ ...prev, meetingDate: '' }));
                }}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-slate-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                  errors.meetingDate ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
            </div>
            {errors.meetingDate && (
              <p className="text-[13px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.meetingDate}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="meetingTime" className="block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              Meeting Time <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <input
                id="meetingTime"
                type="text"
                value={meetingTime}
                onChange={(e) => {
                  setMeetingTime(e.target.value);
                  if (errors.meetingTime) setErrors((prev) => ({ ...prev, meetingTime: '' }));
                }}
                placeholder="e.g. 10:00 AM or 14:30"
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-slate-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                  errors.meetingTime ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
            </div>
            {errors.meetingTime && (
              <p className="text-[13px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.meetingTime}</span>
              </p>
            )}
          </div>
        </div>

        {/* Meeting Purpose */}
        <div className="space-y-2">
          <label htmlFor="meetingPurpose" className="block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            Meeting Purpose <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
            <select
              id="meetingPurpose"
              value={meetingPurpose}
              onChange={(e) => setMeetingPurpose(e.target.value as MeetingPurpose)}
              disabled={isLoading}
              className="w-full pl-10 pr-9 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {p}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Conditional Target Role / Domain (Job Interview & Internship Discussion only) */}
        {showTargetRole && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="targetRole" className="block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                Target Role / Domain <span className="text-[13px] text-slate-500 dark:text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[13px] text-slate-500 dark:text-slate-400">Personalizes role &amp; skills research</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
              <input
                id="targetRole"
                type="text"
                maxLength={120}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineering Intern, Java Developer, Backend Engineering, Data Science Intern"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

        {/* Additional Context */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="additionalContext" className="block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              Additional Context <span className="text-[13px] text-slate-500 dark:text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[13px] text-slate-500 dark:text-slate-400">Special goals or background</span>
          </div>
          <textarea
            id="additionalContext"
            rows={3}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="e.g. Discuss internship opportunities, explore enterprise pricing, or prepare for specific technical questions..."
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 text-[15px] bg-white dark:bg-[#0c1324] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED_CONTEXTS.map((ctx) => (
              <button
                key={ctx}
                type="button"
                onClick={() => setAdditionalContext(ctx)}
                className="text-[13px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer text-left"
              >
                + {ctx}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Competitor Comparison */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-lg flex items-start gap-3.5 cursor-pointer select-none">
          <input
            id="includeCompetitors"
            type="checkbox"
            checked={includeCompetitors}
            onChange={(e) => setIncludeCompetitors(e.target.checked)}
            className="w-4.5 h-4.5 mt-0.5 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="includeCompetitors" className="cursor-pointer space-y-1">
            <div className="flex items-center gap-1.5 text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Include Competitor Comparison (Optional)</span>
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Synthesize top market competitors, their recent moves in the 30-day window, and comparative talk tracks directly into this briefing.
            </p>
          </label>
        </div>

        {/* Research Scope Explanation */}
        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-lg space-y-1.5">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-900 dark:text-slate-100">
            <Info className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>30-Day Intelligence Scope Guarantee</span>
          </div>
          <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
            MeetBrief focuses on developments published during the 30 calendar days preceding your meeting date.
          </p>
          {windowPreview && (
            <p className="text-[14px] font-mono text-blue-900 dark:text-blue-300 font-semibold pt-0.5">
              Intelligence Window: {windowPreview.start} → {windowPreview.end}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full py-3.5 px-4 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
          >
            <span>{isLoading || isSubmitting ? 'Starting Research...' : 'Generate My Meeting Briefing'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
