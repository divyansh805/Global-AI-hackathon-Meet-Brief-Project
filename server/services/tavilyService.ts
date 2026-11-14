import type { MeetingPurpose } from '../../src/types/briefing.js';

export interface TavilyRawResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  published_date?: string | null;
  raw_content?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilyRawResult[];
  response_time?: number;
}

export interface TavilyCleanedItem {
  title: string;
  url: string;
  content: string;
  publishedDate: string; // YYYY-MM-DD or "Date unavailable"
  inDateRange: boolean;
  searchTopic: string;
  sourceScope?: 'recent_30d' | 'purpose_background';
  score?: number;
}

export interface ResearchQuerySpec {
  query: string;
  topic: 'news' | 'general';
  label: string;
  sourceScope: 'recent_30d' | 'purpose_background';
}

const TRACKING_QUERY_PARAMS = new Set([
  'fbclid',
  'gclid',
  'gbraid',
  'wbraid',
  'dclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'igsh',
  '_hsenc',
  '_hsmi',
  'hsctatracking',
  'mkt_tok',
  'vero_id',
  'yclid',
  'oly_anon_id',
  'oly_enc_id',
  'ncid',
  'sr_share',
  's_kwcid',
  'guccounter',
  'guce_referrer',
  'guce_referrer_sig',
  'ref_src',
  'ref_url',
  'cmpid',
  'ocid',
  'icid',
  'taid',
  'trk',
  'trkinfo',
]);

const CREDIBLE_PUBLICATION_DOMAINS = new Set([
  'reuters.com',
  'bloomberg.com',
  'ft.com',
  'wsj.com',
  'apnews.com',
  'bbc.com',
  'bbc.co.uk',
  'cnbc.com',
  'nytimes.com',
  'washingtonpost.com',
  'economist.com',
  'forbes.com',
  'fortune.com',
  'techcrunch.com',
  'theverge.com',
  'wired.com',
  'arstechnica.com',
  'venturebeat.com',
  'theinformation.com',
  'semafor.com',
  'axios.com',
  'businessinsider.com',
  'zdnet.com',
  'theregister.com',
  'engadget.com',
  'fastcompany.com',
  'inc.com',
  'hbr.org',
  'technologyreview.com',
  'nature.com',
  'science.org',
  'prnewswire.com',
  'businesswire.com',
  'globenewswire.com',
  'sec.gov',
  'github.com',
  'arxiv.org',
  'crunchbase.com',
]);

const LOW_PRIORITY_UGC_DOMAINS = new Set([
  'reddit.com',
  'quora.com',
  'pinterest.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
]);

const CORPORATE_SUFFIX_REGEX =
  /\b(?:inc(?:orporated)?|llc|ltd|limited|corp(?:oration)?|co(?:mpany)?|plc|lp|llp|gmbh|ag|sa|nv|bv|pty|pte)\b\.?/gi;

const COMPANY_STOP_WORDS = new Set([
  'the',
  'and',
  'of',
  'for',
  'group',
  'holdings',
  'technologies',
  'technology',
  'solutions',
  'systems',
  'services',
  'labs',
  'ai',
]);

const UTC_MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function isValidUtcCalendarDate(year: number, monthIndex: number, day: number): boolean {
  const dt = new Date(Date.UTC(year, monthIndex, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === monthIndex &&
    dt.getUTCDate() === day
  );
}

function formatUtcDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsTerm(haystack: string, term: string): boolean {
  if (!term) return false;
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.length <= 2) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegex(trimmed)}([^a-z0-9]|$)`, 'i').test(haystack);
  }
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(trimmed)}([^a-z0-9]|$)`, 'i').test(haystack);
}

function matchesHostnameDomain(hostname: string, domainSet: Set<string>): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  for (const domain of domainSet) {
    if (host === domain || host.endsWith(`.${domain}`)) return true;
  }
  return false;
}

const CONTEXT_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'about', 'their',
  'they', 'have', 'will', 'would', 'could', 'should', 'can', 'may', 'more',
  'discuss', 'explore', 'understand', 'prepare', 'preparing', 'meeting', 'discussion',
  'interview', 'company', 'latest', 'recent', 'questions', 'specific', 'opportunities',
  'opportunity', 'background', 'goals', 'interests', 'focus', 'using', 'based', 'role',
  'roles', 'position', 'positions', 'team', 'teams', 'work', 'looking', 'want', 'need',
]);

const ROLE_EXTRACTION_REGEX =
  /\b((?:senior|staff|principal|junior|associate|lead)?\s*(?:software|backend|back-end|frontend|front-end|full[- ]?stack|data\s+science|machine\s+learning|ml|ai|cloud|devops|sre|security|mobile|android|ios|systems|embedded|platform|product|research|qa|test)\s+(?:engineering|engineer|developer|intern|internship|scientist|analyst|architect|manager|designer)(?:\s+intern(?:ship)?)?)\b/i;

const KNOWN_CAREER_DOMAINS = new Set([
  'greenhouse.io',
  'lever.co',
  'myworkdayjobs.com',
  'ashbyhq.com',
  'smartrecruiters.com',
  'icims.com',
  'linkedin.com',
  'levels.fyi',
]);

