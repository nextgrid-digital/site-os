import { NextResponse } from 'next/server';
import { updateFindingWorkflow } from '@/lib/db/projects';
import type { FindingStatus } from '@/lib/supabase/types';

const STATUSES = new Set<FindingStatus>(['open', 'reviewed', 'resolved']);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; findingId: string }> }
) {
  try {
    const { projectId, findingId } = await context.params;
    const body = await request.json();
    const statusRaw = body.status != null ? String(body.status) : undefined;
    if (statusRaw && !STATUSES.has(statusRaw as FindingStatus)) {
      return NextResponse.json(
        { error: 'status must be open, reviewed, or resolved.' },
        { status: 400 }
      );
    }
    const finding = await updateFindingWorkflow(projectId, findingId, {
      status: statusRaw as FindingStatus | undefined,
      nextAction: body.nextAction != null ? String(body.nextAction) : undefined,
    });
    return NextResponse.json({ finding });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update finding.' },
      { status: 500 }
    );
  }
}
