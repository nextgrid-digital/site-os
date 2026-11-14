// @ts-nocheck
import type { TextLink2Styles } from "../_styles";
import { cn } from "../lib/utils";
export type TextLink2Data = {
  ariaselected: string;
  id: string;
  label: string;
};
/** A text link. */
export default function TextLink2({ d, cids, styles }: { d: TextLink2Data; cids: string[]; styles: TextLink2Styles }) {
  return (
    <button data-cid={cids[0]} className={cn("block rounded-sm text-center cursor-default", styles.className)} data-component="button" aria-selected={d.ariaselected} id={d.id} role="tab" type="button">
      {d.label}
    </button>
  );
}
