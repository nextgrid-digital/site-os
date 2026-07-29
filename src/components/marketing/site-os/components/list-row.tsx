// @ts-nocheck
import type { ListRowStyles } from "../_styles";
import { cn } from "../lib/utils";
export type ListRowData = {
  href: string;
  label: string;
  rel?: string;
  target?: string;
};
/** A list row. */
export default function ListRow({ d, cids, styles }: { d: ListRowData; cids: string[]; styles: ListRowStyles }) {
  return (
    <li data-cid={cids[0]} className="block relative max-md:hidden">
      <a data-cid={cids[1]} className={cn("flex rounded-[10px] items-center gap-2 text-muted-foreground text-sm font-medium leading-5 cursor-pointer hover:text-foreground hover:[text-decoration-color:var(--foreground)]", styles.className)} data-component="link" href={d.href} rel={d.rel} target={d.target}>
        {d.label}
      </a>
    </li>
  );
}
