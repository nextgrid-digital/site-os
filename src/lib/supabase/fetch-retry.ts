function isTransientFetchError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { message?: string; cause?: { code?: string; message?: string } };
  const code = err.cause?.code ?? '';
  const message = `${err.message ?? ''} ${err.cause?.message ?? ''}`.toLowerCase();
  return (
    code === 'ENOTFOUND' ||
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'UND_ERR_CONNECT_TIMEOUT' ||
    message.includes('fetch failed') ||
    message.includes('enotfound') ||
    message.includes('network')
  );
}

/** Retry transient DNS/network failures when talking to Supabase. */
export async function fetchWithSupabaseRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  attempts = 3
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (!isTransientFetchError(error) || attempt === attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }
  throw lastError;
}
