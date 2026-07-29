// @ts-nocheck
import type { ListRow8Styles } from "../_styles";
import { cn } from "../lib/utils";
export type ListRow8Data = {
  label: string;
  text: string;
  description: string;
  description2: string;
};
/** A list row. */
export default function ListRow8({ d, cids, styles }: { d: ListRow8Data; cids: string[]; styles: ListRow8Styles }) {
  return (
    <li data-cid={cids[0]} className={cn("list-item", styles.className)}>
      <div data-cid={cids[1]} className={cn("block relative rounded-lg overflow-hidden w-full", styles.className2)}>
        <div data-cid={cids[2]} className={cn("h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none", styles.className3)} aria-hidden="true" />
        <div data-cid={cids[3]} className={cn("w-121.5 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 max-md:w-[17.8125rem] max-md:px-2 md:max-lg:w-77.5", styles.className4)}>
          <span data-cid={cids[4]} className={cn("w-79.5 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap max-md:w-[9.0625rem] md:max-lg:w-35.5", styles.className5)} title={d.label}>
            {d.text}
          </span>
          <div data-cid={cids[5]} className={cn("flex justify-end items-baseline shrink-0 gap-4 max-md:gap-2", styles.className6)}>
            <p data-cid={cids[6]} className="block text-[0.6875rem] font-medium leading-[0.6875rem] text-right w-16 max-md:w-14">
              {d.description}
            </p>
            <p data-cid={cids[7]} className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right w-14 max-md:w-12">
              {d.description2}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
