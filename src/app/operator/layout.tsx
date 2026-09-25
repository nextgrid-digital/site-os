import { redirect } from 'next/navigation';
import { OperatorTopbar } from '@/components/operator/operator-topbar';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getSessionPlan } from '@/lib/db/profiles';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseConfig()) {
    const session = await getSessionPlan();
    if (!session.signedIn) {
      redirect('/login?next=/operator');
    }
    if (!session.isAdmin) {
      redirect('/app');
    }
  }

  return (
    <TooltipProvider>
      <div className="operator-shell dark flex min-h-svh flex-col bg-[#0a0a0b] text-white">
        <OperatorTopbar />
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
        <footer className="mt-auto border-t border-white/10 py-4">
          <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 md:px-6">
            <p className="text-xs text-white/50">Site-OS Operator</p>
            <ThemeModeToggle />
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
