import { NextResponse } from 'next/server';
import { unlockFullBrief } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }
    const project = await unlockFullBrief(projectId);
    return NextResponse.json({
      unlocked: true,
      fullBriefUnlockedAt: project.full_brief_unlocked_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unlock full audit access.' },
      { status: 500 }
    );
  }
}