const PURPOSE_KEYWORDS: Record<MeetingPurpose, string[]> = {
  'Job Interview': [
    'careers', 'career', 'jobs', 'job', 'hiring', 'opening', 'openings', 'engineer',
    'engineering', 'interview', 'preparation', 'qualifications', 'skills',
    'responsibilities', 'requirements', 'team', 'architecture', 'developer',
  ],
  'Internship Discussion': [
    'intern', 'internship', 'internships', 'student', 'students', 'university',
    'early career', 'campus', 'mentorship', 'fellowship', 'apprenticeship',
    'eligibility', 'apply', 'application', 'qualifications', 'projects', 'dsa',
    'algorithms', 'data structures',
  ],
  'Business Meeting': [
    'strategy', 'enterprise', 'partnership', 'partnerships', 'revenue', 'pricing',
    'growth', 'expansion', 'market', 'commercial', 'acquisition', 'customers', 'b2b',
  ],
  'Client Meeting': [
    'solution', 'solutions', 'customer', 'customers', 'client', 'case study',
    'integration', 'integrations', 'deployment', 'enterprise', 'pricing', 'platform',
    'support', 'roi',
  ],
  'Partnership Discussion': [
    'partner', 'partnership', 'partnerships', 'ecosystem', 'alliance', 'integration',
    'integrations', 'api', 'sdk', 'channel', 'reseller', 'co-sell', 'collaboration',
  ],
  'Investor Meeting': [
    'earnings', 'revenue', 'quarter', 'q1', 'q2', 'q3', 'q4', 'sec', '10-k', '10-q',
    'guidance', 'margin', 'funding', 'valuation', 'investor', 'investors', 'shareholder',
    'growth', 'capital',
  ],
  'Networking': [
    'interview', 'podcast', 'keynote', 'talk', 'speaker', 'background', 'career',
    'bio', 'profile', 'statement', 'insights', 'author',
  ],
  'Academic Meeting': [
    'research', 'paper', 'papers', 'arxiv', 'journal', 'lab', 'academic',
    'university', 'fellowship', 'grant', 'benchmark', 'publication', 'conference',
  ],
  'Other': [],
};

export class TavilyService {
  private static readonly ENDPOINT = 'https://api.tavily.com/search';

  static getTodayDateString(): string {
    return formatUtcDate(new Date());
  }

