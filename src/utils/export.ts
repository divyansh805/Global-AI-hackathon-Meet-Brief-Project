import { MeetingBriefing } from '../types/briefing.js';

export function formatBriefingAsMarkdown(briefing: MeetingBriefing): string {
  const { request, dateWindow, executiveSummary, latestDevelopments, purposeBackground = [], companyNews, productTechUpdates, peopleLeadershipUpdates, keyInsights, risks = [], meetingDiscussionPoints, questionsToAsk, sources } = briefing;

  let md = `# MEETBRIEF: MEETING INTELLIGENCE REPORT
Target: ${request.companyName}${request.personName ? ` (${request.personName})` : ''}
Meeting Schedule: ${request.meetingDate} at ${request.meetingTime}
Meeting Purpose: ${request.meetingPurpose}${request.targetRole ? `\nTarget Role / Domain: ${request.targetRole}` : ''}
Intelligence Window: ${dateWindow.startDate} to ${dateWindow.endDate} (30 days lookback)
Generated: ${new Date(briefing.createdAt).toLocaleString()}

---

## EXECUTIVE SUMMARY
${executiveSummary}

---

## 30-DAY LATEST DEVELOPMENTS
`;

  if (latestDevelopments.length > 0) {
    latestDevelopments.forEach((dev) => {
      md += `- [${dev.date}] **${dev.headline}** (${dev.category})\n  ${dev.summary}\n  Source: ${dev.sourceUrl}\n\n`;
    });
  } else {
    md += `No chronological timeline events were detected in the 30-day window.\n\n`;
  }

  if (purposeBackground.length > 0) {
    md += `---

## PURPOSE-RELEVANT BACKGROUND
`;
    purposeBackground.forEach((item) => {
      const detailsText = item.keyDetails.length > 0 ? `\n- Key Details: ${item.keyDetails.join(' | ')}` : '';
      const statusText = item.listingStatus ? `\n- Status: ${item.listingStatus}` : '';
      md += `### ${item.title} (${item.category})
- Date: ${item.publishedDate}${statusText}
- Summary: ${item.summary}${detailsText}
- Relevance to Meeting: ${item.relevanceToMeeting}
- Source: [${item.sourceTitle}](${item.sourceUrl})\n\n`;
    });
  }

  md += `---

## COMPANY NEWS & ANNOUNCEMENTS
`;
  if (companyNews.length > 0) {
    companyNews.forEach((news) => {
      md += `### ${news.headline}
- Date: ${news.publishedDate}
- Summary: ${news.summary}
- Why It Matters: ${news.whyItMatters}
- Relevance to Meeting: ${news.relevanceToMeeting}
- Source: [${news.sourceTitle}](${news.sourceUrl})\n\n`;
    });
  } else {
    md += `No major public company news confirmed in the 30-day window.\n\n`;
  }

  md += `---

## PRODUCT & TECHNOLOGY UPDATES
`;
  if (productTechUpdates.length > 0) {
    productTechUpdates.forEach((pt) => {
      md += `### ${pt.headline}
- Date: ${pt.publishedDate}
- Summary: ${pt.summary}
- Why It Matters: ${pt.whyItMatters}
- Source: [${pt.sourceTitle}](${pt.sourceUrl})\n\n`;
    });
  } else {
    md += `No recent product or technical announcements recorded.\n\n`;
  }

  md += `---

## PEOPLE & LEADERSHIP UPDATES
`;
  if (peopleLeadershipUpdates.length > 0) {
    peopleLeadershipUpdates.forEach((pl) => {
      md += `### ${pl.headline}
- Date: ${pl.publishedDate}
- Summary: ${pl.summary}
- Relevance to Meeting: ${pl.relevanceToMeeting}
- Source: [${pl.sourceTitle}](${pl.sourceUrl})\n\n`;
    });
  } else {
    md += `No verified executive hiring or leadership changes recorded.\n\n`;
  }

  md += `---

## KEY STRATEGIC INSIGHTS
`;
  keyInsights.forEach((insight, idx) => {
    md += `${idx + 1}. ${insight}\n`;
  });

  md += `\n---\n\n## RISKS & WATCH ITEMS\n`;
  if (risks.length > 0) {
    risks.forEach((risk) => {
      md += `- **${risk.risk}**: ${risk.rationale}\n  Source: [${risk.sourceTitle}](${risk.sourceUrl})\n\n`;
    });
  } else {
    md += `No evidence-backed risks were identified in the retrieved sources.\n`;
  }

  md += `\n---\n\n## MEETING DISCUSSION POINTS\n`;
  meetingDiscussionPoints.forEach((dp, idx) => {
    md += `### Point ${idx + 1}: ${dp.point}
Context: ${dp.context}
Suggested Opener: "${dp.suggestedOpener}"\n\n`;
  });

  md += `---

## 5 QUESTIONS TO ASK
`;
  questionsToAsk.forEach((q) => {
    md += `${q.number}. **${q.question}** [Topic: ${q.topic}]
   Rationale: ${q.rationale}\n\n`;
  });

  md += `---

## SOURCES & REFERENCES (Powered by Tavily)
`;
  sources.forEach((s, idx) => {
    md += `${idx + 1}. [${s.title}](${s.url}) (Published: ${s.publishedDate})\n   Snippet: ${s.snippet}\n\n`;
  });

  md += `\n_Report prepared by MeetBrief · Web research powered by Tavily Search API · Synthesized by ${briefing.researchMetadata.aiProvider || 'AI provider'} (${briefing.researchMetadata.aiModel || 'model unavailable'})_\n`;

  return md;
}

export function copyBriefingToClipboard(briefing: MeetingBriefing): Promise<void> {
  const text = formatBriefingAsMarkdown(briefing);
  return navigator.clipboard.writeText(text);
}

export function printBriefing(): void {
  window.print();
}

export function downloadBriefingAsFile(briefing: MeetingBriefing): void {
  const text = formatBriefingAsMarkdown(briefing);
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = briefing.request.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.href = url;
  a.download = `meetbrief_${safeName}_${briefing.request.meetingDate}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
