import { redirect } from 'next/navigation';

export default async function LegacyConnectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/connect`);
}
