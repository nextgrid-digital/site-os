// @ts-nocheck
import type { ListRow7Styles } from "../_styles";
import { cn } from "../lib/utils";
export type ListRow7Data = {
  text: string;
  ariahidden?: string;
};
/** A list row. */
export default function ListRow7({ d, cids, styles }: { d: ListRow7Data; cids: string[]; styles: ListRow7Styles }) {
  return (
    <li data-cid={cids[0]} className={cn("list-item", styles.className)} aria-hidden={d.ariahidden}>
      {d.text}
    </li>
  );
}
