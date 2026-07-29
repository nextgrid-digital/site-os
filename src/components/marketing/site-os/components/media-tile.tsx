// @ts-nocheck
import type { MediaTileStyles } from "../_styles";
import { cn } from "../lib/utils";
export type MediaTileData = {
  label: string;
  imgSrc: string;
  label2: string;
  text: string;
  text2: string;
};
/** A media tile. */
export default function MediaTile({ d, cids, styles }: { d: MediaTileData; cids: string[]; styles: MediaTileStyles }) {
  return (
    <li data-cid={cids[0]} className={cn("list-item", styles.className)}>
      <div data-cid={cids[1]} className={cn("block relative rounded-lg overflow-hidden w-full", styles.className2)}>
        <div data-cid={cids[2]} className={cn("h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none", styles.className3)} aria-hidden="true" />
        <div data-cid={cids[3]} className={cn("w-121.5 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 max-md:w-[17.8125rem] max-md:px-2 md:max-lg:w-77.5", styles.className4)}>
          <span data-cid={cids[4]} className={cn("w-99.5 flex min-w-0 rounded-md items-center flex-1 gap-2 cursor-default max-md:w-[13.0625rem] md:max-lg:w-55.5", styles.className5)} title={d.label}>
            <img data-cid={cids[5]} className="w-4 h-4 block max-w-full rounded-md shrink-0 overflow-clip object-contain aspect-[auto_16/16] align-middle bg-surface-7" data-component="image" alt="" height="16" src={d.imgSrc} title={d.label2} width="16" />
            <span data-cid={cids[6]} className={cn("w-88.5 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap max-md:w-[10.3125rem] md:max-lg:w-44.5", styles.className6)}>
              {d.text}
            </span>
            <svg data-cid={cids[7]} className="w-3 h-3 block opacity-0 shrink-0 overflow-hidden align-middle text-muted-foreground" aria-hidden="true" fill="none" height="24" stroke="currentColor" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" color="currentColor" strokeWidth="1.8">
              <path d="M11.1004 3.00208C7.4515 3.00864 5.54073 3.09822 4.31962 4.31931C3.00183 5.63706 3.00183 7.75796 3.00183 11.9997C3.00183 16.2415 3.00183 18.3624 4.31962 19.6801C5.6374 20.9979 7.75836 20.9979 12.0003 20.9979C16.2421 20.9979 18.3631 20.9979 19.6809 19.6801C20.902 18.4591 20.9916 16.5484 20.9982 12.8996" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M20.4803 3.51751L14.931 9.0515M20.4803 3.51751C19.9863 3.023 16.6587 3.0691 15.9552 3.0791M20.4803 3.51751C20.9742 4.01202 20.9282 7.34329 20.9182 8.04754" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </span>
          <div data-cid={cids[8]} className="flex justify-end items-baseline shrink-0 gap-4 max-md:gap-2">
            <span data-cid={cids[9]} className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right w-14 max-md:w-12">
              {d.text2}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
