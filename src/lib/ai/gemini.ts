const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;

export function hasGeminiConfig() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function getGeminiBaseUrl() {
  return (process.env.GEMINI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
}

function getGeminiTimeoutMs() {
  const raw = process.env.GEMINI_TIMEOUT_MS;
  if (!raw) return DEFAULT_TIMEOUT_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function errorName(error: unknown): string {
  if (error && typeof error === 'object' && 'name' in error) {
    return String((error as { name: unknown }).name);
  }
  return '';
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return typeof error === 'string' ? error : '';
}

export function isAbortOrTimeoutError(error: unknown): boolean {
  const name = errorName(error);
  const message = errorMessage(error).toLowerCase();
  if (name === 'TimeoutError' || name === 'AbortError') return true;
  if (message.includes('aborted due to timeout')) return true;
  if (message.includes('the operation was aborted')) return true;
  if (message.includes('timed out')) return true;
  return false;
}

export function toPlainError(error: unknown, fallback: string): Error {
  if (isAbortOrTimeoutError(error)) {
    return new Error(fallback);
  }
  if (error instanceof Error) return error;
  const message = errorMessage(error);
  return new Error(message || fallback);
}

export async function generateGeminiJson(
  prompt: string,
  options?: { timeoutMs?: number; maxOutputTokens?: number }
): Promise<{
  model: string;
  text: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI provider is not configured.');
  }

  const model = getGeminiModel();
  const url = `${getGeminiBaseUrl()}/models/${model}:generateContent?key=${apiKey}`;
  const timeoutMs = options?.timeoutMs ?? getGeminiTimeoutMs();
  const maxOutputTokens = options?.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
  const supportsThinking = /gemini-3\.5|gemini-3-flash|gemini-3\.0/i.test(model);

  const generationConfig: Record<string, unknown> = {
    responseMimeType: 'application/json',
    maxOutputTokens,
  };
  if (supportsThinking) {
    generationConfig.thinkingConfig = { thinkingLevel: 'minimal' };
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw toPlainError(
      error,
      `AI request timed out after ${Math.round(timeoutMs / 1000)}s.`
    );
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI request failed (${response.status}): ${body.slice(0, 400)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
  if (!text.trim()) {
    throw new Error('AI provider returned an empty response.');
  }

  return { model, text };
}
