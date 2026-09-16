// Semantic page content extracted from recognized recipe sections.

export type ListRowDataItem = {
  href: string;
  label: string;
  rel?: string;
  target?: string;
};
export const listRowData: ListRowDataItem[] = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
    { href: "/audit", label: "Sign in" }
];

export type ProductsItem = {
  variant: string;
  eyebrow: string;
  title: string;
  label?: string;
  stat?: string;
  imgSrc: string;
  description: string;
  description2: string;
};
export const products: ProductsItem[] = [
    { variant: "traffic-overview", eyebrow: "82", title: "Crawl findings", label: "Scored SEO and commercial issues from a live site crawl—titles, metas, H1s, links, and schema.", stat: "47", imgSrc: "/assets/cloned/images/2db9318bbc2f.png", description: "Crawl findings", description2: "Scored SEO and commercial issues from a live site crawl—titles, metas, H1s, links, and schema." },
    { variant: "conversions", eyebrow: "Priority", title: "Revenue impact", label: "Severity", stat: "A1", imgSrc: "/assets/cloned/images/914b33ffec33.png", description: "Revenue impact", description2: "Each finding maps to buyer moments, revenue impact, and a composite priority score." },
    { variant: "pin-notes-to-specific-days-on-your-traffic", eyebrow: "Graph gaps", title: "Commercial knowledge graph with ICP, offers, proof, and CTA chains so gaps stay tied to revenue.", stat: "12", imgSrc: "/assets/cloned/images/3aed687c1b1f.png", description: "Knowledge graph", description2: "Commercial knowledge graph with ICP, offers, proof, and CTA chains so gaps stay tied to revenue." },
    { variant: "connect-search-console-to-see-which-querie", eyebrow: "Search Console", title: "Connect Search Console on a paid audit to tie queries and page performance to crawl findings.", stat: "GSC", imgSrc: "/assets/cloned/images/af9128c8772f.png", description: "Search Console", description2: "Connect Search Console on a paid audit to tie queries and page performance to crawl findings." },
    { variant: "see-when-conversions-peak-by-day-and-hour-", eyebrow: "AEO", title: "Answer-engine citability and entity clarity scored beside classic SEO findings.", imgSrc: "/assets/cloned/images/1a229c4e3deb.png", description: "AEO analysis", description2: "Answer-engine citability and entity clarity scored beside classic SEO findings." },
    { variant: "measure-the-actions-that-matter-from-sign-", eyebrow: "Work orders", title: "Actionable tasks from graph gaps—rewrite, add proof, fix links—tracked open to done.", stat: "18", imgSrc: "/assets/cloned/images/3aed687c1b1f.png", description: "Work orders", description2: "Actionable tasks from graph gaps—rewrite, add proof, fix links—tracked open to done." },
    { variant: "see-who-is-on-your-site-right-now-where-th", eyebrow: "GA4", title: "Connect GA4 on upgrade to read sessions and conversion gaps next to the free crawl report.", imgSrc: "/assets/cloned/images/3aa13c971186.png", description: "GA4 connect", description2: "Connect GA4 on upgrade to read sessions and conversion gaps next to the free crawl report." },
    { variant: "flag-your-not-found-page-once-then-see-bro", eyebrow: "Fix prompts", title: "Every finding ships with an AI-ready prompt you can paste into Cursor or Claude.", stat: "AI", imgSrc: "/assets/cloned/images/7a0f73293c73.png", description: "Fix prompts", description2: "Every finding ships with an AI-ready prompt you can paste into Cursor or Claude." },
    { variant: "connect-cursor-claude-code-or-codex-to-pul", eyebrow: "Growth brief", title: "Client-ready growth brief with findings, graph gaps, and pricing guidance in one shareable report.", stat: "PDF", imgSrc: "/assets/cloned/images/ddc11a1b5498.png", description: "Growth brief", description2: "Client-ready growth brief with findings, graph gaps, and pricing guidance in one shareable report." }
];

