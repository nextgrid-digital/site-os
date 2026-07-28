import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isAbortOrTimeoutError, toPlainError } from '@/lib/ai/gemini';
import { runAeoAnalysis } from '@/lib/aeo/run-aeo-analysis';

test('runAeoAnalysis skips when AI provider key is missing', async () => {
  const previous = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const result = await runAeoAnalysis({
      websiteUrl: 'https://example.com',
      projectName: 'Example',
      intake: null,
      pages: [],
      gscQueries: [],
      gscPages: [],
      ga4Pages: [],
      findings: [],
    });

    assert.equal(result.status, 'skipped');
    assert.equal(result.analysis, null);
    assert.match(result.error_message ?? '', /AI provider is not configured/i);
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});

test('isAbortOrTimeoutError detects raw AbortSignal timeout text', () => {
  assert.equal(
    isAbortOrTimeoutError({ name: 'TimeoutError', message: 'The operation was aborted due to timeout' }),
    true
  );
  assert.equal(isAbortOrTimeoutError(new Error('something else')), false);
});

test('toPlainError never returns raw abort wording', () => {
  const plain = toPlainError(
    { name: 'AbortError', message: 'The operation was aborted due to timeout' },
    'AI request timed out after 120s.'
  );
  assert.match(plain.message, /timed out after 120s/);
  assert.doesNotMatch(plain.message, /operation was aborted/i);
});
