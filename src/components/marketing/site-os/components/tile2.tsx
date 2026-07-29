// @ts-nocheck
export type Tile2Data = {
  text: string;
  text2: string;
};
/** A content tile. */
export default function Tile2({ d, cids }: { d: Tile2Data; cids: string[] }) {
  return (
    <div data-cid={cids[0]} className="w-41.5 border border-solid border-surface block relative min-w-0 p-4 rounded-[14px] aspect-square text-left bg-surface-3 max-md:w-[149.5px] max-lg:aspect-[initial] md:max-lg:w-[226.7px]">
      <div data-cid={cids[1]} className="w-33 flex flex-col gap-1 h-full max-md:w-[115.5px] md:max-lg:w-[192.7px]">
        <div data-cid={cids[2]} className="h-[0.9375rem] flex min-w-0 justify-between items-baseline gap-2 w-full">
          <span data-cid={cids[3]} className="h-[0.9375rem] block overflow-hidden text-muted-foreground text-xs font-medium leading-[0.9375rem] whitespace-nowrap text-nowrap">
            {d.text}
          </span>
        </div>
        <div data-cid={cids[4]} className="w-33 block min-w-0 mt-[5.5625rem] max-md:w-[115.5px] max-lg:mt-0 md:max-lg:w-[192.7px]">
          <span data-cid={cids[5]} className="inline font-medium leading-5 tracking-[-0.4px]">
            {d.text2}
          </span>
        </div>
      </div>
    </div>
  );
}
