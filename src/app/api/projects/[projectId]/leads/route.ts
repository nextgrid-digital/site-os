import { NextResponse } from 'next/server';
import {
  createLead,
  getProjectLeadReportingSummary,
  listLeads,
  ProjectAccessError,
  requireProjectOwner,
} from '@/lib/db/projects';
import type { LeadStage, LeadStatus } from '@/lib/supabase/types';

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    await requireProjectOwner(projectId);
    const leads = await listLeads(projectId);
    const reporting = await getProjectLeadReportingSummary(projectId, leads);
    return NextResponse.json({ leads, reporting });
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load leads.' },
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
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Lead name is required.' }, { status: 400 });
    }

    const lead = await createLead(projectId, {
      name: body.name,
      email: typeof body.email === 'string' ? body.email : null,
      company: typeof body.company === 'string' ? body.company : null,
      channel: typeof body.channel === 'string' ? body.channel : null,
      source: typeof body.source === 'string' ? body.source : null,
      medium: typeof body.medium === 'string' ? body.medium : null,
      campaign: typeof body.campaign === 'string' ? body.campaign : null,
      stage: typeof body.stage === 'string' ? (body.stage as LeadStage) : undefined,
      status: typeof body.status === 'string' ? (body.status as LeadStatus) : undefined,
      value: typeof body.value === 'number' ? body.value : null,
      notes: typeof body.notes === 'string' ? body.notes : null,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lead.' },
      { status: 500 }
    );
  }
}
