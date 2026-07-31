import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IntakeForm } from '@/components/audit/intake-form';
import { SponsorBanner } from '@/components/audit/sponsor-banner';
import { resolveAuditProjectId } from '@/lib/db/resolve-audit-workspace';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const projectId = await resolveAuditProjectId(id);
  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .single();
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header className="space-y-3">
        <Link
          href={`/audit/${id}`}
          className="inline-flex text-sm text-zinc-500 transition hover:text-zinc-900"
        >
          ← Back to report
        </Link>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Upgrade</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Connect Search Console + GA4
        </h1>
        <p className="text-sm leading-6 text-zinc-500">
          Tell us your goal so the connected audit can prioritize channel traffic, leads, funnel
          stage, search demand, and landing-page performance.
        </p>
      </header>
      <IntakeForm projectId={projectId} />
      <SponsorBanner />
    </div>
  );
}
