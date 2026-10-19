import { NextResponse } from 'next/server';
import { createProject } from '@/lib/db/projects';
import { AdminRequiredError, requireAdminSession } from '@/lib/db/profiles';
import { hasSupabaseConfig } from '@/lib/supabase/server';

/** Operator-only: creates a project for a client. Customers create sites via /api/audit/start. */
export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }
    await requireAdminSession();
    const body = await request.json();
    if (!body.name || !body.websiteUrl) {
      return NextResponse.json({ error: 'Name and website URL are required.' }, { status: 400 });
    }
    const project = await createProject({
      name: String(body.name),
      websiteUrl: String(body.websiteUrl),
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminRequiredError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project.' },
      { status: 500 }
    );
  }
}
