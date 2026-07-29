// @ts-nocheck
import type { TextLink3Styles } from "../_styles";
import { cn } from "../lib/utils";
export type TextLink3Data = {
  ariapressed: string;
  label: string;
  label2: string;
  label3: string;
};
/** A text link. */
export default function TextLink3({ d, cids, styles }: { d: TextLink3Data; cids: string[]; styles: TextLink3Styles }) {
  return (
    <button data-cid={cids[0]} className={cn("border border-solid block relative min-w-0 p-4 rounded-[14px] aspect-square text-left cursor-pointer w-full max-lg:aspect-[initial]", styles.className)} data-component="button" aria-pressed={d.ariapressed} type="button">
      <div data-cid={cids[1]} className="w-[10.475rem] flex flex-col gap-1 h-full max-md:w-[115.5px] md:max-lg:w-[192.7px]">
        <div data-cid={cids[2]} className="flex min-w-0 justify-between items-baseline gap-2 w-full">
          <span data-cid={cids[3]} className={cn("block overflow-hidden text-xs font-medium leading-[0.9375rem] whitespace-nowrap text-nowrap", styles.className2)}>
            {d.label}
          </span>
          <span data-cid={cids[4]} className={cn("block shrink-0 text-xs font-medium leading-[0.9375rem]", styles.className3)}>
            {d.label2}
          </span>
        </div>
        <div data-cid={cids[5]} className="w-[10.475rem] block min-w-0 mt-[6.6rem] max-md:w-[115.5px] max-lg:mt-0 md:max-lg:w-[192.7px]">
          <span data-cid={cids[6]} className="inline text-xl font-medium leading-[1.5625rem] tracking-[-0.5px] max-md:text-lg max-md:leading-[1.4375rem] max-md:tracking-[-0.45px]">
            {d.label3}
          </span>
          <div data-cid={cids[7]} className="flex mt-0.5 flex-wrap items-center gap-x-2 text-xs leading-4">
            <span data-cid={cids[8]} className={cn("block font-medium", styles.className4)}>
              Good
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
