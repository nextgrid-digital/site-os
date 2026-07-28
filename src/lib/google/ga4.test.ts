import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeTrafficChannel } from '@/lib/google/ga4';

test('normalizeTrafficChannel maps common source / medium pairs', () => {
  assert.equal(normalizeTrafficChannel('google / organic'), 'Organic Search');
  assert.equal(normalizeTrafficChannel('linkedin.com / referral'), 'Social');
  assert.equal(normalizeTrafficChannel('newsletter / email'), 'Email');
  assert.equal(normalizeTrafficChannel('(direct) / (none)'), 'Direct');
  assert.equal(normalizeTrafficChannel('(not set)'), 'Unassigned');
  assert.equal(normalizeTrafficChannel('partner-site / referral'), 'Referral');
});
