"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Small "i" button that explains a metric in plain language.
 * `what` = what it is, `why` = how it helps you act on it.
 */
export function InfoTip({
  what,
  why,
  label = "What does this mean?",
  className = "",
}: {
  what: string;
  why?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={80}
        closeDelay={60}
        render={
          <button
            type="button"
            aria-label={label}
            className={`group/tip -m-1 inline-flex size-6 shrink-0 cursor-help items-center justify-center rounded-full focus-visible:ring-1 focus-visible:ring-foreground focus-visible:outline-none ${className}`}
          />
        }
      >
        <span className="inline-flex size-4 items-center justify-center rounded-full border border-border text-[10px] leading-none font-semibold text-muted-foreground transition-colors group-hover/tip:bg-tint group-hover/tip:text-foreground">
          i
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-64 flex-col items-start gap-1 py-2 leading-4"
      >
        <span>{what}</span>
        {why ? <span className="text-background/70">{why}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

/** Instant replacement for the browser's slow, flaky `title` hover (truncated text, tag chips). */
export function HoverTip({
  text,
  className,
  children,
}: {
  text: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={80}
        closeDelay={60}
        render={<span className={className} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 leading-4">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
