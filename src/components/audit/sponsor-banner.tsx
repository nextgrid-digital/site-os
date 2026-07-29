export function SponsorBanner({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        'rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900'
      }
    >
      <p className="font-medium">Support public audits</p>
      <p className="mt-1 text-emerald-800/80">
        If this audit is useful, sponsor us to keep Site-OS free and help keep this project running.
      </p>
    </div>
  );
}
