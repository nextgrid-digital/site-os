// @ts-nocheck
import type { ListRow3Styles } from "../_styles";
import { cn } from "../lib/utils";
export type ListRow3Data = {
  style: string;
  label: string;
  label2: string;
  text: string;
  text2: string;
};
/** A list row. */
export default function ListRow3({ d, cids, styles }: { d: ListRow3Data; cids: string[]; styles: ListRow3Styles }) {
  return (
    <li data-cid={cids[0]} className={cn("list-item", styles.className)}>
      <div data-cid={cids[1]} className={cn("block relative rounded-lg overflow-hidden w-full", styles.className2)}>
        <div data-cid={cids[2]} className={cn("h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none", styles.className3)} aria-hidden="true" />
        <div data-cid={cids[3]} className={cn("w-121.5 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 max-md:w-[17.8125rem] max-md:px-2 md:max-lg:w-77.5", styles.className4)}>
          <span data-cid={cids[4]} className={cn("w-99.5 flex min-w-0 items-center flex-1 gap-2 max-md:w-[13.0625rem] md:max-lg:w-55.5", styles.className5)}>
            <span data-cid={cids[5]} className="w-[18.7px] h-4 block relative rounded-xs shrink-0 overflow-hidden leading-3.5 bg-contain [background-position:50%_50%] bg-no-repeat before:content-[' '] before:text-foreground before:text-sm before:leading-3.5" style={d.style} aria-hidden="true" title={d.label} />
            <span data-cid={cids[6]} className={cn("w-[371.3px] block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap max-md:w-[182.3px] md:max-lg:w-[195.3px]", styles.className6)} title={d.label2}>
              {d.text}
            </span>
          </span>
          <div data-cid={cids[7]} className="flex justify-end items-baseline shrink-0 gap-4 max-md:gap-2">
            <span data-cid={cids[8]} className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right w-14 max-md:w-12">
              {d.text2}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
