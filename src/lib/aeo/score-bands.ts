/**
 * The one definition of AEO readiness score bands and their colours. The audit
 * workspace and the landing-page demo both read it, so they never disagree.
 */
export type ScoreBandId = 'low' | 'mid' | 'good' | 'high';

export const SCORE_BANDS = [
  { id: 'low', label: '0–39', min: 0, max: 39, text: 'text-danger-ink', bar: 'bg-danger-ink', fill: 'var(--danger-ink)' },
  { id: 'mid', label: '40–59', min: 40, max: 59, text: 'text-warning-ink', bar: 'bg-warning-ink', fill: 'var(--warning-ink)' },
  { id: 'good', label: '60–79', min: 60, max: 79, text: 'text-info-ink', bar: 'bg-info-ink', fill: 'var(--info-ink)' },
  { id: 'high', label: '80–100', min: 80, max: 100, text: 'text-success-ink', bar: 'bg-success-ink', fill: 'var(--success-ink)' },
] as const;

export function bandFor(score: number) {
  return SCORE_BANDS.find((band) => score <= band.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}
