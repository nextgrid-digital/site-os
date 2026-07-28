import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { ArchitectureInput } from '@/lib/supabase/types';
import type { DraftGraphEntity, DraftGraphRelationship } from '@/lib/graph/types';

let localCounter = 0;

function nextLocalId(prefix: string) {
  localCounter += 1;
  return `${prefix}_${localCounter}`;
}

function resetLocalIds() {
  localCounter = 0;
}

function splitList(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;\n|/]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1 && part.length < 120);
}

function pushEntity(
  entities: DraftGraphEntity[],
  partial: Omit<DraftGraphEntity, 'localId'> & { localId?: string }
): DraftGraphEntity {
  const existing = entities.find(
    (e) => e.type === partial.type && e.label.toLowerCase() === partial.label.toLowerCase()
  );
  if (existing) {
    if (partial.status === 'found' && existing.status !== 'found') {
      existing.status = 'found';
      existing.confidence = Math.max(existing.confidence, partial.confidence);
      existing.source = partial.source;
    }
    return existing;
  }
  const entity: DraftGraphEntity = {
    localId: partial.localId ?? nextLocalId(partial.type),
    type: partial.type,
    label: partial.label,
    source: partial.source,
    confidence: partial.confidence,
    metadata: partial.metadata,
    status: partial.status,
  };
  entities.push(entity);
  return entity;
}

function pushRel(
  relationships: DraftGraphRelationship[],
  rel: DraftGraphRelationship
) {
  const dup = relationships.some(
    (r) =>
      r.fromLocalId === rel.fromLocalId &&
      r.toLocalId === rel.toLocalId &&
      r.type === rel.type
  );
  if (!dup) relationships.push(rel);
}

const CTA_PATTERNS =
  /\b(book a demo|get started|contact us|request a quote|talk to sales|start free|sign up|schedule|buy now|try free)\b/gi;

