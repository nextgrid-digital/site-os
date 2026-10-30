"use client";
import { useEffect, useRef, useState } from "react";

type FaqItem = { id: string; title: string; description: string };
const FAQ_ITEMS: FaqItem[] = [
    { id: "what-is-site-os", title: "What is Site-OS?", description: "Site-OS turns a website crawl into a scored, commercial audit. Paste a URL to get SEO findings, an AI answer readiness score for every page, and a buyer-moment diagnosis. Sign in to test whether AI search cites you, then connect Search Console and GA4 to fold query, session, and conversion data, including visits from AI tools, into a prioritized growth brief with AI-ready fix prompts." },
    { id: "is-free-really-free", title: "Is the free audit really free?", description: "Yes. The free crawl audit requires no credit card and doesn't expire. It scores your site, flags buyer-moment and architecture gaps, and gives you a top-priority fix list. Connecting Google for the full audit is free too." },
    // { id: "need-gsc-to-start", title: "Do I need Google Search Console to start?", description: "No. Paste any URL and Site-OS runs a full crawl without connecting Google. Search Console and GA4 are optional sources you connect later if you want query, session, and conversion depth layered on top of the crawl findings." },
    { id: "free-crawl-includes", title: "What does the free crawl audit include?", description: "A homepage and page crawl, business context inferred from the site, a buyer-moment diagnosis and architecture gaps, a basic opportunity scorecard with top-priority fixes, and one agent-ready execution prompt when available." },
    { id: "paid-audit-adds", title: "What does the full audit add?", description: "The full audit connects Search Console and GA4, so query and page performance and session and conversion data sit next to the crawl findings. You also get a scored priority stack across search, site, and conversion, and execution briefs with universal agent prompts." },
    { id: "save-free-report", title: "How do I save my free report?", description: "Sign in with email or Google. Signing in doesn't change what the free crawl finds — it keeps the audit attached to your account under Your sites so you can reopen it anytime instead of losing it when you close the tab." },
    { id: "any-website", title: "Can I use Site-OS on any website?", description: "Yes. Site-OS crawls any live, publicly reachable URL regardless of what it's built on — WordPress, Shopify, Webflow, Framer, custom code, and more. You just need a URL; no code or plugin install is required." },
    { id: "store-credentials", title: "Does Site-OS store my Google credentials?", description: "No. Site-OS never sees your Google password. Search Console and GA4 access uses read-only OAuth scopes, and the resulting tokens are stored server-side and never exposed to your browser. You can revoke access anytime from Site-OS or from your Google account permissions page." },
    { id: "what-is-aeo", title: "What is AEO analysis?", description: "AEO (answer-engine optimization) analysis scores how easily AI answer engines and chat assistants can find, understand, and quote each of your pages: structured data, direct answers, question-style headings, authorship, freshness, and extractable structure. You see a score per page and the gaps that cost the most." },
    { id: "citation-probe", title: "What is the citation probe?", description: "It asks an AI search engine questions your buyers might ask, using Google's Gemini with search, and checks whether your domain is cited as a source. You see which questions cited you, which didn't, and which other sites were cited instead. Answers vary between runs, so treat a result as a sample. Only questions about your business and market are accepted, and you need to be signed in." },
    { id: "topic-map", title: "What is the topic map?", description: "It groups the pages Site-OS crawled into topics, shows how well each topic is covered, and lists subjects buyers would expect that no page answers yet. It is AI-drafted from your own crawl, so treat the missing topics as a starting point, not a measured demand report." },
    { id: "ai-traffic", title: "Can I see visitors that come from ChatGPT or Perplexity?", description: "Yes, once you connect Google Analytics. Site-OS reads your own GA4 for the last 90 days and shows visits attributed to AI tools such as ChatGPT, Perplexity, Gemini, Copilot and Claude, with a daily trend and the pages those visitors land on. It is a floor, not a total, because some AI apps hide where visitors come from." },
    { id: "hide-sections", title: "Can I hide parts of the AI report?", description: "Yes. On the AI answer readiness tab, use the Show toggles to hide the AI traffic, topic map, or citation probe cards. Your choice is remembered in your browser, and hiding a card doesn't delete any data." },
    { id: "knowledge-graph", title: "What is the commercial knowledge graph?", description: "It's a map of your ICP, offers, proof points, and CTA chains built from the crawl. Site-OS uses it to show where a missing proof point or a broken offer chain is costing you a buyer, not just what's technically wrong on a page." },
    { id: "fix-prompts", title: "Do I get fix prompts for each finding?", description: "Yes, on the full audit. Every finding ships with an AI-ready execution prompt you can paste directly into Cursor, Claude Code, Codex, or another coding agent to ship the fix without re-explaining the context." },
    { id: "operators-client-work", title: "Can operators use Site-OS for client work?", description: "Yes. Agencies and freelancers run audits per client project, then export a client-ready growth brief with findings and priorities to share — no client login required to view it." },
    { id: "what-is-growth-brief", title: "What is a growth brief?", description: "A shareable, client-ready report that packages your findings, priority stack, knowledge-graph gaps, and next steps into one document you can hand to a client or stakeholder." },
    { id: "upgrade-after-free", title: "Can I connect Google after the free audit?", description: "Yes, anytime. Your free crawl audit stays saved under Your sites, and connecting Google adds Search Console and GA4 depth to the same project instead of starting over." },
    // { id: "why-sign-in", title: "Why do you ask me to sign in?", description: "Signing in lets Site-OS save your audits to Your sites, remember connected Google accounts, and let you reopen or share a report later. The free crawl itself works without signing in — sign-in is only needed to keep it." },
    { id: "crawl-slow-site", title: "Will the crawl slow down my site?", description: "No. The crawl behaves like a normal visitor requesting your public pages at a moderate rate. It doesn't hammer your server or run any load testing." },
    // { id: "share-with-client", title: "Can I share the report with a client?", description: "Yes. Export a growth brief as a shareable link — recipients can view findings and priorities without needing a Site-OS account." },
    // { id: "sponsor-site-os", title: "How do I sponsor Site-OS?", description: "Site-OS isn't sponsorship-funded. If you're interested in a partnership, an agency or reseller plan, or bulk audits across multiple client sites, email support@site-os.app and we'll set it up." },
    { id: "get-help", title: "Where do I get help?", description: "Email support@site-os.app for account, billing, or audit-accuracy questions, or sign in and reach support from inside Your sites." },
];
const FAQ_GROUPS: { title: string; ids: string[] }[] = [
  { title: "Getting started", ids: ["what-is-site-os", "is-free-really-free", "free-crawl-includes", "paid-audit-adds", "save-free-report", "any-website", "upgrade-after-free"] },
  { title: "AI search & reports", ids: ["what-is-aeo", "citation-probe", "topic-map", "ai-traffic", "hide-sections", "knowledge-graph", "fix-prompts", "what-is-growth-brief", "operators-client-work"] },
  { title: "Data & support", ids: ["store-credentials", "crawl-slow-site", "get-help"] },
];

