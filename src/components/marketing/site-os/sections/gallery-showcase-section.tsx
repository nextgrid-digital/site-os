// @ts-nocheck
import TextLink3, { type TextLink3Data } from "../components/text-link3";
import TextLink4, { type TextLink4Data } from "../components/text-link4";
import Illustration4 from "../svgs/svg-illustration4";
import Tile7, { type Tile7Data } from "../components/tile7";
import Tile8, { type Tile8Data } from "../components/tile8";
import Icon6 from "../svgs/svg-icon6";
import Icon3 from "../svgs/svg-icon3";
import ListRow9, { type ListRow9Data } from "../components/list-row9";
import ListRow10, { type ListRow10Data } from "../components/list-row10";
import { TextLink3_cids, TextLink4_cids, Tile7_cids, Tile8_cids, ListRow9_cids, ListRow10_cids } from "../_cids";
import { TextLink3_styles, TextLink4_styles, Tile7_styles, Tile8_styles, ListRow9_styles, ListRow10_styles } from "../_styles";
const TextLink3_data: TextLink3Data[] = [
    { ariapressed: "true", label: "LCP", label2: "n=1,284", label3: "1,800 ms" },
    { ariapressed: "false", label: "INP", label2: "n=1,172", label3: "92 ms" },
    { ariapressed: "false", label: "CLS", label2: "n=1,218", label3: "0.030" },
    { ariapressed: "false", label: "TTFB", label2: "n=984", label3: "420 ms" },
    { ariapressed: "false", label: "FCP", label2: "n=1,246", label3: "1,100 ms" }
];
const TextLink4_data: TextLink4Data[] = [
    { ariapressed: "false", label: "p50" },
    { ariapressed: "true", label: "p75" },
    { ariapressed: "false", label: "p95" }
];
const Tile7_data: Tile7Data[] = [
    { text: "Good" },
    { text: "Watch" },
    { text: "Poor" }
];
const Tile8_data: Tile8Data[] = [
    { text: "/pricing", text2: "2,800 ms", text3: "184" },
    { text: "/docs/install-nextjs", text2: "2,400 ms", text3: "142" },
    { text: "/audit/report", text2: "2,100 ms", text3: "96" },
    { text: "/docs/overview", text2: "2,000 ms", text3: "82" }
];
const ListRow9_data: ListRow9Data[] = [
    { label: "Safari", text: "Safari", text2: "2,140 ms", text3: "318" },
    { label: "Chrome", text: "Chrome", text2: "1,680 ms", text3: "624" },
    { label: "Firefox", text: "Firefox", text2: "1,980 ms", text3: "144" },
    { label: "Edge", text: "Edge", text2: "1,860 ms", text3: "96" }
];
const ListRow10_data: ListRow10Data[] = [
    { style: { backgroundImage: "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-us'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23bd3d44'%20d='M0%200h640v480H0'/%3e%3cpath%20stroke='%23fff'%20stroke-width='37'%20d='M0%2055.3h640M0%20129h640M0%20203h640M0%20277h640M0%20351h640M0%20425h640'/%3e%3cpath%20fill='%23192f5d'%20d='M0%200h364.8v258.5H0'/%3e%3cmarker%20id='us-a'%20markerHeight='30'%20markerWidth='30'%3e%3cpath%20fill='%23fff'%20d='m14%200%209%2027L0%2010h28L5%2027z'/%3e%3c/marker%3e%3cpath%20fill='none'%20marker-mid='url(\"data:image/gif" }, label: "US", label2: "US", text: "US", text2: "2,400 ms", text3: "412" },
    { style: { backgroundImage: "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-de'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23fc0'%20d='M0%20320h640v160H0z'/%3e%3cpath%20fill='%23000001'%20d='M0%200h640v160H0z'/%3e%3cpath%20fill='red'%20d='M0%20160h640v160H0z'/%3e%3c/svg%3e\")" }, label: "DE", label2: "DE", text: "DE", text2: "2,280 ms", text3: "180" },
    { style: { backgroundImage: "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-gb'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23012169'%20d='M0%200h640v480H0z'/%3e%3cpath%20fill='%23FFF'%20d='m75%200%20244%20181L562%200h78v62L400%20241l240%20178v61h-80L320%20301%2081%20480H0v-60l239-178L0%2064V0z'/%3e%3cpath%20fill='%23C8102E'%20d='m424%20281%20216%20159v40L369%20281zm-184%2020%206%2035L54%20480H0zM640%200v3L391%20191l2-44L590%200zM0%200l239%20176h-60L0%2042z'/%3e%3cpath%20fill='%23FFF'%20d='M241%200v480h160V0zM0%20160v160h640V160z'/%3e%3cpath%20fill='%23C8102E'%20d='M0%20193v96h640v-96zM273%200v480h96V0z'/%3e%3c/svg%3e\")" }, label: "GB", label2: "GB", text: "GB", text2: "2,160 ms", text3: "166" },
    { style: { backgroundImage: "url(\"/assets/cloned/svg/ab71e3ed135f.svg\")" }, label: "ES", label2: "ES", text: "ES", text2: "2,040 ms", text3: "121" }
];
/** Gallery Showcase section. */
export default function GalleryShowcaseSection({ textLink3Data = TextLink3_data, textLink4Data = TextLink4_data, tile7Data = Tile7_data, tile8Data = Tile8_data, listRow9Data = ListRow9_data, listRow10Data = ListRow10_data } = {}) {
  return (
    <section className="block pt-8" data-cid="n1783">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n1784">
        <div className="block mx-auto text-center max-w-3xl" data-cid="n1785">
          <div className="block text-balance" data-cid="n1786">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n1787" data-component="heading">
              Keep AEO beside your SEO findings.
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n1788">
              Track answer-engine clarity with the same audit language: citability, entity clarity, and content gaps.
            </p>
          </div>
        </div>
        <div className="h-[73.375rem] block relative mt-8 max-md:h-[91.6625rem] md:max-lg:h-[73.525rem]" data-cid="n1789">
          <astro-island class="contents" data-cid="n1790">
            <div className="h-[73.375rem] block max-md:h-[91.6625rem] md:max-lg:h-[73.525rem]" data-cid="n1791">
              <astro-slot class="contents" data-cid="n1792">
                <astro-island class="contents" data-cid="n1793">
                  <div className="w-264 block relative mx-auto max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n1794">
                    <section className="block mt-2 -mx-2 p-2" data-cid="n1795" aria-label="Web Vitals metrics">
                      <div className="grid relative gap-3 grid-rows-[201.6px] grid-cols-5 max-md:grid-rows-[95px_95px_95px] max-md:grid-cols-2 md:max-lg:grid-rows-[96px_96px] md:max-lg:grid-cols-3" data-cid="n1796">
                        {textLink3Data.map((d, i) => <TextLink3 key={i} d={d} cids={TextLink3_cids[i]} styles={TextLink3_styles[i]} />)}
                      </div>
                    </section>
                    <div className="block mt-2" data-cid="n1842">
                      <div className="border border-solid border-surface flex mb-4 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-auto" data-cid="n1843">
                        <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_16px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n1844">
                          <div className="block font-medium leading-[1.1875rem]" data-cid="n1845">
                            LCP over time
                          </div>
                          <div className="block text-muted-foreground text-xs font-medium leading-4 text-balance" data-cid="n1846">
                            Last 7 days
                          </div>
                          <div className="block self-start col-start-2 row-start-1 row-end-[span_2]" data-cid="n1847">
                            <div className="flex flex-wrap items-center gap-1" data-cid="n1848">
                              {textLink4Data.map((d, i) => <TextLink4 key={i} d={d} cids={TextLink4_cids[i]} styles={TextLink4_styles[i]} />)}
                            </div>
                          </div>
                        </div>
                        <div className="w-263.5 block min-w-0 pb-5 h-auto max-md:w-[19.3125rem] max-md:pb-4 md:max-lg:w-175.5" data-cid="n1852">
                          <div className="w-263.5 block px-4 max-md:w-[19.3125rem] max-md:px-3 md:max-lg:w-175.5" data-cid="n1853">
                            <div className="block relative w-full" data-cid="n1854">
                              <div className="block relative text-xs leading-4 h-72 w-full max-md:h-64" data-cid="n1855">
                                <div className="h-full min-h-50 block" data-cid="n1856">
                                  <div className="w-0 h-0 block" data-cid="n1857">
                                    <div className="w-255.5 h-72 block relative shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--foreground)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px] cursor-default max-md:w-[17.8125rem] max-md:h-64 md:max-lg:w-167.5" data-cid="n1858" height="288" width="1022">
                                      <Illustration4 cid={"n1859"} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex pt-2 px-1 flex-wrap items-center gap-y-1 gap-x-3 text-muted-foreground text-[0.6875rem] leading-[1.125rem]" data-cid="n1860">
                                {tile7Data.map((d, i) => <Tile7 key={i} d={d} cids={Tile7_cids[i]} styles={Tile7_styles[i]} />)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border border-solid border-surface flex mb-4 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-auto" data-cid="n1867">
                        <div className="h-[75.3px] grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_16px] [grid-auto-rows:min-content] grid-cols-1 max-md:h-[83.3px] max-md:pt-4 max-md:pb-3 max-md:px-3 max-md:grid-rows-[19.25px_32px]" data-cid="n1868">
                          <div className="block font-medium leading-[1.1875rem]" data-cid="n1869">
                            Needs attention
                          </div>
                          <div className="block text-muted-foreground text-xs font-medium leading-4 text-balance" data-cid="n1870">
                            Pages with the highest p75 for LCP (min. 3 samples per path)
                          </div>
                        </div>
                        <div className="w-263.5 block min-w-0 pb-5 px-4 h-auto max-md:w-[19.3125rem] max-md:pb-4 max-md:px-3 md:max-lg:w-175.5" data-cid="n1871">
                          <div className="h-45 block relative overflow-auto w-full" data-cid="n1872">
                            <table className="h-45 table [border-collapse:collapse] w-full" data-cid="n1873">
                              <thead className="table-header-group align-middle [border-collapse:collapse]" data-cid="n1874">
                                <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n1875">
                                  <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-left whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto" data-cid="n1876">
                                    Page
                                  </th>
                                  <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto" data-cid="n1877">
                                    p75
                                  </th>
                                  <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto" data-cid="n1878">
                                    Samples
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="h-[147.5px] table-row-group align-middle [border-collapse:collapse]" data-cid="n1879">
                                {tile8Data.map((d, i) => <Tile8 key={i} d={d} cids={Tile8_cids[i]} styles={Tile8_styles[i]} />)}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <section className="grid gap-4 grid-rows-[228px] grid-cols-2 max-md:grid-rows-[221.25px_216px] max-md:grid-cols-1" data-cid="n1900">
                        <div className="border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full" data-cid="n1901">
                          <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-center gap-y-2 gap-x-3 grid-rows-[24px] [grid-auto-rows:min-content] grid-cols-[minmax(0,1fr)_auto] max-md:pt-4 max-md:pb-3 max-md:px-3 max-md:items-start max-md:gap-x-1 max-md:grid-rows-[19.25px_24px] max-md:grid-cols-1" data-cid="n1902">
                            <div className="w-14 block min-w-0 font-medium leading-[1.1875rem]" data-cid="n1903">
                              Devices
                            </div>
                            <div className="w-[11.3125rem] flex min-w-0 flex-wrap justify-end items-center gap-3 max-w-full max-md:w-[17.8125rem] max-md:justify-start max-md:gap-2" data-cid="n1904">
                              <div className="flex flex-wrap items-center gap-3 text-xs font-medium leading-4 max-w-full max-md:gap-2" data-cid="n1905" aria-label="Devices" role="tablist">
                                <button className="block rounded-sm text-center cursor-default" data-cid="n1906" data-component="button" aria-selected="true" id="_r20R_1iu_-t-0" role="tab" type="button">
                                  Browsers
                                </button>
                                <button className="block rounded-sm text-muted-foreground text-center cursor-default hover:text-clr-26 hover:[text-decoration-color:var(--clr-26)]" data-cid="n1907" data-component="button" aria-selected="false" id="_r20R_1iu_-t-1" role="tab" type="button">
                                  Devices
                                </button>
                              </div>
                              <div className="flex items-center gap-0.5" data-cid="n1908">
                                <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1909" data-component="button" aria-hidden="true" aria-label="Open full breakdown" type="button">
                                  <Icon6 cid={"n1910"} />
                                </button>
                                <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1911" data-component="button" aria-hidden="true" aria-label="Share breakdown" type="button">
                                  <Icon3 cid={"n1912"} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="w-129.5 block min-w-0 pb-4 max-md:w-[19.3125rem] max-md:pb-3 md:max-lg:w-85.5" data-cid="n1913">
                            <div className="w-129.5 block px-4 max-md:w-[19.3125rem] max-md:px-3 md:max-lg:w-85.5" data-cid="n1914">
                              <ul className="flex flex-col [list-style-type:none] list-outside" data-cid="n1915">
                                {listRow9Data.map((d, i) => <ListRow9 key={i} d={d} cids={ListRow9_cids[i]} styles={ListRow9_styles[i]} />)}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full" data-cid="n1948">
                          <div className="h-20.5 grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_2.75px_16px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:h-18.5 max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n1949">
                            <div className="block font-medium leading-[1.1875rem]" data-cid="n1950">
                              Country
                            </div>
                            <div className="flex pt-0.5 items-center self-start gap-0.5 col-start-2 row-start-1 row-end-[span_2]" data-cid="n1951">
                              <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1952" data-component="button" aria-hidden="true" aria-label="Open full breakdown" type="button">
                                <Icon6 cid={"n1953"} />
                              </button>
                              <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1954" data-component="button" aria-hidden="true" aria-label="Share breakdown" type="button">
                                <Icon3 cid={"n1955"} />
                              </button>
                            </div>
                            <div className="block col-span-full text-muted-foreground text-xs font-medium leading-4 text-balance" data-cid="n1956">
                              Slowest dimensions by p75 · LCP
                            </div>
                          </div>
                          <div className="w-129.5 block min-w-0 pb-4 max-md:w-[19.3125rem] max-md:pb-3 md:max-lg:w-85.5" data-cid="n1957">
                            <div className="w-129.5 block px-4 max-md:w-[19.3125rem] max-md:px-3 md:max-lg:w-85.5" data-cid="n1958">
                              <ul className="flex flex-col [list-style-type:none] list-outside" data-cid="n1959">
                                {listRow10Data.map((d, i) => <ListRow10 key={i} d={d} cids={ListRow10_cids[i]} styles={ListRow10_styles[i]} />)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </section>
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
