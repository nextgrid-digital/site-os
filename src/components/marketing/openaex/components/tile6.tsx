// @ts-nocheck
import type { Tile6Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Tile6Data = {
  text: string;
  text2: string;
  text3: string;
  text4: string;
};
/** A content tile. */
export default function Tile6({ d, cids, styles }: { d: Tile6Data; cids: string[]; styles: Tile6Styles }) {
  return (
    <tr data-cid={cids[0]} className="table-row align-middle [border-collapse:collapse]">
      <td data-cid={cids[1]} className={cn("table-cell py-2 overflow-hidden align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse] max-w-[min(100%,20rem)]", styles.className)}>
        {d.text}
      </td>
      <td data-cid={cids[2]} className={cn("table-cell py-2 align-middle text-right whitespace-nowrap text-nowrap [border-collapse:collapse]", styles.className2)}>
        {d.text2}
      </td>
      <td data-cid={cids[3]} className={cn("table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]", styles.className3)}>
        {d.text3}
      </td>
      <td data-cid={cids[4]} className={cn("table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]", styles.className4)}>
        {d.text4}
      </td>
    </tr>
  );
}
