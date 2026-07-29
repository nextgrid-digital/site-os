// @ts-nocheck
import type { MediaCardStyles } from "../_styles";
import { cn } from "../lib/utils";
export type MediaCardData = {
  id: string;
  title: string;
};
/** A card with media + heading. */
export default function MediaCard({ d, cids, styles }: { d: MediaCardData; cids: string[]; styles: MediaCardStyles }) {
  return (
    <div data-cid={cids[0]} className={cn("block", styles.className)}>
      <h3 data-cid={cids[1]} className="flex" data-component="heading">
        <button data-cid={cids[2]} className="flex py-5 justify-between items-center flex-1 gap-4 text-sm font-semibold leading-5 text-left cursor-default hover:text-clr-28 hover:[text-decoration-color:var(--clr-28)] focus:text-foreground focus:[text-decoration-color:var(--foreground)]" data-component="button" aria-disabled="false" aria-expanded="false" id={d.id} type="button">
          <span data-cid={cids[3]} className="block text-lg font-medium leading-7">
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
