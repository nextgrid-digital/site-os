"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Same entrance motion the hero cards use, so every card on the page moves alike. */
export const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Container that staggers its `RevealCard` children in when scrolled into view. */
export function RevealGrid(props: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={gridVariants}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      {...props}
    />
  );
}

/** Card that fades up with its siblings. No hover movement. */
export function RevealCard(props: HTMLMotionProps<"div">) {
  return <motion.div variants={cardVariants} {...props} />;
}
