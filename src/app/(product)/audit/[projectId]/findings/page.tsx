import { redirect } from 'next/navigation';

export default async function LegacyFindingsRedirect({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/work`);
}
