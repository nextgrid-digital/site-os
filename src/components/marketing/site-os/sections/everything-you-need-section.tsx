// @ts-nocheck
import Icon7 from "../svgs/svg-icon7";
import FeatureCard2 from "../components/feature-card2";
import MediaCard, { type MediaCardData } from "../components/media-card";
import { FeatureCard2_cids, MediaCard_cids } from "../_cids";
import { FeatureCard2_styles, MediaCard_styles } from "../_styles";
import { featureCard2Data as featureCard2DataContent } from "../content";
const MediaCard_data: MediaCardData[] = [
    { id: "base-ui-_r17R_2H2_", title: "Breakdowns" },
    { id: "base-ui-_r17R_3H2_", title: "Events" },
    { id: "base-ui-_r17R_4H2_", title: "Tracking" },
    { id: "base-ui-_r17R_5H2_", title: "Revenue" },
    { id: "base-ui-_r17R_6H2_", title: "Privacy" },
    { id: "base-ui-_r17R_7H2_", title: "Setup" },
    { id: "base-ui-_r17R_8H2_", title: "Sharing" }
];
/** Everything You Need section. */
export default function EverythingYouNeedSection({ featureCard2Data = featureCard2DataContent, mediaCardData = MediaCard_data } = {}) {
  return (
    <section className="block pt-8" data-cid="n1332" id="benefits">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n1333">
        <div className="w-full block max-w-xl" data-cid="n1334">
          <div className="block text-balance" data-cid="n1335">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n1336" data-component="heading">
              Everything you need to run the audit-to-brief pipeline.
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n1337">
              Free crawl first. Connect GSC and GA4 when you need depth.
            </p>
          </div>
        </div>
        <div className="h-[50.5625rem] block mt-8 max-md:h-[63.0625rem]" data-cid="n1338">
          <astro-island class="contents" data-cid="n1339">
            <div className="h-[50.5625rem] block max-md:h-[63.0625rem]" data-cid="n1340">
              <astro-slot class="contents" data-cid="n1341">
                <astro-island class="contents" data-cid="n1342">
                  <div className="border-t border-solid border-t-surface-4 border-b border-b-surface-4 block w-full" data-cid="n1343" dir="ltr">
                    <div className="border-b border-solid border-b-surface-4 block" data-cid="n1344">
                      <h3 className="flex" data-cid="n1345" data-component="heading">
                        <button className="flex py-5 justify-between items-center flex-1 gap-4 text-sm font-semibold leading-5 text-left cursor-default hover:text-clr-28 hover:[text-decoration-color:var(--clr-28)] focus:text-foreground focus:[text-decoration-color:var(--foreground)]" data-cid="n1346" data-component="button" aria-controls="base-ui-_r17R_1H1_" aria-disabled="false" aria-expanded="true" id="base-ui-_r17R_1H2_" type="button">
                          <span className="block text-lg font-medium leading-7" data-cid="n1347">
                            Overview
                          </span>
                          <Icon7 cid={"n1348"} />
                        </button>
                      </h3>
                      <div className="h-64 block overflow-hidden max-md:h-114" data-cid="n1349" aria-labelledby="base-ui-_r17R_1H2_" id="base-ui-_r17R_1H1_" role="region">
                        <ul className="h-full grid pt-2 pb-10 items-start gap-y-8 gap-x-10 grid-rows-[88px_88px] [list-style-type:none] list-outside grid-cols-[repeat(auto-fit,_minmax(310px,_1fr))] max-md:grid-rows-[68px_88px_68px_88px]" data-cid="n1350">
                          {featureCard2Data.map((d, i) => <FeatureCard2 key={i} d={d} cids={FeatureCard2_cids[i]} styles={FeatureCard2_styles[i]} />)}
                        </ul>
                      </div>
                    </div>
                    {mediaCardData.map((d, i) => <MediaCard key={i} d={d} cids={MediaCard_cids[i]} styles={MediaCard_styles[i]} />)}
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
