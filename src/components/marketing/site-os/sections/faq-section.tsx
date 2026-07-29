// @ts-nocheck
import MediaCard2, { type MediaCard2Data } from "../components/media-card2";
import { MediaCard2_cids } from "../_cids";
import { MediaCard2_styles } from "../_styles";
const MediaCard2_data: MediaCard2Data[] = [
    { id: "base-ui-_r24R_bH2_", title: "What is Site-OS?" },
    { id: "base-ui-_r24R_jH2_", title: "Is the free audit really free?" },
    { id: "base-ui-_r24R_rH2_", title: "Do I need Google Search Console to start?" },
    { id: "base-ui-_r24R_13H2_", title: "What does the free crawl audit include?" },
    { id: "base-ui-_r24R_1bH2_", title: "What does a paid connected audit add?" },
    { id: "base-ui-_r24R_1jH2_", title: "How do I see my full free report?" },
    { id: "base-ui-_r24R_1rH2_", title: "Can I use Site-OS on any website?" },
    { id: "base-ui-_r24R_23H2_", title: "Does Site-OS store my Google credentials?" },
    { id: "base-ui-_r24R_2bH2_", title: "What is AEO analysis?" },
    { id: "base-ui-_r24R_2jH2_", title: "What is the commercial knowledge graph?" },
    { id: "base-ui-_r24R_2rH2_", title: "Do I get fix prompts for each finding?" },
    { id: "base-ui-_r24R_33H2_", title: "Can operators use Site-OS for client work?" },
    { id: "base-ui-_r24R_3bH2_", title: "How does pricing guidance work?" },
    { id: "base-ui-_r24R_3jH2_", title: "What is a growth brief?" },
    { id: "base-ui-_r24R_3rH2_", title: "Can I upgrade after the free audit?" },
    { id: "base-ui-_r24R_43H2_", title: "Why do you ask me to sign in?" },
    { id: "base-ui-_r24R_4bH2_", title: "Will the crawl slow down my site?" },
    { id: "base-ui-_r24R_4jH2_", title: "Can I share the report with a client?" },
    { id: "base-ui-_r24R_4rH2_", title: "How do I sponsor Site-OS?" },
    { id: "base-ui-_r24R_53H2_", title: "Where do I get help?" },
];
/** Faq section. */
export default function FaqSection({ mediaCard2Data = MediaCard2_data } = {}) {
  return (
    <section className="block pt-8" data-cid="n2305" aria-labelledby="faq-heading" id="faq">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n2306">
        <div className="h-[80.1875rem] block mx-auto max-w-2xl max-md:h-[99.1875rem] md:max-lg:h-[79.9375rem] 2xl:h-[81.6875rem]" data-cid="n2307">
          <div className="block text-balance" data-cid="n2308">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n2309" data-component="heading" id="faq-heading">
              FAQ
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n2310">
              Quick answers about free audits, connected upgrades, findings, and sign-in.
            </p>
          </div>
          <astro-island class="contents" data-cid="n2311">
            <div className="block mt-10 mx-auto w-full max-w-2xl" data-cid="n2312">
              <div className="border-t border-solid border-t-surface-4 border-b border-b-surface-4 block w-full" data-cid="n2313" aria-labelledby="faq-heading" dir="ltr">
                {mediaCard2Data.map((d, i) => <MediaCard2 key={i} d={d} cids={MediaCard2_cids[i]} styles={MediaCard2_styles[i]} />)}
              </div>
              <p className="block mt-4 text-muted-foreground text-xs leading-4 text-center" data-cid="n2414">
                {"Still have questions? "}
                <a className="inline text-foreground cursor-pointer hover:underline" data-cid="n2415" data-component="link" href="/audit">
                  Sign in to audit
                </a>
                .
              </p>
            </div>
          </astro-island>
        </div>
      </div>
    </section>
  );
}
