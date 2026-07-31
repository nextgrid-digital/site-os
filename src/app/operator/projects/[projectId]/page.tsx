import { redirect } from 'next/navigation';

export default async function LegacyProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/overview`);
}
