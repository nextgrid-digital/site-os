// @ts-nocheck
import Logo2 from "../components/logo2";
import Tile9, { type Tile9Data } from "../components/tile9";
import Icon9 from "../svgs/svg-icon9";
import Icon10 from "../svgs/svg-icon10";
import { Logo2_cids, Tile9_cids } from "../_cids";
import { Logo2_styles, Tile9_styles } from "../_styles";
import { logos2 as logosContent } from "../content";
const Tile9_data: Tile9Data[] = [
    { text: "get_overview", text2: "range: today" },
    { text: "get_top_pages", text2: "limit: 5" },
    { text: "get_next_actions", text2: "site: yourdomain.com" }
];
/** Logo Cloud section. */
export default function LogoCloudSection2({ logos = logosContent, tile9Data = Tile9_data } = {}) {
  return (
    <section className="block pt-8" data-cid="n2000">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n2001">
        <div className="block mx-auto text-center max-w-4xl" data-cid="n2002">
          <div className="block text-balance" data-cid="n2003">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n2004" data-component="heading">
              Agent prompts, ready for your editor.
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n2005">
              Every finding includes an AI-ready prompt—paste into Cursor, Claude, or Codex and execute the fix without rewriting context.
            </p>
          </div>
          <div className="w-76 block mt-8 mx-auto" data-cid="n2006">
            <span className="w-px h-px block absolute -m-px overflow-hidden whitespace-nowrap text-nowrap [clip-path:inset(50%)]" data-cid="n2007">
              Works with the AI tools you already use, including:
            </span>
            <div className="h-6 flex flex-wrap items-center gap-y-2 gap-x-4" data-cid="n2008" aria-label="Supported code editors and agents">
              {logos.map((d, i) => <Logo2 key={i} d={d} cids={Logo2_cids[i]} styles={Logo2_styles[i]} />)}
            </div>
          </div>
        </div>
        <div className="h-172 block relative mt-8 max-lg:h-135" data-cid="n2033">
          <astro-island class="contents" data-cid="n2034">
            <div className="h-172 block max-lg:h-135" data-cid="n2035">
              <astro-slot class="contents" data-cid="n2036">
                <astro-island class="contents" data-cid="n2037">
                  <div className="border border-solid border-surface flex rounded-[14px] flex-col overflow-hidden bg-surface-3 mx-auto h-[43rem] max-lg:h-[33.75rem]" data-cid="n2038">
                    <div className="grid px-4 items-center grid-rows-[36px] text-xs leading-4 h-9 grid-cols-[1fr_auto_1fr]" data-cid="n2039">
                      <div className="flex items-center gap-1.5" data-cid="n2040">
                        <span className="w-2.5 h-2.5 block rounded-full bg-foreground" data-cid="n2041" />
                        <span className="w-2.5 h-2.5 block rounded-full bg-foreground" data-cid="n2042" />
                        <span className="w-2.5 h-2.5 block rounded-full bg-foreground" data-cid="n2043" />
                      </div>
                      <span className="block [font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace] font-medium" data-cid="n2044">
                        $ open finding → copy agent prompt
                      </span>
                      <span className="flex justify-end items-center gap-1.5 text-muted-foreground font-medium" data-cid="n2045">
                        <span className="w-1.5 h-1.5 block opacity-[0.518714] rounded-full bg-primary [animation-name:pulse] [animation-duration:2s] [animation-timing-function:cubic-bezier(0.4,_0,_0.6,_1)] [animation-iteration-count:infinite] max-md:w-[3.7px]" data-cid="n2046" aria-hidden="true" />
                        site-os prompt
                      </span>
                    </div>
                    <div className="h-162.5 border-t border-solid border-t-surface-6 flex p-4 justify-center items-stretch flex-1 bg-surface-3 max-lg:h-125.5" data-cid="n2047">
                      <div className="h-[38.5625rem] flex flex-col w-full max-lg:h-[29.3125rem]" data-cid="n2048">
                        <div className="h-[28.8125rem] block p-4 flex-1 overflow-auto max-md:h-[19.0625rem] md:max-lg:h-[19.5625rem]" data-cid="n2049">
                          <div className="block" data-cid="n2050">
                            <div className="block py-2.5 px-3 rounded-[10px] text-xs leading-5 bg-background max-lg:mb-4 2xl:mb-4" data-cid="n2051">
                              What should I fix first on this site, and how should I rewrite it?
                            </div>
                            <div className="hidden max-lg:block max-lg:mb-4 max-lg:text-muted-foreground max-lg:text-xs max-lg:leading-4 2xl:block 2xl:mb-4 2xl:text-muted-foreground 2xl:text-xs 2xl:leading-4" data-cid="n2052">
                              <p className="hidden max-lg:block max-lg:mb-2 2xl:block 2xl:mb-2" data-cid="n2053">
                                Calling tools on the
                                <span className="hidden max-lg:inline max-lg:text-foreground max-lg:[font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace] 2xl:inline 2xl:text-foreground 2xl:[font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace]" data-cid="n2054">
                                  site-os
                                </span>
                                {" MCP server..."}
                              </p>
                              {tile9Data.map((d, i) => <Tile9 key={i} d={d} cids={Tile9_cids[i]} styles={Tile9_styles[i]} />)}
                            </div>
                            <div className="hidden max-lg:block max-lg:text-[0.75rem] 2xl:block 2xl:text-[0.75rem]" data-cid="n2073">
                              <p className="hidden max-md:h-12 max-lg:block max-lg:mb-3 md:max-lg:h-6 2xl:h-6 2xl:block 2xl:mb-3" data-cid="n2074">
                                {"Today you have "}
                                <strong className="hidden max-lg:inline max-lg:font-semibold 2xl:inline 2xl:font-semibold" data-cid="n2075">
                                  1,284 visitors
                                </strong>
                                {"and "}
                                <strong className="hidden max-lg:inline max-lg:font-semibold 2xl:inline 2xl:font-semibold" data-cid="n2076">
                                  3,842 views
                                </strong>
                                {" across your top pages."}
                              </p>
                              <p className="hidden max-md:h-[4.5625rem] max-lg:block max-lg:mb-3 md:max-lg:h-[3.0625rem] 2xl:h-[1.5625rem] 2xl:block 2xl:mb-3" data-cid="n2077">
                                <span className="hidden max-lg:inline max-lg:[font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace] 2xl:inline 2xl:[font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace]" data-cid="n2078">
                                  /pricing
                                </span>
                                {" is the highest-traffic page. It drove 612 views, so I would improve that CTA before changing lower traffic pages."}
                              </p>
                              <p className="hidden max-lg:block max-lg:text-muted-foreground max-lg:text-[0.6875rem] 2xl:block 2xl:text-muted-foreground 2xl:text-[0.6875rem]" data-cid="n2079">
                                1 prompt · ready for any AI writing tool
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="w-255.5 h-39 block p-4 shrink-0 max-md:w-[17.3125rem] max-md:h-41 md:max-lg:w-167.5" data-cid="n2080">
                          <div className="h-full block p-3 rounded-[10px] bg-background" data-cid="n2081">
                            <p className="h-10 min-h-10 block text-muted-foreground text-[0.875rem] max-md:h-auto" data-cid="n2082">
                              Ask about findings, proofs, CTAs...
                            </p>
                            <div className="w-16 flex mt-8 ml-225.5 items-center shrink-0 gap-2 text-muted-foreground max-md:ml-[9.8125rem] md:max-lg:ml-137.5" data-cid="n2083">
                              <button className="w-7 h-7 grid rounded-lg items-center grid-rows-[28px] justify-items-center text-center cursor-default grid-cols-[minmax(0,_1fr)] hover:bg-background" data-cid="n2084" data-component="button" aria-label="Attach image" type="button">
                                <Icon9 cid={"n2085"} />
                              </button>
                              <button className="w-7 h-7 grid rounded-full items-center grid-rows-[28px] justify-items-center text-surface-3 text-center bg-foreground cursor-default grid-cols-[minmax(0,_1fr)] hover:opacity-90" data-cid="n2086" data-component="button" aria-label="Send message" type="button">
                                <Icon10 cid={"n2087"} />
                              </button>
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
      </div>
    </section>
  );
}
