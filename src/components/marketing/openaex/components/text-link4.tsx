// @ts-nocheck
import type { TextLink4Styles } from "../_styles";
import { cn } from "../lib/utils";
export type TextLink4Data = {
  ariapressed: string;
  label: string;
};
/** A text link. */
export default function TextLink4({ d, cids, styles }: { d: TextLink4Data; cids: string[]; styles: TextLink4Styles }) {
  return (
    <button data-cid={cids[0]} className={cn("min-h-5 border border-solid border-clr-0 flex px-1.5 rounded-lg justify-center items-center shrink-0 gap-2 text-[0.6875rem] font-medium leading-[1rem] text-center whitespace-nowrap text-nowrap [background-clip:padding-box] [-webkit-background-clip:padding-box] cursor-pointer h-5", styles.className)} data-component="button" aria-pressed={d.ariapressed} type="button">
      {d.label}
    </button>
  );
}
