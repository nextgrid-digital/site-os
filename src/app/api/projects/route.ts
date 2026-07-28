import { NextResponse } from 'next/server';
import { createProject, listProjects } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export async function GET() {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }
    const projects = await listProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list projects.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project.' },
      { status: 500 }
    );
  }
}
