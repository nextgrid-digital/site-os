// @ts-nocheck
import type { Tile9Styles } from "../_styles";
import { cn } from "../lib/utils";
export type Tile9Data = {
  text: string;
  text2: string;
};
/** A content tile. */
export default function Tile9({ d, cids, styles }: { d: Tile9Data; cids: string[]; styles: Tile9Styles }) {
  return (
    <div data-cid={cids[0]} className={cn("hidden max-lg:h-9 max-lg:flex max-lg:py-2 max-lg:px-3 max-lg:rounded-lg max-lg:justify-between max-lg:items-center max-lg:bg-background max-lg:[animation-name:site-os-agent-tool-in] max-lg:[animation-duration:0.36s] max-lg:[animation-timing-function:ease-out] max-lg:[animation-fill-mode:both] 2xl:h-9 2xl:flex 2xl:py-2 2xl:px-3 2xl:rounded-lg 2xl:justify-between 2xl:items-center 2xl:bg-background 2xl:[animation-name:site-os-agent-tool-in] 2xl:[animation-duration:0.36s] 2xl:[animation-timing-function:ease-out] 2xl:[animation-fill-mode:both]", styles.className)}>
      <span data-cid={cids[1]} className={cn("hidden max-lg:flex max-lg:min-w-0 max-lg:items-center max-lg:gap-2 2xl:flex 2xl:min-w-0 2xl:items-center 2xl:gap-2", styles.className2)}>
        <span data-cid={cids[2]} className="hidden max-lg:border max-lg:border-solid max-lg:border-surface-4 max-lg:block max-lg:py-px max-lg:px-1 max-lg:rounded-sm max-lg:shrink-0 max-lg:text-[0.625rem] max-lg:font-medium 2xl:border 2xl:border-solid 2xl:border-surface-4 2xl:block 2xl:py-px 2xl:px-1 2xl:rounded-sm 2xl:shrink-0 2xl:text-[0.625rem] 2xl:font-medium">
          MCP
        </span>
        <span data-cid={cids[3]} className={cn("hidden max-lg:block max-lg:overflow-hidden max-lg:text-foreground max-lg:[font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace] max-lg:whitespace-nowrap max-lg:text-nowrap 2xl:block 2xl:overflow-hidden 2xl:text-foreground 2xl:[font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace] 2xl:whitespace-nowrap 2xl:text-nowrap", styles.className3)}>
          {d.text}
        </span>
      </span>
      <span data-cid={cids[4]} className={cn("hidden max-lg:flex max-lg:items-center max-lg:shrink-0 max-lg:gap-2 2xl:flex 2xl:items-center 2xl:shrink-0 2xl:gap-2", styles.className4)}>
        {d.text2}
        <span data-cid={cids[5]} className="hidden max-lg:block max-lg:text-primary 2xl:block 2xl:text-primary" aria-label="Tool call finished">
          ✓
        </span>
      </span>
    </div>
  );
}
