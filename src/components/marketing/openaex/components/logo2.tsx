// @ts-nocheck
import type { Logo2Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Logo2Data = {
  alt: string;
  imgSrc: string;
  text: string;
};
/** A logo. */
export default function Logo2({ d, cids, styles }: { d: Logo2Data; cids: string[]; styles: Logo2Styles }) {
  return (
    <span data-cid={cids[0]} className={cn("block", styles.className)}>
      <img data-cid={cids[1]} className="w-6 h-6 block max-w-full rounded-sm overflow-clip object-contain aspect-[auto_24/24] align-middle" data-component="image" alt={d.alt} height="24" src={d.imgSrc} width="24" />
      <span data-cid={cids[2]} className="w-px h-px block absolute -m-px overflow-hidden whitespace-nowrap text-nowrap [clip-path:inset(50%)]">
        {d.text}
      </span>
    </span>
  );
}
