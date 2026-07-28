import { OperatorTopbar } from '@/components/operator/operator-topbar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="operator-shell dark flex min-h-svh flex-col bg-[#0a0a0b] text-white">
        <OperatorTopbar />
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
