import { NextResponse } from 'next/server';
import { getLatestAuditSessionForProject, setAuditSessionUpgradeState } from '@/lib/db/audit-sessions';
import { upsertClientIntake } from '@/lib/db/client-intake';
import type { GoalCategory } from '@/lib/db/client-intake';

const VALID_GOALS: GoalCategory[] = ['leads', 'signups', 'sales', 'traffic', 'funnel_clarity'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await request.json();

  const goalCandidates: string[] = Array.isArray(body.goal_categories)
    ? body.goal_categories
    : typeof body.goal_category === 'string'
      ? body.goal_category.split(',').map((v: string) => v.trim())
      : [];
  const goalCategory =
    goalCandidates.find((g): g is GoalCategory => VALID_GOALS.includes(g as GoalCategory)) ??
    'leads';

  const intake = await upsertClientIntake(projectId, {
    goal_category: goalCategory,
    business_goal: body.business_goal ?? null,
    success_metric: body.success_metric ?? null,
    conversion_type: body.conversion_type ?? null,
    primary_buyer: body.primary_buyer ?? null,
    priority_channel: body.priority_channel ?? null,
    funnel_stage_focus: body.funnel_stage_focus ?? null,
    problem_statement: body.problem_statement ?? null,
    priority_pages: body.priority_pages ?? null,
  });

  try {
    const session = await getLatestAuditSessionForProject(projectId);
    if (session) {
      await setAuditSessionUpgradeState(session.id, 'intake_started');
    }
  } catch {
    // best-effort
  }

  return NextResponse.json({ intake });
}