  /**
   * Produces a canonical URL for deduplication only (ignoring www, http/https,
   * trailing slashes, regular hash fragments, and known tracking parameters).
   * Original URLs are preserved separately for citations and display.
   */
  static canonicalizeUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';
    try {
      const parsed = new URL(trimmed);
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
      const port = parsed.port ? `:${parsed.port}` : '';
      const pathname = parsed.pathname.replace(/\/+$/, '') || '/';

      const keptParams: [string, string][] = [];
      parsed.searchParams.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.startsWith('utm_') || TRACKING_QUERY_PARAMS.has(lowerKey)) {
          return;
        }
        keptParams.push([key, value]);
      });
      keptParams.sort(([aKey, aVal], [bKey, bVal]) => {
        if (aKey !== bKey) return aKey.localeCompare(bKey);
        return aVal.localeCompare(bVal);
      });

      const queryString =
        keptParams.length > 0
          ? `?${keptParams.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`
          : '';
      const hashRoute =
        parsed.hash.startsWith('#/') || parsed.hash.startsWith('#!') ? parsed.hash : '';

      return `${hostname}${port}${pathname}${queryString}${hashRoute}`;
    } catch {
      return trimmed.toLowerCase().replace(/\/+$/, '');
    }
  }

  /**
   * Calculates a 30-day lookback window anchored at report generation date (today)
   * for upcoming/today meetings, or at (meetingDate - 1 day) for past meetings.
   * Never uses a future meeting date as the research cutoff.
   */
  static calculateDateWindow(
    meetingDateStr: string,
    referenceDateStr?: string
  ): {
    startDate: string;
    endDate: string;
    daysLookback: number;
  } {
    const todayStr = referenceDateStr || this.getTodayDateString();
    const validIso = /^\d{4}-\d{2}-\d{2}$/.test(meetingDateStr);
    const parsedMeeting = validIso ? new Date(`${meetingDateStr}T00:00:00Z`) : new Date(NaN);
    const isPastMeeting =
      validIso && !isNaN(parsedMeeting.getTime()) && meetingDateStr < todayStr;

    const endObj = isPastMeeting
      ? new Date(parsedMeeting.getTime() - 24 * 60 * 60 * 1000)
      : new Date(`${todayStr}T00:00:00Z`);
    const startObj = new Date(endObj.getTime() - 29 * 24 * 60 * 60 * 1000);

    return {
      startDate: formatUtcDate(startObj),
      endDate: formatUtcDate(endObj),
      daysLookback: 30,
    };
  }

  /**
   * Normalizes a source publication date to YYYY-MM-DD (or "Date unavailable")
   * and rejects sources published outside the window or after the actual cutoff.
   * Rejects vague/partial/ambiguous/invalid dates (e.g. "November 2026", "03/04/2026", "2026-02-31")
   * instead of guessing or rolling over calendar dates.
   */
  static normalizePublishedDate(
    rawDate: string | null | undefined,
    dateWindow: { startDate: string; endDate: string },
    maxCutoffDate?: string
  ): { publishedDate: string; inDateRange: boolean } {
    if (!rawDate || typeof rawDate !== 'string' || !rawDate.trim()) {
      return { publishedDate: 'Date unavailable', inDateRange: true };
    }

    const trimmed = rawDate.trim().replace(/\s+/g, ' ');
    let normalized: string | undefined;

    // 1. Strict YYYY-MM-DD or YYYY/MM/DD (never fall back on invalid calendar dates like 2026-02-31)
    const isoDateOnly = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoDateOnly) {
      const year = Number(isoDateOnly[1]);
      const monthIndex = Number(isoDateOnly[2]) - 1;
      const day = Number(isoDateOnly[3]);
      if (isValidUtcCalendarDate(year, monthIndex, day)) {
        normalized = formatUtcDate(new Date(Date.UTC(year, monthIndex, day)));
      } else {
        return { publishedDate: 'Date unavailable', inDateRange: true };
      }
    }

    // 2. Strict ISO 8601 datetime with explicit Z or timezone offset
    if (!normalized) {
      const isoDateTime = trimmed.match(
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/i
      );
      if (isoDateTime) {
        const year = Number(isoDateTime[1]);
        const monthIndex = Number(isoDateTime[2]) - 1;
        const day = Number(isoDateTime[3]);
        const hour = Number(isoDateTime[4]);
        const minute = Number(isoDateTime[5]);
        const second = isoDateTime[6] ? Number(isoDateTime[6]) : 0;
        if (
          isValidUtcCalendarDate(year, monthIndex, day) &&
          hour <= 23 &&
          minute <= 59 &&
          second <= 59
        ) {
          const tz = isoDateTime[7].toUpperCase();
          const normalizedTz =
            tz === 'Z' || tz.includes(':') ? tz : `${tz.slice(0, 3)}:${tz.slice(3)}`;
          const isoCandidate = `${isoDateTime[1]}-${isoDateTime[2]}-${isoDateTime[3]}T${isoDateTime[4]}:${isoDateTime[5]}:${isoDateTime[6] || '00'}${normalizedTz}`;
          const parsed = new Date(isoCandidate);
          if (!isNaN(parsed.getTime())) {
            normalized = formatUtcDate(parsed);
          }
        }
      }
    }

    // 3. Explicit Month DD, YYYY (with optional weekday and optional time/timezone)
    if (!normalized) {
      const monthFirst = trimmed.match(
        /^(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(GMT|UTC|[+-]\d{2}:?\d{2}))?)?$/i
      );
      if (monthFirst) {
        const monthIndex = UTC_MONTHS[monthFirst[1].toLowerCase()];
        const day = Number(monthFirst[2]);
        const year = Number(monthFirst[3]);
        if (monthIndex !== undefined && isValidUtcCalendarDate(year, monthIndex, day)) {
          if (monthFirst[4] && monthFirst[7]) {
            const parsed = new Date(trimmed);
            normalized = !isNaN(parsed.getTime())
              ? formatUtcDate(parsed)
              : formatUtcDate(new Date(Date.UTC(year, monthIndex, day)));
          } else {
            normalized = formatUtcDate(new Date(Date.UTC(year, monthIndex, day)));
          }
        }
      }
    }

    // 4. Explicit DD Month YYYY / RFC 2822 style (with optional weekday and optional time/timezone)
    if (!normalized) {
      const dayFirst = trimmed.match(
        /^(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+),?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(GMT|UTC|[+-]\d{2}:?\d{2}))?)?$/i
      );
      if (dayFirst) {
        const day = Number(dayFirst[1]);
        const monthIndex = UTC_MONTHS[dayFirst[2].toLowerCase()];
        const year = Number(dayFirst[3]);
        if (monthIndex !== undefined && isValidUtcCalendarDate(year, monthIndex, day)) {
          if (dayFirst[4] && dayFirst[7]) {
            const parsed = new Date(trimmed);
            normalized = !isNaN(parsed.getTime())
              ? formatUtcDate(parsed)
              : formatUtcDate(new Date(Date.UTC(year, monthIndex, day)));
          } else {
            normalized = formatUtcDate(new Date(Date.UTC(year, monthIndex, day)));
          }
        }
      }
    }

    // 5. Numeric MM/DD/YYYY or DD/MM/YYYY ONLY when unambiguous (one part > 12, or both equal)
    if (!normalized) {
      const numericDate = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (numericDate) {
        const first = Number(numericDate[1]);
        const second = Number(numericDate[2]);
        const year = Number(numericDate[3]);
        let month = 0;
        let day = 0;

        if (first > 12 && second >= 1 && second <= 12) {
          day = first;
          month = second;
        } else if (second > 12 && first >= 1 && first <= 12) {
          month = first;
          day = second;
        } else if (first === second && first >= 1 && first <= 12) {
          month = first;
          day = second;
        }

        if (month > 0 && day > 0 && isValidUtcCalendarDate(year, month - 1, day)) {
          normalized = formatUtcDate(new Date(Date.UTC(year, month - 1, day)));
        }
      }
    }

    if (!normalized) {
      return { publishedDate: 'Date unavailable', inDateRange: true };
    }

    const cutoff =
      maxCutoffDate && maxCutoffDate < dateWindow.endDate
        ? maxCutoffDate
        : dateWindow.endDate;

    const inDateRange = normalized >= dateWindow.startDate && normalized <= cutoff;
    return { publishedDate: normalized, inDateRange };
  }

  /**
   * Resolves a source's publication date from item.published_date first, falling back ONLY
   * to explicit standalone publication metadata headers in item.content (ignoring Updated:,
   * Event date:, or arbitrary prose dates).
   */
  static resolvePublishedDate(
    rawDate: string | null | undefined,
    content: string | undefined,
    dateWindow: { startDate: string; endDate: string },
    maxCutoffDate?: string
  ): { publishedDate: string; inDateRange: boolean } {
    const primary = this.normalizePublishedDate(rawDate, dateWindow, maxCutoffDate);
    if (primary.publishedDate !== 'Date unavailable') {
      return primary;
    }

    if (!content || typeof content !== 'string') {
      return primary;
    }

    const headerRegex =
      /(?:^|[\r\n]|(?:\||•)\s*)(?:Published(?:\s+(?:on|date))?|Date\s+Published|Posted(?:\s+on)?)\s*:\s*([^\r\n|•;]{4,50})/gi;
    let match: RegExpExecArray | null;
    while ((match = headerRegex.exec(content)) !== null) {
      const candidateRaw = match[1]
        .trim()
        .replace(/\s*\([^)]*\)\s*$/g, '')
        .replace(/\s+(?:-|–|—|\bby\b)\s+.*$/i, '')
        .replace(/[.]+$/, '')
        .trim();
      if (!candidateRaw) continue;
      const candidateResult = this.normalizePublishedDate(candidateRaw, dateWindow, maxCutoffDate);
      if (candidateResult.publishedDate !== 'Date unavailable') {
        return candidateResult;
      }
    }

    return primary;
  }

  /**
   * Extracts structured role and technical/business focus terms from targetRole + additionalContext
   * without inventing a role if none was provided.
   */
  static extractResearchFocus(params: {
    targetRole?: string;
    additionalContext?: string;
    meetingPurpose?: MeetingPurpose;
  }): {
    explicitRole?: string;
    focusTokens: string[];
    focusPhrase: string;
  } {
    const rawRole = params.targetRole?.trim();
    const rawContext = params.additionalContext?.trim();

    let explicitRole = rawRole && rawRole.length > 0 ? rawRole : undefined;
    if (!explicitRole && rawContext) {
      const roleMatch = rawContext.match(ROLE_EXTRACTION_REGEX);
      if (roleMatch && roleMatch[1]) {
        explicitRole = roleMatch[1].replace(/\s+/g, ' ').trim();
      }
    }

    const combined = [explicitRole || '', rawContext || ''].join(' ').trim();
    const seen = new Set<string>();
    const focusTokens: string[] = [];
    for (const token of combined.split(/[^a-zA-Z0-9+#.-]+/)) {
      const cleaned = token.replace(/^[.-]+|[.-]+$/g, '');
      const lower = cleaned.toLowerCase();
      if (lower.length < 2) continue;
      if (lower.length === 2 && !['ai', 'ml', 'qa', 'go', 'ui', 'ux', 'ir'].includes(lower)) {
        continue;
      }
      if (CONTEXT_STOP_WORDS.has(lower) || seen.has(lower)) continue;
      seen.add(lower);
      focusTokens.push(cleaned);
      if (focusTokens.length >= 6) break;
    }

    const focusPhrase = focusTokens.slice(0, 5).join(' ');
    return {
      explicitRole,
      focusTokens,
      focusPhrase,
    };
  }

  /**
   * Builds genuinely distinct, purpose-aware Tavily queries personalized with
   * Target Role / Domain and Additional Context.
   */
  static buildResearchQueries(params: {
    companyName: string;
    personName?: string;
    meetingPurpose?: MeetingPurpose;
    targetRole?: string;
    additionalContext?: string;
  }): ResearchQuerySpec[] {
    const company = params.companyName.trim();
    const person = params.personName?.trim();
    const purpose: MeetingPurpose = params.meetingPurpose || 'Business Meeting';
    const focus = this.extractResearchFocus({
      targetRole: params.targetRole,
      additionalContext: params.additionalContext,
      meetingPurpose: purpose,
    });

    const roleText = focus.explicitRole;
    const suffix = focus.focusPhrase ? ` ${focus.focusPhrase}` : '';
    const extraNonRoleTokens = focus.focusTokens
      .filter((tok) => !roleText || !roleText.toLowerCase().includes(tok.toLowerCase()))
      .slice(0, 4)
      .join(' ');
    const techOrFocusSuffix = extraNonRoleTokens ? ` ${extraNonRoleTokens}` : suffix;

    switch (purpose) {
      case 'Job Interview': {
        const targetLabel = roleText || 'software engineering';
        const queries: ResearchQuerySpec[] = [
          {
            query: `"${company}" careers jobs "${targetLabel}" requirements skills qualifications${extraNonRoleTokens ? ` ${extraNonRoleTokens}` : ''}`,
            topic: 'general',
            label: 'Role Openings & Requirements (Background)',
            sourceScope: 'purpose_background',
          },
          {
            query: `"${company}" interview preparation engineering team technical projects${suffix}`,
            topic: 'general',
            label: 'Engineering Teams & Interview Prep (Background)',
            sourceScope: 'purpose_background',
          },
          {
            query: `"${company}" engineering product architecture technical updates${techOrFocusSuffix}`,
            topic: 'general',
            label: 'Recent Engineering & Product Updates',
            sourceScope: 'recent_30d',
          },
          {
            query: `"${company}" hiring expansion engineering leadership updates${techOrFocusSuffix}`,
            topic: 'news',
            label: 'Recent Hiring & Leadership News',
            sourceScope: 'recent_30d',
          },
        ];
        if (person) {
          queries.push({
            query: `"${person}" "${company}" engineering leadership role interview`,
            topic: 'general',
            label: 'Interviewer & Leadership Background',
            sourceScope: 'recent_30d',
          });
        }
        return queries;
      }

      case 'Internship Discussion': {
        const internLabel = roleText || 'software engineering intern';
        const queries: ResearchQuerySpec[] = [
          {
            query: `"${company}" internship "${internLabel}" apply eligibility qualifications`,
            topic: 'general',
            label: 'Official Internship Programmes & Openings (Background)',
            sourceScope: 'purpose_background',
          },
          {
            query: `"${company}" student internship mentorship projects skills${techOrFocusSuffix || ' programming DSA'}`,
            topic: 'general',
            label: 'Internship Skills, Projects & Mentorship (Background)',
            sourceScope: 'purpose_background',
          },
          {
            query: `"${company}" internship student hiring program announcement${techOrFocusSuffix}`,
            topic: 'news',
            label: 'Recent Internship & Student Hiring News',
            sourceScope: 'recent_30d',
          },
          {
            query: `"${company}" engineering teams technical projects updates${techOrFocusSuffix}`,
            topic: 'general',
            label: 'Recent Engineering Team Developments',
            sourceScope: 'recent_30d',
          },
        ];
        if (person) {
          queries.push({
            query: `"${person}" "${company}" university recruiting engineering mentorship`,
            topic: 'general',
            label: 'Contact & Mentorship Context',
            sourceScope: 'recent_30d',
          });
        }
        return queries;
      }

      case 'Client Meeting':
        return [
          {
            query: `"${company}" enterprise products solutions integrations case study${suffix}`,
            topic: 'general',
            label: 'Products, Solutions & Integrations',
            sourceScope: 'recent_30d',
          },
          {
            query: `"${company}" customer partnership product update announcement${suffix}`,
            topic: 'news',
            label: 'Customer & Product Announcements',
            sourceScope: 'recent_30d',
          },
          person
            ? {
                query: `"${person}" "${company}" customer solutions leadership statement`,
                topic: 'general',
                label: 'Client Stakeholder Context',
                sourceScope: 'recent_30d',
              }
            : {
                query: `"${company}" industry challenges enterprise deployment pricing${suffix}`,
                topic: 'general',
                label: 'Client Needs & Commercial Context',
                sourceScope: 'recent_30d',
              },
        ];

      case 'Partnership Discussion':
        return [
          {
            query: `"${company}" partnership partner program ecosystem integration${suffix}`,
            topic: 'news',
            label: 'Partnerships & Ecosystem Announcements',
            sourceScope: 'recent_30d',
          },
          {
            query: `"${company}" developer ecosystem API integration partner requirements${suffix}`,
            topic: 'general',
            label: 'Ecosystem & Technical Integration',
            sourceScope: 'recent_30d',
          },
          person
            ? {
                query: `"${person}" "${company}" partnerships alliances ecosystem`,
                topic: 'general',
                label: 'Partnership Leadership Context',
                sourceScope: 'recent_30d',
              }
            : {
                query: `"${company}" strategic alliance joint solution collaboration${suffix}`,
                topic: 'news',
                label: 'Strategic Collaboration News',
                sourceScope: 'recent_30d',
              },
        ];

      case 'Investor Meeting':
        return [
          {
            query: `"${company}" earnings revenue financial results funding guidance${suffix}`,
            topic: 'news',
            label: 'Financial Results & Funding News',
            sourceScope: 'recent_30d',
          },
          {
            query: `"${company}" investor relations SEC growth strategy risks market${suffix}`,
            topic: 'general',
            label: 'Investor Strategy & Primary Filings',
            sourceScope: 'recent_30d',
          },
          person
            ? {
                query: `"${person}" "${company}" CEO CFO investor earnings remarks`,
                topic: 'general',
                label: 'Executive Financial Commentary',
                sourceScope: 'recent_30d',
              }
            : {
                query: `"${company}" valuation acquisition market position corporate announcement${suffix}`,
                topic: 'news',
                label: 'Corporate & Market Developments',
                sourceScope: 'recent_30d',
              },
        ];

      case 'Networking': {
        const queries: ResearchQuerySpec[] = [
          {
            query: person
              ? `"${person}" "${company}" interview podcast talk recent work${suffix}`
              : `"${company}" leadership engineering talk keynote recent work${suffix}`,
            topic: 'general',
            label: 'Recent Talks, Work & Statements',
            sourceScope: 'recent_30d',
          },
          {
            query: person
              ? `"${person}" "${company}" announcements projects insights${suffix}`
              : `"${company}" team projects culture community news${suffix}`,
            topic: 'news',
            label: 'Recent Projects & Community Updates',
            sourceScope: 'recent_30d',
          },
        ];
        if (person) {
          queries.push({
            query: `"${person}" "${company}" background career role bio${suffix}`,
            topic: 'general',
            label: 'Professional Background (Background)',
            sourceScope: 'purpose_background',
          });
        } else {
          queries.push({
            query: `"${company}" engineering leadership executives initiatives${suffix}`,
            topic: 'general',
            label: 'People & Shared Interests',
            sourceScope: 'recent_30d',
          });
        }
        return queries;
      }

      case 'Academic Meeting':
        return [
          {
            query: `"${company}" research paper lab academic collaboration${suffix}`,
            topic: 'general',
            label: 'Academic & Research Initiatives',
            sourceScope: 'recent_30d',
          },
          {
            query: `"${company}" research announcement grant conference publication${suffix}`,
            topic: 'news',
            label: 'Recent Research Announcements',
            sourceScope: 'recent_30d',
          },
          person
            ? {
                query: `"${person}" "${company}" research publications academic role${suffix}`,
                topic: 'general',
                label: 'Researcher & Publication Context',
                sourceScope: 'recent_30d',
              }
            : {
                query: `"${company}" university fellowship benchmark study${suffix}`,
                topic: 'general',
                label: 'Fellowships & Academic Benchmarks',
                sourceScope: 'recent_30d',
              },
        ];

      case 'Other':
        return [
          {
            query: `"${company}"${suffix || ' announcements'} updates news`,
            topic: 'news',
            label: 'Context-Aligned Recent News',
            sourceScope: 'recent_30d',
          },
          {
            query: `"${company}"${suffix || ' initiatives overview'} projects technology`,
            topic: 'general',
            label: 'Context-Aligned Company & Tech Research',
            sourceScope: 'recent_30d',
          },
          person
            ? {
                query: `"${person}" "${company}"${suffix || ' role work'}`,
                topic: 'general',
                label: 'Person & Context Specifics',
                sourceScope: 'recent_30d',
              }
            : {
                query: `"${company}" leadership strategy${suffix}`,
                topic: 'general',
                label: 'Leadership & Strategy Context',
                sourceScope: 'recent_30d',
              },
        ];

      case 'Business Meeting':
      default:
        return [
          {
            query: `"${company}" strategy corporate announcement partnership expansion${suffix}`,
            topic: 'news',
            label: 'Corporate Strategy & Announcements',
            sourceScope: 'recent_30d',
          },
          {
            query: `"${company}" enterprise product pricing revenue business updates${suffix}`,
            topic: 'general',
            label: 'Enterprise Products & Commercial Updates',
            sourceScope: 'recent_30d',
          },
          person
            ? {
                query: `"${person}" "${company}" executive strategy role statement`,
                topic: 'general',
                label: 'Executive & Stakeholder Context',
                sourceScope: 'recent_30d',
              }
            : {
                query: `"${company}" market position competitors earnings${suffix}`,
                topic: 'news',
                label: 'Market & Competitive Developments',
                sourceScope: 'recent_30d',
              },
        ];
    }
  }

  static evaluateRelevanceAndPriority(
    item: TavilyRawResult,
    publishedDate: string,
    params: {
      companyName: string;
      personName?: string;
      bucketIndex: number;
      meetingPurpose?: MeetingPurpose;
      targetRole?: string;
      additionalContext?: string;
      sourceScope?: 'recent_30d' | 'purpose_background';
    }
  ): { relevant: boolean; priority: number } {
    const title = item.title.trim();
    const content = item.content || '';
    let hostname = '';
    let pathname = '';
    try {
      const parsedUrl = new URL(item.url);
      hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
      pathname = parsedUrl.pathname.toLowerCase();
    } catch {
      hostname = '';
    }

    const rawCompany = params.companyName.trim().toLowerCase();
    const coreCompany = rawCompany
      .replace(CORPORATE_SUFFIX_REGEX, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const companyVariants = Array.from(
      new Set([rawCompany, coreCompany].filter((v) => v.length > 0))
    );
    const companySlug = (coreCompany || rawCompany).replace(/[^a-z0-9]/g, '');
    const companyTokens = (coreCompany || rawCompany)
      .split(/[^a-z0-9]+/)
      .filter((tok) => tok.length >= 3 && !COMPANY_STOP_WORDS.has(tok));

    const person = params.personName?.trim().toLowerCase() || '';
    const personTokens = person
      ? person.split(/[^a-z0-9]+/).filter((tok) => tok.length >= 2)
      : [];

    const matchesCompanyPhrase = (text: string): boolean =>
      companyVariants.some((variant) => containsTerm(text, variant)) ||
      (companyTokens.length >= 2 && companyTokens.every((tok) => containsTerm(text, tok)));

    const matchesPersonPhrase = (text: string): boolean =>
      Boolean(person) &&
      (containsTerm(text, person) ||
        (personTokens.length >= 2 && personTokens.every((tok) => containsTerm(text, tok))));

    const hostLabels = hostname.split('.');
    const companyInHost =
      companySlug.length >= 3 &&
      hostLabels.some((label) => {
        const cleanLabel = label.replace(/[^a-z0-9]/g, '');
        return cleanLabel === companySlug || (companySlug.length >= 5 && cleanLabel.includes(companySlug));
      });
    const companyInUrlPath =
      companySlug.length >= 4 && pathname.replace(/[^a-z0-9]/g, '').includes(companySlug);

    const companyInTitle = matchesCompanyPhrase(title);
    const companyInContent = matchesCompanyPhrase(content);
    const personInTitle = matchesPersonPhrase(title);
    const personInContent = matchesPersonPhrase(content);
    const personInUrl =
      personTokens.length >= 2 &&
      personTokens.every((tok) => `${hostname}${pathname}`.includes(tok));

    const matchesCompany = companyInTitle || companyInContent || companyInHost || companyInUrlPath;
    const matchesPerson = personInTitle || personInContent || personInUrl;

    // Exclude clearly unrelated sources rather than filling the list with weak noise
    if (!matchesCompany && !matchesPerson) {
      return { relevant: false, priority: -1 };
    }
    if (typeof item.score === 'number') {
      if (item.score < 0.15) {
        return { relevant: false, priority: -1 };
      }
      if (item.score < 0.28 && !companyInTitle && !companyInHost && !personInTitle) {
        return { relevant: false, priority: -1 };
      }
    }

    // Internal ranking score (Tavily's original score remains untouched on item.score)
    let priority = typeof item.score === 'number' ? item.score * 100 : 50;

    if (companyInTitle) priority += 20;
    else if (companyInContent) priority += 8;

    if (personInTitle) priority += 26;
    else if (personInContent) priority += 14;

    if (companyInHost) {
      // Official company website / newsroom / blog / careers / investor relations
      priority += 25;
      if (/^(about|blog|news|newsroom|press|ir|investors|investor|careers|jobs|developers|engineering)\./.test(hostname)) {
        priority += 6;
      }
    } else if (matchesHostnameDomain(hostname, CREDIBLE_PUBLICATION_DOMAINS)) {
      priority += 15;
    } else if (matchesHostnameDomain(hostname, LOW_PRIORITY_UGC_DOMAINS) && !personInTitle) {
      priority -= 12;
    }

    // Purpose relevance scoring (major ranking factor)
    const purpose = params.meetingPurpose;
    if (purpose) {
      const titleLower = title.toLowerCase();
      const contentLower = content.toLowerCase();
      const urlLower = `${hostname}${pathname}`;

      const purposeTerms = PURPOSE_KEYWORDS[purpose] || [];
      let purposeTitleHits = 0;
      let purposeContentHits = 0;
      for (const term of purposeTerms) {
        if (containsTerm(titleLower, term) || urlLower.includes(term)) purposeTitleHits++;
        else if (containsTerm(contentLower, term)) purposeContentHits++;
      }
      priority += Math.min(36, purposeTitleHits * 11) + Math.min(20, purposeContentHits * 5);

      const isCareerPathOrHost =
        /^(?:careers|jobs|university|students)\./.test(hostname) ||
        /(?:\/careers|\/jobs|\/intern|\/students|\/university|\/early-career)/.test(pathname) ||
        matchesHostnameDomain(hostname, KNOWN_CAREER_DOMAINS);

      if (purpose === 'Internship Discussion') {
        if (/(?:intern|internship|student|university|early career|fellowship|apprenticeship)/.test(`${titleLower} ${urlLower}`)) {
          priority += 32;
        }
        if (isCareerPathOrHost && companyInHost) priority += 22;
        else if (isCareerPathOrHost) priority += 12;
        if (purposeTitleHits === 0 && purposeContentHits === 0 && /\b(?:earnings|stock|antitrust|consumer|marketing)\b/i.test(titleLower)) {
          priority -= 16;
        }
      } else if (purpose === 'Job Interview') {
        if (/(?:career|job|hiring|engineer|developer|interview|qualifications|opening)/.test(`${titleLower} ${urlLower}`)) {
          priority += 26;
        }
        if (isCareerPathOrHost && companyInHost) priority += 22;
        else if (isCareerPathOrHost) priority += 12;
        if (/^(?:engineering|developers|tech)\./.test(hostname) || pathname.includes('/engineering')) {
          priority += 14;
        }
      } else if (purpose === 'Investor Meeting') {
        if (hostname === 'sec.gov' || /^(?:ir|investor|investors)\./.test(hostname)) {
          priority += 24;
        }
      } else if (purpose === 'Business Meeting' || purpose === 'Client Meeting' || purpose === 'Partnership Discussion') {
        if (isCareerPathOrHost && purposeTitleHits === 0) {
          priority -= 14;
        }
      }
    }

    // Target Role / Domain & Additional Context personalization boost
    const focus = this.extractResearchFocus({
      targetRole: params.targetRole,
      additionalContext: params.additionalContext,
      meetingPurpose: purpose,
    });
    if (focus.explicitRole) {
      if (containsTerm(title, focus.explicitRole)) priority += 28;
      else if (containsTerm(content, focus.explicitRole)) priority += 16;
    }
    if (focus.focusTokens.length > 0) {
      let focusTitleMatches = 0;
      let focusContentMatches = 0;
      for (const tok of focus.focusTokens) {
        if (containsTerm(title, tok)) focusTitleMatches++;
        else if (containsTerm(content, tok)) focusContentMatches++;
      }
      priority += Math.min(27, focusTitleMatches * 9) + Math.min(20, focusContentMatches * 5);
    }

    if (publishedDate !== 'Date unavailable') {
      priority += 4;
    }

    return { relevant: true, priority };
  }

  /**
   * Executes a single search query against Tavily API with timeout and error handling.
   */
  static async search(
    query: string,
    options: {
      topic?: 'news' | 'general';
      maxResults?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<TavilyRawResult[]> {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey || apiKey.trim() === '' || apiKey.includes('MY_GEMINI') || apiKey.includes('tvly-xxxxxxxxxxxx')) {
      throw new Error(
        'TAVILY_API_KEY is not configured on the server. Please set your valid Tavily API key in the environment or project secrets.'
      );
    }

    const payload: Record<string, unknown> = {
      api_key: apiKey.trim(),
      query,
      search_depth: 'basic',
      topic: options.topic || 'news',
      max_results: Math.min(Math.max(options.maxResults || 5, 1), 5),
      include_answer: false,
      include_raw_content: false,
      include_images: false,
    };

    // Include date restrictions if available
    if (options.startDate) {
      payload.start_date = options.startDate;
    }
    if (options.endDate) {
      payload.end_date = options.endDate;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MeetBrief-Agent/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Tavily API key is invalid or unauthorized. Please verify your Tavily credentials.');
        }
        if (response.status === 429) {
          throw new Error('Tavily API quota or rate limit exceeded. Please try again later.');
        }
        throw new Error(`Tavily Search API returned error status ${response.status}.`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!/\bapplication\/(?:[\w.-]+\+)?json\b/i.test(contentType)) {
        throw new Error(`Tavily Search API returned an unexpected content type (${contentType || 'missing'}).`);
      }

      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== 'object' ||
        !('results' in data) ||
        !Array.isArray(data.results)
      ) {
        throw new Error('Tavily Search API returned a malformed response without a results array.');
      }

      return data.results.map((result, index) => {
        if (
          !result ||
          typeof result !== 'object' ||
          !('title' in result) ||
          typeof result.title !== 'string' ||
          !result.title.trim() ||
          !('url' in result) ||
          typeof result.url !== 'string' ||
          !result.url.trim() ||
          !('content' in result) ||
          typeof result.content !== 'string'
        ) {
          throw new Error(`Tavily Search API returned a malformed result at index ${index}.`);
        }

        let parsedUrl: URL;
        try {
          parsedUrl = new URL(result.url);
        } catch {
          throw new Error(`Tavily Search API returned a malformed source URL at index ${index}.`);
        }
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
          throw new Error(`Tavily Search API returned an unsupported source URL at index ${index}.`);
        }

        return {
          title: result.title.trim(),
          url: result.url.trim(),
          content: result.content,
          score:
            'score' in result && typeof result.score === 'number' && Number.isFinite(result.score)
              ? result.score
              : undefined,
          published_date:
            'published_date' in result && typeof result.published_date === 'string'
              ? result.published_date
              : undefined,
        };
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Tavily search request timed out after 10 seconds. Please try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Runs targeted, purpose-aware research across 30-day queries and (where appropriate)
   * evergreen background queries in parallel.
   */
  static async runComprehensiveResearch(params: {
    companyName: string;
    personName?: string;
    meetingDate: string;
    meetingPurpose?: MeetingPurpose;
    targetRole?: string;
    additionalContext?: string;
  }): Promise<{
    items: TavilyCleanedItem[];
    queriesRun: string[];
    dateWindow: { startDate: string; endDate: string; daysLookback: number };
  }> {
    const {
      companyName,
      personName,
      meetingDate,
      meetingPurpose,
      targetRole,
      additionalContext,
    } = params;
    const todayStr = this.getTodayDateString();
    const dateWindow = this.calculateDateWindow(meetingDate, todayStr);

    const queries = this.buildResearchQueries({
      companyName,
      personName,
      meetingPurpose,
      targetRole,
      additionalContext,
    });

    const queriesRun: string[] = queries.map((q) => q.query);

    // Execute all targeted queries concurrently; only recent_30d queries apply 30-day search bounds
    const searchResults = await Promise.allSettled(
      queries.map((q) =>
        this.search(q.query, {
          topic: q.topic,
          maxResults: 5,
          ...(q.sourceScope === 'recent_30d'
            ? { startDate: dateWindow.startDate, endDate: dateWindow.endDate }
            : {}),
        })
      )
    );

    let hadApiKeyError = false;
    let failedSearchCount = 0;

    type RankedCandidate = {
      item: TavilyCleanedItem;
      canonicalUrl: string;
      bucketIndex: number;
      priority: number;
    };

    const bestByCanonicalUrl = new Map<string, RankedCandidate>();

    for (let i = 0; i < searchResults.length; i++) {
      const result = searchResults[i];
      const q = queries[i];

      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          if (!item.url || !item.title.trim() || !item.content.trim()) continue;

          const { publishedDate, inDateRange } = this.resolvePublishedDate(
            item.published_date,
            item.content,
            dateWindow,
            todayStr
          );

          // Always reject future-dated sources; enforce 30-day window strictly on recent_30d queries
          if (publishedDate !== 'Date unavailable' && publishedDate > todayStr) {
            continue;
          }
          if (q.sourceScope === 'recent_30d' && !inDateRange) {
            continue;
          }

          const { relevant, priority } = this.evaluateRelevanceAndPriority(
            item,
            publishedDate,
            {
              companyName,
              personName,
              bucketIndex: i,
              meetingPurpose,
              targetRole,
              additionalContext,
              sourceScope: q.sourceScope,
            }
          );
          if (!relevant) continue;

          const canonicalUrl = this.canonicalizeUrl(item.url);
          if (!canonicalUrl) continue;

          const itemInRecentWindow =
            q.sourceScope === 'recent_30d' && inDateRange;

          const cleanedItem: TavilyCleanedItem = {
            title: item.title.trim(),
            url: item.url.trim(),
            content: item.content.slice(0, 600), // Compact, relevant evidence
            publishedDate,
            inDateRange: itemInRecentWindow,
            searchTopic: q.label,
            sourceScope: itemInRecentWindow ? 'recent_30d' : 'purpose_background',
            ...(item.score !== undefined ? { score: item.score } : {}),
          };

          const existing = bestByCanonicalUrl.get(canonicalUrl);
          if (!existing) {
            bestByCanonicalUrl.set(canonicalUrl, {
              item: cleanedItem,
              canonicalUrl,
              bucketIndex: i,
              priority,
            });
          } else {
            // Preserve recent_30d scope if the URL was also retrieved within the 30-day window
            const mergedScope =
              existing.item.sourceScope === 'recent_30d' || cleanedItem.sourceScope === 'recent_30d'
                ? 'recent_30d'
                : 'purpose_background';
            if (priority > existing.priority) {
              bestByCanonicalUrl.set(canonicalUrl, {
                item: {
                  ...cleanedItem,
                  sourceScope: mergedScope,
                  inDateRange: mergedScope === 'recent_30d',
                },
                canonicalUrl,
                bucketIndex: i,
                priority,
              });
            } else if (mergedScope === 'recent_30d' && existing.item.sourceScope !== 'recent_30d') {
              existing.item.sourceScope = 'recent_30d';
              existing.item.inDateRange = true;
            }
          }
        }
      } else {
        failedSearchCount++;
        const rawErrorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
        const sanitizeLog = (value: string): string => {
          let cleaned = value;
          const tavilyKey = process.env.TAVILY_API_KEY?.trim();
          if (tavilyKey) {
            cleaned = cleaned.replaceAll(tavilyKey, '[REDACTED]');
          }
          return cleaned.replace(/[\r\n\t\x00-\x1f\x7f]+/g, ' ').trim().slice(0, 200);
        };
        console.warn(`[TavilyService] Search failed for "${sanitizeLog(q.query)}": ${sanitizeLog(rawErrorMsg)}`);
        if (rawErrorMsg.includes('TAVILY_API_KEY') || rawErrorMsg.includes('unauthorized') || rawErrorMsg.includes('invalid')) {
          hadApiKeyError = true;
        }
      }
    }

    if (bestByCanonicalUrl.size === 0 && failedSearchCount > 0) {
      throw new Error(
        hadApiKeyError
          ? 'TAVILY_API_KEY is not configured or unauthorized on the server. Please check your Tavily API key.'
          : 'All Tavily searches failed. Please try again later.'
      );
    }

    // Balance across all query buckets, keeping up to 12 when evergreen background queries are present
    const hasBackgroundBucket = queries.some((q) => q.sourceScope === 'purpose_background');
    const MAX_SOURCES = hasBackgroundBucket ? 12 : 10;
    const buckets: RankedCandidate[][] = Array.from({ length: queries.length }, () => []);
    for (const candidate of bestByCanonicalUrl.values()) {
      buckets[candidate.bucketIndex].push(candidate);
    }
    for (const bucket of buckets) {
      bucket.sort((a, b) => b.priority - a.priority);
    }

    const selected: RankedCandidate[] = [];
    const selectedUrls = new Set<string>();
    const bucketOffsets = new Array<number>(queries.length).fill(0);

    while (selected.length < MAX_SOURCES) {
      const roundItems: RankedCandidate[] = [];
      for (let b = 0; b < buckets.length; b++) {
        while (bucketOffsets[b] < buckets[b].length) {
          const candidate = buckets[b][bucketOffsets[b]];
          if (selectedUrls.has(candidate.canonicalUrl)) {
            bucketOffsets[b]++;
            continue;
          }
          roundItems.push(candidate);
          break;
        }
      }

      if (roundItems.length === 0) break;

      if (selected.length + roundItems.length <= MAX_SOURCES) {
        for (const item of roundItems) {
          selected.push(item);
          selectedUrls.add(item.canonicalUrl);
          bucketOffsets[item.bucketIndex]++;
        }
      } else {
        const remaining: RankedCandidate[] = [];
        for (let b = 0; b < buckets.length; b++) {
          for (let idx = bucketOffsets[b]; idx < buckets[b].length; idx++) {
            const candidate = buckets[b][idx];
            if (!selectedUrls.has(candidate.canonicalUrl)) {
              remaining.push(candidate);
            }
          }
        }
        remaining.sort((a, b) => b.priority - a.priority);
        for (const item of remaining) {
          if (selected.length >= MAX_SOURCES) break;
          selected.push(item);
          selectedUrls.add(item.canonicalUrl);
        }
        break;
      }
    }

    const boundedEvidence = selected
      .sort((a, b) => b.priority - a.priority)
      .slice(0, MAX_SOURCES)
      .map((entry) => entry.item);

    return {
      items: boundedEvidence,
      queriesRun,
      dateWindow: {
        startDate: dateWindow.startDate,
        endDate: dateWindow.endDate,
        daysLookback: dateWindow.daysLookback,
      },
    };
  }
}
