// @ts-nocheck
import type { Tile8Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Tile8Data = {
  text: string;
  text2: string;
  text3: string;
};
/** A content tile. */
export default function Tile8({ d, cids, styles }: { d: Tile8Data; cids: string[]; styles: Tile8Styles }) {
  return (
    <tr data-cid={cids[0]} className={cn("table-row align-middle [border-collapse:collapse]", styles.className)}>
      <td data-cid={cids[1]} className={cn("table-cell py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse] max-w-[min(100%,20rem)]", styles.className2)}>
        <span data-cid={cids[2]} className="inline overflow-hidden [border-collapse:collapse]">
          {d.text}
        </span>
      </td>
      <td data-cid={cids[3]} className={cn("table-cell py-2 align-middle text-right whitespace-nowrap text-nowrap [border-collapse:collapse]", styles.className3)}>
        {d.text2}
      </td>
      <td data-cid={cids[4]} className={cn("table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]", styles.className4)}>
        {d.text3}
      </td>
    </tr>
  );
}
