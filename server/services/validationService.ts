import { ResearchRequest } from '../../src/types/briefing.js';
import type { TavilyCleanedItem } from './tavilyService.js';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: ResearchRequest;
}

const MAX_CACHED_EVIDENCE_ITEMS = 12;

function isStrictUtcCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

function validateHttpUrl(rawUrl: unknown): string | undefined {
  if (typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }
    return trimmed;
  } catch {
    return undefined;
  }
}

function validateCachedPublishedDate(rawDate: unknown): string | undefined {
  if (rawDate === undefined || rawDate === null || rawDate === '') {
    return 'Date unavailable';
  }
  if (typeof rawDate !== 'string') return undefined;
  const trimmed = rawDate.trim();
  if (!trimmed || trimmed === 'Date unavailable') return 'Date unavailable';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return isStrictUtcCalendarDate(trimmed) ? trimmed : undefined;
  }
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().split('T')[0];
}

function sanitizeCachedEvidence(rawItems: unknown[]): TavilyCleanedItem[] {
  const validItems: TavilyCleanedItem[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const rec = item as Record<string, unknown>;
    const title = typeof rec.title === 'string' ? rec.title.trim() : '';
    const content = typeof rec.content === 'string' ? rec.content.trim() : '';
    const url = validateHttpUrl(rec.url);
    const publishedDate = validateCachedPublishedDate(rec.publishedDate);

    if (!title || !content || !url || !publishedDate) continue;

    validItems.push({
      title,
      url,
      content: content.slice(0, 600),
      publishedDate,
      inDateRange: true,
      searchTopic:
        typeof rec.searchTopic === 'string' && rec.searchTopic.trim()
          ? rec.searchTopic.trim()
          : 'Cached Evidence',
      ...(rec.sourceScope === 'purpose_background' || rec.sourceScope === 'recent_30d'
        ? { sourceScope: rec.sourceScope }
        : {}),
      ...(typeof rec.score === 'number' && Number.isFinite(rec.score)
        ? { score: rec.score }
        : {}),
    });

    if (validItems.length >= MAX_CACHED_EVIDENCE_ITEMS) break;
  }
  return validItems;
}

function sanitizeCachedDateWindow(rawWindow: unknown): ResearchRequest['cachedDateWindow'] {
  if (!rawWindow || typeof rawWindow !== 'object' || Array.isArray(rawWindow)) {
    return undefined;
  }
  const rec = rawWindow as Record<string, unknown>;
  const startDate = typeof rec.startDate === 'string' ? rec.startDate.trim() : '';
  const endDate = typeof rec.endDate === 'string' ? rec.endDate.trim() : '';
  const daysLookback =
    typeof rec.daysLookback === 'number' && Number.isFinite(rec.daysLookback) && rec.daysLookback > 0
      ? Math.floor(rec.daysLookback)
      : 30;

  if (!isStrictUtcCalendarDate(startDate) || !isStrictUtcCalendarDate(endDate) || startDate > endDate) {
    return undefined;
  }
  return { startDate, endDate, daysLookback };
}

export class ValidationService {
  static validateRequest(body: unknown): ValidationResult {
    const errors: Record<string, string> = {};

    if (!body || typeof body !== 'object') {
      return { isValid: false, errors: { request: 'Invalid request payload.' } };
    }

    const data = body as Record<string, unknown>;

    // Company Name
    const companyName = typeof data.companyName === 'string' ? data.companyName.trim() : '';
    if (!companyName) {
      errors.companyName = 'Company or Organisation name is required.';
    } else if (companyName.length > 120) {
      errors.companyName = 'Company name cannot exceed 120 characters.';
    }

    // Person Name (optional)
    const personName = typeof data.personName === 'string' ? data.personName.trim() : undefined;
    if (personName && personName.length > 120) {
      errors.personName = 'Person name cannot exceed 120 characters.';
    }

    // Meeting Date (YYYY-MM-DD with strict UTC calendar check)
    const meetingDate = typeof data.meetingDate === 'string' ? data.meetingDate.trim() : '';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!meetingDate) {
      errors.meetingDate = 'Meeting date is required.';
    } else if (!dateRegex.test(meetingDate)) {
      errors.meetingDate = 'Meeting date must be in YYYY-MM-DD format.';
    } else if (!isStrictUtcCalendarDate(meetingDate)) {
      errors.meetingDate = 'Invalid meeting calendar date.';
    }

    // Meeting Time
    const meetingTime = typeof data.meetingTime === 'string' ? data.meetingTime.trim() : '';
    if (!meetingTime) {
      errors.meetingTime = 'Meeting time is required.';
    } else if (meetingTime.length > 30) {
      errors.meetingTime = 'Meeting time cannot exceed 30 characters.';
    }

    // Meeting Purpose
    const validPurposes = [
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
    const meetingPurpose = typeof data.meetingPurpose === 'string' ? data.meetingPurpose.trim() : '';
    if (!meetingPurpose) {
      errors.meetingPurpose = 'Meeting purpose is required.';
    } else if (!validPurposes.includes(meetingPurpose)) {
      errors.meetingPurpose = 'Please select a valid meeting purpose.';
    }

    // Target Role / Domain (optional, primarily for Job Interview and Internship Discussion)
    const rawTargetRole = typeof data.targetRole === 'string' ? data.targetRole.trim() : undefined;
    if (rawTargetRole && rawTargetRole.length > 120) {
      errors.targetRole = 'Target role / domain cannot exceed 120 characters.';
    }
    const targetRole =
      rawTargetRole &&
      (meetingPurpose === 'Job Interview' || meetingPurpose === 'Internship Discussion')
        ? rawTargetRole
        : undefined;

    // Additional Context (optional)
    const additionalContext = typeof data.additionalContext === 'string' ? data.additionalContext.trim() : undefined;
    if (additionalContext && additionalContext.length > 1000) {
      errors.additionalContext = 'Additional context cannot exceed 1000 characters.';
    }

    // Cached Evidence (optional on retry)
    let cachedEvidence: TavilyCleanedItem[] | undefined;
    if (data.cachedEvidence !== undefined) {
      if (!Array.isArray(data.cachedEvidence)) {
        errors.cachedEvidence = 'Cached evidence must be an array.';
      } else {
        cachedEvidence = sanitizeCachedEvidence(data.cachedEvidence);
        if (data.cachedEvidence.length > 0 && cachedEvidence.length === 0) {
          errors.cachedEvidence = 'Cached evidence items are invalid.';
        }
      }
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
      sanitized: isValid
        ? {
            companyName,
            personName: personName || undefined,
            meetingDate,
            meetingTime,
            meetingPurpose: meetingPurpose as ResearchRequest['meetingPurpose'],
            targetRole: targetRole || undefined,
            additionalContext: additionalContext || undefined,
            cachedEvidence,
            cachedDateWindow: sanitizeCachedDateWindow(data.cachedDateWindow),
            cachedQueriesRun: Array.isArray(data.cachedQueriesRun)
              ? data.cachedQueriesRun.filter(
                  (q): q is string => typeof q === 'string' && q.trim().length > 0
                )
              : undefined,
          }
        : undefined,
    };
  }
}
