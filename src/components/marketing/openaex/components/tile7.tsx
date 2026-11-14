// @ts-nocheck
import type { Tile7Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Tile7Data = {
  text: string;
};
/** A content tile. */
export default function Tile7({ d, cids, styles }: { d: Tile7Data; cids: string[]; styles: Tile7Styles }) {
  return (
    <span data-cid={cids[0]} className="flex items-center gap-1.5">
      <span data-cid={cids[1]} className={cn("w-2 h-2 block rounded-xs", styles.className)} aria-hidden="true" />
      {d.text}
    </span>
  );
}
