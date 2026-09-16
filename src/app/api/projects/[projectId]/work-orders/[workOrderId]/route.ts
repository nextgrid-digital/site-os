import { NextResponse } from 'next/server';
import { ProjectAccessError, requireProjectOwner, updateWorkOrderStatus } from '@/lib/db/projects';

const STATUSES = new Set(['open', 'done', 'skipped']);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; workOrderId: string }> }
) {
  try {
    const { projectId, workOrderId } = await context.params;
    await requireProjectOwner(projectId);
    const body = await request.json();
    const status = String(body.status ?? '');
    if (!STATUSES.has(status)) {
      return NextResponse.json(
        { error: 'status must be open, done, or skipped.' },
        { status: 400 }
      );
    }
    const nextAction =
      body.nextAction != null ? String(body.nextAction) : undefined;
    const workOrder = await updateWorkOrderStatus(
      projectId,
      workOrderId,
      status as 'open' | 'done' | 'skipped',
      nextAction
    );
    return NextResponse.json({ workOrder });
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update work order.' },
      { status: 500 }
    );
  }
}
