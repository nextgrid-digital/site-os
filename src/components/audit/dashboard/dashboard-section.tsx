"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { InfoTip } from "@/components/audit/dashboard/info-tip";
import { EASE_OUT } from "@/lib/ease";

/** Section wrapper: heading + help tooltip, fades up once when scrolled into view. */
export function DashboardSection({
  id,
  title,
  lead,
  tip,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  tip?: { what: string; why?: string };
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <section id={id} className="block scroll-mt-24 pt-2">
      <motion.div
        className="mx-auto max-w-280 space-y-6 px-8 py-10"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        <div className="mx-auto max-w-3xl text-center text-balance">
          <h2 className="inline-flex items-center justify-center gap-2 font-display text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9">
            {title}
            {tip ? <InfoTip what={tip.what} why={tip.why} /> : null}
          </h2>
          {lead ? (
            <p className="mt-1.5 block text-muted-foreground">{lead}</p>
          ) : null}
        </div>
        {children}
      </motion.div>
    </section>
  );
}
