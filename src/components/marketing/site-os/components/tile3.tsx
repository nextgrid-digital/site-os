// @ts-nocheck
import type { Tile3Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Tile3Data = {
  text: string;
  ariaLabel?: string;
  text2: string;
  text3: string;
};
/** A content tile. */
export default function Tile3({ d, cids, styles }: { d: Tile3Data; cids: string[]; styles: Tile3Styles }) {
  return (
    <div data-cid={cids[0]} className={cn("w-41.5 border border-solid block relative min-w-0 p-4 rounded-[14px] aspect-square text-left max-md:w-[149.5px] max-lg:aspect-[initial] md:max-lg:w-[226.7px]", styles.className)}>
      <div data-cid={cids[1]} className="w-33 flex flex-col gap-1 h-full max-md:w-[115.5px] md:max-lg:w-[192.7px]">
        <div data-cid={cids[2]} className="flex min-w-0 justify-between items-baseline gap-2 w-full">
          <span data-cid={cids[3]} className={cn("block overflow-hidden text-xs font-medium leading-[0.9375rem] whitespace-nowrap text-nowrap", styles.className2)}>
            {d.text}
          </span>
          <span data-cid={cids[4]} className={cn("flex relative shrink-0 text-xs font-medium leading-[0.9375rem]", styles.className3)}>
            <span data-cid={cids[5]} className={cn("block", styles.className4)} aria-label={d.ariaLabel}>
              {d.text2}
            </span>
          </span>
        </div>
        <div data-cid={cids[6]} className={cn("w-33 block min-w-0 max-md:w-[115.5px] md:max-lg:w-[192.7px]", styles.className5)}>
          <span data-cid={cids[7]} className={cn("inline font-medium", styles.className6)}>
            {d.text3}
          </span>
        </div>
      </div>
    </div>
  );
}
