import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AeoPageScanRow } from '@/lib/db/aeo';
import { summarizeAeoScans } from '@/lib/aeo/summarize-scans';

function scan(path: string, score: number, directAnswerPassed: boolean): AeoPageScanRow {
  return {
    path,
    kind: 'page',
    score,
    signals: {} as AeoPageScanRow['signals'],
    checks: [
      {
        id: 'direct_answer',
        label: 'Direct answer',
        weight: 20,
        applicable: true,
        passed: directAnswerPassed,
        detail: '',
        fix: 'Lead with an answer.',
      },
      {
        id: 'authorship',
        label: 'Author',
        weight: 8,
        applicable: false,
        passed: false,
        detail: '',
        fix: '',
      },
    ],
  };
}

test('summarizeAeoScans rolls up failing checks, skips inapplicable, bands scores', () => {
  const summary = summarizeAeoScans([scan('/a', 30, false), scan('/b', 90, true), scan('/c', 50, false)]);
  assert.equal(summary.pageCount, 3);
  assert.equal(summary.averageScore, 57);
  assert.equal(summary.checks.length, 1);
  assert.deepEqual(
    { applicable: summary.checks[0].applicable, failing: summary.checks[0].failing, lost: summary.checks[0].weightLost },
    { applicable: 3, failing: 2, lost: 40 }
  );
  assert.deepEqual(summary.bands.map((b) => b.count), [1, 1, 0, 1]);
});

test('summarizeAeoScans handles no scans', () => {
  const summary = summarizeAeoScans([]);
  assert.equal(summary.averageScore, 0);
  assert.equal(summary.pageCount, 0);
});
