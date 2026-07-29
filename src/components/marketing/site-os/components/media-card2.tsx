// @ts-nocheck
import type { MediaCard2Styles } from "../_styles";
import { cn } from "../lib/utils";
export type MediaCard2Data = {
  id: string;
  title: string;
};
/** A card with media + heading. */
export default function MediaCard2({ d, cids, styles }: { d: MediaCard2Data; cids: string[]; styles: MediaCard2Styles }) {
  return (
    <div data-cid={cids[0]} className={cn("block", styles.className)}>
      <h3 data-cid={cids[1]} className={cn("flex", styles.className2)} data-component="heading">
        <button data-cid={cids[2]} className={cn("flex py-4 justify-between items-center flex-1 gap-4 font-semibold text-left cursor-default hover:text-clr-28 hover:[text-decoration-color:var(--clr-28)] focus:text-foreground focus:[text-decoration-color:var(--foreground)]", styles.className3)} data-component="button" aria-disabled="false" aria-expanded="false" id={d.id} type="button">
          <span data-cid={cids[3]} className={cn("block", styles.className4)}>
            {d.title}
          </span>
          <svg data-cid={cids[4]} className="w-4 h-4 block shrink-0 overflow-hidden align-middle text-muted-foreground" data-component="icon" aria-hidden="true" fill="none" height="24" stroke="currentColor" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </h3>
    </div>
  );
}
