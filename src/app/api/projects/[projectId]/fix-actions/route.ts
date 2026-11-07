import { NextResponse } from 'next/server';
import { FixTargetMissingError, listFixActions, markFixDone, reopenFix } from '@/lib/db/fix-actions';
import { ProjectAccessError, requireProjectAccess } from '@/lib/db/projects';

type RouteContext = { params: Promise<{ projectId: string }> };

function fail(error: unknown, fallback: string) {
  if (error instanceof ProjectAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof FixTargetMissingError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 500 }
  );
}

function cleanString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max ? trimmed : null;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    await requireProjectAccess(projectId);
    return NextResponse.json({ actions: await listFixActions(projectId) });
  } catch (error) {
    return fail(error, 'Failed to load fixes.');
  }
}

/** Mark an issue as fixed. Starting numbers are read server-side from the latest audit. */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    await requireProjectAccess(projectId);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const issueId = cleanString(body?.issueId, 80);
    const target = cleanString(body?.target, 500);
    const title = cleanString(body?.title, 200);
    const targetKind = body?.targetKind === 'page' || body?.targetKind === 'query' ? body.targetKind : null;
    if (!issueId || !target || !title || !targetKind) {
      return NextResponse.json({ error: 'issueId, target, targetKind and title are required.' }, { status: 400 });
    }
    await markFixDone(projectId, { issueId, target, targetKind, title });
    return NextResponse.json({ actions: await listFixActions(projectId) });
  } catch (error) {
    return fail(error, 'Failed to save fix.');
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    await requireProjectAccess(projectId);
    const params = new URL(request.url).searchParams;
    const issueId = cleanString(params.get('issueId'), 80);
    const target = cleanString(params.get('target'), 500);
    if (!issueId || !target) {
      return NextResponse.json({ error: 'issueId and target are required.' }, { status: 400 });
    }
    await reopenFix(projectId, issueId, target);
    return NextResponse.json({ actions: await listFixActions(projectId) });
  } catch (error) {
    return fail(error, 'Failed to reopen fix.');
  }
}
