import { NextResponse } from 'next/server';
import { buildTopicMapPrompt, parseTopicMap } from '@/lib/aeo/topic-map';
import { generateGeminiJson, hasGeminiConfig, toPlainError } from '@/lib/ai/gemini';
import {
  loadAeoAnalysis,
  loadAeoPageScans,
  loadTopicMapCreatedAt,
  saveTopicMap,
} from '@/lib/db/aeo';
import { requireSignedInSession, SessionRequiredError } from '@/lib/db/profiles';
import {
  getPreferredCompletedAuditRunId,
  getProjectOverview,
  ProjectAccessError,
  requireProjectOwner,
} from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export const maxDuration = 120;

const REGENERATE_COOLDOWN_MS = 60_000;

type RouteContext = { params: Promise<{ projectId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }
    if (!hasGeminiConfig()) {
      return NextResponse.json({ error: 'AI provider is not configured.' }, { status: 503 });
    }
    const { projectId } = await context.params;
    await requireSignedInSession();
    await requireProjectOwner(projectId);

    // No user text goes to the model: the input is only this project's own crawl.
    const [project, runId] = await Promise.all([
      getProjectOverview(projectId),
      getPreferredCompletedAuditRunId(projectId),
    ]);
    const domain = project?.website?.domain;
    if (!project || !domain || !runId) {
      return NextResponse.json({ error: 'Run an audit first.' }, { status: 404 });
    }

    const lastBuiltAt = await loadTopicMapCreatedAt(runId);
    if (lastBuiltAt && Date.now() - lastBuiltAt < REGENERATE_COOLDOWN_MS) {
      return NextResponse.json({ error: 'Please wait a moment before rebuilding.' }, { status: 429 });
    }

    const [scans, analysis] = await Promise.all([loadAeoPageScans(runId), loadAeoAnalysis(runId)]);
    if (scans.length === 0) {
      return NextResponse.json({ error: 'No scanned pages to map. Re-run the audit.' }, { status: 404 });
    }
    const pages = scans.map((s) => ({ path: s.path, title: s.title ?? null, h1: s.h1 ?? null, score: s.score }));

    let map;
    let model: string;
    try {
      const prompt = buildTopicMapPrompt(pages, {
        domain,
        brandName: project.name,
        offer: analysis?.inferred_primary_offer ?? null,
        icps: analysis?.inferred_icps?.slice(0, 3) ?? [],
      });
      const result = await generateGeminiJson(prompt, { maxOutputTokens: 4096 });
      model = result.model;
      map = parseTopicMap(result.text, pages);
    } catch (error) {
      return NextResponse.json(
        { error: toPlainError(error, 'Topic map timed out. Please try again.').message },
        { status: 502 }
      );
    }

    await saveTopicMap(runId, projectId, model, map);
    return NextResponse.json({ topicMap: map });
  } catch (error) {
    if (error instanceof SessionRequiredError || error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Topic map failed.' },
      { status: 500 }
    );
  }
}
