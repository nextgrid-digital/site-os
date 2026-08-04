// @ts-nocheck
import LogoCloudItem from "../components/logo-cloud-item";
import Tile10, { type Tile10Data } from "../components/tile10";
import { LogoCloudItem_cids, Tile10_cids } from "../_cids";
import { LogoCloudItem_styles, Tile10_styles } from "../_styles";
import { logos3 as logosContent } from "../content";
const Tile10_data: Tile10Data[] = [
    { text: "01", description: "Paste the URL", description2: "Start a free crawl audit from the homepage. No Google connect required for the free report." },
    { text: "02", description: "Read the free report", description2: "See scored findings, graph gaps, AEO, and AI fix prompts as soon as the crawl finishes." },
    { text: "03", description: "Save and connect", description2: "Sign in to keep the site on Your sites, then connect GSC and GA4 for traffic evidence." }
];
/** Logo Cloud section. */
export default function LogoCloudSection3({ logos = logosContent, tile10Data = Tile10_data } = {}) {
  return (
    <section className="block" data-cid="n2088">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n2089">
        <div className="block mx-auto max-w-3xl" data-cid="n2090">
          <div className="block text-center max-lg:[text-align:inherit]" data-cid="n2091">
            <div className="block text-balance" data-cid="n2092">
              <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n2093" data-component="heading">
                From one URL to a brief you can actually share.
              </h2>
              <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n2094">
                Paste a URL once, read the free report, sign in to save the site, then connect GSC and GA4 for traffic evidence.
              </p>
            </div>
          </div>
          <div className="block py-12" data-cid="n2095">
            <astro-island class="contents" data-cid="n2096">
              <div className="grid items-center gap-y-5 gap-x-6 justify-items-center grid-rows-2 grid-cols-11 max-md:grid-rows-4 max-md:grid-cols-6 md:max-lg:grid-rows-3 md:max-lg:grid-cols-8" data-cid="n2097" aria-label="Supported installation platforms">
                {logos.map((d, i) => <LogoCloudItem key={i} d={d} cids={LogoCloudItem_cids[i]} styles={LogoCloudItem_styles[i]} />)}
              </div>
            </astro-island>
          </div>
        </div>
        <dl className="border-t border-solid border-t-surface-4 border-b border-b-surface-4 block mx-auto max-w-2xl" data-cid="n2142">
          {tile10Data.map((d, i) => <Tile10 key={i} d={d} cids={Tile10_cids[i]} styles={Tile10_styles[i]} />)}
        </dl>
      </div>
    </section>
  );
}
