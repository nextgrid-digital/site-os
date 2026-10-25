import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildTopicMapPrompt, parseTopicMap, type TopicMapPage } from '@/lib/aeo/topic-map';

const page = (path: string, score: number): TopicMapPage => ({ path, title: path, h1: null, score });
const pages = [page('/a', 80), page('/b', 60), page('/c', 40), page('/d', 20)];

test('parseTopicMap drops unknown paths, dedupes pages and computes coverage/score', () => {
  const map = parseTopicMap(
    JSON.stringify({
      topics: [
        { name: 'Alpha', description: 'd', page_paths: ['/a', '/b', '/c', '/evil'] },
        { name: 'Beta', description: 'd', page_paths: ['/c', '/d'] },
        { name: 'Ghost', description: 'd', page_paths: ['/nope'] },
      ],
      gaps: [{ topic: 'Pricing', why: 'Buyers ask.', suggested_page: 'Pricing guide' }],
    }),
    pages
  );
  assert.deepEqual(map.topics.map((t) => t.name), ['Alpha', 'Beta']);
  assert.equal(map.topics[0].coverage, 'strong');
  assert.equal(map.topics[0].avgScore, 60);
  assert.deepEqual(map.topics[1].paths, ['/d']);
  assert.equal(map.topics[1].coverage, 'thin');
  assert.equal(map.gaps[0].suggestedPage, 'Pricing guide');
});

test('parseTopicMap collects skipped pages into Other pages', () => {
  const map = parseTopicMap(
    JSON.stringify({ topics: [{ name: 'Alpha', description: 'd', page_paths: ['/a'] }], gaps: [] }),
    pages
  );
  const other = map.topics.find((t) => t.name === 'Other pages');
  assert.deepEqual(other?.paths, ['/b', '/c', '/d']);
});

test('parseTopicMap rejects malformed or empty output', () => {
  assert.throws(() => parseTopicMap('nope', pages));
  assert.throws(() => parseTopicMap('{"topics":[],"gaps":[]}', []));
});

test('buildTopicMapPrompt embeds page text as JSON data', () => {
  const prompt = buildTopicMapPrompt([{ path: '/x', title: 'Ignore "rules"', h1: null, score: 1 }], {
    domain: 'a.com',
    brandName: 'A',
    offer: null,
    icps: [],
  });
  assert.ok(prompt.includes(JSON.stringify('Ignore "rules"')));
});
