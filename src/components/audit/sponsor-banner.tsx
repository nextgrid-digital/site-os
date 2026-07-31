export function SponsorBanner({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        'rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800'
      }
    >
      <p className="font-medium text-zinc-900">Support public audits</p>
      <p className="mt-1 text-zinc-500">
        If this audit is useful, sponsor us to keep Site-OS free and help keep this project running.
      </p>
    </div>
  );
}
