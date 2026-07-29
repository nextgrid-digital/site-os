// @ts-nocheck
import Logo from "../components/logo";
import Tile3, { type Tile3Data } from "../components/tile3";
import Icon3 from "../svgs/svg-icon3";
import Illustration2 from "../svgs/svg-illustration2";
import Icon8 from "../svgs/svg-icon8";
import TextLink2, { type TextLink2Data } from "../components/text-link2";
import Icon6 from "../svgs/svg-icon6";
import ListRow8, { type ListRow8Data } from "../components/list-row8";
import MediaTile2, { type MediaTile2Data } from "../components/media-tile2";
import FeatureCard from "../components/feature-card";
import { Logo_cids, Tile3_cids, TextLink2_cids5, ListRow8_cids, TextLink2_cids6, MediaTile2_cids, FeatureCard_cids2 } from "../_cids";
import { Tile3_styles, TextLink2_styles5, ListRow8_styles, TextLink2_styles6, MediaTile2_styles } from "../_styles";
import { logos as logosContent, featureCardData2 as featureCardData2Content } from "../content";
const Tile3_data: Tile3Data[] = [
    { text: "Visitors", ariaLabel: "Change vs previous period", text2: "+18.4%", text3: "11.4K" },
    { text: "Visits", ariaLabel: "Change vs previous period", text2: "+15.2%", text3: "11.6K" },
    { text: "Views", ariaLabel: "Change vs previous period", text2: "+22.1%", text3: "24K" },
    { text: "Bounce rate", ariaLabel: "Change vs previous period", text2: "-6.3%", text3: "28%" },
    { text: "Session time", ariaLabel: "Change vs previous period", text2: "+9.8%", text3: "1m 54s" },
    { text: "Revenue", text2: "130 paid", text3: "$54.4K" }
];
const TextLink2_data5: TextLink2Data[] = [
    { ariaselected: "true", id: "_r18R_6ba_-t-0", label: "Top" },
    { ariaselected: "false", id: "_r18R_6ba_-t-1", label: "Entered" },
    { ariaselected: "false", id: "_r18R_6ba_-t-2", label: "Exited" }
];
const ListRow8_data: ListRow8Data[] = [
    { label: "/", text: "/", description: "$4,180", description2: "9,842" },
    { label: "/pricing", text: "/pricing", description: "$6,240", description2: "4,118" },
    { label: "/docs/install-astro", text: "/docs/install-astro", description: "$1,820", description2: "2,906" },
    { label: "/docs/overview", text: "/docs/overview", description: "$940.00", description2: "2,442" },
    { label: "/audit/report", text: "/audit/report", description: "$1,560", description2: "1,885" }
];
const TextLink2_data6: TextLink2Data[] = [
    { ariaselected: "true", id: "_r18R_6da_-t-0", label: "Referrers" },
    { ariaselected: "false", id: "_r18R_6da_-t-1", label: "Hostnames" },
    { ariaselected: "false", id: "_r18R_6da_-t-2", label: "Channels" },
    { ariaselected: "false", id: "_r18R_6da_-t-3", label: "AI" }
];
const MediaTile2_data: MediaTile2Data[] = [
    { label: "google.com (preview, not a link)", imgSrc: "/assets/cloned/images/4afefff04e61.png", label2: "google.com", text: "google.com", text2: "$4,120", text3: "6,140" },
    { label: "t.co (preview, not a link)", imgSrc: "/assets/cloned/images/7da7fa93e500.png", label2: "t.co", text: "t.co", text2: "$2,860", text3: "2,284" },
    { label: "github.com (preview, not a link)", imgSrc: "/assets/cloned/images/5a4e0f1b4609.png", label2: "github.com", text: "github.com", text2: "$1,180", text3: "1,903" },
    { label: "producthunt.com (preview, not a link)", imgSrc: "/assets/cloned/images/32d2558b75df.png", label2: "producthunt.com", text: "producthunt.com", text2: "$2,240", text3: "1,522" },
    { label: "direct (preview, not a link)", imgSrc: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", label2: "direct", text: "direct", text2: "$860.00", text3: "1,177" }
];
/** Logo Cloud section. */
export default function LogoCloudSection({ logos = logosContent, tile3Data = Tile3_data, textLink2Data5 = TextLink2_data5, listRow8Data = ListRow8_data, textLink2Data6 = TextLink2_data6, mediaTile2Data = MediaTile2_data, featureCardData2 = featureCardData2Content } = {}) {
  return (
    <section className="block pt-8" data-cid="n1406">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n1407">
        <div className="block mx-auto max-w-4xl" data-cid="n1408">
          <div className="block mx-48 text-center max-w-lg max-lg:mx-0 max-lg:[text-align:inherit]" data-cid="n1409">
            <div className="block text-balance" data-cid="n1410">
              <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n1411" data-component="heading">
                Connected data sources
              </h2>
              <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n1412">
                Connect Search Console and GA4 on a paid audit and read queries, sessions, and conversion gaps beside crawl findings.
              </p>
            </div>
            <div className="w-36 flex mt-8 mx-auto flex-wrap items-center gap-y-2 gap-x-4 text-muted-foreground text-xs font-medium leading-4 max-lg:mx-0" data-cid="n1413" aria-label="Supported revenue providers">
              <span className="w-px h-px block absolute min-w-0 -m-px overflow-hidden whitespace-nowrap text-nowrap [clip-path:inset(50%)]" data-cid="n1414">
                Works with:
              </span>
              {logos.map((d, i) => <Logo key={i} d={d} cids={Logo_cids[i]} />)}
            </div>
          </div>
        </div>
        <div className="h-[851.1px] block relative mt-8 max-md:h-[73.7875rem] md:max-lg:h-[855.1px]" data-cid="n1427">
          <astro-island class="contents" data-cid="n1428">
            <div className="h-[851.1px] block max-md:h-[73.7875rem] md:max-lg:h-[855.1px]" data-cid="n1429">
              <astro-slot class="contents" data-cid="n1430">
                <astro-island class="contents" data-cid="n1431">
                  <div className="w-264 block relative max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n1432">
                    <section className="block mt-2 -mx-2 p-2" data-cid="n1433" aria-label="Key metrics">
                      <div className="grid relative gap-3 grid-rows-[166px] grid-cols-6 max-md:grid-rows-[77px_77px_77px] max-md:grid-cols-2 md:max-lg:grid-rows-[77px_81px] md:max-lg:grid-cols-3" data-cid="n1434">
                        {tile3Data.map((d, i) => <Tile3 key={i} d={d} cids={Tile3_cids[i]} styles={Tile3_styles[i]} />)}
                      </div>
                    </section>
                    <div className="block mt-2" data-cid="n1483">
                      <div className="block mb-4" data-cid="n1484">
                        <div className="border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-auto" data-cid="n1485">
                          <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_16px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n1486">
                            <div className="block font-medium leading-[1.1875rem]" data-cid="n1487">
                              Findings over time
                            </div>
                            <div className="block text-muted-foreground text-xs font-medium leading-4 text-balance" data-cid="n1488">
                              Last 30 days
                            </div>
                            <div className="block self-start col-start-2 row-start-1 row-end-[span_2]" data-cid="n1489">
                              <button className="w-6 h-6 inline-flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1490" data-component="button" aria-hidden="true" aria-label="Share chart" type="button">
                                <Icon3 cid={"n1491"} />
                              </button>
                            </div>
                          </div>
                          <div className="w-263.5 block min-w-0 pb-5 h-auto max-md:w-[19.3125rem] max-md:pb-4 md:max-lg:w-175.5" data-cid="n1492">
                            <div className="w-263.5 block px-4 max-md:w-[19.3125rem] max-md:px-3 md:max-lg:w-175.5" data-cid="n1493">
                              <div className="block relative text-color-002 w-full" data-cid="n1494">
                                <div className="block relative text-xs leading-4 h-72 w-full max-md:h-64" data-cid="n1495">
                                  <div className="h-full min-h-50 block" data-cid="n1496">
                                    <div className="w-0 h-0 block" data-cid="n1497">
                                      <div className="w-255.5 h-72 block relative shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--color-002)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px] cursor-default max-md:w-[17.8125rem] max-md:h-64 md:max-lg:w-167.5" data-cid="n1498" height="288" width="1022">
                                        <Illustration2 cid={"n1499"} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="w-4 h-5 block absolute top-[126.5px] left-[29rem] z-10 pointer-events-none max-md:top-[6.125rem] max-md:left-[9.175rem] md:max-lg:top-[9.7125rem] md:max-lg:left-[14.75rem] 2xl:top-[7.6875rem] 2xl:left-[42.125rem]" data-cid="n1500" aria-hidden="true">
                                  <span className="block relative text-foreground [filter:drop-shadow(var(--clr-13)_0px_1px_2px)] [translate:-4px_-4px] [rotate:-18deg] pointer-events-none" data-cid="n1501">
                                    <Icon8 cid={"n1502"} />
                                  </span>
                                </div>
                                <div className="w-44 h-12 block absolute top-[6.75rem] left-[29rem] z-20 transform-[matrix(1,0,0,1,12,-48)] pointer-events-none max-md:top-[5.075rem] max-md:left-[9.175rem] md:max-lg:top-[8.55rem] md:max-lg:left-[14.75rem] 2xl:top-[104.5px] 2xl:left-[42.125rem] 2xl:transform-[matrix(1,0,0,1,-176,-48)]" data-cid="n1503" aria-hidden="true">
                                  <div className="w-44 border border-solid border-surface-8 grid min-w-44 py-1.5 px-2.5 rounded-[10px] gap-1.5 grid-rows-[16px_12px] text-surface-3 text-xs leading-4 bg-foreground shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-1)_0px_12px_36px_0px,var(--clr-2)_0px_18px_24px_-8px,var(--clr-3)_0px_0px_2px_0px,var(--clr-3)_0px_2px_4px_0px] pointer-events-none grid-cols-1 max-w-xs" data-cid="n1504">
                                    <div className="block font-medium pointer-events-none" data-cid="n1505">
                                      July 5, 2026
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 pointer-events-none w-full" data-cid="n1506">
                                      <div className="flex justify-between items-center flex-1 gap-4 leading-3 pointer-events-none" data-cid="n1507">
                                        <span className="block text-color-004 pointer-events-none" data-cid="n1508">
                                          Revenue
                                        </span>
                                        <span className="block [font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace] font-medium pointer-events-none" data-cid="n1509">
                                          $3,535.09
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex mt-1 px-1 flex-wrap items-center gap-y-1 gap-x-3 text-muted-foreground text-[0.6875rem] leading-[1.125rem]" data-cid="n1510">
                                  <span className="flex items-center gap-1.5" data-cid="n1511">
                                    <span className="w-2 h-2 block rounded-xs bg-color-002" data-cid="n1512" aria-hidden="true" />
                                    Revenue
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-264 grid gap-4 grid-rows-[238px] grid-cols-2 max-md:w-[19.4375rem] max-md:grid-rows-[253.25px_253.25px] max-md:grid-cols-1 md:max-lg:w-176" data-cid="n1513">
                        <div className="border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full" data-cid="n1514">
                          <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-center gap-y-2 gap-x-3 grid-rows-[24px] [grid-auto-rows:min-content] grid-cols-[minmax(0,1fr)_auto] max-md:pt-4 max-md:pb-3 max-md:px-3 max-md:items-start max-md:gap-x-1 max-md:grid-rows-[19.25px_24px] max-md:grid-cols-1" data-cid="n1515">
                            <div className="w-11 block min-w-0 font-medium leading-[1.1875rem]" data-cid="n1516">
                              Pages
                            </div>
                            <div className="w-48.5 flex min-w-0 flex-wrap justify-end items-center gap-3 max-w-full max-md:w-[17.8125rem] max-md:justify-start max-md:gap-2" data-cid="n1517">
                              <div className="flex flex-wrap items-center gap-3 text-xs font-medium leading-4 max-w-full max-md:gap-2" data-cid="n1518" aria-label="Page breakdown" role="tablist">
                                {textLink2Data5.map((d, i) => <TextLink2 key={i} d={d} cids={TextLink2_cids5[i]} styles={TextLink2_styles5[i]} />)}
                              </div>
                              <div className="flex items-center gap-0.5" data-cid="n1522">
                                <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1523" data-component="button" aria-hidden="true" aria-label="Open full breakdown" type="button">
                                  <Icon6 cid={"n1524"} />
                                </button>
                                <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1525" data-component="button" aria-hidden="true" aria-label="Share breakdown" type="button">
                                  <Icon3 cid={"n1526"} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="w-129.5 h-44 block min-w-0 pb-4 max-md:w-[19.3125rem] max-md:h-43 max-md:pb-3 md:max-lg:w-85.5" data-cid="n1527">
                            <div className="w-129.5 block px-4 max-md:w-[19.3125rem] max-md:px-3 md:max-lg:w-85.5" data-cid="n1528">
                              <ul className="h-40 flex flex-col [list-style-type:none] list-outside" data-cid="n1529">
                                {listRow8Data.map((d, i) => <ListRow8 key={i} d={d} cids={ListRow8_cids[i]} styles={ListRow8_styles[i]} />)}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full" data-cid="n1570">
                          <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-center gap-y-2 gap-x-3 grid-rows-[24px] [grid-auto-rows:min-content] grid-cols-[minmax(0,1fr)_auto] max-md:pt-4 max-md:pb-3 max-md:px-3 max-md:items-start max-md:gap-x-1 max-md:grid-rows-[19.25px_24px] max-md:grid-cols-1" data-cid="n1571">
                            <div className="w-[3.5625rem] block min-w-0 font-medium leading-[1.1875rem]" data-cid="n1572">
                              Sources
                            </div>
                            <div className="w-full flex min-w-0 flex-wrap justify-end items-center gap-3 max-w-full max-md:justify-start max-md:gap-2" data-cid="n1573">
                              <div className="flex flex-wrap items-center gap-3 text-xs font-medium leading-4 max-w-full max-md:gap-2" data-cid="n1574" aria-label="Traffic sources" role="tablist">
                                {textLink2Data6.map((d, i) => <TextLink2 key={i} d={d} cids={TextLink2_cids6[i]} styles={TextLink2_styles6[i]} />)}
                              </div>
                              <div className="flex items-center gap-0.5" data-cid="n1579">
                                <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1580" data-component="button" aria-hidden="true" aria-label="Open full breakdown" type="button">
                                  <Icon6 cid={"n1581"} />
                                </button>
                                <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1582" data-component="button" aria-hidden="true" aria-label="Share breakdown" type="button">
                                  <Icon3 cid={"n1583"} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="w-129.5 h-44 block min-w-0 pb-4 max-md:w-[19.3125rem] max-md:h-43 max-md:pb-3 md:max-lg:w-85.5" data-cid="n1584">
                            <div className="w-129.5 block px-4 max-md:w-[19.3125rem] max-md:px-3 md:max-lg:w-85.5" data-cid="n1585">
                              <ul className="h-40 flex flex-col [list-style-type:none] list-outside" data-cid="n1586">
                                {mediaTile2Data.map((d, i) => <MediaTile2 key={i} d={d} cids={MediaTile2_cids[i]} styles={MediaTile2_styles[i]} />)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </astro-island>
              </astro-slot>
            </div>
          </astro-island>
        </div>
        <div className="grid mt-8 gap-4 grid-rows-[68px] text-center text-balance grid-cols-3 max-md:grid-rows-[68px_88px_68px] max-md:grid-cols-1 max-lg:[text-align:inherit] md:max-lg:grid-rows-[88px]" data-cid="n1642">
          {featureCardData2.map((d, i) => <FeatureCard key={i} d={d} cids={FeatureCard_cids2[i]} />)}
        </div>
      </div>
    </section>
  );
}
