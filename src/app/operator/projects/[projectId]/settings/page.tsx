import { redirect } from 'next/navigation';

export default async function LegacySettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/intake`);
}
