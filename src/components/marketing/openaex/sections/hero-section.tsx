// @ts-nocheck
"use client";

import { motion, useReducedMotion } from "motion/react";
import { AuditWord } from "../components/audit-word";
import { ActionWord } from "../components/action-word";
import { WordSequence } from "../components/use-word-loop";
import { HeroAuditNotch } from "../hero-audit-notch";
import { HeroDemoDashboard } from "../demo/hero-demo-dashboard";

const EASE = [0.22, 1, 0.36, 1] as const;

const introVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const introItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * Shared heading type scale. Fluid via clamp() so there are no jumps between
 * breakpoints: size scales smoothly with viewport width between a floor and a ceiling.
 */
const H2_CLASS =
  "block w-full max-w-full text-balance break-words [font-family:var(--font-display),_Georgia,_serif] " +
  "text-[clamp(1.75rem,1.1rem+3.2vw,3.75rem)] font-medium leading-[1.12] tracking-[-0.02em] " +
  "[overflow-wrap:anywhere] [hyphens:manual]";

const LEAD_CLASS =
  "max-w-xl text-pretty text-[clamp(0.875rem,0.8rem+0.35vw,1.125rem)] " +
  "leading-[1.6] text-muted-foreground";

/** Hero section — the page's lead block. */
export default function HeroSection() {
  const reduce = useReducedMotion();
  return (
    <section className="block" data-cid="n24" id="audit">
      <div
        className="mx-auto block max-w-280 px-4 pt-28 sm:px-6 md:px-8 max-lg:pt-20 max-sm:pt-14"
        data-cid="n25"
      >
        <motion.div
          className="mx-auto block max-w-3xl text-center"
          data-cid="n26"
          variants={introVariants}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <div
            className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5"
            data-cid="n27"
          >
            <WordSequence reduce={reduce}>
            <motion.h2
              variants={introItem}
              className={H2_CLASS + " pb-3 sm:pb-4"}
              data-cid="n28"
              data-component="heading"
            >
              Website <AuditWord>audits</AuditWord> that turn crawl data into commercial <ActionWord>action</ActionWord>
            </motion.h2>
            </WordSequence>
            <motion.p
              variants={introItem}
              className={LEAD_CLASS}
              data-cid="n29"
            >
              Paste a URL for a free crawl audit, no login required. See how
              ready every page is for AI answers.
            </motion.p>
          </div>
          <motion.div variants={introItem} className="mx-auto mt-6 max-w-2xl sm:mt-8">
            <HeroAuditNotch />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mt-12 block max-sm:mt-8"
          data-cid="n38"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
        >
          <div className="mb-3 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
            <span className="tracking-[0.08em] uppercase">
              What you get · sample data
            </span>
            <span className="text-[13px] max-sm:hidden">Pick a metric</span>
          </div>
          <HeroDemoDashboard variant="landing" />
        </motion.div>
      </div>
    </section>
  );
}