export type CardsItem = {
  variant: string;
  title: string;
  price?: string;
  stat: string;
  description?: string;
};
export const cards: CardsItem[] = [
    { variant: "top-sources", title: "Top sources", price: "$860.00", stat: "1,177" },
    { variant: "top-countries", title: "Top countries", description: "United Kingdom", stat: "982" },
    { variant: "devices", title: "Devices", stat: "436" },
    { variant: "browsers", title: "Browsers", stat: "716" },
    { variant: "top-pages", title: "Top pages", price: "$1,560", stat: "1,885" },
    { variant: "top-converting-events", title: "Top converting events", description: "Copied install script", stat: "284" }
];

export type FeatureCardDataItem = {
  title: string;
  description: string;
};
export const featureCardData: FeatureCardDataItem[] = [
    { title: "Score every finding", description: "Severity, buyer moment, revenue impact, and priority in one ranked list." },
    { title: "Review graph gaps together", description: "Missing proof, weak CTAs, and broken offer chains in one commercial view." },
    { title: "Ship fix prompts", description: "AI-ready prompts per finding so operators and clients can execute without rewriting context." }
];

export type FeatureCard2DataItem = {
  href: string;
  title: string;
  description: string;
};
export const featureCard2Data: FeatureCard2DataItem[] = [
    { href: "/#how-it-works", title: "Free crawl audit", description: "Paste a URL, crawl the site, and get scored findings without Google connect." },
    { href: "/login?next=/app", title: "Save your sites", description: "Sign in to keep audits on Your sites and reopen them anytime." },
    { href: "/#audit", title: "Connect Google", description: "Add Search Console and GA4 for query, session, and conversion depth." },
    { href: "/#faq", title: "Growth brief", description: "Share a client-ready brief with findings, priorities, and pricing guidance." }
];

export type LogosItem = {
  alt: string;
  imgSrc: string;
  text: string;
};
export const logos: LogosItem[] = [
    { alt: "Stripe logo", imgSrc: "/assets/cloned/svg/7f7c8d3d24a2.svg", text: "Stripe" },
    { alt: "Polar logo", imgSrc: "/assets/cloned/svg/8279c34e27bd.svg", text: "Polar" },
    { alt: "Paddle logo", imgSrc: "/assets/cloned/svg/bfe72e408d0d.svg", text: "Paddle" },
    { alt: "Creem logo", imgSrc: "/assets/cloned/svg/e0da153feedf.svg", text: "Creem" }
];

export type FeatureCardData2Item = {
  title: string;
  description: string;
};
export const featureCardData2: FeatureCardData2Item[] = [
    { title: "Connect Google", description: "OAuth into Search Console and GA4 after you sign in." },
    { title: "Keep scope clear", description: "Free crawl first; connect adds query and session depth without replacing findings." },
    { title: "Read it in context", description: "GSC queries and GA4 sessions sit beside crawl findings and graph gaps." }
];

export type Logos2Item = {
  alt: string;
  imgSrc: string;
  text: string;
};
export const logos2: Logos2Item[] = [
    { alt: "Cursor logo", imgSrc: "/assets/cloned/svg/b749a521ac36.svg", text: "Cursor" },
    { alt: "Claude Code logo", imgSrc: "/assets/cloned/svg/37138e35d576.svg", text: "Claude Code" },
    { alt: "Codex logo", imgSrc: "/assets/cloned/svg/6ffe5df6e827.svg", text: "Codex" },
    { alt: "GitHub Copilot logo", imgSrc: "/assets/cloned/svg/4f2d24edd8fe.svg", text: "GitHub Copilot" },
    { alt: "Zed logo", imgSrc: "/assets/cloned/svg/9503c1f6f6d8.svg", text: "Zed" },
    { alt: "OpenCode logo", imgSrc: "/assets/cloned/svg/2b966b61b5af.svg", text: "OpenCode" },
    { alt: "Roo Code logo", imgSrc: "/assets/cloned/svg/84871af8a5d9.svg", text: "Roo Code" },
    { alt: "Windsurf logo", imgSrc: "/assets/cloned/svg/30461bfc0f1a.svg", text: "Windsurf" }
];

