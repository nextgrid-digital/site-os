import { classifyWebsiteSync } from '@/lib/audit/site-classification';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';

/** Accept stored site_only_analysis, including pre-classification payloads. */
export function normalizeSiteOnlyAnalysis(value: unknown): SiteOnlyAnalysis | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Partial<SiteOnlyAnalysis>;
  if (!Array.isArray(obj.pageInventory)) return null;

  const fallbackClassification = classifyWebsiteSync([]);
  return {
    pageInventory: obj.pageInventory,
    messagingClarity: obj.messagingClarity ?? [],
    architectureGaps: obj.architectureGaps ?? [],
    weakLinkHubs: obj.weakLinkHubs ?? [],
    buyerMoments: obj.buyerMoments ?? [],
    proofGaps: obj.proofGaps ?? [],
    conversionBlockers: obj.conversionBlockers ?? [],
    recommendedNextSteps: obj.recommendedNextSteps ?? [],
    whatTheSiteSays: obj.whatTheSiteSays ?? [],
    programmaticSuggestions: obj.programmaticSuggestions ?? [],
    ogImageUrl: obj.ogImageUrl ?? null,
    homepageTitle: obj.homepageTitle ?? null,
    homepageMetaDescription: obj.homepageMetaDescription ?? null,
    faviconUrl: obj.faviconUrl ?? null,
    classification: obj.classification ?? {
      ...fallbackClassification,
      category: 'unknown',
      categoryNotes: 'Older audit run without live classification — re-run for category-aware results.',
      categoryConfidence: 20,
    },
    inferred: obj.inferred,
    labels: obj.labels ?? {
      observed: 'Observed from crawl',
      inferred: 'AI inference',
    },
  };
}
