import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

function redactSecrets(message: string): string {
  let sanitized = message;
  for (const secret of [
    process.env.GEMINI_API_KEY,
    process.env.GROQ_API_KEY,
    process.env.OPENROUTER_API_KEY,
    process.env.TAVILY_API_KEY,
  ]) {
    if (secret && secret.trim().length > 0) {
      sanitized = sanitized.replaceAll(secret, '[REDACTED]');
    }
  }
  return sanitized;
}

async function startServer() {
  const { BriefingService } = await import('./server/services/briefingService.js');
  const { configuredKey } = await import('./server/services/openAICompatibleProviderService.js');
  const app = express();
  const portArgIndex = process.argv.indexOf('--port');
  const cliPort =
    portArgIndex !== -1 && process.argv[portArgIndex + 1]
      ? parseInt(process.argv[portArgIndex + 1], 10)
      : NaN;
  const envPort =
    process.env.PORT && process.env.PORT !== '8080'
      ? parseInt(process.env.PORT, 10)
      : NaN;
  const PORT = Number.isFinite(cliPort)
    ? cliPort
    : Number.isFinite(envPort)
    ? envPort
    : 3000;

  app.use(express.json({ limit: '2mb' }));

  // API logging and default JSON Content-Type header
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const startTime = Date.now();
    res.on('finish', () => {
      console.log(`[API ${req.method}] ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startTime}ms)`);
    });
    next();
  });

  // Health and API Status
  app.get(['/api/status', '/api/status/'], (_req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY?.trim() || '';
    const tavilyKey = process.env.TAVILY_API_KEY?.trim() || '';
    const hasGemini = Boolean(
      geminiKey &&
        geminiKey !== 'MY_GEMINI_API_KEY' &&
        !geminiKey.startsWith('your-') &&
        !geminiKey.includes('xxxxxxxx')
    );
    const hasTavily = Boolean(
      tavilyKey &&
        !tavilyKey.includes('MY_GEMINI') &&
        !tavilyKey.includes('tvly-xxxxxxxxxxxx') &&
        !tavilyKey.startsWith('your-')
    );
    const hasGroq = Boolean(configuredKey('GROQ_API_KEY'));
    const hasOpenRouter = Boolean(configuredKey('OPENROUTER_API_KEY'));

    res.json({
      status: 'operational',
      hasGeminiKey: hasGemini,
      hasGroqKey: hasGroq,
      hasOpenRouterKey: hasOpenRouter,
      hasTavilyKey: hasTavily,
      tavilyProvider: 'Tavily Search API (POST https://api.tavily.com/search)',
      aiProviderOrder: ['Google Gemini', 'Groq', 'OpenRouter'],
      aiPrimaryModel: process.env.GEMINI_PRIMARY_MODEL || 'gemini-3.8-flash',
    });
  });

  // Briefing Generation Endpoint
  app.post(['/api/research/briefing', '/api/research/briefing/'], async (req, res) => {
    try {
      const briefing = await BriefingService.generateMeetingBriefing(req.body);
      res.json(briefing);
    } catch (error: unknown) {
      const errorObj = error as Record<string, unknown> | undefined;
      const errorType = (errorObj?.errorType as string) || 'UNKNOWN';
      const rawMessage = redactSecrets(
        error instanceof Error ? error.message : 'An unknown error occurred during research.'
      );

      console.error(`[POST /api/research/briefing] Error [${errorType}]:`, rawMessage);

      if (errorType === 'AI_PROVIDER_ERROR') {
        res.status(503).json({
          error: rawMessage,
          errorType,
          canRetryAnalysis: true,
          cachedEvidence: errorObj?.cachedEvidence || [],
          dateWindow: errorObj?.dateWindow,
          queriesRun: errorObj?.queriesRun || [],
          sources: errorObj?.sources || [],
        });
        return;
      }

      if (errorType === 'TAVILY_ERROR' || rawMessage.toLowerCase().includes('tavily')) {
        res.status(502).json({
          error: rawMessage,
          errorType: 'TAVILY_ERROR',
          canRetryAnalysis: false,
        });
        return;
      }

      res.status(400).json({
        error: rawMessage,
        errorType: rawMessage.toLowerCase().includes('validation') ? 'VALIDATION_ERROR' : 'UNKNOWN',
        canRetryAnalysis: false,
      });
    }
  });

  // News Intelligence Endpoint
  app.post(['/api/research/news', '/api/research/news/'], async (req, res) => {
    try {
      const { query } = req.body;
      const report = await BriefingService.generateNewsIntelligence(query);
      res.json(report);
    } catch (error: unknown) {
      const errorObj = error as Record<string, unknown> | undefined;
      const errorType = (errorObj?.errorType as string) || 'UNKNOWN';
      const rawMessage = redactSecrets(
        error instanceof Error ? error.message : 'An unknown error occurred during news research.'
      );

      console.error(`[POST /api/research/news] Error [${errorType}]:`, rawMessage);

      if (errorType === 'AI_PROVIDER_ERROR') {
        res.status(503).json({
          error: rawMessage,
          errorType,
          canRetryAnalysis: true,
        });
        return;
      }

      res.status(errorType === 'TAVILY_ERROR' ? 502 : 400).json({
        error: rawMessage,
        errorType,
        canRetryAnalysis: false,
      });
    }
  });

  // Explicit API 404 Handler - MUST come before Vite middleware to NEVER serve index.html for API routes
  app.use('/api', (req, res) => {
    console.warn(`[API 404] Unhandled route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl}`,
      errorType: 'NOT_FOUND',
      canRetryAnalysis: false,
    });
  });

  // Global Error Handler for API routes
  app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api')) {
      const errObj = err as { status?: number; statusCode?: number; message?: string } | undefined;
      const statusCode =
        typeof errObj?.status === 'number'
          ? errObj.status
          : typeof errObj?.statusCode === 'number'
          ? errObj.statusCode
          : 500;
      const message = err instanceof Error ? redactSecrets(err.message) : 'Internal Server Error';
      console.error('[API Uncaught Error]:', message);
      res.status(statusCode).json({
        error: message,
        errorType: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
        canRetryAnalysis: false,
      });
      return;
    }
    next(err);
  });

  // Dev server or Production static serving
  const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MeetBrief server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
    console.log(`\n  Local: http://localhost:${PORT}/`);
  });
}

startServer().catch((err: unknown) => {
  const message = err instanceof Error ? redactSecrets(err.message) : 'Unknown startup error.';
  console.error('Failed to start MeetBrief server:', message);
  process.exit(1);
});
