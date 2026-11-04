"use client";

import { AppWindow, MousePointerClick, Share2 } from "lucide-react";
import type { ComponentType } from "react";
import { motion, type TargetAndTransition, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { CalendarIcon, DevicesIcon, GlobeIcon, GoogleSearchIcon, PageRouteIcon } from "@/components/icons";

const ICONS: Record<string, { Icon: ComponentType<{ className?: string; strokeWidth?: number }>; hover: TargetAndTransition }> = {
  pages: { Icon: PageRouteIcon, hover: { y: [0, -3, 0] } },
  sources: { Icon: Share2, hover: { rotate: [0, -18, 18, 0] } },
  locations: { Icon: GlobeIcon, hover: { rotate: 360 } },
  devices: { Icon: DevicesIcon, hover: { scale: [1, 1.2, 1] } },
  search: { Icon: GoogleSearchIcon, hover: { x: [0, 2, -2, 0], y: [0, -2, 2, 0] } },
  browsers: { Icon: AppWindow, hover: { scale: [1, 1.15, 1] } },
  peak: { Icon: CalendarIcon, hover: { rotate: [0, -8, 8, 0] } },
  events: { Icon: MousePointerClick, hover: { y: [0, 3, 0], scale: [1, 0.85, 1] } },
} as const;

export type CardTitleIconKind = "pages" | "sources" | "locations" | "devices" | "browsers" | "peak" | "search" | "events";

/** Small icon tile beside a card title. Each icon has its own hover motion and presses in on tap. */
export default function CardTitleIcon({ kind }: { kind: CardTitleIconKind }) {
  const reduced = useReducedMotion();
  const { Icon, hover } = ICONS[kind];

  return (
    <motion.span
      aria-hidden
      whileHover={reduced ? undefined : hover}
      whileTap={reduced ? undefined : { scale: 0.88 }}
      transition={{ duration: kind === "locations" ? 0.8 : 0.5, ease: EASE_OUT }}
      className="flex size-6 shrink-0 cursor-default items-center justify-center rounded-md bg-tint text-muted-foreground transition-colors duration-200 hover:bg-tint-strong hover:text-foreground group-hover/card:text-foreground"
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </motion.span>
  );
}
