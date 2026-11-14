# MeetBrief — AI-Powered Pre-Meeting Research Assistant

<p align="center">
  <strong>Walk Into Every Meeting Prepared.</strong>
</p>

<p align="center">
  Turn scattered information into actionable meeting intelligence with AI-powered web research.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Geek%20Room-Global%20AI%20Hackathon%202026-6C63FF?style=for-the-badge" alt="Geek Room Hackathon"/>
  <img src="https://img.shields.io/badge/Problem%20Statement-Tavily%20Research%20Agent-00A67E?style=for-the-badge" alt="Tavily Research Agent"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square"/>
  <img src="https://img.shields.io/badge/Research-Tavily-7C3AED?style=flat-square"/>
  <img src="https://img.shields.io/badge/Fallback-Groq-orange?style=flat-square"/>
  <img src="https://img.shields.io/badge/Fallback-OpenRouter-black?style=flat-square"/>
</p>

---

## 📌 Overview

**MeetBrief** is an AI-powered pre-meeting research assistant that helps individuals prepare for important conversations with relevant, recent, and source-backed information.

Preparing for a meeting often involves searching through multiple websites, reading scattered updates, identifying important developments, and figuring out the right questions to ask.

MeetBrief simplifies this process.

Provide a company or person's name, meeting date, purpose, and relevant context. MeetBrief researches developments from the preceding 30 days and transforms the collected information into a structured **Meeting Intelligence Report**.

Instead of spending hours researching before a meeting, users get a focused briefing to help them walk in informed and prepared.

## 🎯 Problem Statement

**Tavily Research Agent — Pre-Meeting Briefing Agent**

People frequently enter interviews, business discussions, client meetings, and professional conversations without sufficient knowledge of the person or organisation they are meeting.

Existing research methods are often:
- Time-consuming and scattered across multiple sources.
- Difficult to organise into meeting-relevant insights.
- Dependent on manually identifying recent developments.
- Insufficient for preparing meaningful discussion points and questions.

**Our approach:** Automate pre-meeting research and convert recent web information into actionable meeting intelligence.

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔎 Intelligent Web Research | Retrieves relevant information using Tavily. |
| 📅 30-Day Intelligence Window | Focuses research on developments preceding the scheduled meeting. |
| 🏢 Company & Person Research | Helps users prepare for company-focused and person-focused meetings. |
| 🎯 Meeting Context | Accepts meeting purpose and additional context to guide report generation. |
| 📰 Recent Developments | Organises relevant news, launches, hiring updates, and other developments found during research. |
| 📚 Source-Backed Findings | Presents references so users can examine the underlying information. |
| 💬 Discussion Points | Generates useful topics to bring into the conversation. |
| ❓ Smart Questions | Suggests relevant questions to ask during the meeting. |
| 🛡️ AI Provider Fallbacks | Supports alternative AI providers when the primary provider is unavailable. |

## ⚙️ How It Works

<p align="center">
  <strong>From Meeting Details to Meeting Intelligence</strong>
</p>

```text
       USER INPUT
            │
            ▼
   Meeting Information
   • Company / Person
   • Meeting Date
   • Meeting Purpose
   • Additional Context
            │
            ▼
    RESEARCH ORCHESTRATION
            │
            ▼
       TAVILY API
   Real-Time Web Research
            │
            ▼
     EVIDENCE PROCESSING
   Relevant Research Findings
            │
            ▼
      GOOGLE GEMINI
   AI Analysis & Synthesis
            │
            ▼
    MEETING INTELLIGENCE
            │
     ┌──────┼────────┐
     ▼      ▼        ▼
  Recent  Discussion Smart
  Updates   Points  Questions
     │      │        │
     └──────┼────────┘
            ▼
      FINAL BRIEFING
```

## 🧠 Technology Stack

