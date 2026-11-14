export type FallbackProviderName = 'Groq' | 'OpenRouter';

export interface ProviderCompletion {
  text: string;
  provider: FallbackProviderName;
  model: string;
}

interface ProviderModel {
  id: string;
  active?: boolean;
  context_length?: number;
  context_window?: number;
  supported_parameters?: string[];
  architecture?: {
    modality?: string;
  };
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
}

interface ProviderError extends Error {
  statusCode?: number;
}

const GROQ_MODELS_ENDPOINT = 'https://api.groq.com/openai/v1/models';
const GROQ_COMPLETIONS_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_MODELS_ENDPOINT = 'https://openrouter.ai/api/v1/models';
const OPENROUTER_COMPLETIONS_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DISCOVERY_TIMEOUT_MS = 10000;
const COMPLETION_TIMEOUT_MS = 35000;
const MAX_COMPLETION_TOKENS = 6000;

export function configuredKey(name: 'GROQ_API_KEY' | 'OPENROUTER_API_KEY'): string | undefined {
  const value = process.env[name]?.trim();
  return value && !value.startsWith('your-') && !value.includes('xxxxxxxx') ? value : undefined;
}

export function hasConfiguredFallbackProvider(): boolean {
  return Boolean(configuredKey('GROQ_API_KEY') || configuredKey('OPENROUTER_API_KEY'));
}

function providerError(provider: FallbackProviderName, message: string, statusCode?: number): ProviderError {
  const error = new Error(`${provider}: ${message}`) as ProviderError;
  error.statusCode = statusCode;
  return error;
}

function safeErrorMessage(value: unknown): string {
  if (typeof value !== 'string') return '';
  let message = value;
  for (const key of [process.env.GEMINI_API_KEY, process.env.GROQ_API_KEY, process.env.OPENROUTER_API_KEY]) {
    if (key?.trim()) message = message.replaceAll(key, '[REDACTED]');
  }
  return message.slice(0, 240);
}

