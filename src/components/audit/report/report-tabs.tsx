'use client';

import type { LucideIcon } from 'lucide-react';
import { Bot, User } from 'lucide-react';

export type ReportTabId = 'human' | 'agents';

interface ReportTabsProps {
  active: ReportTabId;
  onChange: (tab: ReportTabId) => void;
}

export function ReportTabs({ active, onChange }: ReportTabsProps) {
  const tabs: Array<{ id: ReportTabId; label: string; hint: string; icon: LucideIcon }> = [
    { id: 'human', label: 'Human', hint: 'How people experience the site', icon: User },
    { id: 'agents', label: 'Agents', hint: 'How AI and tools should fix it', icon: Bot },
  ];

  return (
    <div className="border-b border-zinc-200">
      <div className="flex gap-6" role="tablist" aria-label="Report audience">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={[
                'relative -mb-px pb-3 text-left transition',
                isActive ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-700',
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`}
                  aria-hidden
                />
                <span className="text-sm font-semibold tracking-tight">{tab.label}</span>
              </span>
              <span
                className={`mt-0.5 block pl-6 text-[11px] ${isActive ? 'text-zinc-500' : 'text-zinc-400'}`}
              >
                {tab.hint}
              </span>
              {isActive ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-950" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
