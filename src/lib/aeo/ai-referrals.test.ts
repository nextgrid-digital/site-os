import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  aiSourceFilterRegex,
  classifyAiSource,
  summarizeAiReferrals,
} from '@/lib/aeo/ai-referrals';

test('classifyAiSource matches AI hosts and subdomains, not lookalikes', () => {
  assert.equal(classifyAiSource('chatgpt.com')?.id, 'chatgpt');
  assert.equal(classifyAiSource('www.perplexity.ai')?.id, 'perplexity');
  assert.equal(classifyAiSource('Perplexity')?.id, 'perplexity');
  assert.equal(classifyAiSource('gemini.google.com')?.id, 'gemini');
  assert.equal(classifyAiSource('google'), null);
  assert.equal(classifyAiSource('notchatgpt.com'), null);
  assert.equal(classifyAiSource('(direct)'), null);
});

test('aiSourceFilterRegex escapes dots', () => {
  assert.ok(aiSourceFilterRegex().includes('chatgpt\\.com'));
});

test('summarizeAiReferrals merges engines and pages, ignores non-AI rows', () => {
  const data = summarizeAiReferrals({
    rows: [
      { source: 'chatgpt.com', landingPage: '/a', sessions: 10, engagedSessions: 6, conversions: 1 },
      { source: 'chat.openai.com', landingPage: '/a', sessions: 5, engagedSessions: 2, conversions: 0 },
      { source: 'perplexity.ai', landingPage: '/b', sessions: 3, engagedSessions: 3, conversions: 2 },
      { source: 'google', landingPage: '/a', sessions: 999, engagedSessions: 0, conversions: 0 },
    ],
    daily: [
      { date: '2026-10-02', source: 'chatgpt.com', sessions: 4 },
      { date: '2026-10-01', source: 'perplexity.ai', sessions: 1 },
      { date: '2026-10-01', source: 'google', sessions: 50 },
    ],
    totalSessions: 1000,
    rangeStart: '2026-07-27',
    rangeEnd: '2026-10-25',
  });
  assert.equal(data.aiSessions, 18);
  assert.equal(data.sharePct, 1.8);
  assert.deepEqual(data.engines.map((e) => [e.name, e.sessions]), [['ChatGPT', 15], ['Perplexity', 3]]);
  assert.deepEqual(data.pages[0], { landingPage: '/a', sessions: 15, conversions: 1 });
  assert.deepEqual(data.daily, [
    { date: '2026-10-01', sessions: 1 },
    { date: '2026-10-02', sessions: 4 },
  ]);
});

test('summarizeAiReferrals handles zero traffic', () => {
  const data = summarizeAiReferrals({ rows: [], daily: [], totalSessions: 0, rangeStart: 'a', rangeEnd: 'b' });
  assert.equal(data.sharePct, 0);
  assert.equal(data.aiSessions, 0);
});
