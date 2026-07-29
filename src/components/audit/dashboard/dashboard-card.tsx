'use client';

import type { ReactNode } from 'react';

export interface DashboardTab {
  id: string;
  label: string;
}

interface DashboardCardProps {
  title: string;
  description?: string;
  tabs?: DashboardTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
  className = '',
}: DashboardCardProps) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          {description ? <p className="text-xs leading-5 text-zinc-500">{description}</p> : null}
        </div>
        {actions}
      </div>
      {tabs && tabs.length > 0 ? (
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 px-3 pt-2">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={[
                  'shrink-0 rounded-t-lg px-3 py-2 text-xs font-medium transition',
                  active
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="flex-1 px-5 py-4">{children}</div>
    </section>
  );
}
