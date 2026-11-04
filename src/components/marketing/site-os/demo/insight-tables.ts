import type { CardTitleIconKind } from "../components/card-title-icon";

/**
 * Sample data for the "See where buyers get stuck" tables. Raw numbers only: every figure on screen
 * is formatted by the helpers below so counts, shares and money read the same in every table.
 */

/** Counts: whole numbers with thousands separators. */
export const fmtCount = (n: number) => n.toLocaleString("en-US");
/** Shares: always one decimal. */
export const fmtShare = (views: number, total: number) => `${((views / total) * 100).toFixed(1)}%`;
/** Money: whole dollars. */
export const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Every view in the period, across all rows (listed or not). Shares are measured against this. */
export const TOTAL_VIEWS = 21172;

const svg = (viewBox: string, body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}'>${body}</svg>`,
  )}")`;

const FLAGS = {
  US: svg(
    "0 0 26 14",
    "<rect width='26' height='14' fill='#fff'/>" +
      [0, 4, 8, 12].map((y) => `<rect y='${y}' width='26' height='2' fill='#bd3d44'/>`).join("") +
      "<rect width='11' height='8' fill='#192f5d'/>" +
      [2, 5, 8].flatMap((x) => [2, 4, 6].map((y) => `<circle cx='${x}' cy='${y}' r='.5' fill='#fff'/>`)).join(""),
  ),
  DE: svg("0 0 5 3", "<rect width='5' height='1' fill='#000'/><rect y='1' width='5' height='1' fill='#d00'/><rect y='2' width='5' height='1' fill='#fc0'/>"),
  GB: svg(
    "0 0 60 30",
    "<rect width='60' height='30' fill='#012169'/><path d='M0 0L60 30M60 0L0 30' stroke='#fff' stroke-width='6'/><path d='M0 0L60 30M60 0L0 30' stroke='#c8102e' stroke-width='3'/><path d='M30 0V30M0 15H60' stroke='#fff' stroke-width='10'/><path d='M30 0V30M0 15H60' stroke='#c8102e' stroke-width='6'/>",
  ),
  ES: 'url("/assets/site/svg/ab71e3ed135f.svg")',
  CA: svg(
    "0 0 4 2",
    "<rect width='4' height='2' fill='#d52b1e'/><rect x='1' width='2' height='2' fill='#fff'/><path d='M2 .5l.25.5.35-.15-.1.6.3-.05-.5.5.1.4-.4-.15-.4.15.1-.4-.5-.5.3.05-.1-.6.35.15z' fill='#d52b1e'/>",
  ),
};

export type InsightRow = {
  label: string;
  views: number;
  /** Estimated revenue in dollars. Omit on tables with no revenue column. */
  revenue?: number;
  /** CSS background-image (flags) or image URL (favicons). */
  image?: string;
  imageKind?: "css" | "src";
};

export type InsightTable = {
  id: string;
  title: string;
  icon: CardTitleIconKind;
  nameHeader: string;
  rows: InsightRow[];
  revenue: boolean;
  explainer: { title: string; body: string };
};

const src = (path: string) => ({ image: path, imageKind: "src" as const });
const css = (image: string) => ({ image, imageKind: "css" as const });

export const INSIGHT_TABLES: InsightTable[] = [
  {
    id: "top-sources",
    title: "Top sources",
    icon: "sources",
    nameHeader: "Source",
    revenue: true,
    rows: [
      { label: "google.com", views: 6140, revenue: 4120, ...src("/assets/site/images/4afefff04e61.png") },
      { label: "t.co", views: 2284, revenue: 2860, ...src("/assets/site/images/7da7fa93e500.png") },
      { label: "github.com", views: 1903, revenue: 1180, ...src("/assets/site/images/5a4e0f1b4609.png") },
      { label: "producthunt.com", views: 1522, revenue: 2240, ...src("/assets/site/images/32d2558b75df.png") },
      { label: "direct", views: 1177, revenue: 860 },
    ],
    explainer: {
      title: "Where visits come from",
      body: "Sites that sent visitors, ranked by views. Share is a source's views divided by all 21,172 views. Revenue is estimated from purchases made in sessions that arrived through that source.",
    },
  },
  {
    id: "top-countries",
    title: "Top countries",
    icon: "locations",
    nameHeader: "Country",
    revenue: false,
    rows: [
      { label: "United States", views: 4126, ...css(FLAGS.US) },
      { label: "Germany", views: 1804, ...css(FLAGS.DE) },
      { label: "United Kingdom", views: 1662, ...css(FLAGS.GB) },
      { label: "Spain", views: 1214, ...css(FLAGS.ES) },
      { label: "Canada", views: 982, ...css(FLAGS.CA) },
    ],
    explainer: {
      title: "Where visitors are",
      body: "Views by country, taken from each visitor's IP address, so locations are approximate. Share is the country's views divided by all 21,172 views.",
    },
  },
  {
    id: "devices",
    title: "Devices",
    icon: "devices",
    nameHeader: "Device",
    revenue: false,
    rows: [
      { label: "Desktop", views: 5842 },
      { label: "Mobile", views: 3182 },
      { label: "Tablet", views: 436 },
    ],
    explainer: {
      title: "What visitors browse on",
      body: "Views split by screen type, read from the browser's user agent. Share is the device's views divided by all 21,172 views. Check mobile first if it's high but converts low.",
    },
  },
  {
    id: "browsers",
    title: "Browsers",
    icon: "browsers",
    nameHeader: "Browser",
    revenue: false,
    rows: [
      { label: "Chrome", views: 5924 },
      { label: "Safari", views: 2622 },
      { label: "Firefox", views: 1038 },
      { label: "Edge", views: 716 },
    ],
    explainer: {
      title: "Which browsers to test",
      body: "Views by browser, read from the user agent. Share is the browser's views divided by all 21,172 views. A browser with real traffic but no sales often points to a rendering bug.",
    },
  },
  {
    id: "top-pages",
    title: "Top pages",
    icon: "pages",
    nameHeader: "Page",
    revenue: true,
    rows: [
      { label: "/", views: 9842, revenue: 4180 },
      { label: "/pricing", views: 4118, revenue: 6240 },
      { label: "/docs/install-astro", views: 2906, revenue: 1820 },
      { label: "/docs/overview", views: 2442, revenue: 940 },
      { label: "/demo/site-os", views: 1885, revenue: 1560 },
    ],
    explainer: {
      title: "Which pages earn",
      body: "Pages ranked by views. Share is the page's views divided by all 21,172 views. Revenue is estimated from purchases in sessions that viewed the page, so one sale can credit several pages and rows may add up to more than the total.",
    },
  },
  {
    id: "top-converting-events",
    title: "Top converting events",
    icon: "events",
    nameHeader: "Event",
    revenue: false,
    rows: [
      { label: "Clicked live demo", views: 2428 },
      { label: "Copied install script", views: 1611 },
      { label: "Opened pricing", views: 516 },
      { label: "Started trial", views: 284 },
    ],
    explainer: {
      title: "Actions that lead to a sale",
      body: "Buyer actions ranked by how often they fired. Share is the event count divided by all 21,172 views, so it shows how often a view ends in that action.",
    },
  },
];
