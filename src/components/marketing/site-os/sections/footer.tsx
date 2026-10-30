// @ts-nocheck
import Icon11 from "../svgs/svg-icon11";
import Illustration6 from "../svgs/svg-illustration6";
import ListRow11 from "../components/list-row11";
import Icon12 from "../svgs/svg-icon12";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { ListRow11_cids, ListRow11_cids2, ListRow11_cids3, ListRow11_cids4, ListRow11_cids5, ListRow11_cids6, ListRow11_cids7, ListRow11_cids8, ListRow11_cids9, ListRow11_cids10, ListRow11_cids11 } from "../_cids";
import { ListRow11_styles, ListRow11_styles2, ListRow11_styles3, ListRow11_styles4, ListRow11_styles5, ListRow11_styles6, ListRow11_styles7, ListRow11_styles8, ListRow11_styles9, ListRow11_styles10, ListRow11_styles11 } from "../_styles";
import { listRow11Data as listRow11DataContent, listRow11Data2 as listRow11Data2Content, listRow11Data3 as listRow11Data3Content, listRow11Data4 as listRow11Data4Content, listRow11Data5 as listRow11Data5Content, listRow11Data6 as listRow11Data6Content, listRow11Data7 as listRow11Data7Content, listRow11Data8 as listRow11Data8Content, listRow11Data9 as listRow11Data9Content, listRow11Data10 as listRow11Data10Content, listRow11Data11 as listRow11Data11Content } from "../content";
/** Site footer. */
export default function Footer({ listRow11Data = listRow11DataContent, listRow11Data2 = listRow11Data2Content, listRow11Data3 = listRow11Data3Content, listRow11Data4 = listRow11Data4Content, listRow11Data5 = listRow11Data5Content, listRow11Data6 = listRow11Data6Content, listRow11Data7 = listRow11Data7Content, listRow11Data8 = listRow11Data8Content, listRow11Data9 = listRow11Data9Content, listRow11Data10 = listRow11Data10Content, listRow11Data11 = listRow11Data11Content } = {}) {
  return (
    <footer className="block relative pt-20 pb-8 overflow-x-clip" data-cid="n2416">
      <img className="block absolute right-0 bottom-0 z-0 max-w-full overflow-clip aspect-[auto_343/370] align-middle pointer-events-none h-auto w-56 max-md:w-36 md:max-lg:w-44" data-cid="n2417" data-component="image" alt="" aria-hidden="true" height="370" src="/assets/cloned/images/ed1c86b8e3c8.png" width="343" />
      <div className="block relative z-10 max-w-280 mx-auto px-8" data-cid="n2418">
        <div className="block w-full" data-cid="n2455">
          <nav className="grid gap-8 grid-rows-[120px] text-sm leading-5 grid-cols-5 max-md:grid-rows-[120px_120px_92px] max-md:grid-cols-2 md:max-lg:grid-rows-[120px_72px] md:max-lg:grid-cols-4 2xl:grid-rows-[124px]" data-cid="n2456" data-component="nav">
            <Icon11 cid={"n2457"} />
            <div className="h-30 block 2xl:h-31" data-cid="n2458">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2459">
                Product
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2460">
                {listRow11Data.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids[i]} styles={ListRow11_styles[i]} />)}
              </ul>
            </div>
            <div className="block" data-cid="n2469">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2470">
                Support
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2471">
                {listRow11Data2.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids2[i]} styles={ListRow11_styles2[i]} />)}
              </ul>
            </div>
            <div className="block" data-cid="n2478">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2479">
                Legal
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2480">
                {listRow11Data3.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids3[i]} styles={ListRow11_styles3[i]} />)}
              </ul>
            </div>
            <div className="block" data-cid="n2489">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2490">
                More
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2491">
                <li className="list-item mb-1" data-cid="n2492">
                  <a className="inline text-muted-foreground text-xs font-medium leading-4 cursor-pointer hover:text-foreground hover:[text-decoration-color:var(--foreground)]" data-cid="n2493" data-component="link" href="https://onmy.land/" rel="noopener noreferrer" target="_blank">
                    More than link in bio
                  </a>
                </li>
                <li className="list-item" data-cid="n2494">
                  <a className="inline text-muted-foreground text-xs font-medium leading-4 cursor-pointer hover:text-foreground hover:[text-decoration-color:var(--foreground)]" data-cid="n2495" data-component="link" href="http://lexingtonthemes.com/" rel="noopener noreferrer" target="_blank">
                    Astro Website templates
                  </a>
                </li>
              </ul>
            </div>
          </nav>
          {/* Feature-link columns (Overview/Breakdowns/...): commented out until those features ship. */}
          {/* <nav className="border-t border-solid border-t-surface-4 grid mt-12 pt-12gap-y-10 gap-x-8 grid-rows-[164px_216px] text-sm leading-5 grid-cols-5 max-md:grid-rows-[184px_120px_192px_236px] max-md:grid-cols-2 md:max-lg:grid-rows-[164px_236px] md:max-lg:grid-cols-4 2xl:grid-rows-[168px_220px]" data-cid="n2496" data-component="nav">
            <div className="h-41 block max-md:h-46 2xl:h-42" data-cid="n2497">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2498">
                Overview
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2499">
                {listRow11Data4.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids4[i]} styles={ListRow11_styles4[i]} />)}
              </ul>
            </div>
            <div className="block" data-cid="n2506">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2507">
                Breakdowns
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2508">
                {listRow11Data5.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids5[i]} styles={ListRow11_styles5[i]} />)}
              </ul>
            </div>
            <div className="h-41 block max-md:h-30 2xl:h-42" data-cid="n2519">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2520">
                Events
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2521">
                {listRow11Data6.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids6[i]} styles={ListRow11_styles6[i]} />)}
              </ul>
            </div>
            <div className="h-41 block max-md:h-30 2xl:h-42" data-cid="n2530">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2531">
                Tracking
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2532">
                {listRow11Data7.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids7[i]} styles={ListRow11_styles7[i]} />)}
              </ul>
            </div>
            <div className="h-41 block max-md:h-48 md:max-lg:h-59 2xl:h-42" data-cid="n2541">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2542">
                Revenue
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2543">
                {listRow11Data8.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids8[i]} styles={ListRow11_styles8[i]} />)}
              </ul>
            </div>
            <div className="h-54 block max-md:h-48 md:max-lg:h-59 2xl:h-55" data-cid="n2550">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2551">
                Privacy
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2552">
                {listRow11Data9.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids9[i]} styles={ListRow11_styles9[i]} />)}
              </ul>
            </div>
            <div className="block" data-cid="n2567">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2568">
                Setup
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2569">
                {listRow11Data10.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids10[i]} styles={ListRow11_styles10[i]} />)}
              </ul>
            </div>
            <div className="h-54 block max-lg:h-59 2xl:h-55" data-cid="n2586">
              <p className="block mb-3 text-xs font-semibold leading-4 uppercase 2xl:[font-size:inherit] 2xl:leading-[inherit]" data-cid="n2587">
                Sharing
              </p>
              <ul className="block [list-style-type:none] list-outside" data-cid="n2588">
                {listRow11Data11.map((d, i) => <ListRow11 key={i} d={d} cids={ListRow11_cids11[i]} styles={ListRow11_styles11[i]} />)}
              </ul>
            </div>
          </nav> */}
          <div className="border-t border-solid border-t-surface-4 flex mt-48 pt-4 flex-wrap justify-end items-center gap-2 text-xs font-semibold leading-4 uppercase max-lg:mt-24" data-cid="n2599">
           
            <div className="flex flex-wrap items-center gap-3 normal-case tracking-normal">
              <ThemeModeToggle />
              <p className="block uppercase tracking-wider" data-cid="n2603">
                © 2026 Site-OS. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
