import type { HistoricalChangeEvent } from '@/lib/evidence/types';
import type { WorkItemView } from '@/lib/workflow/work-items';

export type MonthlyLine = {
  title: string;
  detail?: string;
};

export type MonthlyCompareSection = {
  improved: MonthlyLine[];
  regressed: MonthlyLine[];
  stillPending: MonthlyLine[];
  needsFollowUp: MonthlyLine[];
};

function humanizeLabel(raw: string) {
  const cleaned = raw.replace(/[_-]+/g, ' ').trim();
  if (!cleaned) return raw;
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

function lineFromChange(change: HistoricalChangeEvent): {
  bucket: 'improved' | 'regressed';
  line: MonthlyLine;
} {
  const raw =
    change.current_value ||
    change.previous_value ||
    change.event_type.replace(/_/g, ' ');
  const label = humanizeLabel(raw);
  const type = change.event_type;

  if (
    type.includes('removed') ||
    type.includes('lost') ||
    type === 'category_removed' ||
    type === 'content_type_removed' ||
    type === 'claim_removed'
  ) {
    if (type.includes('claim')) {
      return { bucket: 'regressed', line: { title: `Claim removed: ${label}` } };
    }
    return { bucket: 'regressed', line: { title: `No longer showing: ${label}` } };
  }

  if (
    type.includes('added') ||
    type.includes('gained') ||
    type === 'category_added' ||
    type === 'content_type_added' ||
    type === 'claim_added'
  ) {
    if (type.includes('claim')) {
      return { bucket: 'improved', line: { title: `New claim: ${label}` } };
    }
    return { bucket: 'improved', line: { title: `New on the site: ${label}` } };
  }

  return { bucket: 'improved', line: { title: `${label} changed` } };
}

function uniqueLines(items: MonthlyLine[]) {
  const seen = new Set<string>();
  const out: MonthlyLine[] = [];
  for (const item of items) {
    const key = `${item.title}::${item.detail ?? ''}`;
    if (!item.title || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function buildMonthlyCompare(input: {
  historicalChanges: HistoricalChangeEvent[];
  openWorkItems: WorkItemView[];
  currentFindingCount: number;
  previousFindingCount: number | null;
  currentOpenWorkCount: number;
  previousOpenWorkCount: number | null;
}): MonthlyCompareSection {
  const improved: MonthlyLine[] = [];
  const regressed: MonthlyLine[] = [];

  for (const change of input.historicalChanges) {
    const mapped = lineFromChange(change);
    if (mapped.bucket === 'improved') improved.push(mapped.line);
    else regressed.push(mapped.line);
  }

  if (
    input.previousFindingCount != null &&
    input.currentFindingCount < input.previousFindingCount
  ) {
    improved.push({
      title: `Fewer issues found (was ${input.previousFindingCount}, now ${input.currentFindingCount})`,
    });
  } else if (
    input.previousFindingCount != null &&
    input.currentFindingCount > input.previousFindingCount
  ) {
    regressed.push({
      title: `More issues found (was ${input.previousFindingCount}, now ${input.currentFindingCount})`,
    });
  }

  if (
    input.previousOpenWorkCount != null &&
    input.currentOpenWorkCount < input.previousOpenWorkCount
  ) {
    improved.push({
      title: `Fewer open tasks (was ${input.previousOpenWorkCount}, now ${input.currentOpenWorkCount})`,
    });
  } else if (
    input.previousOpenWorkCount != null &&
    input.currentOpenWorkCount > input.previousOpenWorkCount
  ) {
    regressed.push({
      title: `More open tasks (was ${input.previousOpenWorkCount}, now ${input.currentOpenWorkCount})`,
    });
  }

  const stillPending = input.openWorkItems
    .filter((i) => i.status === 'open' || i.status === 'in_progress')
    .slice(0, 12)
    .map((i) => {
      const detail =
        i.nextAction && i.nextAction.trim() && i.nextAction.trim() !== i.issue.trim()
          ? i.nextAction.trim()
          : undefined;
      return { title: i.issue, detail };
    });

  const needsFollowUp = input.openWorkItems
    .filter((i) => i.status === 'open' && (i.priority === 'critical' || i.priority === 'high'))
    .slice(0, 8)
    .map((i) => ({
      title: i.issue,
      detail: 'Fix soon',
    }));

  return {
    improved: uniqueLines(improved).slice(0, 12),
    regressed: uniqueLines(regressed).slice(0, 12),
    stillPending,
    needsFollowUp,
  };
}
