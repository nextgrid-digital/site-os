import { NextResponse } from 'next/server';
import { updateLead } from '@/lib/db/projects';
import type { LeadStage, LeadStatus } from '@/lib/supabase/types';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; leadId: string }> }
) {
  try {
    const { projectId, leadId } = await context.params;
    const body = await request.json();

    const lead = await updateLead(projectId, leadId, {
      name: typeof body.name === 'string' ? body.name : undefined,
      email: typeof body.email === 'string' || body.email === null ? body.email : undefined,
      company: typeof body.company === 'string' || body.company === null ? body.company : undefined,
      channel: typeof body.channel === 'string' ? body.channel : undefined,
      source: typeof body.source === 'string' || body.source === null ? body.source : undefined,
      medium: typeof body.medium === 'string' || body.medium === null ? body.medium : undefined,
      campaign: typeof body.campaign === 'string' || body.campaign === null ? body.campaign : undefined,
      stage: typeof body.stage === 'string' ? (body.stage as LeadStage) : undefined,
      status: typeof body.status === 'string' ? (body.status as LeadStatus) : undefined,
      value: typeof body.value === 'number' || body.value === null ? body.value : undefined,
      notes: typeof body.notes === 'string' || body.notes === null ? body.notes : undefined,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update lead.' },
      { status: 500 }
    );
  }
}
