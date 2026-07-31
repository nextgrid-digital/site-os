import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import {
  BUYER_QUESTIONS,
  CONTENT_TYPES,
  mapPageKindToContentType,
} from '@/lib/evidence/catalog';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';
import type {
  AssociationClassification,
  BrandAssociation,
  BrandClaim,
  BrandContradiction,
  BrandEvidenceReportView,
  BuyerQuestionCoverage,
  CompanyDescription,
  CompanyIdentityField,
  CompetitorObservation,
  ContentCoverageItem,
  CoverageStatus,
  EvidenceRecordInput,
  ExecutiveEvidenceSummary,
  ExternalSourceItem,
  HistoricalChangeEvent,
  KeyObservation,
  PromptRunObservation,
  TechnicalObservation,
} from '@/lib/evidence/types';
import { BER_SCHEMA_VERSION } from '@/lib/evidence/types';
import type { ArchitectureInput } from '@/lib/supabase/types';

const AI_SAMPLE_DISCLAIMER =
  'AI outputs can vary by model, date, geography, account state, browsing mode, personalization, and conversation context. These results are sampled observations, not deterministic rankings.';

const ABSENCE_DISCLAIMER =
  'Not identified means the system did not locate the item within the selected sources and audit scope. It does not prove that the item does not exist.';

const CLAIM_PATTERNS: RegExp[] = [
  /\bwe (help|build|design|create|deliver|provide|offer)\b[^.!?]{0,120}/gi,
  /\btrusted by\b[^.!?]{0,80}/gi,
  /\b\d+%\b[^.!?]{0,80}/gi,
];

function nowIso() {
  return new Date().toISOString();
}

function clampConfidence(n: number) {
  return Math.max(0, Math.min(1, n));
}

function extractCategoryTerms(text: string): string[] {
  const terms: string[] = [];
  const candidates = [
    'design studio',
    'product studio',
    'ai implementation',
    'ai adoption',
    'gtm',
    'web design',
    'product development',
    'agency',
    'consultancy',
    'saas',
    'software',
  ];
  const lower = text.toLowerCase();
  for (const c of candidates) {
    if (lower.includes(c)) terms.push(c);
  }
  return [...new Set(terms)];
}

function classifyAssociation(
  first: number,
  third: number,
  ai: number
): AssociationClassification {
  if (first === 0 && third === 0 && ai === 0) return 'not_identified';
  if (third > 0 && first > 0) return 'independently_corroborated';
  if (first >= 3 && third === 0) return 'primarily_first_party';
  if (first >= 2 && third === 0) return 'consistently_supported';
  if (first === 1 && third === 0) return 'weakly_supported';
  return 'primarily_first_party';
}

export interface BuildBrandEvidenceInput {
  projectId: string;
  companyName: string;
  domain: string;
  websiteUrl: string;
  crawledPages: CrawledPage[];
  siteOnly: SiteOnlyAnalysis | null;
  aeo: AeoAnalysis | null;
  intake?: ArchitectureInput | null;
  sitemapFound: boolean;
  crawlErrors: string[];
  externalSources?: ExternalSourceItem[];
  promptRuns?: PromptRunObservation[];
  competitors?: CompetitorObservation[];
  historicalChanges?: HistoricalChangeEvent[];
  auditDate?: string;
}

