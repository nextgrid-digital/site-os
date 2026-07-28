import { NextResponse } from 'next/server';
import { saveArchitectureInputs } from '@/lib/db/projects';

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const body = await request.json();
    await saveArchitectureInputs(projectId, {
      icp_notes: body.icp_notes ?? null,
      product_notes: body.product_notes ?? null,
      offer_notes: body.offer_notes ?? null,
      proof_notes: body.proof_notes ?? null,
      business_type: body.business_type ?? null,
      primary_offer: body.primary_offer ?? null,
      secondary_offers: body.secondary_offers ?? null,
      primary_icp: body.primary_icp ?? null,
      secondary_icps: body.secondary_icps ?? null,
      conversion_goal: body.conversion_goal ?? null,
      trust_proof_assets: body.trust_proof_assets ?? null,
      site_type: body.site_type ?? null,
      nextgrid_notes: body.nextgrid_notes ?? null,
      pricing_context: body.pricing_context ?? null,
      engagement_interest: body.engagement_interest ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save architecture inputs.' },
      { status: 500 }
    );
  }
}
