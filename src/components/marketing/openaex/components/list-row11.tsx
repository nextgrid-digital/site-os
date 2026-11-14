// @ts-nocheck
import type { ListRow11Styles } from "../_styles";
import { cn } from "../lib/utils";
export type ListRow11Data = {
  href: string;
  label: string;
};
/** A list row. */
export default function ListRow11({ d, cids, styles }: { d: ListRow11Data; cids: string[]; styles: ListRow11Styles }) {
  return (
    <li data-cid={cids[0]} className={cn("list-item", styles.className)}>
      <a data-cid={cids[1]} className="inline text-muted-foreground text-xs font-medium leading-4 cursor-pointer hover:text-foreground hover:[text-decoration-color:var(--foreground)]" data-component="link" href={d.href}>
        {d.label}
      </a>
    </li>
  );
}
