import { MeetingBriefing, NewsIntelligenceReport } from '../types/briefing.js';

const BRIEFINGS_KEY = 'meetbrief_saved_briefings_v2';
const NEWS_KEY = 'meetbrief_saved_news_v2';

export class BriefingStorage {
  // --- Meeting Briefings ---
  static getAll(): MeetingBriefing[] {
    try {
      const data = localStorage.getItem(BRIEFINGS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to load briefings from localStorage:', err);
      return [];
    }
  }

  static getById(id: string): MeetingBriefing | null {
    const list = this.getAll();
    return list.find((item) => item.id === id) || null;
  }

  static save(briefing: MeetingBriefing): void {
    try {
      const existing = this.getAll();
      const filtered = existing.filter((item) => item.id !== briefing.id);
      const updated = [briefing, ...filtered].slice(0, 30);
      localStorage.setItem(BRIEFINGS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save briefing to localStorage:', err);
    }
  }

  static delete(id: string): void {
    try {
      const existing = this.getAll();
      const updated = existing.filter((item) => item.id !== id);
      localStorage.setItem(BRIEFINGS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete briefing from localStorage:', err);
    }
  }

  // --- News Intelligence Reports ---
  static getAllNews(): NewsIntelligenceReport[] {
    try {
      const data = localStorage.getItem(NEWS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to load news reports from localStorage:', err);
      return [];
    }
  }

  static saveNews(report: NewsIntelligenceReport): void {
    try {
      const existing = this.getAllNews();
      const filtered = existing.filter((item) => item.id !== report.id);
      const updated = [report, ...filtered].slice(0, 30);
      localStorage.setItem(NEWS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save news report to localStorage:', err);
    }
  }

  static deleteNews(id: string): void {
    try {
      const existing = this.getAllNews();
      const updated = existing.filter((item) => item.id !== id);
      localStorage.setItem(NEWS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete news report from localStorage:', err);
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(BRIEFINGS_KEY);
      localStorage.removeItem(NEWS_KEY);
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
  }
}
