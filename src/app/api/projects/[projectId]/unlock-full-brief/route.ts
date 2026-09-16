import { NextResponse } from 'next/server';
import { PaidPlanRequiredError, requirePaidSession } from '@/lib/db/profiles';
import { ProjectAccessError, requireProjectOwner, unlockFullBrief } from '@/lib/db/projects';
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

    await requirePaidSession();
    await requireProjectOwner(projectId);

    const project = await unlockFullBrief(projectId);
    return NextResponse.json({
      unlocked: true,
      fullBriefUnlockedAt: project.full_brief_unlocked_at,
    });
  } catch (error) {
    if (error instanceof PaidPlanRequiredError || error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unlock full audit access.' },
      { status: 500 }
    );
  }
}
