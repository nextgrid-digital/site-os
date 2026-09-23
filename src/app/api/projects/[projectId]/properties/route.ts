import { NextResponse } from 'next/server';
import { selectProperties, syncPropertyOptions } from '@/lib/db/google';
import { syncGoogleConnectionInventory } from '@/lib/db/google-inventory';
import { listPropertyOptions, ProjectAccessError, requireProjectOwner } from '@/lib/db/projects';

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    await requireProjectOwner(projectId);
    const properties = await listPropertyOptions(projectId);
    return NextResponse.json({ properties });
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
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
    const userId = await requireProjectOwner(projectId);
    const body = await request.json();

    if (body.action === 'sync') {
      await syncPropertyOptions(projectId);
      try {
        await syncGoogleConnectionInventory(userId);
      } catch (inventoryError) {
        console.error('[properties] inventory sync failed', inventoryError);
      }
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
    const adsAccountId =
      typeof body.adsAccountId === 'string' && body.adsAccountId.trim()
        ? String(body.adsAccountId)
        : null;

    await selectProperties(projectId, gscPropertyId, ga4PropertyId, adsAccountId);
    const properties = await listPropertyOptions(projectId);
    return NextResponse.json({ properties });
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update properties.' },
      { status: 500 }
    );
  }
}
