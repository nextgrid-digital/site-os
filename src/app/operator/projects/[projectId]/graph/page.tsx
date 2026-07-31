import { redirect } from 'next/navigation';

export default async function LegacyGraphPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/graph`);
}
