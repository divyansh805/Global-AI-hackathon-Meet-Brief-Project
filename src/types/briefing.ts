export type MeetingPurpose =
  | 'Job Interview'
  | 'Internship Discussion'
  | 'Business Meeting'
  | 'Client Meeting'
  | 'Partnership Discussion'
  | 'Investor Meeting'
  | 'Networking'
  | 'Academic Meeting'
  | 'Other';

export interface ResearchRequest {
  companyName: string;
  personName?: string;
  meetingDate: string; // YYYY-MM-DD
  meetingTime: string; // e.g. "14:30" or "2:30 PM"
  meetingPurpose: MeetingPurpose;
  targetRole?: string;
  additionalContext?: string;
  includeCompetitors?: boolean;
  // Preserved research evidence to avoid repeating Tavily searches on Gemini analysis retry
  cachedEvidence?: unknown[];
  cachedDateWindow?: {
    startDate: string;
    endDate: string;
    daysLookback: number;
  };
  cachedQueriesRun?: string[];
}

export type FindingCategory =
  | 'Company News'
  | 'Product & Tech'
  | 'Leadership & People'
  | 'Business & Partnerships'
  | 'Personal & Career';

export interface ResearchFinding {
  id: string;
  headline: string;
  category: FindingCategory;
  summary: string;
  publishedDate: string; // YYYY-MM-DD or "Date unavailable"
  whyItMatters: string;
  relevanceToMeeting: string;
  sourceUrl: string;
  sourceTitle: string;
  evidenceQuality: 'High' | 'Medium' | 'Unverified/Inferred';
}

export interface TimelineEvent {
  date: string; // YYYY-MM-DD or "Recent (Date unavailable)"
  headline: string;
  summary: string;
  category: FindingCategory;
  sourceUrl: string;
}

export interface PurposeBackgroundItem {
  id: string;
  title: string;
  category:
    | 'Career & Programme'
    | 'Role Requirements'
    | 'Technical Documentation'
    | 'Interview Preparation'
    | 'Role & Ecosystem Context';
  summary: string;
  keyDetails: string[];
  relevanceToMeeting: string;
  publishedDate: string; // YYYY-MM-DD or "Date unavailable"
  sourceUrl: string;
  sourceTitle: string;
  listingStatus?: 'Active / Open' | 'Status unverified' | 'General programme / resource';
}

export interface DiscussionPoint {
  point: string;
  context: string;
  suggestedOpener: string;
}

export interface MeetingQuestion {
  number: number;
  question: string;
  rationale: string;
  topic: string;
}

export interface ResearchRisk {
  risk: string;
  rationale: string;
  sourceUrl: string;
  sourceTitle: string;
}

export interface CompetitorItem {
  competitor: string;
  recentMove: string;
  differentiator: string;
  talkTrack: string;
  sourceUrl: string;
  sourceTitle: string;
}

export interface SourceReference {
  title: string;
  url: string;
  publishedDate: string;
  snippet: string;
}

export interface MeetingBriefing {
  id: string;
  createdAt: string;
  request: ResearchRequest;
  dateWindow: {
    startDate: string;
    endDate: string;
    daysLookback: number;
  };
  executiveSummary: string;
  latestDevelopments: TimelineEvent[];
  purposeBackground?: PurposeBackgroundItem[];
  companyNews: ResearchFinding[];
  productTechUpdates: ResearchFinding[];
  peopleLeadershipUpdates: ResearchFinding[];
  keyInsights: string[];
  risks: ResearchRisk[];
  meetingDiscussionPoints: DiscussionPoint[];
  questionsToAsk: MeetingQuestion[];
  competitorAnalysis?: CompetitorItem[];
  sources: SourceReference[];
  researchMetadata: {
    tavilyQueriesRun: string[];
    totalSourcesAnalyzed: number;
    dateRangeUsed: string;
    completedAt: string;
    aiProvider: string;
    aiModel: string;
    attribution: string;
    status: 'completed' | 'partial' | 'fallback';
    statusNote?: string;
  };
}

export interface NewsArticleItem {
  id: string;
  headline: string;
  category: 'Launch' | 'Leadership' | 'Partnership' | 'Hiring' | 'Corporate';
  summary: string;
  whyItMatters: string;
  publishedDate: string;
  sourceUrl: string;
  sourceTitle: string;
}

export interface NewsIntelligenceReport {
  id: string;
  query: string;
  createdAt: string;
  dateRange: string;
  executiveBrief: string;
  articles: NewsArticleItem[];
  sources: SourceReference[];
  metadata: {
    queriesRun: string[];
    totalSources: number;
    attribution: string;
    aiProvider: string;
    aiModel: string;
  };
}

export type VaultItem =
  | { type: 'briefing'; data: MeetingBriefing }
  | { type: 'news'; data: NewsIntelligenceReport };

export type ApiErrorType =
  | 'GEMINI_UNAVAILABLE'
  | 'GEMINI_ERROR'
  | 'AI_PROVIDER_ERROR'
  | 'TAVILY_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN';

export interface BriefingApiErrorResponse {
  error: string;
  errorType: ApiErrorType;
  canRetryAnalysis?: boolean;
  cachedEvidence?: unknown[];
  dateWindow?: {
    startDate: string;
    endDate: string;
    daysLookback: number;
  };
  queriesRun?: string[];
  sources?: SourceReference[];
}
