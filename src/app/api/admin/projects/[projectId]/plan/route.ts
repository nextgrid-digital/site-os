import { NextResponse } from 'next/server';
import { AdminRequiredError, requireAdminSession } from '@/lib/db/profiles';
import { unlockFullBrief } from '@/lib/db/projects';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Manual plan override for admins — covers deals closed outside Paddle, or
 * unblocking a customer while a webhook delivery is delayed/retrying.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    await requireAdminSession();
    const { projectId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const plan = body.plan === 'paid' ? 'paid' : body.plan === 'free' ? 'free' : null;
    if (!plan) {
      return NextResponse.json({ error: "plan must be 'free' or 'paid'." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .maybeSingle();
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }
    if (!project.user_id) {
      return NextResponse.json(
        { error: 'This project has no owner yet — connect Google or have the client sign in first.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('profiles')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('user_id', project.user_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (plan === 'paid') {
      await unlockFullBrief(projectId);
    }

    return NextResponse.json({ ok: true, plan });
  } catch (error) {
    if (error instanceof AdminRequiredError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update plan.' },
      { status: 500 }
    );
  }
}
