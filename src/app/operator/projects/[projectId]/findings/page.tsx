import { redirect } from 'next/navigation';

export default async function LegacyFindingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/findings`);
}
