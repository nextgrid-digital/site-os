import { redirect } from 'next/navigation';

export default async function LegacyWorkOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { projectId } = await params;
  const { action } = await searchParams;
  const qs = action ? `?action=${encodeURIComponent(action)}` : '';
  redirect(`/audit/${projectId}/work-orders${qs}`);
}
