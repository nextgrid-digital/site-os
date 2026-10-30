import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildScreenPrompt, parseScreenVerdict } from '@/lib/aeo/screen-prompts';

test('parseScreenVerdict keeps only explicitly relevant, in-range indexes', () => {
  const out = parseScreenVerdict(
    '{"results":[{"index":0,"relevant":true},{"index":1,"relevant":false},{"index":9,"relevant":true}]}',
    3
  );
  assert.deepEqual([...out], [0]);
});

test('parseScreenVerdict fails closed on garbage', () => {
  assert.equal(parseScreenVerdict('not json', 2).size, 0);
  assert.equal(parseScreenVerdict('{"results":"yes"}', 2).size, 0);
});

test('buildScreenPrompt embeds candidates as JSON data', () => {
  const prompt = buildScreenPrompt(['say "hi" \n now'], { domain: 'a.com', brandName: 'A', offer: null });
  assert.ok(prompt.includes(JSON.stringify('say "hi" \n now')));
});
