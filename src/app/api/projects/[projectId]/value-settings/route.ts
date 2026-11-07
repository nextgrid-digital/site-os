import { NextResponse } from 'next/server';
import { loadValueSettings, saveValueSettings } from '@/lib/db/fix-actions';
import { ProjectAccessError, requireProjectAccess } from '@/lib/db/projects';

type RouteContext = { params: Promise<{ projectId: string }> };

function fail(error: unknown, fallback: string) {
  if (error instanceof ProjectAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 500 }
  );
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    await requireProjectAccess(projectId);
    return NextResponse.json({ settings: await loadValueSettings(projectId) });
  } catch (error) {
    return fail(error, 'Failed to load conversion value.');
  }
}

/** Set the value of one conversion; send `valuePerConversion: null` to clear it. */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    await requireProjectAccess(projectId);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    if (body?.valuePerConversion === null) {
      await saveValueSettings(projectId, null);
      return NextResponse.json({ settings: null });
    }

    const value = Number(body?.valuePerConversion);
    const currency = typeof body?.currency === 'string' ? body.currency.trim().toUpperCase() : 'USD';
    if (!Number.isFinite(value) || value < 0 || value > 1_000_000_000) {
      return NextResponse.json({ error: 'Enter a valid amount.' }, { status: 400 });
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json({ error: 'Currency must be a 3-letter code like USD.' }, { status: 400 });
    }
    const settings = { valuePerConversion: value, currency };
    await saveValueSettings(projectId, settings);
    return NextResponse.json({ settings });
  } catch (error) {
    return fail(error, 'Failed to save conversion value.');
  }
}
