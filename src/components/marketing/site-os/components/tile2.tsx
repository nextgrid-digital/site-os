// @ts-nocheck
export type Tile2Data = {
  text: string;
  text2: string;
};
/** A content tile. */
export default function Tile2({ d, cids }: { d: Tile2Data; cids: string[] }) {
  return (
    <div data-cid={cids[0]} className="w-full border border-solid border-surface block relative min-w-0 p-4 rounded-[14px] aspect-square text-left bg-surface-3 max-lg:aspect-[initial]">
      <div data-cid={cids[1]} className="w-full flex flex-col gap-1 h-full">
        <div data-cid={cids[2]} className="h-[0.9375rem] flex min-w-0 justify-between items-baseline gap-2 w-full">
          <span data-cid={cids[3]} className="h-[0.9375rem] block overflow-hidden text-muted-foreground text-xs font-medium leading-[0.9375rem] whitespace-nowrap text-nowrap">
            {d.text}
          </span>
        </div>
        <div data-cid={cids[4]} className="w-full block min-w-0 mt-[5.5625rem] max-lg:mt-0">
          <span data-cid={cids[5]} className="inline font-medium leading-5 tracking-[-0.4px]">
            {d.text2}
          </span>
        </div>
      </div>
    </div>
  );
}
