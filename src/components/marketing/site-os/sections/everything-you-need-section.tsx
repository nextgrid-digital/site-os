// @ts-nocheck
"use client";
import { Accordion } from "@base-ui/react/accordion";
import FeatureCard2 from "../components/feature-card2";
import MediaCard, { type MediaCardData } from "../components/media-card";
import { FeatureCard2_cids, MediaCard_cids } from "../_cids";
import { FeatureCard2_styles, MediaCard_styles } from "../_styles";
import { featureCard2Data as featureCard2DataContent } from "../content";
const MediaCard_data: MediaCardData[] = [
    { id: "breakdowns", title: "Breakdowns", description: "Findings break down by severity, buyer moment, and category — so a page with ten small issues doesn't outrank one page with a broken checkout flow." },
    { id: "events", title: "Events", description: "Connect GA4 to see which conversion events fire and where visitors drop off, right next to the crawl findings that explain why." },
    { id: "tracking", title: "Tracking", description: "Once Search Console is connected, crawl findings sit beside real query and page performance data — not just guesses about what matters." },
    { id: "revenue", title: "Revenue", description: "Each finding maps to a buyer moment, an estimated revenue impact, and a composite priority score, so fixes are ranked by what they're worth." },
    { id: "privacy", title: "Privacy", description: "Search Console and GA4 connect with read-only OAuth scopes. Tokens are stored server-side and never exposed to your browser, and you can disconnect anytime." },
    { id: "setup", title: "Setup", description: "Paste a URL to start — no install, no code, and no credit card. Connect Google in a couple of clicks later if you want deeper findings." },
    { id: "sharing", title: "Sharing", description: "Export a client-ready growth brief and share a link, so stakeholders can see the findings and priorities without needing to sign in." },
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
        <div className="block mt-8" data-cid="n1338">
          <Accordion.Root data-cid="n1339" className="border-t border-solid border-t-surface-4 border-b border-b-surface-4 block w-full" defaultValue={["overview"]}>
            <Accordion.Item value="overview" data-cid="n1343" className="border-b border-solid border-b-surface-4 block">
              <Accordion.Header className="flex" data-component="heading">
                <Accordion.Trigger data-cid="n1346" className="flex py-5 justify-between items-center flex-1 gap-4 text-sm font-semibold leading-5 text-left cursor-pointer hover:text-clr-28 hover:[text-decoration-color:var(--clr-28)] focus:text-foreground focus:[text-decoration-color:var(--foreground)]">
                  <span className="block text-lg font-medium leading-7" data-cid="n1347">
                    Overview
                  </span>
                  <svg className="w-4 h-4 block shrink-0 overflow-hidden align-middle text-muted-foreground transition-transform data-panel-open:rotate-180" data-component="icon" aria-hidden="true" fill="none" height="24" stroke="currentColor" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" data-cid="n1348">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="block overflow-hidden" data-cid="n1349">
                <ul className="grid pt-2 pb-10 items-start gap-y-8 gap-x-10 grid-cols-[repeat(auto-fit,_minmax(310px,_1fr))] [list-style-type:none] list-outside" data-cid="n1350">
                  {featureCard2Data.map((d, i) => <FeatureCard2 key={i} d={d} cids={FeatureCard2_cids[i]} styles={FeatureCard2_styles[i]} />)}
                </ul>
              </Accordion.Panel>
            </Accordion.Item>
            {mediaCardData.map((d, i) => <MediaCard key={d.id} d={d} cids={MediaCard_cids[i]} styles={MediaCard_styles[i]} />)}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}