export function buildBrandEvidenceRecord(input: BuildBrandEvidenceInput): BrandEvidenceReportView {
  const observedAt = input.auditDate ?? nowIso();
  const pages = input.crawledPages;
  const home =
    pages.find((p) => p.path === '/' || p.path === '') ?? pages[0] ?? null;
  const siteOnly = input.siteOnly;
  const aeo = input.aeo;

  const evidence: EvidenceRecordInput[] = [];

  for (const page of pages) {
    if (page.title) {
      evidence.push({
        subject: input.companyName,
        relationship: 'has_page_title',
        object: page.title,
        source_type: 'company_website',
        source_title: page.title,
        source_url: page.url,
        evidence_text: page.title,
        observed_at: observedAt,
        first_observed_at: observedAt,
        last_observed_at: observedAt,
        confidence: 0.95,
        independence: 'first_party',
        verification_status: 'directly_observed',
        extraction_method: 'crawl',
      });
    }
    if (page.metaDescription) {
      evidence.push({
        subject: input.companyName,
        relationship: 'described_as',
        object: page.metaDescription,
        source_type: 'company_website',
        source_title: page.title ?? page.path,
        source_url: page.url,
        evidence_text: page.metaDescription,
        observed_at: observedAt,
        confidence: 0.9,
        independence: 'first_party',
        verification_status: 'directly_observed',
        extraction_method: 'crawl',
      });
    }
  }

  for (const line of siteOnly?.whatTheSiteSays ?? []) {
    evidence.push({
      subject: input.companyName,
      relationship: 'claims',
      object: line,
      source_type: 'company_website',
      source_title: home?.title ?? input.domain,
      source_url: home?.url ?? input.websiteUrl,
      evidence_text: line,
      observed_at: observedAt,
      confidence: 0.75,
      independence: 'first_party',
      verification_status: 'first_party_claim_only',
      extraction_method: 'site_only_analysis',
    });
  }

  for (const ext of input.externalSources ?? []) {
    evidence.push({
      subject: input.companyName,
      relationship: 'mentioned_by',
      object: ext.source_title ?? ext.source_type,
      source_type: ext.source_type,
      source_title: ext.source_title,
      source_url: ext.source_url,
      evidence_text: ext.evidence_excerpt,
      published_at: ext.publication_date,
      observed_at: ext.observed_at,
      confidence: 0.6,
      independence: ext.independence,
      verification_status: 'directly_observed',
      extraction_method: 'external_source_collector',
    });
  }

  const identity: CompanyIdentityField[] = [
    {
      field_key: 'company_name',
      field_value: input.companyName,
      source_type: 'company_website',
      source_url: home?.url ?? input.websiteUrl,
      observed_at: observedAt,
      confidence: 0.9,
      has_conflict: false,
      conflict_note: null,
    },
    {
      field_key: 'domain',
      field_value: input.domain,
      source_type: 'company_website',
      source_url: input.websiteUrl,
      observed_at: observedAt,
      confidence: 1,
      has_conflict: false,
      conflict_note: null,
    },
    {
      field_key: 'homepage_title',
      field_value: siteOnly?.homepageTitle ?? home?.title ?? null,
      source_type: 'company_website',
      source_url: home?.url ?? null,
      observed_at: observedAt,
      confidence: home?.title ? 0.95 : 0.3,
      has_conflict: false,
      conflict_note: null,
    },
    {
      field_key: 'meta_description',
      field_value: siteOnly?.homepageMetaDescription ?? home?.metaDescription ?? null,
      source_type: 'company_website',
      source_url: home?.url ?? null,
      observed_at: observedAt,
      confidence: home?.metaDescription ? 0.9 : 0.3,
      has_conflict: false,
      conflict_note: null,
    },
    {
      field_key: 'category',
      field_value: siteOnly?.classification.category ?? null,
      source_type: 'company_website',
      source_url: home?.url ?? null,
      observed_at: observedAt,
      confidence: clampConfidence((siteOnly?.classification.categoryConfidence ?? 50) / 100),
      has_conflict: false,
      conflict_note: null,
    },
  ];

  if (aeo?.inferred_primary_offer) {
    identity.push({
      field_key: 'inferred_primary_offer',
      field_value: aeo.inferred_primary_offer,
      source_type: 'first_party_inference',
      source_url: home?.url ?? null,
      observed_at: observedAt,
      confidence: 0.55,
      has_conflict: false,
      conflict_note: 'Derived from first-party page text via model extraction; not an external citation.',
    });
  }

  const descriptions: CompanyDescription[] = [];
  if (home?.metaDescription) {
    descriptions.push({
      description_text: home.metaDescription,
      source_type: 'homepage_meta',
      source_title: home.title,
      source_url: home.url,
      observed_at: observedAt,
      category_terms: extractCategoryTerms(home.metaDescription),
      audience_terms: [],
      capability_terms: [],
      flags: ['homepage'],
    });
  }
  for (const line of (siteOnly?.whatTheSiteSays ?? []).slice(0, 6)) {
    descriptions.push({
      description_text: line,
      source_type: 'website_observed',
      source_title: home?.title ?? input.domain,
      source_url: home?.url ?? input.websiteUrl,
      observed_at: observedAt,
      category_terms: extractCategoryTerms(line),
      audience_terms: [],
      capability_terms: [],
      flags: [],
    });
  }
  if (aeo?.business_summary) {
    descriptions.push({
      description_text: aeo.business_summary,
      source_type: 'first_party_model_summary',
      source_title: 'AEO observed summary',
      source_url: home?.url ?? input.websiteUrl,
      observed_at: observedAt,
      category_terms: extractCategoryTerms(aeo.business_summary),
      audience_terms: aeo.inferred_icps?.slice(0, 4) ?? [],
      capability_terms: [],
      flags: ['model_summary'],
      });
  }

  // Associations from description terms + classification
  const topicCounts = new Map<string, { urls: Set<string>; first: number }>();
  function bumpTopic(topic: string, url: string | null | undefined) {
    const key = topic.toLowerCase();
    const cur = topicCounts.get(key) ?? { urls: new Set<string>(), first: 0 };
    cur.first += 1;
    if (url) cur.urls.add(url);
    topicCounts.set(key, cur);
  }
  for (const d of descriptions) {
    for (const t of d.category_terms) bumpTopic(t, d.source_url);
  }
  if (siteOnly?.classification.category && siteOnly.classification.category !== 'unknown') {
    bumpTopic(siteOnly.classification.category.replace(/_/g, ' '), home?.url);
  }
  for (const ev of siteOnly?.classification.categoryEvidence ?? []) {
    bumpTopic(siteOnly?.classification.category?.replace(/_/g, ' ') ?? 'category', home?.url);
    evidence.push({
      subject: input.companyName,
      relationship: 'associated_with',
      object: siteOnly?.classification.category ?? 'category',
      source_type: 'company_website',
      source_url: home?.url ?? input.websiteUrl,
      evidence_text: ev,
      observed_at: observedAt,
      confidence: 0.7,
      independence: 'first_party',
      verification_status: 'directly_observed',
      extraction_method: 'site_classification',
    });
  }

  const associations: BrandAssociation[] = [...topicCounts.entries()].map(([topic, data]) => ({
    topic,
    first_party_count: data.first,
    third_party_count: 0,
    ai_appearance_count: 0,
    supporting_urls: [...data.urls],
    first_observed_at: observedAt,
    last_observed_at: observedAt,
    confidence: clampConfidence(0.4 + Math.min(data.first, 4) * 0.1),
    classification: classifyAssociation(data.first, 0, 0),
  }));

  // Claims from page excerpts
  const claims: BrandClaim[] = [];
  for (const page of pages) {
    const text = page.textExcerpt ?? '';
    for (const pattern of CLAIM_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const claimText = match[0].trim();
        if (claimText.length < 12) continue;
        if (claims.some((c) => c.claim_text === claimText)) continue;
        claims.push({
          claim_text: claimText,
          claiming_source_url: page.url,
          claiming_excerpt: claimText,
          corroboration_count: 0,
          contradiction_count: 0,
          verification_status: 'first_party_claim_only',
          observed_at: observedAt,
          confidence: 0.7,
          evidence: [
            {
              role: 'supports',
              source_url: page.url,
              excerpt: claimText,
              independence: 'first_party',
            },
          ],
        });
        if (claims.length >= 20) break;
      }
      if (claims.length >= 20) break;
    }
    if (claims.length >= 20) break;
  }

  // Buyer coverage
  const buyer_coverage: BuyerQuestionCoverage[] = BUYER_QUESTIONS.map((q) => {
    const matching = pages.filter((p) => {
      const pathHit = q.pathHints.some((r) => r.test(p.path) || r.test(p.url));
      const blob = `${p.title ?? ''} ${p.metaDescription ?? ''} ${p.textExcerpt ?? ''}`;
      const textHit = q.textHints.some((r) => r.test(blob));
      return pathHit || textHit;
    });
    let coverage_status: CoverageStatus = 'not_identified';
    if (matching.length >= 2) coverage_status = 'clearly_covered';
    else if (matching.length === 1) {
      const blob = `${matching[0].title ?? ''} ${matching[0].textExcerpt ?? ''}`;
      coverage_status = q.textHints.some((r) => r.test(blob))
        ? 'partially_covered'
        : 'indirectly_covered';
    }
    const excerpt =
      matching[0]?.metaDescription ??
      matching[0]?.textExcerpt?.slice(0, 220) ??
      null;
    return {
      question_group: q.group,
      question: q.question,
      coverage_status,
      page_urls: matching.map((p) => p.url).slice(0, 5),
      evidence_excerpt: excerpt,
      source_count: matching.length,
      confidence: matching.length ? 0.7 : 0.5,
    };
  });

  // Content coverage
  const byType = new Map<string, string[]>();
  for (const t of CONTENT_TYPES) byType.set(t, []);
  for (const item of siteOnly?.pageInventory ?? []) {
    const contentType = mapPageKindToContentType(item.kind);
    if (!item.present) continue;
    const urls = item.paths.map((path) => {
      try {
        return new URL(path, input.websiteUrl).href;
      } catch {
        return path;
      }
    });
    byType.set(contentType, [...(byType.get(contentType) ?? []), ...urls]);
  }
  // Path heuristics for types not in PageKind
  for (const page of pages) {
    if (/compar/i.test(page.path)) byType.get('comparisons')?.push(page.url);
    if (/alternativ/i.test(page.path)) byType.get('alternatives')?.push(page.url);
    if (/integrat/i.test(page.path)) byType.get('integrations')?.push(page.url);
    if (/docs?|documentation/i.test(page.path)) byType.get('documentation')?.push(page.url);
    if (/research|whitepaper/i.test(page.path)) byType.get('research')?.push(page.url);
    if (/team|founder|people|author/i.test(page.path)) byType.get('team_or_author')?.push(page.url);
    if (/use[-_]?case/i.test(page.path)) byType.get('use_cases')?.push(page.url);
    if (/industr/i.test(page.path)) byType.get('industries')?.push(page.url);
  }
  const content_coverage: ContentCoverageItem[] = CONTENT_TYPES.map((content_type) => {
    const urls = [...new Set(byType.get(content_type) ?? [])];
    return {
      content_type,
      page_count: urls.length,
      urls: urls.slice(0, 12),
      topics: [],
      latest_observed_at: urls.length ? observedAt : null,
      oldest_observed_at: urls.length ? observedAt : null,
      evidence_strength: urls.length ? 'identified' : 'not_identified',
    };
  });

  // Technical
  const technical: TechnicalObservation[] = [
    {
      observation_key: 'sitemap.xml',
      status: input.sitemapFound ? 'detected' : 'not_detected',
      detail: input.sitemapFound
        ? `Sitemap referenced during crawl for ${input.domain}`
        : 'No sitemap.xml found at origin during this audit.',
      source_url: `${new URL(input.websiteUrl).origin}/sitemap.xml`,
      observed_at: observedAt,
    },
    {
      observation_key: 'pages_crawled',
      status: pages.length > 0 ? 'detected' : 'not_detected',
      detail: `${pages.length} page(s) fetched`,
      source_url: input.websiteUrl,
      observed_at: observedAt,
    },
    {
      observation_key: 'homepage_title',
      status: home?.title ? 'detected' : 'not_detected',
      detail: home?.title ?? null,
      source_url: home?.url ?? null,
      observed_at: observedAt,
    },
    {
      observation_key: 'homepage_meta_description',
      status: home?.metaDescription ? 'detected' : 'not_detected',
      detail: home?.metaDescription ?? null,
      source_url: home?.url ?? null,
      observed_at: observedAt,
    },
    {
      observation_key: 'faq_schema',
      status: pages.some((p) => p.hasFaqSchema) ? 'detected' : 'not_detected',
      detail: pages.some((p) => p.hasFaqSchema)
        ? 'FAQPage-related JSON-LD detected on at least one crawled page.'
        : 'No FAQ schema detected on crawled pages.',
      source_url: pages.find((p) => p.hasFaqSchema)?.url ?? null,
      observed_at: observedAt,
    },
  ];

  // Contradictions: homepage meta vs other descriptions with different category terms
  const contradictions: BrandContradiction[] = [];
  if (descriptions.length >= 2) {
    const a = descriptions[0];
    for (let i = 1; i < descriptions.length; i++) {
      const b = descriptions[i];
      const aTerms = new Set(a.category_terms);
      const uniqueB = b.category_terms.filter((t) => !aTerms.has(t));
      if (uniqueB.length > 0 && a.category_terms.length > 0) {
        contradictions.push({
          subject: 'company_category_terms',
          version_a: a.category_terms.join(', ') || a.description_text.slice(0, 120),
          source_a: a.source_type,
          source_a_url: a.source_url,
          version_b: uniqueB.join(', ') || b.description_text.slice(0, 120),
          source_b: b.source_type,
          source_b_url: b.source_url,
          observed_at: observedAt,
          confidence: 0.55,
          status: 'unresolved',
        });
        break;
      }
    }
  }

  const promptRuns = input.promptRuns ?? [];
  const competitors = input.competitors ?? [];
  const externalSources = input.externalSources ?? [];
  const historical_changes = input.historicalChanges ?? [];

  const strongest =
    associations.toSorted((a, b) => b.first_party_count - a.first_party_count)[0]?.topic ?? null;
  const intended =
    input.intake?.primary_offer?.trim() ||
    input.intake?.site_type?.trim() ||
    null;
  let weakest_intended: string | null = null;
  if (intended) {
    const match = associations.find((a) =>
      intended.toLowerCase().includes(a.topic) || a.topic.includes(intended.toLowerCase())
    );
    if (!match || match.classification === 'weakly_supported' || match.first_party_count <= 1) {
      weakest_intended = intended;
    }
  }

  const largestInconsistency =
    contradictions[0] != null
      ? `${contradictions[0].version_a} vs ${contradictions[0].version_b}`
      : null;

  const majorLimitationParts = [
    'This record is based primarily on first-party website crawl data.',
    externalSources.length === 0
      ? 'No third-party sources were collected in this audit scope.'
      : null,
    promptRuns.length === 0
      ? 'No sampled AI prompt runs were executed in this audit scope.'
      : null,
    pages.length < 5 ? 'Crawl coverage was limited to a small page sample.' : null,
  ].filter(Boolean) as string[];

  const narrative = [
    `${input.companyName} (${input.domain}) was analyzed on ${observedAt.slice(0, 10)}.`,
    strongest
      ? `Across first-party pages, the most frequently observed association was “${strongest}”.`
      : 'No strong category association was identified from first-party pages.',
    weakest_intended
      ? `Intended positioning “${weakest_intended}” had limited first-party corroboration in the crawl sample.`
      : null,
    largestInconsistency
      ? `A description inconsistency was identified: ${largestInconsistency}.`
      : null,
    `These results reflect the selected sources and crawl scope as of the audit date.`,
  ]
    .filter(Boolean)
    .join(' ');

  const executive: ExecutiveEvidenceSummary = {
    company_name: input.companyName,
    domain: input.domain,
    audit_date: observedAt,
    data_collection_period: observedAt.slice(0, 10),
    sources_analyzed: [
      'company_website',
      ...(externalSources.length ? ['third_party_sources'] : []),
      ...(promptRuns.length ? ['sampled_ai'] : []),
    ],
    pages_analyzed: pages.length,
    sampled_prompts_tested: promptRuns.length,
    external_sources_identified: externalSources.length,
    major_categories_detected: associations.map((a) => a.topic).slice(0, 8),
    strongest_supported_association: strongest,
    weakest_intended_association: weakest_intended,
    largest_description_inconsistency: largestInconsistency,
    major_data_limitation: majorLimitationParts.join(' '),
    narrative,
  };

  const key_observations: KeyObservation[] = [
    ...associations.slice(0, 3).map((a) => ({
      title: `Association: ${a.topic}`,
      statement: `“${a.topic}” was identified across ${a.first_party_count} first-party source(s). Classification: ${a.classification.replace(/_/g, ' ')}.`,
      evidence_text: a.supporting_urls[0] ?? null,
      source_url: a.supporting_urls[0] ?? null,
      source_type: 'company_website',
      observed_at: observedAt,
      confidence: a.confidence,
      limitation: a.third_party_count === 0 ? 'No independent third-party sources in this audit scope.' : null,
      related_claim_or_topic: a.topic,
    })),
    ...contradictions.slice(0, 2).map((c) => ({
      title: `Inconsistency: ${c.subject}`,
      statement: `Conflicting values were observed (“${c.version_a}” vs “${c.version_b}”).`,
      evidence_text: null,
      source_url: c.source_a_url,
      source_type: c.source_a ?? 'company_website',
      observed_at: c.observed_at,
      confidence: c.confidence,
      limitation: null,
      related_claim_or_topic: c.subject,
    })),
  ];

  const first_party = evidence.filter((e) => e.independence === 'first_party');
  const third_party = evidence.filter((e) => e.independence === 'third_party');
  const customer = evidence.filter((e) => e.independence === 'customer');
  const owned_media = evidence.filter((e) => e.independence === 'owned_media');

  const source_distribution = [
    {
      source_group: 'company website',
      source_count: pages.length,
      related_topics: associations.map((a) => a.topic).slice(0, 6),
      first_observed_at: observedAt,
      latest_observed_at: observedAt,
      independence: 'first_party',
    },
    {
      source_group: 'third-party sources',
      source_count: externalSources.length,
      related_topics: [],
      first_observed_at: externalSources[0]?.observed_at ?? null,
      latest_observed_at: externalSources.at(-1)?.observed_at ?? null,
      independence: 'third_party',
    },
    {
      source_group: 'sampled AI answers',
      source_count: promptRuns.length,
      related_topics: [],
      first_observed_at: promptRuns[0]?.run_at ?? null,
      latest_observed_at: promptRuns.at(-1)?.run_at ?? null,
      independence: 'ai_sample',
    },
  ];

  return {
    schema_version: BER_SCHEMA_VERSION,
    generated_at: observedAt,
    executive,
    identity,
    descriptions,
    associations,
    claims,
    key_observations,
    buyer_coverage,
    sampled_ai: promptRuns,
    competitors,
    evidence_inventory: {
      first_party,
      third_party,
      customer,
      owned_media,
    },
    source_distribution,
    content_coverage,
    technical,
    contradictions,
    historical_changes,
    methodology: {
      pages_analyzed: pages.length,
      page_urls: pages.map((p) => p.url),
      sources_searched: executive.sources_analyzed,
      prompts_tested: promptRuns.length,
      models_used: promptRuns.length
        ? [...new Set(promptRuns.map((p) => p.ai_system))]
        : [],
      audit_date: observedAt,
      crawl_limitations: [
        ...input.crawlErrors.slice(0, 5),
        'Crawl is limited by crawl_max_pages and publicly reachable HTML.',
      ],
      data_availability_notes: majorLimitationParts,
      sampling_limitations: [
        'AI visibility results, when present, are samples — not rankings.',
      ],
      unavailable_sources: [
        ...(externalSources.length === 0 ? ['third-party editorial and directory sources'] : []),
        ...(promptRuns.length === 0 ? ['sampled AI systems'] : []),
      ],
      absence_disclaimer: ABSENCE_DISCLAIMER,
    },
    external_sources: externalSources,
    ai_sample_disclaimer: AI_SAMPLE_DISCLAIMER,
  };
}
