// @ts-nocheck
import type { ListRow5Styles } from "../_styles";
import { cn } from "../lib/utils";
export type ListRow5Data = {
  text: string;
  text2: string;
};
/** A list row. */
export default function ListRow5({ d, cids, styles }: { d: ListRow5Data; cids: string[]; styles: ListRow5Styles }) {
  return (
    <li data-cid={cids[0]} className="h-8 list-item">
      <div data-cid={cids[1]} className="h-8 block relative rounded-lg overflow-hidden w-full">
        <div data-cid={cids[2]} className={cn("h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none", styles.className)} aria-hidden="true" />
        <div data-cid={cids[3]} className="w-121.5 h-8 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 max-md:w-[17.8125rem] max-md:px-2 md:max-lg:w-77.5">
          <span data-cid={cids[4]} className="w-99.5 h-4 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap max-md:w-[13.0625rem] md:max-lg:w-55.5">
            {d.text}
          </span>
          <span data-cid={cids[5]} className="block shrink-0 text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right w-14 max-md:w-12">
            {d.text2}
          </span>
        </div>
      </div>
    </li>
  );
}
