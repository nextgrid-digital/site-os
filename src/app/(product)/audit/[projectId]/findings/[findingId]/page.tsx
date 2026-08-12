import { redirect } from 'next/navigation';

export default async function LegacyFindingDetailRedirect({
  params,
}: {
  params: Promise<{ projectId: string; findingId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/work`);
}
