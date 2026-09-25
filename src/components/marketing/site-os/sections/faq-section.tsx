// @ts-nocheck
"use client";
import { Accordion } from "@base-ui/react/accordion";
import MediaCard2, { type MediaCard2Data } from "../components/media-card2";
import { MediaCard2_cids } from "../_cids";
import { MediaCard2_styles } from "../_styles";
const MediaCard2_data: MediaCard2Data[] = [
    { id: "what-is-site-os", title: "What is Site-OS?", description: "Site-OS turns a website crawl into a scored, commercial audit. Paste a URL to get SEO and AEO findings and a buyer-moment diagnosis, then connect Search Console and GA4 on a full audit to fold query, session, and conversion data into a prioritized growth brief with AI-ready fix prompts." },
    { id: "is-free-really-free", title: "Is the free audit really free?", description: "Yes. The free crawl audit is $0, requires no credit card, and doesn't expire. It scores your site, flags buyer-moment and architecture gaps, and gives you a top-priority fix list. You only pay if you upgrade to a full audit with Search Console and GA4 connected." },
    { id: "need-gsc-to-start", title: "Do I need Google Search Console to start?", description: "No. Paste any URL and Site-OS runs a full crawl without connecting Google. Search Console and GA4 are optional upgrades you connect later if you want query, session, and conversion depth layered on top of the crawl findings." },
    { id: "free-crawl-includes", title: "What does the free crawl audit include?", description: "A homepage and page crawl, business context inferred from the site, a buyer-moment diagnosis and architecture gaps, a basic opportunity scorecard with top-priority fixes, and one agent-ready execution prompt when available." },
    { id: "paid-audit-adds", title: "What does a paid connected audit add?", description: "The full audit (~$700) connects Search Console and GA4, so query and page performance and session and conversion data sit next to the crawl findings. You also get AI/AEO scoring, a scored priority stack across search, site, and conversion, and execution briefs with universal agent prompts." },
    { id: "save-free-report", title: "How do I save my free report?", description: "Sign in with email or Google. Signing in doesn't change what the free crawl finds — it keeps the audit attached to your account under Your sites so you can reopen it anytime instead of losing it when you close the tab." },
    { id: "any-website", title: "Can I use Site-OS on any website?", description: "Yes. Site-OS crawls any live, publicly reachable URL regardless of what it's built on — WordPress, Shopify, Webflow, Framer, custom code, and more. You just need a URL; no code or plugin install is required." },
    { id: "store-credentials", title: "Does Site-OS store my Google credentials?", description: "No. Site-OS never sees your Google password. Search Console and GA4 access uses read-only OAuth scopes, and the resulting tokens are stored server-side and never exposed to your browser. You can revoke access anytime from Site-OS or from your Google account permissions page." },
    { id: "what-is-aeo", title: "What is AEO analysis?", description: "AEO (answer-engine optimization) analysis scores how easily AI answer engines and chat assistants can find, understand, and cite your pages — entity clarity, structured data, and answer-shaped content — alongside classic SEO findings." },
    { id: "knowledge-graph", title: "What is the commercial knowledge graph?", description: "It's a map of your ICP, offers, proof points, and CTA chains built from the crawl. Site-OS uses it to show where a missing proof point or a broken offer chain is costing you a buyer, not just what's technically wrong on a page." },
    { id: "fix-prompts", title: "Do I get fix prompts for each finding?", description: "Yes, on the full audit. Every finding ships with an AI-ready execution prompt you can paste directly into Cursor, Claude Code, Codex, or another coding agent to ship the fix without re-explaining the context." },
    { id: "operators-client-work", title: "Can operators use Site-OS for client work?", description: "Yes. Agencies and freelancers run audits per client project, then export a client-ready growth brief with findings, priorities, and pricing guidance to share — no client login required to view it." },
    { id: "pricing-guidance", title: "How does pricing guidance work?", description: "Site-OS scores each finding by severity and revenue impact, then recommends whether the work fits inside the current audit, a follow-up implementation sprint, or an ongoing retainer, so you or your client know what to quote next." },
    { id: "what-is-growth-brief", title: "What is a growth brief?", description: "A shareable, client-ready report that packages your findings, priority stack, knowledge-graph gaps, and pricing guidance into one document you can hand to a client or stakeholder." },
    { id: "upgrade-after-free", title: "Can I upgrade after the free audit?", description: "Yes, anytime. Your free crawl audit stays saved under Your sites, and upgrading to the full audit adds Search Console and GA4 depth to the same project instead of starting over." },
    { id: "why-sign-in", title: "Why do you ask me to sign in?", description: "Signing in lets Site-OS save your audits to Your sites, remember connected Google accounts, and let you reopen or share a report later. The free crawl itself works without signing in — sign-in is only needed to keep it." },
    { id: "crawl-slow-site", title: "Will the crawl slow down my site?", description: "No. The crawl behaves like a normal visitor requesting your public pages at a moderate rate. It doesn't hammer your server or run any load testing." },
    { id: "share-with-client", title: "Can I share the report with a client?", description: "Yes. Export a growth brief as a shareable link — recipients can view findings and priorities without needing a Site-OS account." },
    { id: "sponsor-site-os", title: "How do I sponsor Site-OS?", description: "Site-OS isn't sponsorship-funded. If you're interested in a partnership, an agency or reseller plan, or bulk audits across multiple client sites, email support@site-os.app and we'll set it up." },
    { id: "get-help", title: "Where do I get help?", description: "Email support@site-os.app for account, billing, or audit-accuracy questions, or sign in and reach support from inside Your sites." },
];
/** Faq section. */
export default function FaqSection({ mediaCard2Data = MediaCard2_data } = {}) {
  return (
    <section className="block pt-8" data-cid="n2305" aria-labelledby="faq-heading" id="faq">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n2306">
        <div className="block mx-auto max-w-2xl" data-cid="n2307">
          <div className="block text-balance" data-cid="n2308">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n2309" data-component="heading" id="faq-heading">
              FAQ
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n2310">
              Quick answers about free audits, connected upgrades, findings, and sign-in.
            </p>
          </div>
          <div className="block mt-10 mx-auto w-full max-w-2xl" data-cid="n2312">
            <Accordion.Root data-cid="n2313" className="border-t border-solid border-t-surface-4 border-b border-b-surface-4 block w-full" aria-labelledby="faq-heading">
              {mediaCard2Data.map((d, i) => <MediaCard2 key={d.id} d={d} cids={MediaCard2_cids[i]} styles={MediaCard2_styles[i]} />)}
            </Accordion.Root>
            <p className="block mt-4 text-muted-foreground text-xs leading-4 text-center" data-cid="n2414">
              {"Still have questions? "}
              <a className="inline text-foreground cursor-pointer hover:underline" data-cid="n2415" data-component="link" href="/audit">
                Sign in to audit
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
