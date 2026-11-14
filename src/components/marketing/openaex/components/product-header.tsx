"use client";

import { CrawlFindingsDemo } from "./crawl-findings-demo";
import { ProductAiTraffic } from "./demos/ai-traffic";
import { ProductAnswerReadiness } from "./demos/answer-readiness";
import { ProductCitationProbe } from "./demos/citation-probe";
import { ProductFixPrompts } from "./demos/fix-prompts";
import { ProductGA4 } from "./demos/ga4";
import { ProductGrowthBrief } from "./demos/growth-brief";
import { ProductKnowledgeGraph } from "./demos/knowledge-graph";
import { ProductRevenueImpact } from "./demos/revenue-impact";
import { ProductSearchConsole } from "./demos/search-console";
import { ProductTopicMap } from "./demos/topic-map";

/** Header mockup shown above each product tile, keyed by product variant. Each lives in ./demos. */
export const ProductHeader = ({ variant }: { variant: string }) => {
  switch (variant) {
    case "traffic-overview":
      return <CrawlFindingsDemo />;
    case "conversions":
      return <ProductRevenueImpact />;
    case "pin-notes-to-specific-days-on-your-traffic":
      return <ProductKnowledgeGraph />;
    case "connect-search-console-to-see-which-querie":
      return <ProductSearchConsole />;
    case "see-who-is-on-your-site-right-now-where-th":
      return <ProductGA4 />;
    case "flag-your-not-found-page-once-then-see-bro":
      return <ProductFixPrompts />;
    case "connect-cursor-claude-code-or-codex-to-pul":
      return <ProductGrowthBrief />;
    case "ai-answer-readiness":
      return <ProductAnswerReadiness />;
    case "citation-probe":
      return <ProductCitationProbe />;
    case "topic-map":
      return <ProductTopicMap />;
    case "ai-traffic":
      return <ProductAiTraffic />;
    default:
      return null;
  }
};
