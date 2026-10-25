import { SCORE_BANDS } from '@/lib/aeo/score-bands';
import type { AeoCheckId } from '@/lib/aeo/page-scanner';
import type { AeoPageScanRow } from '@/lib/db/aeo';

export interface AeoCheckRollup {
  id: AeoCheckId;
  label: string;
  fix: string;
  /** Pages where this check applies. */
  applicable: number;
  failing: number;
  /** Sum of weights lost across failing pages: how much score this check costs. */
  weightLost: number;
}

export interface AeoScanSummary {
  pageCount: number;
  averageScore: number;
  /** Count of pages in each score band, for the distribution chart. */
  bands: { label: string; min: number; max: number; count: number }[];
  /** Most costly checks first. */
  checks: AeoCheckRollup[];
}

const BANDS = SCORE_BANDS.map(({ label, min, max }) => ({ label, min, max }));

export function summarizeAeoScans(scans: AeoPageScanRow[]): AeoScanSummary {
  const rollup = new Map<AeoCheckId, AeoCheckRollup>();

  for (const scan of scans) {
    for (const check of scan.checks) {
      if (!check.applicable) continue;
      const entry =
        rollup.get(check.id) ??
        ({
          id: check.id,
          label: check.label,
          fix: check.fix,
          applicable: 0,
          failing: 0,
          weightLost: 0,
        } satisfies AeoCheckRollup);
      entry.applicable += 1;
      if (!check.passed) {
        entry.failing += 1;
        entry.weightLost += check.weight;
      }
      rollup.set(check.id, entry);
    }
  }

  const averageScore =
    scans.length === 0
      ? 0
      : Math.round(scans.reduce((sum, scan) => sum + scan.score, 0) / scans.length);

  return {
    pageCount: scans.length,
    averageScore,
    bands: BANDS.map((band) => ({
      ...band,
      count: scans.filter((s) => s.score >= band.min && s.score <= band.max).length,
    })),
    checks: [...rollup.values()].toSorted((a, b) => b.weightLost - a.weightLost),
  };
}
