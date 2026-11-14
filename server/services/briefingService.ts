import {
  MeetingBriefing,
  NewsIntelligenceReport,
  ResearchRequest,
  SourceReference,
} from '../../src/types/briefing.js';
import { TavilyService, TavilyCleanedItem } from './tavilyService.js';
import {
  GeminiService,
  StructuredNewsPayload,
} from './geminiService.js';
import { ValidationService } from './validationService.js';

export interface ResearchServiceError extends Error {
  errorType?: string;
  canRetryAnalysis?: boolean;
  cachedEvidence?: TavilyCleanedItem[];
  dateWindow?: {
    startDate: string;
    endDate: string;
    daysLookback: number;
  };
  queriesRun?: string[];
  sources?: SourceReference[];
}

export class BriefingService {
  /**
   * Orchestrates the complete research workflow:
   * Validation -> Date Calculation -> Tavily Targeted Searches -> Evidence Filtering -> Gemini Analysis -> Structured Briefing.
   */
  static async generateMeetingBriefing(rawRequest: unknown): Promise<MeetingBriefing> {
    // 1. Validation
    const validation = ValidationService.validateRequest(rawRequest);
    if (!validation.isValid || !validation.sanitized) {
      const errorMsgs = Object.values(validation.errors).join(' ');
      throw new Error(`Validation failed: ${errorMsgs}`);
    }

    const request: ResearchRequest = {
      ...validation.sanitized,
      includeCompetitors: Boolean((rawRequest as Record<string, unknown>)?.includeCompetitors),
    };

    // 2. Tavily Targeted Research (or reuse preserved evidence on analysis retry)
    let evidence: TavilyCleanedItem[] = (request.cachedEvidence as TavilyCleanedItem[]) || [];
    let queriesRun: string[] = request.cachedQueriesRun || [];
    let dateWindow = request.cachedDateWindow || TavilyService.calculateDateWindow(request.meetingDate);

    const hasCachedEvidence = Array.isArray(request.cachedEvidence);

    if (hasCachedEvidence) {
      console.log(
        `[BriefingService] Reusing ${request.cachedEvidence!.length} preserved Tavily research items. Skipping Tavily network search.`
      );
      evidence = request.cachedEvidence as TavilyCleanedItem[];
    } else {
      try {
        const research = await TavilyService.runComprehensiveResearch({
          companyName: request.companyName,
          personName: request.personName,
          meetingDate: request.meetingDate,
          meetingPurpose: request.meetingPurpose,
          targetRole: request.targetRole,
          additionalContext: request.additionalContext,
        });
        evidence = research.items;
        queriesRun = research.queriesRun;
        dateWindow = research.dateWindow;
      } catch (tavilyErr: unknown) {
        const errObj: ResearchServiceError =
          tavilyErr instanceof Error ? tavilyErr : new Error(String(tavilyErr));
        errObj.errorType = 'TAVILY_ERROR';
        throw errObj;
      }
    }

    // 3. Compile Unique Sources
    const sourcesMap = new Map<string, SourceReference>();
    for (const item of evidence) {
      const canonicalUrl = TavilyService.canonicalizeUrl(item.url);
      if (canonicalUrl && !sourcesMap.has(canonicalUrl)) {
        sourcesMap.set(canonicalUrl, {
          title: item.title,
          url: item.url,
          publishedDate: item.publishedDate,
          snippet: item.content.slice(0, 300) + (item.content.length > 300 ? '...' : ''),
        });
      }
    }
    const sources = Array.from(sourcesMap.values());

    // 4. AI synthesis (all providers receive the same preserved Tavily evidence)
    let synthesized;
    try {
      synthesized = await GeminiService.synthesizeBriefing(request, dateWindow, evidence);
    } catch (geminiErr: unknown) {
      // Attach preserved evidence so caller can retry synthesis without re-running Tavily
      const errObj: ResearchServiceError =
        geminiErr instanceof Error ? geminiErr : new Error(String(geminiErr));
      errObj.errorType = 'AI_PROVIDER_ERROR';
      errObj.canRetryAnalysis = true;
      errObj.cachedEvidence = evidence;
      errObj.dateWindow = dateWindow;
      errObj.queriesRun = queriesRun;
      errObj.sources = sources;
      throw errObj;
    }

    // 5. Construct Complete Briefing
    const briefingId = `mb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const briefing: MeetingBriefing = {
      id: briefingId,
      createdAt: new Date().toISOString(),
      request,
      dateWindow: {
        startDate: dateWindow.startDate,
        endDate: dateWindow.endDate,
        daysLookback: dateWindow.daysLookback,
      },
      executiveSummary: synthesized.executiveSummary,
      latestDevelopments: synthesized.latestDevelopments,
      ...(synthesized.purposeBackground && synthesized.purposeBackground.length > 0
        ? { purposeBackground: synthesized.purposeBackground }
        : {}),
      companyNews: synthesized.companyNews,
      productTechUpdates: synthesized.productTechUpdates,
      peopleLeadershipUpdates: synthesized.peopleLeadershipUpdates,
      keyInsights: synthesized.keyInsights,
      risks: synthesized.risks,
      meetingDiscussionPoints: synthesized.meetingDiscussionPoints,
      questionsToAsk: synthesized.questionsToAsk,
      competitorAnalysis: synthesized.competitorAnalysis,
      sources,
      researchMetadata: {
        tavilyQueriesRun: queriesRun,
        totalSourcesAnalyzed: sources.length,
        dateRangeUsed: `${dateWindow.startDate} to ${dateWindow.endDate} (30-day lookback)`,
        completedAt: new Date().toISOString(),
        aiProvider: synthesized.aiProvider,
        aiModel: synthesized.aiModel,
        attribution: `Web research powered by Tavily Search API · Synthesized by ${synthesized.aiProvider} (${synthesized.aiModel})`,
        status: sources.length > 0 ? 'completed' : 'partial',
        statusNote:
          sources.length > 0
            ? undefined
            : 'Tavily returned no sources in the requested date window; source-backed findings are omitted.',
      },
    };

    return briefing;
  }

  /**
   * Generates News Intelligence on a company or topic.
   */
  static async generateNewsIntelligence(rawQuery: unknown): Promise<NewsIntelligenceReport> {
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
    if (!query) {
      throw new Error('Company or topic query is required for News Intelligence.');
    }

    const today = TavilyService.getTodayDateString();
    const dateWindow = TavilyService.calculateDateWindow(today, today);

    // Multi-faceted search for news, launches, hiring, leadership
    const targetedQueries = [
      `"${query}" product launch announcement updates`,
      `"${query}" executive hiring leadership partnerships`,
    ];

    const searchResults = await Promise.allSettled(
      targetedQueries.map((q) =>
        TavilyService.search(q, {
          topic: 'news',
          maxResults: 5,
          startDate: dateWindow.startDate,
          endDate: dateWindow.endDate,
        })
      )
    );

    const evidenceItems: TavilyCleanedItem[] = [];
    const seenUrls = new Set<string>();
    const failedSearches = searchResults.filter((result) => result.status === 'rejected');

    for (const result of searchResults) {
      if (result.status !== 'fulfilled') continue;
      for (const item of result.value) {
        if (!item.url || !item.title.trim() || !item.content.trim()) continue;
        const canonicalUrl = TavilyService.canonicalizeUrl(item.url);
        if (!canonicalUrl || seenUrls.has(canonicalUrl)) continue;

        const { publishedDate, inDateRange } = TavilyService.resolvePublishedDate(
          item.published_date,
          item.content,
          dateWindow,
          today
        );
        if (!inDateRange) continue;

        seenUrls.add(canonicalUrl);

        evidenceItems.push({
          title: item.title,
          url: item.url,
          content: item.content.slice(0, 1000),
          publishedDate,
          inDateRange: true,
          searchTopic: 'News Intelligence',
          ...(item.score !== undefined ? { score: item.score } : {}),
        });
      }
    }

    evidenceItems.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    if (evidenceItems.length === 0 && failedSearches.length > 0) {
      const error = failedSearches[0].status === 'rejected' ? failedSearches[0].reason : null;
      const tavilyError: ResearchServiceError =
        error instanceof Error ? error : new Error('Tavily News Intelligence searches failed.');
      tavilyError.errorType = 'TAVILY_ERROR';
      throw tavilyError;
    }

    let synthesized: StructuredNewsPayload;
    if (evidenceItems.length === 0) {
      synthesized = {
        aiProvider: 'Not used',
        aiModel: 'No sources to synthesize',
        executiveBrief: `Tavily returned no sources for "${query}" in the ${dateWindow.startDate} to ${dateWindow.endDate} date window.`,
        articles: [],
      };
    } else {
      try {
        synthesized = await GeminiService.synthesizeNewsIntelligence(query, evidenceItems);
      } catch (geminiErr: unknown) {
        const errObj: ResearchServiceError =
          geminiErr instanceof Error ? geminiErr : new Error(String(geminiErr));
        errObj.errorType = 'AI_PROVIDER_ERROR';
        throw errObj;
      }
    }

    const sources: SourceReference[] = evidenceItems.map((item) => ({
      title: item.title,
      url: item.url,
      publishedDate: item.publishedDate,
      snippet: item.content.slice(0, 250),
    }));

    return {
      id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      query,
      createdAt: new Date().toISOString(),
      dateRange: `${dateWindow.startDate} to ${dateWindow.endDate}`,
      executiveBrief: synthesized.executiveBrief,
      articles: synthesized.articles,
      sources,
      metadata: {
        queriesRun: targetedQueries,
        totalSources: sources.length,
        attribution: `Web research powered by Tavily Search API · Synthesized by ${synthesized.aiProvider} (${synthesized.aiModel})`,
        aiProvider: synthesized.aiProvider,
        aiModel: synthesized.aiModel,
      },
    };
  }
}
