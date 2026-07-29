// @ts-nocheck
import type { ListRow9Styles } from "../_styles";
import { cn } from "../lib/utils";
export type ListRow9Data = {
  label: string;
  text: string;
  text2: string;
  text3: string;
};
/** A list row. */
export default function ListRow9({ d, cids, styles }: { d: ListRow9Data; cids: string[]; styles: ListRow9Styles }) {
  return (
    <li data-cid={cids[0]} className="list-item">
      <div data-cid={cids[1]} className="block relative rounded-lg overflow-hidden w-full">
        <div data-cid={cids[2]} className={cn("h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none", styles.className)} aria-hidden="true" />
        <div data-cid={cids[3]} className="w-121.5 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 max-md:w-[17.8125rem] max-md:px-2 md:max-lg:w-77.5">
          <span data-cid={cids[4]} className="w-73 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap max-md:w-[8.0625rem] md:max-lg:w-29" title={d.label}>
            {d.text}
          </span>
          <div data-cid={cids[5]} className="flex justify-end items-baseline shrink-0 gap-2.5 text-xs leading-4 max-md:gap-2">
            <span data-cid={cids[6]} className="w-24 block min-w-24 font-medium text-right max-md:w-18 max-md:min-w-18">
              {d.text2}
            </span>
            <span data-cid={cids[7]} className="block text-muted-foreground text-right w-14 max-md:w-12">
              {d.text3}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
