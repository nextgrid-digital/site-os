// @ts-nocheck
import type { ProductCardStyles } from "../_styles";
import Icon4 from "../svgs/svg-icon4";
import Icon5 from "../svgs/svg-icon5";
import { cn } from "../lib/utils";
export type ProductCardData = {
  variant: string;
  eyebrow: string;
  title: string;
  label?: string;
  stat?: string;
  imgSrc: string;
  description: string;
  description2: string;
};
/** A product card. */
export default function ProductCard({ d, cids, styles }: { d: ProductCardData; cids: string[]; styles: ProductCardStyles }) {
  return (
    <div data-cid={cids[0]} className="w-[341.3px] flex min-w-0 flex-col gap-4 h-full max-md:w-[19.4375rem] md:max-lg:w-86">
      <div data-cid={cids[1]} className="block">
        <div data-cid={cids[2]} className="block">
          <div data-cid={cids[3]} className={cn("border border-solid border-surface-2 flex relative rounded-[10px] justify-center items-center overflow-hidden aspect-[4/3] w-full", styles.className)}>
            <img data-cid={cids[4]} className="w-full h-63.5 block absolute min-w-0 max-w-full overflow-clip object-cover align-middle [filter:blur(8px)] [scale:1.1] max-md:h-[14.4375rem] md:max-lg:h-64" data-component="image" alt="" aria-hidden="true" src={d.imgSrc} />
            <div data-cid={cids[5]} className={cn("block relative z-10 px-6 pointer-events-none mx-auto w-full max-w-md max-md:px-5", styles.className2)}>
              <ProductCardSlot1 d={d} />
            </div>
          </div>
        </div>
      </div>
      <div data-cid={cids[6]} className={cn("block", styles.className3)}>
        <p data-cid={cids[7]} className="block mb-1 font-medium">
          {d.description}
        </p>
        <p data-cid={cids[8]} className="block text-muted-foreground text-sm leading-5 text-pretty">
          {d.description2}
        </p>
      </div>
    </div>
  );
}

