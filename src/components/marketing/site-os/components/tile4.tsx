// @ts-nocheck
import type { Tile4Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Tile4Data = {
  ariaLabel: string;
  text: string;
  label: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
};
/** A content tile. */
export default function Tile4({ d, cids, styles }: { d: Tile4Data; cids: string[]; styles: Tile4Styles }) {
  return (
    <div data-cid={cids[0]} className={cn("block relative py-3 px-1 overflow-hidden", styles.className)} aria-label={d.ariaLabel}>
      <div data-cid={cids[1]} className="block absolute inset-y-3 left-3 rounded-full bg-clr-14 w-px max-md:h-[97.7px] max-md:bottom-auto" aria-hidden="true">
        <div data-cid={cids[2]} className={cn("block absolute bottom-0 rounded-full bg-color-002 w-px", styles.className2)} />
      </div>
      <div data-cid={cids[3]} className="block pl-4 max-md:w-[17.3125rem]">
        <div data-cid={cids[4]} className="flex justify-between items-start gap-3 max-md:w-[16.3125rem]">
          <div data-cid={cids[5]} className={cn("block min-w-0", styles.className3)}>
            <div data-cid={cids[6]} className={cn("block text-muted-foreground text-[0.6875rem] font-medium leading-[1rem]", styles.className4)}>
              {d.text}
            </div>
            <div data-cid={cids[7]} className="mt-1 overflow-hidden font-medium line-clamp-2" title={d.label}>
              {d.text2}
            </div>
          </div>
          <div data-cid={cids[8]} className="block min-w-0 shrink-0 text-right max-md:w-10.5">
            <div data-cid={cids[9]} className="block font-semibold">
              {d.text3}
            </div>
            <div data-cid={cids[10]} className="block text-muted-foreground text-[0.6875rem] leading-[1rem]">
              visitors
            </div>
          </div>
        </div>
        <div data-cid={cids[11]} className="grid mt-3 pt-3 gap-2 text-xs leading-4 grid-cols-2 max-md:grid-rows-[34px]">
          <div data-cid={cids[12]} className="block min-w-0">
            <div data-cid={cids[13]} className="block text-muted-foreground">
              Conversion
            </div>
            <div data-cid={cids[14]} className="block mt-0.5 font-medium">
              {d.text4}
            </div>
          </div>
          <div data-cid={cids[15]} className="block min-w-0 text-right">
            <div data-cid={cids[16]} className="block text-muted-foreground">
              Drop-off
            </div>
            <div data-cid={cids[17]} className="block mt-0.5 font-medium">
              {d.text5}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
