// @ts-nocheck
"use client";

import { motion, useReducedMotion } from "motion/react";
import ListRow3, { type ListRow3Data } from "../components/list-row3";
import ListRow4, { type ListRow4Data } from "../components/list-row4";
import ListRow5, { type ListRow5Data } from "../components/list-row5";
import ListRow6, { type ListRow6Data } from "../components/list-row6";
import CardTitleIcon, { type CardTitleIconKind } from "../components/card-title-icon";
import { HeroAuditNotch } from "../hero-audit-notch";
import { HeroDemoDashboard } from "../demo/hero-demo-dashboard";
import {
  ListRow3_cids,
  ListRow4_cids,
  ListRow5_cids,
  ListRow6_cids,
} from "../_cids";
import {
  ListRow3_styles,
  ListRow4_styles,
  ListRow5_styles,
  ListRow6_styles,
} from "../_styles";

const ListRow3_data: ListRow3Data[] = [
  {
    style: {
      backgroundImage:
        "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-us'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23bd3d44'%20d='M0%200h640v480H0'/%3e%3cpath%20stroke='%23fff'%20stroke-width='37'%20d='M0%2055.3h640M0%20129h640M0%20203h640M0%20277h640M0%20351h640M0%20425h640'/%3e%3cpath%20fill='%23192f5d'%20d='M0%200h364.8v258.5H0'/%3e%3c/svg%3e\")",
    },
    label: "US",
    label2: "United States",
    text: "United States",
    text2: "4,126",
  },
  {
    style: {
      backgroundImage:
        "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-de'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23fc0'%20d='M0%20320h640v160H0z'/%3e%3cpath%20fill='%23000001'%20d='M0%200h640v160H0z'/%3e%3cpath%20fill='red'%20d='M0%20160h640v160H0z'/%3e%3c/svg%3e\")",
    },
    label: "DE",
    label2: "Germany",
    text: "Germany",
    text2: "1,804",
  },
  {
    style: {
      backgroundImage:
        "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-gb'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23012169'%20d='M0%200h640v480H0z'/%3e%3c/svg%3e\")",
    },
    label: "GB",
    label2: "United Kingdom",
    text: "United Kingdom",
    text2: "1,662",
  },
  {
    style: { backgroundImage: 'url("/assets/site/svg/ab71e3ed135f.svg")' },
    label: "ES",
    label2: "Spain",
    text: "Spain",
    text2: "1,214",
  },
  {
    style: {
      backgroundImage:
        "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-ca'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23fff'%20d='M150.1%200h339.7v480H150z'/%3e%3cpath%20fill='%23d52b1e'%20d='M-19.7%200h169.8v480H-19.7zm509.5%200h169.8v480H489.9z'/%3e%3c/svg%3e\")",
    },
    label: "CA",
    label2: "Canada",
    text: "Canada",
    text2: "982",
  },
];
const ListRow4_data: ListRow4Data[] = [
  { label: "Chrome", text: "Chrome", text2: "5,924" },
  { label: "Safari", text: "Safari", text2: "2,622" },
  { label: "Firefox", text: "Firefox", text2: "1,038" },
  { label: "Edge", text: "Edge", text2: "716" },
];
const ListRow5_data: ListRow5Data[] = [
  { text: "privacy friendly analytics", text2: "1,548" },
  { text: "cookieless analytics", text2: "1,206" },
  { text: "google analytics alternative", text2: "972" },
  { text: "analytics without cookies", text2: "774" },
];
const ListRow6_data: ListRow6Data[] = [
  { text: "Clicked live demo", text2: "1,994", text3: "2,428" },
  { text: "Copied install script", text2: "1,240", text3: "1,611" },
  { text: "Opened pricing", text2: "408", text3: "516" },
  { text: "Started trial", text2: "228", text3: "284" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const introVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const introItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
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

const H3_CLASS =
  "min-w-0 truncate text-[clamp(0.875rem,0.82rem+0.2vw,1rem)] font-medium leading-[1.3] tracking-[-0.005em]";

/** Card header with a real heading element for correct semantics and consistent type. */
function CardHeader({ title, icon }: { title: string; icon: CardTitleIconKind }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[auto_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
      <div className="flex min-w-0 items-center gap-2">
        <CardTitleIcon kind={icon} />
        <h3 className={H3_CLASS}>{title}</h3>
      </div>
    </div>
  );
}

const CARD_CLASS =
  "group/card flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5";

/** Hero section — the page's lead block. */
export default function HeroSection({
  listRow3Data = ListRow3_data,
  listRow4Data = ListRow4_data,
  listRow5Data = ListRow5_data,
  listRow6Data = ListRow6_data,
} = {}) {
  const reduce = useReducedMotion();
  const hoverProps = {
    whileHover: reduce ? undefined : { y: -4 },
    transition: { type: "spring", stiffness: 300, damping: 24 },
  };

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
            <motion.h2
              variants={introItem}
              className={H2_CLASS}
              data-cid="n28"
              data-component="heading"
            >
              Website audits that turn crawl data into commercial action.
            </motion.h2>
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

          <motion.div
            variants={gridVariants}
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-4 grid w-full grid-cols-2 grid-rows-[238px_206px] gap-4 max-md:grid-cols-1 max-md:grid-rows-[253.25px_221.25px_221.25px_221.25px]"
            data-cid="n260"
          >
            <motion.div
              variants={cardVariants}
              {...hoverProps}
              className={CARD_CLASS}
              data-cid="n261"
            >
              <CardHeader title="Locations" icon="locations" />
              <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
                <ul className="flex h-40 list-outside flex-col [list-style-type:none]">
                  {listRow3Data.map((d, i) => (
                    <ListRow3
                      key={i}
                      d={d}
                      cids={ListRow3_cids[i]}
                      styles={ListRow3_styles[i]}
                    />
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} {...hoverProps} className={CARD_CLASS}>
              <CardHeader title="Devices" icon="devices" />
              <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
                <ul className="flex list-outside flex-col [list-style-type:none]">
                  {listRow4Data.map((d, i) => (
                    <ListRow4
                      key={i}
                      d={d}
                      cids={ListRow4_cids[i]}
                      styles={ListRow4_styles[i]}
                    />
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} {...hoverProps} className={CARD_CLASS}>
              <CardHeader title="Google Search" icon="search" />
              <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
                <ul className="flex h-32 list-outside flex-col [list-style-type:none]">
                  {listRow5Data.map((d, i) => (
                    <ListRow5
                      key={i}
                      d={d}
                      cids={ListRow5_cids[i]}
                      styles={ListRow5_styles[i]}
                    />
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} {...hoverProps} className={CARD_CLASS}>
              <CardHeader title="Events" icon="events" />
              <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
                <ul className="flex h-32 list-outside flex-col [list-style-type:none]">
                  {listRow6Data.map((d, i) => (
                    <ListRow6
                      key={i}
                      d={d}
                      cids={ListRow6_cids[i]}
                      styles={ListRow6_styles[i]}
                    />
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}