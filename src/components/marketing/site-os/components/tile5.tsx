// @ts-nocheck
import type { Tile5Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Tile5Data = {
  ariaLabel: string;
  text: string;
  label: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
};
/** A content tile. */
export default function Tile5({ d, cids, styles }: { d: Tile5Data; cids: string[]; styles: Tile5Styles }) {
  return (
    <div data-cid={cids[0]} className={cn("w-85 h-80 min-h-80 flex relative min-w-0 p-5 flex-col md:max-lg:w-[222.7px] md:max-lg:px-3", styles.className)} aria-label={d.ariaLabel}>
      <div data-cid={cids[1]} className={cn("block min-w-0 text-left", styles.className2)}>
        <div data-cid={cids[2]} className="block text-muted-foreground text-[0.6875rem] font-medium leading-[1rem] tracking-[0.28px]">
          {d.text}
        </div>
        <div data-cid={cids[3]} className="block mt-1 overflow-hidden text-xs font-semibold leading-4 whitespace-nowrap text-nowrap" title={d.label}>
          {d.text2}
        </div>
        <div data-cid={cids[4]} className="block mt-4 overflow-hidden text-muted-foreground text-xs font-medium leading-4 whitespace-nowrap text-nowrap">
          {d.text3}
        </div>
        <div data-cid={cids[5]} className="block mt-1 text-muted text-[0.6875rem] leading-[1rem]">
          {d.text4}
        </div>
      </div>
      <div data-cid={cids[6]} className={cn("h-7 block absolute bottom-4 left-5 min-w-0 text-left md:max-lg:left-3", styles.className3)}>
        <div data-cid={cids[7]} className="block text-color-002 text-lg font-semibold leading-7">
          {d.text5}
        </div>
      </div>
    </div>
  );
}
