import { NextResponse } from 'next/server';
import { ProjectAccessError, requireProjectOwner, saveNote } from '@/lib/db/projects';

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    await requireProjectOwner(projectId);
    const body = await request.json();
    if (!body.body) {
      return NextResponse.json({ error: 'Note body is required.' }, { status: 400 });
    }
    const note = await saveNote(projectId, String(body.body));
    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save note.' },
      { status: 500 }
    );
  }
}
