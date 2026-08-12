import { redirect } from 'next/navigation';

export default async function LegacyPricingRedirect({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/audit/${projectId}/workflow`);
}
