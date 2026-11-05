'use client';


import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { AnimatedMoonIcon, AnimatedSunIcon } from '@/components/icons';

/** One icon button that flips between light and dark. The icon follows the `dark` class, so it never flashes the wrong one on load. */
export function ThemeModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'inline-flex size-8 pointer-coarse:size-11 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <AnimatedSunIcon className="size-4 dark:hidden" aria-hidden />
      <AnimatedMoonIcon className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
