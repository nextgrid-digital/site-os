import type { ReactNode } from 'react';

/** Light panel chrome for operator feature pages inside the audit workspace. */
export function AuditWorkspacePanel({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function AuditWorkspaceCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[14px] bg-white p-5 shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
