// @ts-nocheck
import type { Logo3Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Logo3Data = {
  description: string;
};
/** A logo. */
export default function Logo3({ d, cids, styles }: { d: Logo3Data; cids: string[]; styles: Logo3Styles }) {
  return (
    <li data-cid={cids[0]} className={cn("flex items-start gap-2", styles.className)}>
      <svg data-cid={cids[1]} className={cn("w-3 h-3 block mt-1.5 shrink-0 overflow-hidden align-middle", styles.className2)} data-component="icon" aria-hidden="true" fill="none" viewBox="0 0 542 542" xmlns="http://www.w3.org/2000/svg">
        <path d="M295.5 246.25V0H246.25V246.25H0V295.5H246.25V541.75H295.5V295.5H541.75V246.25H295.5Z" className="fill-muted-foreground/80" />
        <rect width="63" height="63" transform="translate(239.875 239.875)" className="fill-background" />
      </svg>
      <p data-cid={cids[2]} className={cn("block text-sm leading-5 tracking-[-0.35px]", styles.className3)}>
        {d.description}
      </p>
    </li>
  );
}