const CLAIM_PATTERNS =
  /\b(we help|we build|we deliver|trusted by|used by|leading|#1|proven|guarantee|award|certified)\b[^.!?]{0,80}/gi;

function extractCtas(text: string): string[] {
  const matches = text.match(CTA_PATTERNS) ?? [];
  return [...new Set(matches.map((m) => m.trim()))].slice(0, 8);
}

function extractClaims(text: string): string[] {
  const matches = text.match(CLAIM_PATTERNS) ?? [];
  return [...new Set(matches.map((m) => m.trim().replace(/\s+/g, ' ')))].slice(0, 8);
}

function looksLikeCompetitorMention(text: string, brandHints: string[]): string[] {
  const competitors: string[] = [];
  const vsMatch = text.match(/\b(?:vs\.?|versus|compared to|alternative to)\s+([A-Z][A-Za-z0-9&.\- ]{1,40})/g);
  if (vsMatch) {
    for (const m of vsMatch) {
      const name = m.replace(/^.*?\s+(?:to|vs\.?|versus)\s+/i, '').trim();
      if (name && !brandHints.some((b) => name.toLowerCase().includes(b.toLowerCase()))) {
        competitors.push(name);
      }
    }
  }
  return [...new Set(competitors)].slice(0, 5);
}

export interface ExtractCommercialGraphInput {
  projectName: string;
  websiteUrl: string;
  pages: CrawledPage[];
  intake: ArchitectureInput | null;
  aeo: AeoAnalysis | null;
  siteOnly: SiteOnlyAnalysis | null;
  queries: Array<{ query: string; impressions: number; clicks: number; page_path: string | null }>;
  ga4Landings: Array<{ path: string; sessions: number }>;
}

export function extractCommercialGraph(input: ExtractCommercialGraphInput): {
  entities: DraftGraphEntity[];
  relationships: DraftGraphRelationship[];
} {
  resetLocalIds();
  const entities: DraftGraphEntity[] = [];
  const relationships: DraftGraphRelationship[] = [];

  const home =
    input.pages.find((p) => p.path === '/') ??
    input.pages.find((p) => p.path === '') ??
    input.pages[0];

  for (const page of input.pages) {
    const pageEntity = pushEntity(entities, {
      type: 'page',
      label: page.path || '/',
      source: 'crawl',
      confidence: 95,
      status: 'found',
      metadata: {
        url: page.url,
        title: page.title,
        metaDescription: page.metaDescription,
        h1: page.h1,
        hasFaq: page.hasFaq,
        internalLinkCount: page.internalLinks.length,
      },
    });

    const text = [page.title, page.metaDescription, page.h1, page.textExcerpt]
      .filter(Boolean)
      .join(' ');

    for (const cta of extractCtas(text)) {
      const ctaEntity = pushEntity(entities, {
        type: 'cta',
        label: cta,
        source: 'crawl',
        confidence: 70,
        status: 'found',
        metadata: { path: page.path },
      });
      pushRel(relationships, {
        fromLocalId: pageEntity.localId,
        toLocalId: ctaEntity.localId,
        type: 'converts_to',
        confidence: 65,
        evidence: { path: page.path },
        source: 'crawl',
      });
    }

    for (const claim of extractClaims(text)) {
      const claimEntity = pushEntity(entities, {
        type: 'claim',
        label: claim,
        source: 'crawl',
        confidence: 55,
        status: 'found',
        metadata: { path: page.path },
      });
      pushRel(relationships, {
        fromLocalId: pageEntity.localId,
        toLocalId: claimEntity.localId,
        type: 'supports',
        confidence: 50,
        evidence: { path: page.path },
        source: 'crawl',
      });
    }

    for (const href of page.internalLinks.slice(0, 20)) {
      const target = input.pages.find((p) => p.path === href || p.url === href);
      if (!target) continue;
      const targetEntity = pushEntity(entities, {
        type: 'page',
        label: target.path || '/',
        source: 'crawl',
        confidence: 95,
        status: 'found',
        metadata: { url: target.url },
      });
      pushRel(relationships, {
        fromLocalId: pageEntity.localId,
        toLocalId: targetEntity.localId,
        type: 'links_to',
        confidence: 90,
        evidence: { from: page.path, to: target.path },
        source: 'crawl',
      });
    }
  }

  const intake = input.intake;
  if (intake?.primary_icp) {
    pushEntity(entities, {
      type: 'icp',
      label: intake.primary_icp.trim(),
      source: 'intake',
      confidence: 90,
      status: 'found',
      metadata: { role: 'primary' },
    });
  }
  for (const icp of splitList(intake?.secondary_icps)) {
    pushEntity(entities, {
      type: 'icp',
      label: icp,
      source: 'intake',
      confidence: 80,
      status: 'found',
      metadata: { role: 'secondary' },
    });
  }
  for (const icp of splitList(intake?.icp_notes)) {
    pushEntity(entities, {
      type: 'icp',
      label: icp,
      source: 'intake',
      confidence: 60,
      status: 'inferred',
      metadata: { from: 'icp_notes' },
    });
  }

  if (intake?.primary_offer) {
    pushEntity(entities, {
      type: 'offer',
      label: intake.primary_offer.trim(),
      source: 'intake',
      confidence: 90,
      status: 'found',
      metadata: { role: 'primary' },
    });
  }
  for (const offer of splitList(intake?.secondary_offers)) {
    pushEntity(entities, {
      type: 'offer',
      label: offer,
      source: 'intake',
      confidence: 80,
      status: 'found',
      metadata: { role: 'secondary' },
    });
  }
  for (const offer of splitList(intake?.offer_notes)) {
    pushEntity(entities, {
      type: 'offer',
      label: offer,
      source: 'intake',
      confidence: 55,
      status: 'inferred',
      metadata: { from: 'offer_notes' },
    });
  }

  for (const product of splitList(intake?.product_notes)) {
    pushEntity(entities, {
      type: 'product',
      label: product,
      source: 'intake',
      confidence: 70,
      status: 'found',
      metadata: {},
    });
  }

  for (const proof of splitList(intake?.trust_proof_assets)) {
    pushEntity(entities, {
      type: 'proof',
      label: proof,
      source: 'intake',
      confidence: 85,
      status: 'found',
      metadata: { kind: 'asset' },
    });
  }
  for (const proof of splitList(intake?.proof_notes)) {
    pushEntity(entities, {
      type: 'proof',
      label: proof,
      source: 'intake',
      confidence: 60,
      status: 'inferred',
      metadata: { from: 'proof_notes' },
    });
  }

  const aeo = input.aeo;
  if (aeo) {
    for (const icp of aeo.inferred_icps) {
      pushEntity(entities, {
        type: 'icp',
        label: icp,
        source: 'aeo',
        confidence: Math.min(75, aeo.clarity_score),
        status: 'inferred',
        metadata: {},
      });
    }
    if (aeo.inferred_primary_offer) {
      pushEntity(entities, {
        type: 'offer',
        label: aeo.inferred_primary_offer,
        source: 'aeo',
        confidence: Math.min(75, aeo.clarity_score),
        status: 'inferred',
        metadata: { role: 'primary' },
      });
    }
    for (const offer of aeo.inferred_secondary_offers) {
      pushEntity(entities, {
        type: 'offer',
        label: offer,
        source: 'aeo',
        confidence: 60,
        status: 'inferred',
        metadata: { role: 'secondary' },
      });
    }
    for (const missing of aeo.missing_page_types) {
      pushEntity(entities, {
        type: 'topic',
        label: `Missing page type: ${missing}`,
        source: 'aeo',
        confidence: 70,
        status: 'missing',
        metadata: { pageType: missing },
      });
    }
    for (const proof of aeo.missing_proof_opportunities) {
      pushEntity(entities, {
        type: 'proof',
        label: proof,
        source: 'aeo',
        confidence: 65,
        status: 'missing',
        metadata: {},
      });
    }
  }

  const inventory = input.siteOnly?.pageInventory ?? [];
  for (const item of inventory) {
    if (!item.present) {
      pushEntity(entities, {
        type: 'page',
        label: `/${item.kind}`,
        source: 'site_only',
        confidence: 80,
        status: 'missing',
        metadata: { kind: item.kind },
      });
    }
  }

  for (const moment of input.siteOnly?.buyerMoments ?? []) {
    pushEntity(entities, {
      type: 'use_case',
      label: moment,
      source: 'site_only',
      confidence: 55,
      status: 'inferred',
      metadata: { buyerMoment: true },
    });
  }

  const sortedQueries = [...input.queries]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  for (const row of sortedQueries) {
    const queryEntity = pushEntity(entities, {
      type: 'query',
      label: row.query,
      source: 'search_console',
      confidence: 90,
      status: 'found',
      metadata: {
        impressions: row.impressions,
        clicks: row.clicks,
        page_path: row.page_path,
      },
    });

    if (row.page_path) {
      const pageEntity = entities.find((e) => e.type === 'page' && e.label === row.page_path);
      if (pageEntity) {
        pushRel(relationships, {
          fromLocalId: queryEntity.localId,
          toLocalId: pageEntity.localId,
          type: 'answers',
          confidence: 75,
          evidence: { impressions: row.impressions },
          source: 'search_console',
        });
      }
    }
  }

  for (const landing of input.ga4Landings.slice(0, 20)) {
    const pageEntity = entities.find((e) => e.type === 'page' && e.label === landing.path);
    if (pageEntity) {
      pageEntity.metadata = {
        ...pageEntity.metadata,
        gaSessions: landing.sessions,
      };
    }
  }

  const brandHints = [input.projectName, ...(home?.title ? [home.title] : [])];
  const corpus = input.pages
    .slice(0, 10)
    .map((p) => [p.title, p.textExcerpt].filter(Boolean).join(' '))
    .join(' ');
  for (const competitor of looksLikeCompetitorMention(corpus, brandHints)) {
    pushEntity(entities, {
      type: 'competitor',
      label: competitor,
      source: 'crawl',
      confidence: 50,
      status: 'found',
      metadata: {},
    });
  }

  // Wire offer → ICP targets when both exist
  const offers = entities.filter((e) => e.type === 'offer' && e.status !== 'missing');
  const icps = entities.filter((e) => e.type === 'icp' && e.status !== 'missing');
  for (const offer of offers.slice(0, 3)) {
    for (const icp of icps.slice(0, 3)) {
      pushRel(relationships, {
        fromLocalId: offer.localId,
        toLocalId: icp.localId,
        type: 'targets',
        confidence: 55,
        evidence: { inferred: true },
        source: 'analysis',
      });
    }
  }

  const proofs = entities.filter((e) => e.type === 'proof' && e.status === 'found');
  for (const offer of offers) {
    for (const proof of proofs.slice(0, 2)) {
      pushRel(relationships, {
        fromLocalId: proof.localId,
        toLocalId: offer.localId,
        type: 'proves',
        confidence: 50,
        evidence: {},
        source: 'analysis',
      });
    }
  }

  return { entities, relationships };
}
