import { redirect } from 'next/navigation';

export default async function LegacySystemsRedirect({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/workflow`);
}
