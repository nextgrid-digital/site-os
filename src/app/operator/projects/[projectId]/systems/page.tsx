import { redirect } from 'next/navigation';

export default async function LegacySystemsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/systems`);
}
