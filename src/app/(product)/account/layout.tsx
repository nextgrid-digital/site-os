import { AccountNav } from '@/components/audit/account-nav';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-4">
      <h1 className="mb-8 text-xl font-semibold">Account</h1>
      <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
