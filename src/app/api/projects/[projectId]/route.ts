import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  deleteProjectForUser,
  getProjectOverview,
  SiteDeleteError,
  updateProjectWebsite,
} from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }
    const project = await getProjectOverview(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load project.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const body = await request.json();
    if (!body.websiteUrl) {
      return NextResponse.json({ error: 'websiteUrl is required.' }, { status: 400 });
    }
    await updateProjectWebsite(projectId, String(body.websiteUrl));
    const project = await getProjectOverview(projectId);
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update project.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const auth = createClient(cookieStore);
    const {
      data: { user },
    } = await auth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sign in to delete a site.' }, { status: 401 });
    }

    const result = await deleteProjectForUser(user.id, projectId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof SiteDeleteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete site.' },
      { status: 500 }
    );
  }
}
