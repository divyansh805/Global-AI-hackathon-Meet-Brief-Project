# MeetBrief — AI-Powered Meeting Intelligence & Research Agent

> "Walk Into Every Meeting Prepared."  
> *Research smarter. Understand deeper. Connect better.*

Built for the **Tavily Research Agent Challenge**.

---

## 1. Problem Statement

> **"Build a Tavily Research Agent that prepares a concise, one-page briefing before a meeting. Given a company or person and a scheduled meeting time, the agent researches relevant developments from the preceding 30 days, including news, launches, hires and other important updates. The briefing provides source-backed findings, useful discussion points and open questions to help users prepare for meaningful conversations."**

MeetBrief fulfills this exact problem statement. Rather than acting as a generic conversational chatbot or displaying static dashboards, MeetBrief is an autonomous, full-stack intelligence agent engineered specifically for meeting preparation.

---

## 2. Three Core Features

MeetBrief focuses strictly on three integrated capabilities:

1. **Meeting Briefing**
   - Research an organization or individual counterparty before any critical discussion.
   - Anchored to the 30 calendar days preceding the meeting date.
   - Generates an executive summary, chronological timeline, verified company updates, and product/tech developments.
   - Includes full **Meeting Prep** inside the briefing: contextual talking points with conversational openers, and 5 non-generic discussion questions.
   - Provides optional **Competitor Comparison** to analyze market rival moves and positioning.

2. **News Intelligence**
   - Perform rapid 30-day web intelligence sweeps on any enterprise or market sector.
   - Categorizes updates into Product Launches, Leadership & Hiring, Partnerships & Deals, and Corporate Announcements.
   - Every finding is linked to the original verified source URL.
   - Allows instant saving into the Research Vault or 1-click transition into a full Meeting Briefing.

3. **Research Vault**
   - Unified local archive for all generated Meeting Briefings and News Intelligence reports.
   - Real-time search across counterparties, topics, and dates.
   - 1-click report reopen, print-optimized export, and markdown download.

- **Dual-Theme Light / Dark Mode**: Full instant theme toggle with Sun/Moon affordance, persistent in localStorage, tailored across every card, form, and report.
- **Enhanced Typography & Readability**: High-legibility 15–16px body text, 14–15px metadata/card descriptions, and WCAG AA contrast.

---

## 3. Sidebar Navigation

The application uses a focused, dedicated workspace layout:
- **Overview**: High-level dashboard showcasing the three core capabilities and recent intelligence in the vault.
- **Meeting Briefing**: The briefing generation workspace and report viewer.
- **News Intelligence**: Targeted market and company news discovery tool.
- **Research Vault**: The persistent repository for all saved intelligence assets.
- **Settings**: Live service health monitoring for Tavily and all three AI providers, research guardrails, and vault cache management.

```
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│   User Enters   │ ────> │  React 19 SPA   │ ────> │  Express.js Backend    │
│ Meeting Details │       │ (Validation UI) │       │ (Window & Query Calc)  │
└─────────────────┘       └─────────────────┘       └───────────┬────────────┘
                                                                │
                                                                ▼
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│ One-Page Brief  │ <──── │ Gemini → Groq → OpenRouter │ <──── │ Tavily Search API │
│ Report & Action │       │ Grounded Synth  │       │ (Targeted 30-Day News) │
└─────────────────┘       └─────────────────┘       └────────────────────────┘
```

### Architecture Pipeline:
1. **User Request**: User inputs Company name, optional Person name, Meeting Date, Meeting Time, Meeting Purpose, and optional Context.
2. **Validation & Anchor Math**: `ValidationService` sanitizes inputs and `TavilyService.calculateDateWindow()` computes the exact 30-day period preceding `meetingDate`.
3. **Tavily Query Orchestration**: Backend runs multi-faceted targeted searches via `POST https://api.tavily.com/search`:
   - `"${companyName}" news announcements updates`
   - `"${companyName}" product launch technology updates feature`
   - A person-specific leadership search, or a company leadership and hiring search when no person is specified.
4. **Evidence Sanitization & Date Filtering**: Extracts publication dates, removes duplicates, validates date bounds, and formats source metadata.
5. **AI Synthesis Engine**: Uses Gemini first and verifies model `generateContent` support. On quota/rate-limit, service-unavailable, or timeout errors, it falls back to Groq and then OpenRouter. Groq and OpenRouter models are discovered from their official APIs; OpenRouter selects only free models. All providers receive the same Tavily evidence, without repeating searches.
6. **Delivery & Export**: Sends structured briefing back to React frontend; automatically persists to localStorage; provides Print, Copy, and Markdown export tools.

---

## 4. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Plus Jakarta Sans typography.
- **Backend**: Node.js, Express.js, TypeScript, Vite middleware mode in development.
- **Research Engine**: Official Tavily Search API (`POST https://api.tavily.com/search`).
- **AI Synthesis**: Google Gemini via `@google/genai` TypeScript SDK (primary), Groq (first fallback), and OpenRouter free models (second fallback).

---

## 5. Environment Variables & Setup

Copy `.env.example` to `.env` in the project root (next to `package.json` and `server.ts`), then add your API keys:

```bash
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
TAVILY_API_KEY=
PORT=
```

Add credentials locally to `.env`; do not commit them. API keys are read by the server only and are never sent to the frontend. `.env.example` contains empty placeholders only. OpenRouter uses free models exclusively and never silently falls back to a paid model.

---

## 6. Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

   This command starts the Express API and Vite frontend together. Use the root URL above; opening Vite's standalone preview server will not connect to the API.

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```
   To serve the built app and API together for a local production preview, run `npm run build` followed by `npm run preview`.

---

## 7. Verification & Testing

- **Backend Health Check**: `GET /api/status` returns operational state and API key readiness.
- **Research Briefing Endpoint**: `POST /api/research/briefing` accepts `{ companyName, personName, meetingDate, meetingTime, meetingPurpose, additionalContext }`.
- **Responsive Layout**: Tested across desktop (1440px), tablet, and mobile viewports.
- **Print Layout**: Triggers clean, document-ready executive brief without navigation or buttons.

---

## 8. License

Apache-2.0
