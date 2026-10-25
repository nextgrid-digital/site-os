"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { createContext, useContext } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

/** Entrance styles. Tiles cycle through these so neighbours move differently. */
export type BentoEffect =
  | "rise"
  | "scale"
  | "slide-left"
  | "slide-right"
  | "blur";

const EFFECT_CYCLE: BentoEffect[] = [
  "rise",
  "slide-left",
  "scale",
  "slide-right",
  "blur",
];

const HIDDEN: Record<BentoEffect, Record<string, string | number>> = {
  rise: { opacity: 0, y: 28 },
  scale: { opacity: 0, scale: 0.92 },
  "slide-left": { opacity: 0, x: -32 },
  "slide-right": { opacity: 0, x: 32 },
  blur: { opacity: 0, y: 12, filter: "blur(10px)" },
};

const SHOWN = { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" };

const ReduceContext = createContext(false);

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const reduce = useReducedMotion() ?? false;

  // Parent only orchestrates: tiles inherit "hidden"/"shown" and stagger in.
  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
  };

  return (
    <ReduceContext.Provider value={reduce}>
      <motion.div
        className={cn(
          "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
          className,
        )}
        variants={container}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      >
        {children}
      </motion.div>
    </ReduceContext.Provider>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  index = 0,
  effect,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  /** Position in the grid; picks the entrance effect when `effect` is omitted. */
  index?: number;
  effect?: BentoEffect;
}) => {
  const reduce = useContext(ReduceContext);
  const kind = effect ?? EFFECT_CYCLE[index % EFFECT_CYCLE.length];

  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : HIDDEN[kind],
    shown: {
      ...SHOWN,
      transition: { duration: reduce ? 0.2 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <motion.div
      variants={variants}
      whileHover={reduce ? undefined : { y: -6, transition: SPRING_PRESS }}
      whileTap={reduce ? undefined : { scale: 0.985, transition: SPRING_PRESS }}
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-surface bg-white p-4 transition-shadow duration-200 hover:shadow-xl dark:bg-surface-3 dark:shadow-none",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-2 mb-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">
          {description}
        </div>
      </div>
    </motion.div>
  );
};
