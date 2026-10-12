// @ts-nocheck
"use client";
import { Accordion } from "@base-ui/react/accordion";
import type { MediaCard2Styles } from "../_styles";
import { cn } from "../lib/utils";
export type MediaCard2Data = {
  id: string;
  title: string;
  description: string;
};
/** A card with media + heading. */
export default function MediaCard2({ d, cids, styles }: { d: MediaCard2Data; cids: string[]; styles: MediaCard2Styles }) {
  return (
    <Accordion.Item value={d.id} data-cid={cids[0]} className={cn("block", styles.className)}>
      <Accordion.Header data-cid={cids[1]} className={cn("flex", styles.className2)} data-component="heading">
        <Accordion.Trigger data-cid={cids[2]} className={cn("flex py-4 justify-between items-center flex-1 gap-4 font-semibold text-left cursor-pointer hover:text-clr-28 hover:[text-decoration-color:var(--clr-28)] focus:text-foreground focus:[text-decoration-color:var(--foreground)]", styles.className3)}>
          <span data-cid={cids[3]} className={cn("block", styles.className4)}>
            {d.title}
          </span>
          <svg data-cid={cids[4]} className="w-4 h-4 block shrink-0 overflow-hidden align-middle text-muted-foreground transition-transform data-panel-open:rotate-180" data-component="icon" aria-hidden="true" fill="none" height="24" stroke="currentColor" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel className="block overflow-hidden">
        <p className="block pb-4 text-muted-foreground text-sm leading-6">
          {d.description}
        </p>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
