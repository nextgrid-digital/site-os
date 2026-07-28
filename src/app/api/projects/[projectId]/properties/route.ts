import { NextResponse } from 'next/server';
import { selectProperties, syncPropertyOptions } from '@/lib/db/google';
import { listPropertyOptions } from '@/lib/db/projects';

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const properties = await listPropertyOptions(projectId);
    return NextResponse.json({ properties });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load properties.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const body = await request.json();

    if (body.action === 'sync') {
      await syncPropertyOptions(projectId);
      const properties = await listPropertyOptions(projectId);
      return NextResponse.json({ properties });
    }

    const gscPropertyId =
      typeof body.gscPropertyId === 'string' && body.gscPropertyId.trim()
        ? String(body.gscPropertyId)
        : null;
    const ga4PropertyId =
      typeof body.ga4PropertyId === 'string' && body.ga4PropertyId.trim()
        ? String(body.ga4PropertyId)
        : null;

    await selectProperties(projectId, gscPropertyId, ga4PropertyId);
    const properties = await listPropertyOptions(projectId);
    return NextResponse.json({ properties });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update properties.' },
      { status: 500 }
    );
  }
}
