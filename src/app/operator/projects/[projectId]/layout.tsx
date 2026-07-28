import { ProjectPrefetch } from '@/components/operator/project-prefetch';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <ProjectPrefetch projectId={projectId} />
      {children}
    </div>
  );
}