export type Logos3Item = {
  alt: string;
  height?: string;
  href?: string;
  imgSrc: string;
  rel?: string;
  srcSet?: string;
  target?: string;
  tooltip?: string;
  width?: string;
};
export const logos3: Logos3Item[] = [
    { alt: "Next.js logo", height: "24", imgSrc: "/assets/cloned/svg/118b5cc5a57a.svg", width: "24" },
    { alt: "React Router logo", height: "24", imgSrc: "/assets/cloned/svg/9f6596a6b40f.svg", width: "24" },
    { alt: "Astro logo", height: "24", imgSrc: "/assets/cloned/svg/a4a7fa3f8062.svg", width: "24" },
    { alt: "Vue logo", height: "24", imgSrc: "/assets/cloned/svg/99d439c05f4a.svg", width: "24" },
    { alt: "Laravel logo", height: "24", imgSrc: "/assets/cloned/svg/0e371db0bb52.svg", width: "24" },
    { alt: "Django logo", height: "24", imgSrc: "/assets/cloned/svg/40b554dad1af.svg", width: "24" },
    { alt: "WordPress logo", height: "24", imgSrc: "/assets/cloned/svg/0b09bee614bc.svg", width: "24" },
    { alt: "Webflow logo", height: "24", imgSrc: "/assets/cloned/svg/4993694b316e.svg", width: "24" },
    { alt: "Framer logo", height: "24", imgSrc: "/assets/cloned/svg/3ce1177f701f.svg", width: "24" },
    { alt: "Ghost logo", height: "24", imgSrc: "/assets/cloned/images/e7395d6503ba.png", width: "24" },
    { alt: "Shopify logo", height: "24", imgSrc: "/assets/cloned/svg/e10e515777c3.svg", width: "24" },
    { alt: "WooCommerce logo", height: "24", imgSrc: "/assets/cloned/svg/e2b4faed88c5.svg", width: "24" },
    { alt: "Bubble logo", height: "24", imgSrc: "/assets/cloned/svg/1616973c43c6.svg", width: "24" },
    { alt: "Podia logo", height: "24", imgSrc: "/assets/cloned/svg/d8a76cc46747.svg", width: "24" },
    { alt: "Kajabi logo", height: "24", imgSrc: "/assets/cloned/svg/9ee8ec0ffd37.svg", width: "24" },
    { alt: "Wix logo", height: "24", imgSrc: "/assets/cloned/svg/2ed85df1b4cd.svg", width: "24" },
    { alt: "Squarespace logo", height: "24", imgSrc: "/assets/cloned/svg/e8ff4ead4dab.svg", width: "24" },
    { alt: "Lovable logo", height: "24", imgSrc: "/assets/cloned/svg/5d1aa372325c.svg", width: "24" },
    { alt: "Bolt logo", height: "24", imgSrc: "/assets/cloned/svg/2e7d3306ce05.svg", width: "24" },
    { alt: "Vercel v0 logo", height: "24", imgSrc: "/assets/cloned/svg/9bafc01166f7.svg", width: "24" },
    { alt: "Replit logo", height: "24", imgSrc: "/assets/cloned/svg/34d1bcb4d65a.svg", width: "24" },
    { alt: "Google Tag Manager logo", height: "24", imgSrc: "/assets/cloned/svg/72b5f3b48b2f.svg", width: "24" }
];

export type Logos4Item = {
  description: string;
};
export const logos4: Logos4Item[] = [
    { description: "Free crawl audit on any URL" },
    { description: "Full free report after sign-in" },
    { description: "Scored findings with severity" },
    { description: "Buyer-moment mapping" },
    { description: "Commercial knowledge graph" },
    { description: "AEO / answer-engine scoring" },
    { description: "AI fix prompts per finding" },
    { description: "Work orders from graph gaps" },
    { description: "Search Console on upgrade" },
    { description: "GA4 on upgrade" },
    { description: "Growth brief export" },
    { description: "Pricing guidance" },
    { description: "Operator project workflow" },
    { description: "Client-ready report share" },
    { description: "Goal-shaped connected audits" },
    { description: "No credit card to start free" },
    { description: "Upgrade anytime after free audit" }
];

