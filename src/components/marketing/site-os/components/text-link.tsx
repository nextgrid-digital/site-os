// @ts-nocheck
import type { TextLinkStyles } from '../_styles';
import { cn } from '../lib/utils';

export type TextLinkData = {
  ariapressed: string;
  label: string;
  ariaLabel?: string;
  label2: string;
  label3: string;
};

/** Metric tile in the hero dashboard preview. */
export default function TextLink({
  d,
  cids,
  styles,
}: {
  d: TextLinkData;
  cids: string[];
  styles: TextLinkStyles;
}) {
  return (
    <button
      data-cid={cids[0]}
      className={cn(
        'relative block h-full min-w-0 w-full cursor-pointer rounded-[14px] border border-solid p-4 text-left',
        styles.className
      )}
      data-component="button"
      aria-pressed={d.ariapressed}
      type="button"
    >
      <div data-cid={cids[1]} className="flex h-full min-w-0 w-full flex-col gap-1">
        <div data-cid={cids[2]} className="flex w-full min-w-0 items-baseline justify-between gap-2">
          <span
            data-cid={cids[3]}
            className={cn(
              'block overflow-hidden text-xs font-medium leading-[0.9375rem] whitespace-nowrap',
              styles.className2
            )}
          >
            {d.label}
          </span>
          <span
            data-cid={cids[4]}
            className={cn(
              'relative flex shrink-0 text-xs font-medium leading-[0.9375rem]',
              styles.className3
            )}
          >
            <span data-cid={cids[5]} className={cn('block', styles.className4)} aria-label={d.ariaLabel}>
              {d.label2}
            </span>
          </span>
        </div>
        <div data-cid={cids[6]} className="mt-auto min-w-0">
          <span data-cid={cids[7]} className={cn('inline font-medium', styles.className6)}>
            {d.label3}
          </span>
        </div>
      </div>
    </button>
  );
}