async function fetchJson(
  provider: FallbackProviderName,
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const bodyRecord =
        typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : undefined;
      const errorRecord =
        typeof bodyRecord?.error === 'object' && bodyRecord.error !== null
          ? (bodyRecord.error as Record<string, unknown>)
          : undefined;
      const detail = safeErrorMessage(errorRecord?.message);
      throw providerError(
        provider,
        detail ? `${detail} (HTTP ${response.status})` : `request failed (HTTP ${response.status})`,
        response.status
      );
    }
    return body;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw providerError(provider, `request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getModelList(value: unknown): ProviderModel[] {
  if (typeof value !== 'object' || value === null || !('data' in value) || !Array.isArray(value.data)) {
    throw new Error('model discovery returned an invalid response.');
  }
  return value.data.filter(
    (model): model is ProviderModel =>
      typeof model === 'object' &&
      model !== null &&
      'id' in model &&
      typeof model.id === 'string' &&
      model.id.length > 0
  );
}

function isChatModel(id: string): boolean {
  return !/(embed|whisper|guard|moderation|tts|speech|transcri|rerank|image)/i.test(id);
}

function stripTrailingCommas(jsonText: string): string {
  let result = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < jsonText.length; i++) {
    const ch = jsonText[i];
    if (inString) {
      result += ch;
      if (escapeNext) {
        escapeNext = false;
      } else if (ch === '\\') {
        escapeNext = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      result += ch;
      continue;
    }

    if (ch === ',') {
      let lookahead = i + 1;
      while (lookahead < jsonText.length && /\s/.test(jsonText[lookahead])) {
        lookahead++;
      }
      if (lookahead < jsonText.length && (jsonText[lookahead] === '}' || jsonText[lookahead] === ']')) {
        continue;
      }
    }

    result += ch;
  }

  return result;
}

export function parseJsonObjectSafely(rawText: string): Record<string, unknown> {
  const tryParse = (candidate: string): Record<string, unknown> | undefined => {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // fall through to repaired parse
    }
    try {
      const repaired = stripTrailingCommas(candidate);
      const parsed: unknown = JSON.parse(repaired);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return undefined;
    }
    return undefined;
  };

  const trimmed = rawText.trim();
  const direct = tryParse(trimmed);
  if (direct) return direct;

  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const fromUnfenced = tryParse(unfenced);
  if (fromUnfenced) return fromUnfenced;

  const firstBrace = unfenced.indexOf('{');
  const lastBrace = unfenced.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = unfenced.slice(firstBrace, lastBrace + 1);
    const fromExtracted = tryParse(extracted);
    if (fromExtracted) return fromExtracted;
  }

  // Re-throw standard parse error on cleaned candidate for diagnostics
  JSON.parse(stripTrailingCommas(unfenced));
  throw new Error('Model response was not a valid JSON object.');
}

function hasValidJson(text: string): boolean {
  try {
    parseJsonObjectSafely(text);
    return true;
  } catch {
    return false;
  }
}

function chooseGroqModels(models: ProviderModel[]): string[] {
  const eligible = models.filter((model) => model.active !== false && isChatModel(model.id));
  const preferred = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
  ];
  const prioritized = preferred
    .map((id) => eligible.find((model) => model.id === id))
    .filter((model): model is ProviderModel => Boolean(model));
  const remaining = eligible
    .filter((model) => (model.context_window ?? model.context_length ?? 0) >= 8000)
    .sort((a, b) => (b.context_window ?? b.context_length ?? 0) - (a.context_window ?? a.context_length ?? 0));
  const selected = [...prioritized, ...remaining.filter((model) => !prioritized.includes(model))];
  return selected.slice(0, 3).map((model) => model.id);
}

function isFreeModel(model: ProviderModel): boolean {
  if (model.id.endsWith(':free')) return true;
  const promptPrice = model.pricing?.prompt;
  const completionPrice = model.pricing?.completion;
  if (
    (typeof promptPrice !== 'string' && typeof promptPrice !== 'number') ||
    (typeof completionPrice !== 'string' && typeof completionPrice !== 'number')
  ) {
    return false;
  }
  const prompt = Number(promptPrice);
  const completion = Number(completionPrice);
  return Number.isFinite(prompt) && Number.isFinite(completion) && prompt === 0 && completion === 0;
}

function chooseOpenRouterModels(models: ProviderModel[]): string[] {
  const eligible = models.filter(
    (model) =>
      isFreeModel(model) &&
      isChatModel(model.id) &&
      model.architecture?.modality?.endsWith('->text') &&
      model.supported_parameters?.includes('response_format')
  );
  const preferred = [
    'baidu/ernie-5.5-flash-preview:free',
    'google/gemma-4-31b-it:free',
    'recursive/flint-v1.0:free',
    'qwen/qwen3-235b-a22b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'liquid/lfm-3-1.7b:free',
  ];
  const prioritized = preferred
    .map((id) => eligible.find((model) => model.id === id))
    .filter((model): model is ProviderModel => Boolean(model));
  const remaining = eligible
    .filter((model) => (model.context_length ?? 0) >= 8000)
    .sort((a, b) => (b.context_length ?? 0) - (a.context_length ?? 0));
  const selected = [...prioritized, ...remaining.filter((model) => !prioritized.includes(model))];
  return selected.slice(0, 3).map((model) => model.id);
}

async function completeWithProvider(
  provider: FallbackProviderName,
  systemInstruction: string,
  prompt: string,
  validateOutput?: (text: string) => boolean
): Promise<ProviderCompletion> {
  const keyName = provider === 'Groq' ? 'GROQ_API_KEY' : 'OPENROUTER_API_KEY';
  const key = configuredKey(keyName);
  if (!key) throw providerError(provider, `${keyName} is not configured on the server.`);

  const modelsUrl = provider === 'Groq' ? GROQ_MODELS_ENDPOINT : OPENROUTER_MODELS_ENDPOINT;
  const completionUrl = provider === 'Groq' ? GROQ_COMPLETIONS_ENDPOINT : OPENROUTER_COMPLETIONS_ENDPOINT;
  const modelsResponse = await fetchJson(
    provider,
    modelsUrl,
    { headers: { Authorization: `Bearer ${key}` } },
    DISCOVERY_TIMEOUT_MS
  );
  const models = getModelList(modelsResponse);
  const candidateModels =
    provider === 'Groq'
      ? chooseGroqModels(models)
      : chooseOpenRouterModels(models);
  if (candidateModels.length === 0) {
    throw providerError(
      provider,
      provider === 'OpenRouter'
        ? 'no eligible free chat model is currently available; paid models will not be used.'
        : 'no supported chat model with sufficient context was returned by model discovery.'
    );
  }

  const messages = [
    ...(systemInstruction.trim() ? [{ role: 'system', content: systemInstruction }] : []),
    { role: 'user', content: prompt },
  ];
  const requestHeaders: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (provider === 'OpenRouter') {
    requestHeaders['HTTP-Referer'] = 'https://meetbrief.app';
    requestHeaders['X-Title'] = 'MeetBrief';
  }

  const failures: string[] = [];
  for (const model of candidateModels) {
    try {
      const response = await fetchJson(
        provider,
        completionUrl,
        {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            model,
            messages,
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: MAX_COMPLETION_TOKENS,
          }),
        },
        COMPLETION_TIMEOUT_MS
      );
      if (typeof response !== 'object' || response === null || !('choices' in response)) {
        throw providerError(provider, `model ${model} returned an invalid chat completion response.`);
      }
      const choices = response.choices;
      if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== 'object') {
        throw providerError(provider, `model ${model} returned no completion choices.`);
      }
      const message = (choices[0] as Record<string, unknown>).message;
      if (
        typeof message !== 'object' ||
        message === null ||
        !('content' in message) ||
        typeof message.content !== 'string' ||
        !message.content.trim()
      ) {
        throw providerError(provider, `model ${model} returned empty content.`);
      }
      if (!hasValidJson(message.content)) {
        throw providerError(provider, `model ${model} returned malformed or truncated JSON.`);
      }
      if (validateOutput && !validateOutput(message.content)) {
        throw providerError(provider, `model ${model} returned an incomplete JSON structure.`);
      }

      console.info(`[AIProvider] provider=${provider} model=${model} status=success`);
      return { text: message.content, provider, model };
    } catch (error: unknown) {
      const message = error instanceof Error ? safeErrorMessage(error.message) : 'unknown provider error';
      failures.push(message);
      console.warn(`[AIProvider] provider=${provider} model=${model} status=failure reason=${message}`);
    }
  }

  throw new Error(failures.join(' '));
}

export class OpenAICompatibleProviderService {
  static generateWithProvider(
    provider: FallbackProviderName,
    systemInstruction: string,
    prompt: string,
    validateOutput?: (text: string) => boolean
  ): Promise<ProviderCompletion> {
    return completeWithProvider(provider, systemInstruction, prompt, validateOutput);
  }

  static async generate(
    systemInstruction: string,
    prompt: string,
    validateOutput?: (text: string) => boolean
  ): Promise<ProviderCompletion> {
    const failures: string[] = [];
    for (const provider of ['Groq', 'OpenRouter'] as const) {
      try {
        return await this.generateWithProvider(provider, systemInstruction, prompt, validateOutput);
      } catch (error: unknown) {
        const message = error instanceof Error ? safeErrorMessage(error.message) : 'unknown provider error';
        failures.push(message);
        console.warn(`[AIProvider] provider=${provider} status=failure reason=${message}`);
      }
    }

    throw new Error(`All configured AI providers failed. ${failures.join(' ')}`);
  }
}
