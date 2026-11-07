import type { AeoCheckId } from '@/lib/aeo/page-scanner';

/** Plain-language reason each check matters, shown in the "Fix these first" list. */
export const WHY_IT_HELPS: Record<AeoCheckId, string> = {
  structured_data:
    'JSON-LD labels the page for machines (article, product, service, FAQ). AI engines quote pages they can classify with confidence, so labelled pages are chosen more often.',
  entity_schema:
    'Organization schema tells engines who you are, so they can attach your name to the answers they quote.',
  faq_schema:
    'FAQPage markup turns each question and answer into a separate, quotable unit an engine can lift as-is.',
  direct_answer:
    'Engines lift the first clear paragraph. A plain 20–80 word answer at the top is the easiest thing for them to quote.',
  question_headings:
    'Buyers ask AI questions. Headings phrased as those questions match the query and point straight at the answer below.',
  authorship:
    'A named author signals who stands behind the page, one of the trust cues engines weigh before quoting.',
  freshness:
    'Published and updated dates let engines judge whether the page is still current before they rely on it.',
  extractable_structure:
    'Lists and tables are the formats engines quote most, because each row or step stands on its own.',
  content_depth:
    'Thin pages leave gaps another source will fill. Covering the topic and its follow-ups keeps the quote yours.',
};

/** Copy-ready code for the checks where a snippet is the fix. */
export const FIX_SNIPPETS: Partial<Record<AeoCheckId, string>> = {
  structured_data: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page title",
  "datePublished": "2026-01-01",
  "author": { "@type": "Person", "name": "Author" }
}
</script>`,
  entity_schema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": ["https://www.linkedin.com/company/your-company"]
}
</script>`,
  faq_schema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "The question as shown on the page",
    "acceptedAnswer": { "@type": "Answer", "text": "The answer as shown on the page" }
  }]
}
</script>`,
};

/** What lands on the clipboard for "Copy fix": the instruction, plus the snippet when there is one. */
export function fixClipboardText(id: AeoCheckId, label: string, fix: string): string {
  const snippet = FIX_SNIPPETS[id];
  return snippet ? `${label}\n${fix}\n\n${snippet}` : `${label}\n${fix}`;
}
