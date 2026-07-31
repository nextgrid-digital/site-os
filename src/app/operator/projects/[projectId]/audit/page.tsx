import { redirect } from 'next/navigation';

export default async function LegacyAuditPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}`);
}