function ProductCardSlot1({ d }: { d: ProductCardData }) {
  switch (d.variant) {
    case "traffic-overview":
      return (
        <div className="flex gap-3 pointer-events-none w-full max-md:gap-2" data-cid="n477">
          <div className="w-[139.7px] h-[139.7px] border border-solid border-color-008 block relative min-w-0 p-3 rounded-[14px] flex-1 text-left bg-surface-3 pointer-events-none aspect-square max-md:w-[130.5px] max-md:h-[130.5px] max-md:p-2.5 md:max-lg:w-[8.8125rem] md:max-lg:h-[8.8125rem]" data-cid="n478">
            <div className="w-[113.7px] flex flex-col gap-1 pointer-events-none h-full max-md:w-[108.5px] md:max-lg:w-[7.1875rem]" data-cid="n479">
              <div className="flex min-w-0 justify-between items-baseline gap-2 pointer-events-none w-full" data-cid="n480">
                <span className="block overflow-hidden text-muted-foreground text-xs font-medium leading-[0.9375rem] whitespace-nowrap text-nowrap pointer-events-none" data-cid="n481">
                  Visitors
                </span>
                <span className="flex relative shrink-0 text-primary text-xs font-medium leading-[0.9375rem] pointer-events-none" data-cid="n482">
                  +18.4%
                </span>
              </div>
              <div className="w-[113.7px] block min-w-0 mt-[70.7px] pointer-events-none max-md:w-[108.5px] max-md:mt-[65.5px] md:max-lg:w-[7.1875rem] md:max-lg:mt-18" data-cid="n483">
                <span className="inline overflow-hidden font-medium leading-5 tracking-[-0.4px] whitespace-nowrap text-nowrap pointer-events-none" data-cid="n484">
                  {d.stat}
                </span>
              </div>
            </div>
          </div>
          <div className="w-[139.7px] h-[139.7px] border border-solid border-surface block relative min-w-0 p-3 rounded-[14px] flex-1 text-left bg-surface-3 pointer-events-none aspect-square max-md:w-[130.5px] max-md:h-[130.5px] max-md:p-2.5 md:max-lg:w-[8.8125rem] md:max-lg:h-[8.8125rem]" data-cid="n485">
            <div className="w-[113.7px] flex flex-col gap-1 pointer-events-none h-full max-md:w-[108.5px] md:max-lg:w-[7.1875rem]" data-cid="n486">
              <div className="flex min-w-0 justify-between items-baseline gap-2 pointer-events-none w-full" data-cid="n487">
                <span className="block overflow-hidden text-muted-foreground text-xs font-medium leading-[0.9375rem] whitespace-nowrap text-nowrap pointer-events-none" data-cid="n488">
                  Revenue
                </span>
                <span className="flex relative shrink-0 text-muted-foreground text-xs font-medium leading-[0.9375rem] pointer-events-none" data-cid="n489">
                  77 paid
                </span>
              </div>
              <div className="w-[113.7px] block min-w-0 mt-[70.7px] pointer-events-none max-md:w-[108.5px] max-md:mt-[65.5px] md:max-lg:w-[7.1875rem] md:max-lg:mt-18" data-cid="n490">
                <span className="inline overflow-hidden font-medium leading-5 tracking-[-0.4px] whitespace-nowrap text-nowrap pointer-events-none" data-cid="n491">
                  {d.eyebrow}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    case "conversions":
      return (
        <div className="block pointer-events-none w-full" data-cid="n501">
          <ul className="h-16 min-h-16 flex relative flex-col [list-style-type:none] list-outside pointer-events-none" data-cid="n502">
            <li className="w-[291.3px] h-8.5 border border-solid border-surface list-item absolute z-10 min-w-0 pl-1 rounded-lg bg-surface-3 transform-[matrix(0.999657,-0.0261769,0.0261769,0.999657,8,0)] origin-[145.664px_17px] pointer-events-none max-md:w-[16.8125rem] max-md:origin-[134.5px_17px] md:max-lg:w-73.5 md:max-lg:origin-[147px_17px]" data-cid="n503">
              <div className="block relative rounded-lg overflow-hidden pointer-events-none w-full" data-cid="n504">
                <div className="w-[10.775rem] h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none max-md:w-[9.9375rem] md:max-lg:w-[10.875rem]" data-cid="n505" aria-hidden="true" />
                <div className="w-[285.3px] flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 pointer-events-none max-md:w-[16.4375rem] max-md:px-2 md:max-lg:w-72" data-cid="n506">
                  <span className="w-[197.3px] block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap pointer-events-none max-md:w-[11.6875rem] md:max-lg:w-50" data-cid="n507">
                    {d.eyebrow}
                  </span>
                  <span className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n508">
                    342
                  </span>
                </div>
              </div>
            </li>
            <li className="w-[291.3px] h-8.5 border border-solid border-surface list-item absolute top-6.5 z-20 min-w-0 pl-1 rounded-lg bg-surface-3 transform-[matrix(0.999848,0.0174524,-0.0174524,0.999848,-4,0)] origin-[145.664px_17px] pointer-events-none max-md:w-[16.8125rem] max-md:origin-[134.5px_17px] md:max-lg:w-73.5 md:max-lg:origin-[147px_17px]" data-cid="n509">
              <div className="h-8 block relative rounded-lg overflow-hidden pointer-events-none w-full" data-cid="n510">
                <div className="w-[7.0625rem] h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none max-md:w-[6.5rem] md:max-lg:w-[7.125rem]" data-cid="n511" aria-hidden="true" />
                <div className="w-[285.3px] h-8 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 pointer-events-none max-md:w-[16.4375rem] max-md:px-2 md:max-lg:w-72" data-cid="n512">
                  <span className="w-[197.3px] h-4 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap pointer-events-none max-md:w-[11.6875rem] md:max-lg:w-50" data-cid="n513">
                    {d.label}
                  </span>
                  <span className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n514">
                    {d.stat}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      );
    case "pin-notes-to-specific-days-on-your-traffic":
      return (
        <div className="block pointer-events-none w-full" data-cid="n524">
          <div className="h-[9.6875rem] border border-solid border-surface grid pt-1.5 pb-2 px-2.5 rounded-[10px] gap-1.5 grid-rows-[16px_16px_12px_77px] text-xs leading-4 bg-surface-3 pointer-events-none grid-cols-1 w-full" data-cid="n525">
            <div className="block text-muted-foreground font-medium tracking-[0.3px] pointer-events-none" data-cid="n526">
              Pinned
            </div>
            <div className="block font-medium pointer-events-none" data-cid="n527">
              July 17, 2026
            </div>
            <div className="flex flex-wrap items-center gap-2 pointer-events-none w-full" data-cid="n528">
              <div className="flex justify-between items-center flex-1 gap-4 leading-3 pointer-events-none" data-cid="n529">
                <span className="block text-muted-foreground pointer-events-none" data-cid="n530">
                  Visitors
                </span>
                <span className="block font-medium pointer-events-none" data-cid="n531">
                  {d.stat}
                </span>
              </div>
            </div>
            <div className="w-[269.3px] h-[4.8125rem] border-t border-solid border-t-surface-4 grid min-w-0 pt-1.5 gap-1.5 grid-rows-[36px_28px] pointer-events-none grid-cols-1 max-md:w-[15.4375rem] md:max-lg:w-68" data-cid="n532">
              <ul className="w-[269.3px] h-9 grid min-w-0 gap-1 grid-rows-[16px_16px] [list-style-type:none] list-outside pointer-events-none grid-cols-1 max-md:w-[15.4375rem] md:max-lg:w-68" data-cid="n533">
                <li className="w-[269.3px] h-4 flex min-w-0 items-center gap-1.5 text-color-005 pointer-events-none max-md:w-[15.4375rem] md:max-lg:w-68" data-cid="n534">
                  <span className="w-2 h-2 block rounded-xs shrink-0 bg-clr-7 pointer-events-none" data-cid="n535" aria-hidden="true" />
                  <span className="w-[211.3px] h-4 block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-nowrap pointer-events-none max-md:w-[11.8125rem] md:max-lg:w-53.5" data-cid="n536">
                    Product launch campaign went live
                  </span>
                  <button className="block opacity-50 p-0.5 rounded-sm text-muted-foreground text-center cursor-default pointer-events-none hover:bg-background hover:text-foreground hover:[text-decoration-color:var(--foreground)]" data-cid="n537" data-component="button" aria-label={"Edit note \"Product launch campaign went live\""} disabled type="button">
                    <Icon4 cid={"n538"} />
                  </button>
                  <button className="block opacity-50 p-0.5 rounded-sm text-muted-foreground text-center cursor-default pointer-events-none hover:bg-background hover:text-foreground hover:[text-decoration-color:var(--foreground)]" data-cid="n539" data-component="button" aria-label={"Delete note \"Product launch campaign went live\""} disabled type="button">
                    <Icon5 cid={"n540"} />
                  </button>
                </li>
                <li className="w-[269.3px] h-4 flex min-w-0 items-center gap-1.5 text-color-005 pointer-events-none max-md:w-[15.4375rem] md:max-lg:w-68" data-cid="n541">
                  <span className="w-2 h-2 block rounded-xs shrink-0 bg-clr-6 pointer-events-none" data-cid="n542" aria-hidden="true" />
                  <span className="w-[211.3px] h-4 block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-nowrap pointer-events-none max-md:w-[11.8125rem] md:max-lg:w-53.5" data-cid="n543">
                    Newsletter sent to 12k subscribers
                  </span>
                  <button className="block opacity-50 p-0.5 rounded-sm text-muted-foreground text-center cursor-default pointer-events-none hover:bg-background hover:text-foreground hover:[text-decoration-color:var(--foreground)]" data-cid="n544" data-component="button" aria-label={"Edit note \"Newsletter sent to 12k subscribers\""} disabled type="button">
                    <Icon4 cid={"n545"} />
                  </button>
                  <button className="block opacity-50 p-0.5 rounded-sm text-muted-foreground text-center cursor-default pointer-events-none hover:bg-background hover:text-foreground hover:[text-decoration-color:var(--foreground)]" data-cid="n546" data-component="button" aria-label={"Delete note \"Newsletter sent to 12k subscribers\""} disabled type="button">
                    <Icon5 cid={"n547"} />
                  </button>
                </li>
              </ul>
              <button className="block opacity-50 py-1.5 px-2 rounded-sm font-medium text-center bg-background cursor-default pointer-events-none w-full hover:bg-clr-27" data-cid="n548" data-component="button" disabled type="button">
                Add a note
              </button>
            </div>
          </div>
        </div>
      );
    case "connect-search-console-to-see-which-querie":
      return (
        <div className="block pointer-events-none w-full" data-cid="n558">
          <ul className="h-16 min-h-16 flex relative flex-col [list-style-type:none] list-outside pointer-events-none" data-cid="n559">
            <li className="w-[291.3px] h-8.5 border border-solid border-surface list-item absolute z-10 min-w-0 pl-1 rounded-lg bg-surface-3 transform-[matrix(0.999657,-0.0261769,0.0261769,0.999657,8,0)] origin-[145.664px_17px] pointer-events-none max-md:w-[16.8125rem] max-md:origin-[134.5px_17px] md:max-lg:w-73.5 md:max-lg:origin-[147px_17px]" data-cid="n560">
              <div className="h-8 block relative rounded-lg overflow-hidden pointer-events-none w-full" data-cid="n561">
                <div className="w-[9.8375rem] h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none max-md:w-[9.0625rem] md:max-lg:w-[158.9px]" data-cid="n562" aria-hidden="true" />
                <div className="w-[285.3px] h-8 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 pointer-events-none max-md:w-[16.4375rem] max-md:px-2 md:max-lg:w-72" data-cid="n563">
                  <span className="w-[197.3px] h-4 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap pointer-events-none max-md:w-[11.6875rem] md:max-lg:w-50" data-cid="n564">
                    privacy friendly analytics
                  </span>
                  <span className="block shrink-0 text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n565">
                    764
                  </span>
                </div>
              </div>
            </li>
            <li className="w-[291.3px] h-8.5 border border-solid border-surface list-item absolute top-6.5 z-20 min-w-0 pl-1 rounded-lg bg-surface-3 transform-[matrix(0.999848,0.0174524,-0.0174524,0.999848,-4,0)] origin-[145.664px_17px] pointer-events-none max-md:w-[16.8125rem] max-md:origin-[134.5px_17px] md:max-lg:w-73.5 md:max-lg:origin-[147px_17px]" data-cid="n566">
              <div className="h-8 block relative rounded-lg overflow-hidden pointer-events-none w-full" data-cid="n567">
                <div className="w-32 h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none max-md:w-[7.375rem] md:max-lg:w-[129.1px]" data-cid="n568" aria-hidden="true" />
                <div className="w-[285.3px] h-8 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 pointer-events-none max-md:w-[16.4375rem] max-md:px-2 md:max-lg:w-72" data-cid="n569">
                  <span className="w-[197.3px] h-4 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap pointer-events-none max-md:w-[11.6875rem] md:max-lg:w-50" data-cid="n570">
                    cookieless analytics
                  </span>
                  <span className="block shrink-0 text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n571">
                    {d.stat}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      );
    case "see-when-conversions-peak-by-day-and-hour-":
      return (
        <div className="border border-solid border-surface block p-3.5 rounded-[14px] overflow-hidden bg-surface-3 pointer-events-none w-full max-md:p-3" data-cid="n581">
          <div className="grid gap-0.5 pointer-events-none grid-rows-7 grid-cols-12" data-cid="n582">
            <div className="h-5 border border-solid border-border block opacity-[0.1704] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n583" />
            <div className="h-5 border border-solid border-border block opacity-[0.1704] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.016s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n584" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.032s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n585" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.048s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n586" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.064s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n587" />
            <div className="h-5 border border-solid border-border block opacity-[0.252] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.08s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n588" />
            <div className="h-5 border border-solid border-border block opacity-[0.252] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.096s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n589" />
            <div className="h-5 border border-solid border-border block opacity-[0.252] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.112s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n590" />
            <div className="h-5 border border-solid border-border block opacity-[0.252] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.128s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n591" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.144s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n592" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.16s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n593" />
            <div className="h-5 border border-solid border-border block opacity-[0.1704] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.176s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n594" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.192s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n595" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.208s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n596" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.224s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n597" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.24s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n598" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.256s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n599" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.272s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n600" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.288s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n601" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.304s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n602" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.32s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n603" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.336s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n604" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.352s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n605" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.368s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n606" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.384s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n607" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.4s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n608" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.416s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n609" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.432s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n610" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.448s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n611" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.464s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n612" />
            <div className="h-5 border border-solid border-border block opacity-[0.847] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.48s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n613" />
            <div className="h-5 border border-solid border-border block rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.496s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n614" />
            <div className="h-5 border border-solid border-border block opacity-[0.898] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.512s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n615" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.528s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n616" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.544s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n617" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.56s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n618" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.576s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n619" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.592s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n620" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.608s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n621" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.624s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n622" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.64s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n623" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.656s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n624" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.672s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n625" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.688s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n626" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.704s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n627" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.72s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n628" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.736s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n629" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.752s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n630" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.768s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n631" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.784s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n632" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.8s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n633" />
            <div className="h-5 border border-solid border-border block opacity-[0.762] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.816s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n634" />
            <div className="h-5 border border-solid border-border block opacity-[0.813] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.832s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n635" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.848s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n636" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.864s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n637" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.88s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n638" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.896s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n639" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.912s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n640" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.928s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n641" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.944s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n642" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.96s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n643" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.976s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n644" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:0.992s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n645" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.008s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n646" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.024s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n647" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.04s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n648" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.056s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n649" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.072s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n650" />
            <div className="h-5 border border-solid border-border block opacity-49 rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.088s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n651" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.104s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n652" />
            <div className="h-5 border border-solid border-border block opacity-[0.405] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.12s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n653" />
            <div className="h-5 border border-solid border-border block opacity-[0.218] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.136s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n654" />
            <div className="h-5 border border-solid border-border block opacity-[0.1704] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.152s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n655" />
            <div className="h-5 border border-solid border-border block opacity-[0.1704] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.168s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n656" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.184s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n657" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.2s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n658" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.216s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n659" />
            <div className="h-5 border border-solid border-border block opacity-[0.252] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.232s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n660" />
            <div className="h-5 border border-solid border-border block opacity-[0.252] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.248s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n661" />
            <div className="h-5 border border-solid border-border block opacity-[0.252] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.264s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n662" />
            <div className="h-5 border border-solid border-border block opacity-[0.252] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.28s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n663" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.296s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n664" />
            <div className="h-5 border border-solid border-border block opacity-[0.2265] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.312s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n665" />
            <div className="h-5 border border-solid border-border block opacity-[0.1704] rounded-md bg-foreground [animation-name:siteOsHeatmapPreviewCellReveal] [animation-duration:0.48s] [animation-timing-function:cubic-bezier(0.16,_1,_0.3,_1)] [animation-delay:1.328s] [animation-fill-mode:both] pointer-events-none aspect-square max-md:h-[1.15rem]" data-cid="n666" />
          </div>
        </div>
      );
    case "measure-the-actions-that-matter-from-sign-":
      return (
        <div className="block pointer-events-none w-full" data-cid="n676">
          <ul className="h-16 min-h-16 flex relative flex-col [list-style-type:none] list-outside pointer-events-none" data-cid="n677">
            <li className="w-[291.3px] h-8.5 border border-solid border-surface list-item absolute z-10 min-w-0 pl-1 rounded-lg bg-surface-3 transform-[matrix(0.999657,-0.0261769,0.0261769,0.999657,8,0)] origin-[145.672px_17px] pointer-events-none max-md:w-[16.8125rem] max-md:origin-[134.5px_17px] md:max-lg:w-73.5 md:max-lg:origin-[147px_17px]" data-cid="n678">
              <div className="h-8 block relative rounded-lg overflow-hidden pointer-events-none w-full" data-cid="n679">
                <div className="w-[10.6875rem] h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none max-md:w-[9.85rem] md:max-lg:w-[10.7875rem]" data-cid="n680" aria-hidden="true" />
                <div className="w-[285.3px] h-8 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 pointer-events-none max-md:w-[16.4375rem] max-md:px-2 md:max-lg:w-72" data-cid="n681">
                  <span className="w-[125.3px] h-4 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap pointer-events-none max-md:w-[8.1875rem] md:max-lg:w-32" data-cid="n682">
                    Clicked live demo
                  </span>
                  <div className="flex justify-end items-baseline shrink-0 gap-4 pointer-events-none max-md:gap-2" data-cid="n683">
                    <span className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n684">
                      956
                    </span>
                    <span className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n685">
                      1,184
                    </span>
                  </div>
                </div>
              </div>
            </li>
            <li className="w-[291.3px] h-8.5 border border-solid border-surface list-item absolute top-6.5 z-20 min-w-0 pl-1 rounded-lg bg-surface-3 transform-[matrix(0.999848,0.0174524,-0.0174524,0.999848,-4,0)] origin-[145.672px_17px] pointer-events-none max-md:w-[16.8125rem] max-md:origin-[134.5px_17px] md:max-lg:w-73.5 md:max-lg:origin-[147px_17px]" data-cid="n686">
              <div className="h-8 block relative rounded-lg overflow-hidden pointer-events-none w-full" data-cid="n687">
                <div className="w-[7.15rem] h-6 block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none max-md:w-[6.5875rem] md:max-lg:w-[7.2125rem]" data-cid="n688" aria-hidden="true" />
                <div className="w-[285.3px] h-8 flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 pointer-events-none max-md:w-[16.4375rem] max-md:px-2 md:max-lg:w-72" data-cid="n689">
                  <span className="w-[125.3px] h-4 block min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap pointer-events-none max-md:w-[8.1875rem] md:max-lg:w-32" data-cid="n690">
                    Copied install script
                  </span>
                  <div className="flex justify-end items-baseline shrink-0 gap-4 pointer-events-none max-md:gap-2" data-cid="n691">
                    <span className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n692">
                      604
                    </span>
                    <span className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n693">
                      {d.stat}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      );
    case "see-who-is-on-your-site-right-now-where-th":
      return (
        <div className="border border-solid border-surface block relative max-h-36 rounded-[14px] overflow-hidden bg-surface-3 pointer-events-none aspect-[5/2] w-full" data-cid="n703">
          <div className="block relative overflow-hidden [font-family:'Helvetica_Neue',_Arial,_Helvetica,_sans-serif] text-xs leading-5 pointer-events-none h-full w-full" data-cid="n704" aria-hidden="true">
            <div className="block pointer-events-none" data-cid="n705">
              <img className="w-[18.0625rem] h-[7.1875rem] block absolute overflow-clip aspect-[auto_289/115] align-middle pointer-events-none max-md:w-[16.6875rem] max-md:h-26.5 max-md:aspect-[auto_267/106] md:max-lg:w-73 md:max-lg:h-29 md:max-lg:aspect-[auto_292/116]" data-cid="n706" aria-label="Map" height="115" role="region" src="/assets/cloned/images/3ae5376332fd.png" width="289" alt="" />
              <div className="w-3.5 h-3.5 border-2 border-solid border-surface-3 block absolute rounded-full bg-foreground shadow-[var(--clr-8)_0px_1px_2px_0px] transform-[matrix(1,0,0,1,-179,101)] pointer-events-none" data-cid="n707" aria-label="Map marker" role="button" />
              <div className="w-4 h-4 border-2 border-solid border-surface-3 block absolute rounded-full bg-foreground shadow-[var(--clr-8)_0px_1px_2px_0px] transform-[matrix(1,0,0,1,-5,87)] pointer-events-none max-md:transform-[matrix(1,0,0,1,-16,82)] md:max-lg:transform-[matrix(1,0,0,1,-3,87)]" data-cid="n708" data-component="button" aria-label="Map marker" role="button" />
              <div className="w-3.5 h-3.5 border-2 border-solid border-surface-3 block absolute rounded-full bg-foreground shadow-[var(--clr-8)_0px_1px_2px_0px] transform-[matrix(1,0,0,1,264,31)] pointer-events-none max-md:transform-[matrix(1,0,0,1,253,26)] md:max-lg:transform-[matrix(1,0,0,1,265,31)]" data-cid="n709" data-component="button" aria-label="Map marker" role="button" />
              <div className="w-3.5 h-3.5 border-2 border-solid border-surface-3 block absolute rounded-full bg-foreground shadow-[var(--clr-8)_0px_1px_2px_0px] transform-[matrix(1,0,0,1,313,25)] pointer-events-none max-md:transform-[matrix(1,0,0,1,302,20)] md:max-lg:transform-[matrix(1,0,0,1,314,25)]" data-cid="n710" data-component="button" aria-label="Map marker" role="button" />
            </div>
            <div className="block pointer-events-none" data-cid="n711" />
          </div>
          <div className="w-6.5 h-12.5 border border-solid border-surface-4 flex absolute top-2 right-2 rounded-lg flex-col overflow-hidden bg-clr-9 pointer-events-none" data-cid="n712">
            <span className="w-6 h-6 border-b border-solid border-b-surface-4 flex justify-center items-center text-muted-foreground text-xs leading-3 pointer-events-none" data-cid="n713">
              +
            </span>
            <span className="w-6 h-6 flex justify-center items-center text-muted-foreground text-xs leading-3 pointer-events-none" data-cid="n714">
              −
            </span>
          </div>
        </div>
      );
    case "flag-your-not-found-page-once-then-see-bro":
      return (
        <div className="block pointer-events-none w-full" data-cid="n724">
          <ul className="h-16 min-h-16 flex relative flex-col [list-style-type:none] list-outside pointer-events-none" data-cid="n725">
            <li className="w-[291.3px] h-[34.5px] border border-solid border-surface list-item absolute z-10 min-w-0 pl-1 rounded-lg bg-surface-3 transform-[matrix(0.999657,-0.0261769,0.0261769,0.999657,8,0)] origin-[145.664px_17.25px] pointer-events-none max-md:w-[16.8125rem] max-md:origin-[134.5px_17.25px] md:max-lg:w-73.5 md:max-lg:origin-[147px_17.25px]" data-cid="n726">
              <div className="h-[32.5px] block relative rounded-lg overflow-hidden pointer-events-none w-full" data-cid="n727">
                <div className="w-[10.8375rem] h-[24.5px] block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none max-md:w-40 md:max-lg:w-[10.9375rem]" data-cid="n728" aria-hidden="true" />
                <div className="w-[285.3px] h-[32.5px] flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 pointer-events-none max-md:w-[16.4375rem] max-md:px-2 md:max-lg:w-72" data-cid="n729">
                  <span className="w-[197.3px] h-[16.5px] flex min-w-0 items-baseline flex-1 gap-2 pointer-events-none max-md:w-[11.6875rem] md:max-lg:w-50" data-cid="n730">
                    <span className="w-[5.4125rem] h-4 block min-w-0 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap pointer-events-none max-md:w-[5.125rem] md:max-lg:w-[5.4875rem]" data-cid="n731" title="/docs/old-install">
                      /docs/old-install
                    </span>
                    <span className="w-[102.7px] h-[16.5px] block min-w-0 overflow-hidden text-muted-foreground text-[0.6875rem] leading-[1.0625rem] whitespace-nowrap text-nowrap pointer-events-none max-md:w-[6.0625rem] md:max-lg:w-[6.5125rem]" data-cid="n732" title="Most linked from /docs/overview">
                      from /docs/overview
                    </span>
                  </span>
                  <span className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n733" aria-label="48 hits">
                    48
                  </span>
                </div>
              </div>
            </li>
            <li className="w-[291.3px] h-[34.5px] border border-solid border-surface list-item absolute top-6.5 z-20 min-w-0 pl-1 rounded-lg bg-surface-3 transform-[matrix(0.999848,0.0174524,-0.0174524,0.999848,-4,0)] origin-[145.664px_17.25px] pointer-events-none max-md:w-[16.8125rem] max-md:origin-[134.5px_17.25px] md:max-lg:w-73.5 md:max-lg:origin-[147px_17.25px]" data-cid="n734">
              <div className="h-[32.5px] block relative rounded-lg overflow-hidden pointer-events-none w-full" data-cid="n735">
                <div className="w-28 h-[24.5px] block absolute top-1 left-0 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both] pointer-events-none max-md:w-[6.45rem] md:max-lg:w-[7.0625rem]" data-cid="n736" aria-hidden="true" />
                <div className="w-[285.3px] h-[32.5px] flex relative z-10 py-2 px-2.5 justify-between items-center gap-3 pointer-events-none max-md:w-[16.4375rem] max-md:px-2 md:max-lg:w-72" data-cid="n737">
                  <span className="w-[197.3px] h-[16.5px] flex min-w-0 items-baseline flex-1 gap-2 pointer-events-none max-md:w-[11.6875rem] md:max-lg:w-50" data-cid="n738">
                    <span className="w-20 h-4 block min-w-0 overflow-hidden text-xs leading-4 whitespace-nowrap text-nowrap pointer-events-none" data-cid="n739" title="/pricing-2024">
                      /pricing-2024
                    </span>
                    <span className="w-24.5 block min-w-0 overflow-hidden text-muted-foreground text-[0.6875rem] leading-[1.0625rem] whitespace-nowrap text-nowrap pointer-events-none" data-cid="n740" title="Most linked from /blog/launch">
                      from /blog/launch
                    </span>
                  </span>
                  <span className="block text-muted-foreground text-[0.6875rem] leading-[0.6875rem] text-right pointer-events-none w-14 max-md:w-12" data-cid="n741" aria-label="31 hits">
                    {d.stat}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      );
    case "connect-cursor-claude-code-or-codex-to-pul":
      return (
        <div className="border border-solid border-surface block p-2.5 rounded-[14px] text-[0.6875rem] leading-[1.0625rem] bg-surface-3 pointer-events-none w-full" data-cid="n751">
          <div className="block mb-1.5 ml-[1.6875rem] py-1.5 px-2 rounded-lg leading-[0.9375rem] bg-background pointer-events-none max-w-[90%] max-md:ml-[24.7px] md:max-lg:ml-[1.7rem]" data-cid="n752">
            What changed on my site this week?
          </div>
          <div className="block py-1.5 px-2 rounded-lg leading-[0.9375rem] bg-color-007 pointer-events-none" data-cid="n753">
            <p className="h-[15.1px] block overflow-hidden text-muted-foreground whitespace-nowrap text-nowrap pointer-events-none" data-cid="n754">
              get_overview, get_top_pages
            </p>
            <p className="h-[31.3px] mt-1 overflow-hidden pointer-events-none line-clamp-2" data-cid="n755">
              <strong className="inline font-semibold pointer-events-none" data-cid="n756">
                6,952 visitors
              </strong>
              {" over 14 days. Improve "}
              <span className="inline [font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace] pointer-events-none" data-cid="n757">
                /pricing
              </span>
              {" first."}
            </p>
          </div>
        </div>
      );
    default:
      return null;
  }
}
