import { getSupabaseAdmin } from '@/lib/supabase/server';

export type GoalCategory = 'leads' | 'signups' | 'sales' | 'traffic' | 'funnel_clarity';

export interface ClientIntakeData {
  goal_category: GoalCategory;
  business_goal?: string | null;
  success_metric?: string | null;
  conversion_type?: string | null;
  primary_buyer?: string | null;
  priority_channel?: string | null;
  funnel_stage_focus?: string | null;
  problem_statement?: string | null;
  priority_pages?: string | null;
}

export async function getClientIntake(projectId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('client_intake')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  return data as (ClientIntakeData & { id: string; project_id: string }) | null;
}

export async function upsertClientIntake(projectId: string, intake: ClientIntakeData) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('client_intake')
    .upsert(
      {
        project_id: projectId,
        ...intake,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Sync relevant fields to architecture_inputs for backward compatibility
  await supabase
    .from('architecture_inputs')
    .update({
      conversion_goal: intake.business_goal ?? undefined,
      primary_icp: intake.primary_buyer ?? undefined,
      pricing_context: intake.problem_statement ?? undefined,
    })
    .eq('project_id', projectId);

  return data;
}
