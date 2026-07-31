// @ts-nocheck
import Tile4, { type Tile4Data } from "../components/tile4";
import Illustration3 from "../svgs/svg-illustration3";
import Tile5, { type Tile5Data } from "../components/tile5";
import Tile6, { type Tile6Data } from "../components/tile6";
import { Tile4_cids, Tile5_cids, Tile6_cids } from "../_cids";
import { Tile4_styles, Tile5_styles, Tile6_styles } from "../_styles";
const Tile4_data: Tile4Data[] = [
    { ariaLabel: "/: 75 visitors, 100% conversion", text: "Step 1", label: "/", text2: "/", text3: "75", text4: "100%", text5: "-" },
    { ariaLabel: "/pricing: 64 visitors, 85% conversion", text: "Step 2", label: "/pricing", text2: "/pricing", text3: "64", text4: "85%", text5: "15%" },
    { ariaLabel: "signup: 39 visitors, 61% conversion", text: "Step 3", label: "signup", text2: "signup", text3: "39", text4: "61%", text5: "39%" }
];
const Tile5_data: Tile5Data[] = [
    { ariaLabel: "/: 75 visitors, 100% conversion", text: "Step 1", label: "/", text2: "/", text3: "75 visitors", text4: "- drop-off", text5: "100%" },
    { ariaLabel: "/pricing: 64 visitors, 85% conversion", text: "Step 2", label: "/pricing", text2: "/pricing", text3: "64 visitors", text4: "15% drop-off", text5: "85%" },
    { ariaLabel: "signup: 39 visitors, 61% conversion", text: "Step 3", label: "signup", text2: "signup", text3: "39 visitors", text4: "39% drop-off", text5: "61%" }
];
const Tile6_data: Tile6Data[] = [
    { text: "1. /", text2: "75", text3: "100%", text4: "-" },
    { text: "2. /pricing", text2: "64", text3: "85.3%", text4: "14.7%" },
    { text: "3. signup", text2: "39", text3: "60.9%", text4: "39.1%" }
];
/** See Where Visitors section. */
export default function SeeWhereVisitorsSection({ tile4Data = Tile4_data, tile5Data = Tile5_data, tile6Data = Tile6_data } = {}) {
  return (
    <section className="block pt-8" data-cid="n1652">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n1653">
        <div className="block mx-auto text-center max-w-3xl" data-cid="n1654">
          <div className="block text-balance" data-cid="n1655">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n1656" data-component="heading">
              See where the buyer path breaks.
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n1657">
              Trace query → page → offer → proof → CTA chains in the knowledge graph, then open work orders for the gaps.
            </p>
          </div>
        </div>
        <div className="h-[681.5px] block relative mt-8 max-md:h-[44.9125rem]" data-cid="n1658">
          <astro-island class="contents" data-cid="n1659">
            <div className="h-[681.5px] block max-md:h-[44.9125rem]" data-cid="n1660">
              <astro-slot class="contents" data-cid="n1661">
                <astro-island class="contents" data-cid="n1662">
                  <div className="block w-full" data-cid="n1663">
                    <div className="border border-solid border-surface flex mb-4 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-auto w-full" data-cid="n1664">
                      <div className="h-[75.3px] grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_16px] [grid-auto-rows:min-content] grid-cols-1 max-md:h-[67.3px] max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n1665">
                        <div className="block font-medium leading-[1.1875rem]" data-cid="n1666">
                          Lead conversion
                        </div>
                        <div className="block text-muted-foreground text-xs font-medium leading-4 text-balance" data-cid="n1667">
                          39 completed, 52% total conversion
                        </div>
                      </div>
                      <div className="w-full block min-w-0 pt-2" data-cid="n1668">
                        <div className="block w-full" data-cid="n1669">
                          <div className="block pb-5 px-4 w-full max-md:pb-4 max-md:px-3" data-cid="n1670">
                            <div className="hidden max-md:block" data-cid="n1671">
                              {tile4Data.map((d, i) => <Tile4 key={i} d={d} cids={Tile4_cids[i]} styles={Tile4_styles[i]} />)}
                            </div>
                            <div className="w-full block max-md:hidden" data-cid="n1726">
                              <div className="h-80 min-h-80 border-r border-solid border-r-clr-15 border-l border-l-clr-15 block relative overflow-hidden" data-cid="n1727">
                                <Illustration3 cid={"n1728"} />
                                <div className="w-255 min-h-80 grid relative z-10 grid-cols-3 grid-rows-1 aspect-[3.188] md:max-lg:w-167 md:max-lg:aspect-[2.088]" data-cid="n1729">
                                  {tile5Data.map((d, i) => <Tile5 key={i} d={d} cids={Tile5_cids[i]} styles={Tile5_styles[i]} />)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-auto w-full" data-cid="n1754">
                      <div className="h-[75.3px] grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_16px] [grid-auto-rows:min-content] grid-cols-1 max-md:h-[67.3px] max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n1755">
                        <div className="block font-medium leading-[1.1875rem]" data-cid="n1756">
                          Step breakdown
                        </div>
                        <div className="block text-muted-foreground text-xs font-medium leading-4 text-balance" data-cid="n1757">
                          All time
                        </div>
                      </div>
                      <div className="w-full block min-w-0 pb-5 px-4 max-md:pb-4 max-md:px-3" data-cid="n1758">
                        <div className="block relative overflow-auto w-full" data-cid="n1759">
                          <table className="table [border-collapse:collapse] w-full" data-cid="n1760">
                            <thead className="table-header-group align-middle [border-collapse:collapse]" data-cid="n1761">
                              <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n1762">
                                <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-left whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto" data-cid="n1763">
                                  Step
                                </th>
                                <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto" data-cid="n1764">
                                  Visitors
                                </th>
                                <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto" data-cid="n1765">
                                  Conv.
                                </th>
                                <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto" data-cid="n1766">
                                  Drop-off
                                </th>
                              </tr>
                            </thead>
                            <tbody className="table-row-group align-middle [border-collapse:collapse]" data-cid="n1767">
                              {tile6Data.map((d, i) => <Tile6 key={i} d={d} cids={Tile6_cids[i]} styles={Tile6_styles[i]} />)}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </astro-island>
              </astro-slot>
            </div>
          </astro-island>
        </div>
      </div>
    </section>
  );
}
