import assert from 'node:assert/strict';
import { test } from 'node:test';
import { displayFactLabel, parseBriefFacts } from '@/lib/reports/brief-facts';

test('splits a multi-fact interpretation line and keeps colons inside values', () => {
  const facts = parseBriefFacts([
    'Business type: SaaS. Primary offer: Audit tool. Conversion goal: Book a demo. AI inference: A tool that audits sites: fast, clear.',
  ]);
  assert.deepEqual(facts, [
    { label: 'Business type', value: 'SaaS' },
    { label: 'Primary offer', value: 'Audit tool' },
    { label: 'Conversion goal', value: 'Book a demo' },
    { label: 'AI inference', value: 'A tool that audits sites: fast, clear.' },
  ]);
});

test('does not truncate titles or URLs containing colons', () => {
  const facts = parseBriefFacts(['Homepage title: Acme: Plans & Pricing | https://acme.com']);
  assert.deepEqual(facts, [{ label: 'Homepage title', value: 'Acme: Plans & Pricing | https://acme.com' }]);
});

test('keeps unlabeled lines and any text before the first label', () => {
  assert.deepEqual(parseBriefFacts(['Business context is thin.']), [
    { label: null, value: 'Business context is thin.' },
  ]);
  assert.deepEqual(parseBriefFacts(['Intro text. AI inference: Hello.']), [
    { label: null, value: 'Intro text.' },
    { label: 'AI inference', value: 'Hello.' },
  ]);
});

test('prefers the longer label and renames jargon', () => {
  const facts = parseBriefFacts(['AI inference ICPs: founders, teams.']);
  assert.equal(facts[0].label, 'AI inference ICPs');
  assert.equal(displayFactLabel('Homepage H1'), 'Main headline');
  assert.equal(displayFactLabel('Business type'), 'Business type');
});
