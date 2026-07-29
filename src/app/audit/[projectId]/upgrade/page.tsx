import { notFound } from 'next/navigation';
import { AuditShell } from '@/components/audit/audit-shell';
import { IntakeForm } from '@/components/audit/intake-form';
import { SponsorBanner } from '@/components/audit/sponsor-banner';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .single();
  if (!project) notFound();

  return (
    <AuditShell>
      <div className="mx-auto max-w-lg space-y-8 pt-8">
        <div className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600">
            Paid connected audit
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Upgrade with Search Console + GA4
          </h1>
          <p className="text-sm text-slate-500">
            Tell us your goal so the connected audit can prioritize channel traffic, leads, funnel
            stage, search demand, and landing-page performance.
          </p>
        </div>
        <IntakeForm projectId={projectId} />
        <SponsorBanner />
      </div>
    </AuditShell>
  );
}
