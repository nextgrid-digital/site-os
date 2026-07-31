import { redirect } from 'next/navigation';

export default async function LegacyFindingDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; findingId: string }>;
}) {
  const { projectId, findingId } = await params;
  redirect(`/audit/${projectId}/findings/${findingId}`);
}