export type ListRow11DataItem = {
  href: string;
  label: string;
};
export const listRow11Data: ListRow11DataItem[] = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
    { href: "/audit", label: "Sign in" }
];

export type ListRow11Data2Item = {
  href: string;
  label: string;
};
export const listRow11Data2: ListRow11Data2Item[] = [
    { href: "/audit", label: "Sign in" },
    { href: "/#faq", label: "FAQ" },
    { href: "/#", label: "Start free audit" }
];

export type ListRow11Data3Item = {
  href: string;
  label: string;
};
export const listRow11Data3: ListRow11Data3Item[] = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" }
];

export type ListRow11Data4Item = {
  href: string;
  label: string;
};
export const listRow11Data4: ListRow11Data4Item[] = [
    { href: "/#how-it-works", label: "Free crawl audit" },
    { href: "/#how-it-works", label: "Full free report" },
    { href: "/#pricing", label: "Connected upgrade" }
];

export type ListRow11Data5Item = {
  href: string;
  label: string;
};
export const listRow11Data5: ListRow11Data5Item[] = [
    { href: "/#how-it-works", label: "Crawl findings" },
    { href: "/#how-it-works", label: "Severity and priority" },
    { href: "/#how-it-works", label: "Buyer-moment mapping" },
    { href: "/#pricing", label: "Search Console insights" },
    { href: "/#pricing", label: "GA4 sessions" }
];

export type ListRow11Data6Item = {
  href: string;
  label: string;
};
export const listRow11Data6: ListRow11Data6Item[] = [
    { href: "/#how-it-works", label: "Knowledge graph" },
    { href: "/#how-it-works", label: "Work orders" },
    { href: "/#how-it-works", label: "AEO scoring" },
    { href: "/#how-it-works", label: "Fix prompts" }
];

export type ListRow11Data7Item = {
  href: string;
  label: string;
};
export const listRow11Data7: ListRow11Data7Item[] = [
    { href: "/#", label: "Start free audit" },
    { href: "/audit", label: "Sign in" },
    { href: "/#faq", label: "Why sign in" },
    { href: "/#pricing", label: "Upgrade path" }
];

export type ListRow11Data8Item = {
  href: string;
  label: string;
};
export const listRow11Data8: ListRow11Data8Item[] = [
    { href: "/#pricing", label: "Free vs paid" },
    { href: "/#pricing", label: "GSC + GA4 connect" },
    { href: "/#faq", label: "What paid adds" }
];

export type ListRow11Data9Item = {
  href: string;
  label: string;
};
export const listRow11Data9: ListRow11Data9Item[] = [
    { href: "/#faq", label: "What is Site-OS" },
    { href: "/#faq", label: "Is free really free" },
    { href: "/#faq", label: "Do I need GSC to start" },
    { href: "/#faq", label: "Credentials" },
    { href: "/#faq", label: "Share with clients" },
    { href: "/#faq", label: "Sponsor Site-OS" },
    { href: "/audit", label: "Get help" }
];

export type ListRow11Data10Item = {
  href: string;
  label: string;
};
export const listRow11Data10: ListRow11Data10Item[] = [
    { href: "/#", label: "Paste a URL" },
    { href: "/audit", label: "Sign in for full report" },
    { href: "/#pricing", label: "Upgrade connected" },
    { href: "/#how-it-works", label: "Crawl pipeline" },
    { href: "/#how-it-works", label: "Growth brief" },
    { href: "/#how-it-works", label: "Fix prompts" },
    { href: "/#faq", label: "Operator workflow" },
    { href: "/#how-it-works", label: "AEO scoring" }
];

export type ListRow11Data11Item = {
  href: string;
  label: string;
};
export const listRow11Data11: ListRow11Data11Item[] = [
    { href: "/audit", label: "Sign in" },
    { href: "/#", label: "Start free audit" },
    { href: "/#faq", label: "Share report" },
    { href: "/#pricing", label: "Paid connected" },
    { href: "/#how-it-works", label: "Work orders" }
];