| Technology | Role |
|---|---|
| Tavily API | Web search and research retrieval |
| Google Gemini | Primary AI model for analysing information and generating reports |
| Groq | First fallback AI provider |
| OpenRouter | Secondary fallback AI provider |
| Frontend | User interface and report presentation |
| Backend | API handling, research orchestration, and report generation |

### AI Provider Strategy

MeetBrief uses a primary and fallback approach for AI generation:

```text
        AI REQUEST
             │
             ▼
      GOOGLE GEMINI
        (Primary)
             │
       If unavailable
             ▼
           GROQ
      (First Fallback)
             │
       If unavailable
             ▼
        OPENROUTER
     (Second Fallback)
```

Tavily handles the research stage, while the AI providers support the analysis and report-generation stage.

## 📊 Meeting Intelligence Report

MeetBrief transforms research into an organised report containing:

| Report Section | Purpose |
|---|---|
| Executive Summary | Understand the most important findings quickly. |
| Recent Developments | Review relevant developments within the research window. |
| Key Findings | Identify information worth knowing before the meeting. |
| Sources & References | Explore the original information behind findings. |
| Discussion Points | Prepare meaningful topics for conversation. |
| Open Questions | Identify useful questions to ask during the meeting. |

## 🌍 Real-World Applications

MeetBrief can support preparation across different professional scenarios:

- **Job Interviews:** Understand the organisation, its recent developments, and relevant industry context.
- **Internship Discussions:** Research internship programmes, opportunities, eligibility, and relevant technical areas where information is available.
- **Business Meetings:** Review company strategy, product developments, and important announcements.
- **Client Meetings:** Prepare with relevant organisational information.
- **Partnership Discussions:** Explore developments and potential areas of collaboration.
- **Professional Networking:** Understand the background of people and organisations before conversations.

## 🏗️ Project Architecture

The system is organised around four major stages:

1. **Input Layer:** Collects meeting details and user context.
2. **Research Layer:** Uses Tavily to retrieve relevant web information.
3. **Intelligence Layer:** Processes research through the configured AI provider.
4. **Presentation Layer:** Displays the generated meeting intelligence report.

The architecture separates web research from AI synthesis, allowing each stage to perform its specific responsibility.

## 🚀 Getting Started

Follow these steps to run MeetBrief locally.

### Prerequisites

- Node.js and npm
- Git
- API credentials for the configured services

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/MeetBrief.git
```

### 2. Navigate to the Project

```bash
cd MeetBrief
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

Add the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_PRIMARY_MODEL=your_gemini_model_id
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Replace the placeholder values with your own API credentials.

**Important:** Never upload your `.env` file or expose API keys in your public repository.

### 5. Start the Application

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## 🔐 Security & Reliability

- API credentials are configured through environment variables.
- API keys should remain on the server side and must not be exposed in frontend code.
- AI fallback providers help maintain report-generation availability.
- Source references allow users to inspect the original research.
- Generated information should be checked against its cited sources before being used in important decisions.

## 🔮 Future Scope

MeetBrief can be expanded with:

- More research source integrations.
- Enhanced purpose-aware research and ranking.
- Multilingual meeting briefings.
- Calendar and scheduling integrations.
- Personalised research preferences.
- Improved source-quality and factual consistency evaluation.

These are potential improvements and should not be confused with existing implemented features.

## 🏆 Hackathon Submission

| Detail | Information |
|---|---|
| Event | Geek Room Global AI Hackathon 2026 |
| Selected Problem Statement | Tavily Research Agent |
| Project | MeetBrief |
| Core Research Technology | Tavily API |
| Primary AI | Google Gemini |
| AI Fallbacks | Groq and OpenRouter |
| Category | AI Research & Productivity |

## 👨‍💻 Author

**Divyansh Srivastava**

Computer Science & Engineering Student

Built as part of the Geek Room Global AI Hackathon 2026.

---

<p align="center">
  <strong>MeetBrief</strong>
  <br/>
  Research Before. Confidence During.
  <br/><br/>
  <em>Better preparation leads to better conversations.</em>
</p>
