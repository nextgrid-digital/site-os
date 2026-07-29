import type { ReactNode } from 'react';

interface ReportSectionProps {
  index: number;
  title: string;
  lead?: string;
  children: ReactNode;
}

export function ReportSection({ index, title, lead, children }: ReportSectionProps) {
  const num = String(index).padStart(2, '0');
  return (
    <section className="scroll-mt-24 space-y-4 border-t border-zinc-200 pt-8 first:border-t-0 first:pt-0">
      <header className="space-y-1.5">
        <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-400 uppercase">{num}</p>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{title}</h2>
        {lead ? <p className="max-w-2xl text-sm leading-6 text-zinc-500">{lead}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