function FaqRow({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const panelId = `faq-panel-${item.id}`;
  return (
    <div
      data-open={open}
      className={`faq-item relative rounded-xl transition-[background-color,box-shadow] duration-300 ${
        open ? "bg-surface-3 shadow-sm ring-1 ring-border" : ""
      }`}
    >
      {open && (
        <>
          <span aria-hidden className="faq-line faq-line-top" />
          <span aria-hidden className="faq-line faq-line-bottom" />
          <span aria-hidden className="faq-line faq-line-left" />
          <span aria-hidden className="faq-line faq-line-right" />
        </>
      )}
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-5 text-left font-medium"
        >
          <span>{item.title}</span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-5 text-sm leading-6 text-muted-foreground">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

/** Faq section. */
export default function FaqSection({ items = FAQ_ITEMS } = {}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <section className="block pt-8" aria-labelledby="faq-heading" id="faq">
      <div className="mx-auto block max-w-280 px-8 py-20">
        <div className="mx-auto block max-w-2xl">
          <div className="block text-balance text-center">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" id="faq-heading">
              Frequently Asked Questions
            </h2>
            <p className="mt-1.5 block text-muted-foreground 2xl:text-lg 2xl:leading-7">
              Quick answers about free audits, connected audits, findings, and sign-in.
            </p>
          </div>
          <div ref={ref} className="faq-root mt-12 w-full space-y-10">
            {FAQ_GROUPS.map((g) => {
              const rows = g.ids.map((id) => items.find((i) => i.id === id)).filter(Boolean) as FaqItem[];
              return (
                <div key={g.title}>
                  <h3 className="mb-2 px-1 text-lg font-medium">{g.title}</h3>
                  <div className="space-y-1">
                    {rows.map((item) => (
                      <FaqRow
                        key={item.id}
                        item={item}
                        open={openId === item.id}
                        onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 block text-center text-xs leading-4 text-muted-foreground">
            {"Still have questions? "}
            <a className="inline cursor-pointer text-foreground hover:underline" href="/login">
              Sign in to audit
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
