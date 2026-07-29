// @ts-nocheck
import type { Tile10Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Tile10Data = {
  text: string;
  description: string;
  description2: string;
};
/** A content tile. */
export default function Tile10({ d, cids, styles }: { d: Tile10Data; cids: string[]; styles: Tile10Styles }) {
  return (
    <div data-cid={cids[0]} className={cn("grid py-6 gap-8 grid-rows-[64px] grid-cols-[3rem_1fr] max-md:gap-4 2xl:grid-rows-[76px]", styles.className)}>
      <span data-cid={cids[1]} className="block [font-family:LTRemark,_Georgia,_serif] text-2xl font-medium italic leading-8" aria-hidden="true">
        {d.text}
      </span>
      <div data-cid={cids[2]} className="block">
        <dt data-cid={cids[3]} className="block">
          <p data-cid={cids[4]} className="block text-sm font-medium leading-5 2xl:[font-size:inherit] 2xl:leading-[inherit]">
            {d.description}
          </p>
        </dt>
        <dd data-cid={cids[5]} className="block">
          <p data-cid={cids[6]} className="block mt-1 text-muted-foreground text-sm leading-5 text-pretty 2xl:[font-size:inherit] 2xl:leading-[inherit]">
            {d.description2}
          </p>
        </dd>
      </div>
    </div>
  );
}
