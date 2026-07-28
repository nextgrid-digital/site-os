import { NextResponse } from 'next/server';
import { updateWorkOrderStatus } from '@/lib/db/projects';

const STATUSES = new Set(['open', 'done', 'skipped']);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; workOrderId: string }> }
) {
  try {
    const { projectId, workOrderId } = await context.params;
    const body = await request.json();
    const status = String(body.status ?? '');
    if (!STATUSES.has(status)) {
      return NextResponse.json(
        { error: 'status must be open, done, or skipped.' },
        { status: 400 }
      );
    }
    const workOrder = await updateWorkOrderStatus(
      projectId,
      workOrderId,
      status as 'open' | 'done' | 'skipped'
    );
    return NextResponse.json({ workOrder });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update work order.' },
      { status: 500 }
    );
  }
}
