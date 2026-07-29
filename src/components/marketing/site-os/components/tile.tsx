// @ts-nocheck
import type { TileStyles } from "../_styles";
import { cn } from "../lib/utils";
export type TileData = {
  text: string;
};
/** A content tile. */
export default function Tile({ d, cids, styles }: { d: TileData; cids: string[]; styles: TileStyles }) {
  return (
    <span data-cid={cids[0]} className="flex items-center gap-1.5 pointer-events-none">
      <span data-cid={cids[1]} className={cn("w-2 h-2 block rounded-xs pointer-events-none", styles.className)} aria-hidden="true" />
      {d.text}
    </span>
  );
}
