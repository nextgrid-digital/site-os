// @ts-nocheck
"use client";

import { motion, useReducedMotion } from "motion/react";
import ListRow3, { type ListRow3Data } from "../components/list-row3";
import ListRow4, { type ListRow4Data } from "../components/list-row4";
import ListRow5, { type ListRow5Data } from "../components/list-row5";
import ListRow6, { type ListRow6Data } from "../components/list-row6";
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
    style: { backgroundImage: 'url("/assets/cloned/svg/ab71e3ed135f.svg")' },
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

/** Hero section — the page's lead block. */
export default function HeroSection({
  listRow3Data = ListRow3_data,
  listRow4Data = ListRow4_data,
  listRow5Data = ListRow5_data,
  listRow6Data = ListRow6_data,
} = {}) {
  const reduce = useReducedMotion();
  return (
    <section className="block" data-cid="n24" id="audit">
      <div
        className="mx-auto block max-w-280 px-8 pt-28 max-lg:pt-20"
        data-cid="n25"
      >
        <motion.div
          className="mx-auto block max-w-2xl text-center"
          data-cid="n26"
          variants={introVariants}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <div className="block text-balance" data-cid="n27">
            <motion.h2
              variants={introItem}
              className="block [font-family:LTRemark,_Georgia,_serif] font-medium text-5xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15"
              data-cid="n28"
              data-component="heading"
            >
              Website audits that turn crawl data into commercial action.
            </motion.h2>
            <motion.p
              variants={introItem}
              className="mt-1.5 block text-muted-foreground 2xl:text-lg 2xl:leading-7"
              data-cid="n29"
            >
              Paste a URL for a free crawl audit, no login required. See how ready every page is for AI answers.
            </motion.p>
          </div>
          <motion.div variants={introItem}>
            <HeroAuditNotch />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mt-12 block"
          data-cid="n38"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
        >
          <div className="mb-3 flex items-baseline justify-between text-xs text-muted-foreground">
            <span className="tracking-[0.08em] uppercase">
              What you get · sample data
            </span>
            <span className="text-[13px]">Pick a metric</span>
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
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5"
              data-cid="n261"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
                <div className="block min-w-0 font-medium leading-[1.1875rem]">
                  Locations
                </div>
              </div>
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

            <motion.div
              variants={cardVariants}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
                <div className="block min-w-0 font-medium leading-[1.1875rem]">
                  Devices
                </div>
              </div>
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

            <motion.div
              variants={cardVariants}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
                <div className="block min-w-0 font-medium leading-[1.1875rem]">
                  Google Search
                </div>
              </div>
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

            <motion.div
              variants={cardVariants}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
                <div className="block min-w-0 font-medium leading-[1.1875rem]">
                  Events
                </div>
              </div>
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
