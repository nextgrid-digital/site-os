import { NextResponse } from 'next/server';
import {
  cleanAdsCustomerId,
  createAdsInvite,
  refreshAdsInvite,
} from '@/lib/db/ads-invites';
import { ProjectAccessError, requireProjectOwner } from '@/lib/db/projects';

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    await requireProjectOwner(projectId);
    const invite = await refreshAdsInvite(projectId);
    return NextResponse.json({ invite });
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check the Google Ads invite.' },
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
    await requireProjectOwner(projectId);
    const body = await request.json();
    const customerId = typeof body.customerId === 'string' ? cleanAdsCustomerId(body.customerId) : '';

    if (!/^\d{10}$/.test(customerId)) {
      return NextResponse.json(
        { error: 'Enter the 10-digit Google Ads account ID (top right of Google Ads).' },
        { status: 400 }
      );
    }

    const invite = await createAdsInvite(projectId, customerId);
    return NextResponse.json({ invite });
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send the Google Ads invite.' },
      { status: 500 }
    );
  }
}
