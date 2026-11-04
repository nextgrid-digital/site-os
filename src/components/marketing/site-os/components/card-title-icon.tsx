"use client";

import { FileText, Globe, MonitorSmartphone, MousePointerClick, Search, Share2 } from "lucide-react";
import { motion, type TargetAndTransition, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";

const ICONS: Record<string, { Icon: typeof Globe; hover: TargetAndTransition }> = {
  pages: { Icon: FileText, hover: { y: [0, -3, 0] } },
  sources: { Icon: Share2, hover: { rotate: [0, -18, 18, 0] } },
  locations: { Icon: Globe, hover: { rotate: 360 } },
  devices: { Icon: MonitorSmartphone, hover: { scale: [1, 1.2, 1] } },
  search: { Icon: Search, hover: { x: [0, 2, -2, 0], y: [0, -2, 2, 0] } },
  events: { Icon: MousePointerClick, hover: { y: [0, 3, 0], scale: [1, 0.85, 1] } },
} as const;

export type CardTitleIconKind = "pages" | "sources" | "locations" | "devices" | "search" | "events";

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
