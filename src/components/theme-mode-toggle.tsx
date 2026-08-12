'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const MODES = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

export function ThemeModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted ? (theme ?? 'system') : 'system';

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5',
        className
      )}
    >
      {MODES.map(({ value, label, icon: Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            disabled={!mounted}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
              !mounted && 'opacity-60'
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
