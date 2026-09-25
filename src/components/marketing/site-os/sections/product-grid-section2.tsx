// @ts-nocheck
"use client";
import { useState } from "react";
import Logo3 from "../components/logo3";
import Illustration5 from "../svgs/svg-illustration5";
import { Logo3_cids } from "../_cids";
import { Logo3_styles } from "../_styles";
import { logos4 as logosContent } from "../content";
import { TIERS } from "@/lib/audit/pricing";
import { cn } from "../lib/utils";
const fullAuditLogos = TIERS.brief.items.map((description) => ({ description }));
/** Product Grid section. */
export default function ProductGridSection2({ logos = logosContent } = {}) {
  const [tier, setTier] = useState<"free" | "full">("free");
  const isFull = tier === "full";
  const activeLogos = isFull ? fullAuditLogos : logos;
  return (
    <section className="block pt-8" data-cid="n2164" aria-labelledby="pricing-heading" id="pricing">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n2165">
        <div className="block mx-auto text-center max-w-2xl" data-cid="n2166">
          <div className="block text-balance" data-cid="n2167">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n2168" data-component="heading" id="pricing-heading">
              Free crawl or Full Audit
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n2169">
              Start free. Upgrade to $700 for a professional audit with our expert team.
            </p>
            <a href="/pricing" className="inline-block mt-4 text-sm font-medium text-foreground underline hover:no-underline">
              View full pricing →
            </a>
          </div>
        </div>
        <div className="h-[48.9375rem] block mt-10 max-md:h-[57.9375rem] md:max-lg:h-[40.9375rem] 2xl:h-[49.9375rem]" data-cid="n2170">
          <astro-island class="contents" data-cid="n2171">
            <div className="block w-full" data-cid="n2172">
              <article className="h-[48.9375rem] border border-solid border-surface-4 block relative rounded-[10px] overflow-hidden bg-surface-3 w-full max-md:h-[57.9375rem] md:max-lg:h-[40.9375rem] 2xl:h-[49.9375rem]" data-cid="n2173">
                <div className="h-full flex max-lg:flex-col grid-cols-1 lg:grid-cols-2" data-cid="n2174">
                  <div className="w-[58%] h-[48.8125rem] flex p-8 flex-col max-lg:w-full max-md:h-[57.8125rem] max-lg:p-4 md:max-lg:h-[40.8125rem] 2xl:h-[49.8125rem]" data-cid="n2175">
                    <div className="h-5 flex items-center shrink-0 gap-2.5" data-cid="n2176">
                      <button type="button" onClick={() => setTier("free")} className={cn("block text-sm font-medium leading-5 cursor-pointer", isFull && "text-muted-foreground")} data-cid="n2177">
                        Free audit
                      </button>
                      <button type="button" onClick={() => setTier(isFull ? "free" : "full")} className="flex relative shrink-0 text-center cursor-pointer h-4 w-7" data-cid="n2178" data-component="button" aria-checked={isFull} aria-label="Switch between free crawl audit and full audit pricing." role="switch">
                        <span className="w-7 block absolute top-2 left-0 min-w-0 rounded-full bg-clr-19 [translate:0px_-50%] h-3" data-cid="n2179" aria-hidden="true" />
                        <span className={cn("w-3.5 h-3.5 block absolute top-2 min-w-0 rounded-full bg-foreground [translate:0px_-50%] transition-transform", isFull ? "translate-x-3.5" : "translate-x-0")} data-cid="n2180" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => setTier("full")} className={cn("block text-sm font-medium leading-5 cursor-pointer", !isFull && "text-muted-foreground")} data-cid="n2181">
                        Full Audit <span data-cid="n2182">$700</span>
                      </button>
                    </div>
                    <p className="block mt-12 text-muted-foreground text-sm font-medium leading-5 text-balance" data-cid="n2183">
                      Free: Self-serve audit with AI findings. Full Audit: $700 professional audit with expert review and enriched findings.
                    </p>
                    <div className="h-18 flex mt-8 flex-wrap justify-between items-start gap-4 max-md:h-16" data-cid="n2184">
                      <div className="block" data-cid="n2185">
                        <p className="block [font-family:LTRemark,_Georgia,_serif] text-5xl italic leading-12 tracking-[-1.2px] max-md:text-4xl max-md:leading-10 max-md:tracking-[-0.9px]" data-cid="n2186">
                          {isFull ? "Full" : "Free"}
                        </p>
                        <p className="block text-muted-foreground text-sm font-medium leading-5" data-cid="n2187">
                          {isFull ? "Audit" : "Crawl audit"}
                        </p>
                      </div>
                      <div className="h-full flex flex-col items-end" data-cid="n2188">
                        <span className="flex items-baseline text-xl font-semibold leading-7 tracking-[-1px]" data-cid="n2189">
                          <span className="block py-0.5 pr-2 overflow-hidden [font-family:LTRemark,_Georgia,_serif] text-5xl font-normal italic leading-12 tracking-[-1.2px] max-md:text-4xl max-md:leading-10 max-md:tracking-[-0.9px]" style={{ maskImage: "linear-gradient(var(--clr-0), var(--clr-20) 15%, var(--clr-20) 85%, var(--clr-0))" }} data-cid="n2190">
                            <span className="inline-block" data-cid="n2191">
                              {isFull ? "$700" : "$0"}
                            </span>
                          </span>
                          <span className="block ml-0.5 text-muted-foreground text-sm font-medium leading-5" data-cid="n2192">
                            {isFull ? "one-time" : "to start"}
                          </span>
                        </span>
                        <p className="block text-muted-foreground text-sm font-medium leading-5 whitespace-nowrap" data-cid="n2193">
                          {isFull ? "Includes Search Console + GA4" : "Sign in to save this site"}
                        </p>
                      </div>
                    </div>
                    <div className="h-14 block mt-6" data-cid="n2226">
                      <a className="border border-solid border-clr-0 inline-flex mt-2 px-4 rounded-[10px] justify-center items-center shrink-0 gap-2 text-color-007 font-medium whitespace-nowrap text-nowrap bg-color-002 [background-clip:padding-box] [-webkit-background-clip:padding-box] cursor-pointer h-12 w-full hover:bg-clr-24" data-cid="n2227" data-component="button" href="/login?next=/app">
                        {isFull ? "Upgrade to Full Audit" : "Start free audit"}
                      </a>
                    </div>
                    <ul className="grid mt-8 items-start flex-1 gap-y-1.5 gap-x-6 grid-cols-2 font-medium [list-style-type:none] list-outside max-md:grid-cols-1 2xl:gap-y-2" data-cid="n2228" role="list">
                      {activeLogos.map((d, i) => <Logo3 key={isFull ? `full-${i}` : `free-${i}`} d={d} cids={Logo3_cids[i]} styles={Logo3_styles[i]} />)}
                    </ul>
                    <p className="border-t border-solid border-t-surface-4 block mt-4 pt-4 text-muted-foreground text-xs font-medium leading-4 text-balance" data-cid="n2280">
                      Free to start · upgrade to $700 for professional audit · view all <a href="/pricing" className="underline hover:no-underline">pricing details</a>
                    </p>
                  </div>
                  <div className="w-[27.975rem] h-[47.4375rem] min-h-full flex relative justify-center items-center overflow-hidden max-lg:hidden 2xl:h-[48.4375rem]" data-cid="n2281" aria-hidden="true">
                    <img className="w-full h-[47.4375rem] block absolute min-w-0 max-w-full overflow-clip object-cover align-middle [filter:blur(8px)] [scale:1.1] 2xl:h-[48.4375rem]" data-cid="n2282" data-component="image" alt="" src="/assets/cloned/images/88a2aecffce9.png" />
                    <div className="flex relative z-10 py-10 px-6 justify-center w-full" data-cid="n2283">
                      <div className="border border-solid border-surface block p-5 rounded-[14px] bg-surface-3 shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-3)_0px_8px_28px_0px,var(--clr-1)_0px_12px_18px_-6px,var(--clr-3)_0px_0px_2px_0px,var(--clr-3)_0px_1px_3px_0px] pointer-events-none w-full max-w-xs" data-cid="n2284">
                        <div className="w-69.5 flex items-start gap-3 pointer-events-none" data-cid="n2285">
                          <img className="w-8 h-8 block max-w-full rounded-lg shrink-0 overflow-clip object-cover aspect-[auto_32/32] align-middle pointer-events-none" data-cid="n2286" data-component="image" alt="" height="32" src="/assets/cloned/images/bfd35f806bc8.png" width="32" />
                          <div className="w-58.5 block min-w-0 flex-1 pointer-events-none" data-cid="n2287">
                            <div className="block overflow-hidden text-sm font-semibold leading-[1.125rem] whitespace-nowrap text-nowrap pointer-events-none" data-cid="n2288">
                              Site-OS
                            </div>
                            <div className="block overflow-hidden text-muted-foreground text-xs leading-[1.0625rem] whitespace-nowrap text-nowrap pointer-events-none" data-cid="n2289">
                              Free crawl audit
                            </div>
                          </div>
                        </div>
                        <div className="block mt-4 pointer-events-none" data-cid="n2290">
                          <div className="min-h-12 block relative text-xs leading-4 pointer-events-none w-full h-12" data-cid="n2291" aria-hidden="true">
                            <div className="h-12 min-h-12 block pointer-events-none" data-cid="n2292">
                              <div className="w-0 h-0 block pointer-events-none" data-cid="n2293">
                                <div className="w-69.5 h-12 block relative shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--foreground)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px] cursor-default pointer-events-none max-lg:hidden" data-cid="n2294" height="48" width="278">
                                  <Illustration5 cid={"n2295"} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="block mt-4 pointer-events-none" data-cid="n2296">
                          <div className="flex mb-2 justify-between items-center gap-3 leading-4 pointer-events-none" data-cid="n2297">
                            <span className="w-14.5 flex min-w-0 items-center gap-1.5 text-muted-foreground text-[0.75rem] pointer-events-none" data-cid="n2298">
                              <span className="w-2 h-2 block rounded-xs shrink-0 bg-foreground pointer-events-none" data-cid="n2299" />
                              Visitors
                            </span>
                            <span className="block shrink-0 text-[0.75rem] font-medium pointer-events-none" data-cid="n2300">
                              28.6K
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-3 leading-4 pointer-events-none" data-cid="n2301">
                            <span className="w-[4.1875rem] flex min-w-0 items-center gap-1.5 text-muted-foreground text-[0.75rem] pointer-events-none" data-cid="n2302">
                              <span className="w-2 h-2 block rounded-xs shrink-0 bg-accent pointer-events-none" data-cid="n2303" />
                              Revenue
                            </span>
                            <span className="block shrink-0 text-[0.75rem] font-medium pointer-events-none" data-cid="n2304">
                              $117K
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </astro-island>
        </div>
      </div>
    </section>
  );
}
