// @ts-nocheck
import Icon3 from '../svgs/svg-icon3';
import Icon6 from '../svgs/svg-icon6';
import TextLink2, { type TextLink2Data } from '../components/text-link2';
import ListRow3, { type ListRow3Data } from '../components/list-row3';
import ListRow4, { type ListRow4Data } from '../components/list-row4';
import ListRow5, { type ListRow5Data } from '../components/list-row5';
import ListRow6, { type ListRow6Data } from '../components/list-row6';
import { HeroAuditCtas } from '../hero-audit-ctas';
import { HeroDemoDashboard } from '../demo/hero-demo-dashboard';
import {
  TextLink2_cids3,
  TextLink2_cids4,
  ListRow3_cids,
  ListRow4_cids,
  ListRow5_cids,
  ListRow6_cids,
} from '../_cids';
import {
  TextLink2_styles3,
  TextLink2_styles4,
  ListRow3_styles,
  ListRow4_styles,
  ListRow5_styles,
  ListRow6_styles,
} from '../_styles';

const TextLink2_data3: TextLink2Data[] = [
  { ariaselected: 'true', id: '_r14R_34u_-t-0', label: 'Countries' },
  { ariaselected: 'false', id: '_r14R_34u_-t-1', label: 'Regions' },
  { ariaselected: 'false', id: '_r14R_34u_-t-2', label: 'Cities' },
];
const ListRow3_data: ListRow3Data[] = [
  {
    style: {
      backgroundImage:
        "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-us'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23bd3d44'%20d='M0%200h640v480H0'/%3e%3cpath%20stroke='%23fff'%20stroke-width='37'%20d='M0%2055.3h640M0%20129h640M0%20203h640M0%20277h640M0%20351h640M0%20425h640'/%3e%3cpath%20fill='%23192f5d'%20d='M0%200h364.8v258.5H0'/%3e%3c/svg%3e\")",
    },
    label: 'US',
    label2: 'United States',
    text: 'United States',
    text2: '4,126',
  },
  {
    style: {
      backgroundImage:
        "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-de'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23fc0'%20d='M0%20320h640v160H0z'/%3e%3cpath%20fill='%23000001'%20d='M0%200h640v160H0z'/%3e%3cpath%20fill='red'%20d='M0%20160h640v160H0z'/%3e%3c/svg%3e\")",
    },
    label: 'DE',
    label2: 'Germany',
    text: 'Germany',
    text2: '1,804',
  },
  {
    style: {
      backgroundImage:
        "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-gb'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23012169'%20d='M0%200h640v480H0z'/%3e%3c/svg%3e\")",
    },
    label: 'GB',
    label2: 'United Kingdom',
    text: 'United Kingdom',
    text2: '1,662',
  },
  {
    style: { backgroundImage: 'url("/assets/cloned/svg/ab71e3ed135f.svg")' },
    label: 'ES',
    label2: 'Spain',
    text: 'Spain',
    text2: '1,214',
  },
  {
    style: {
      backgroundImage:
        "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-ca'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23fff'%20d='M150.1%200h339.7v480H150z'/%3e%3cpath%20fill='%23d52b1e'%20d='M-19.7%200h169.8v480H-19.7zm509.5%200h169.8v480H489.9z'/%3e%3c/svg%3e\")",
    },
    label: 'CA',
    label2: 'Canada',
    text: 'Canada',
    text2: '982',
  },
];
const TextLink2_data4: TextLink2Data[] = [
  { ariaselected: 'true', id: '_r14R_35e_-t-0', label: 'Browsers' },
  { ariaselected: 'false', id: '_r14R_35e_-t-1', label: 'OS' },
  { ariaselected: 'false', id: '_r14R_35e_-t-2', label: 'Devices' },
];
const ListRow4_data: ListRow4Data[] = [
  { label: 'Chrome', text: 'Chrome', text2: '5,924' },
  { label: 'Safari', text: 'Safari', text2: '2,622' },
  { label: 'Firefox', text: 'Firefox', text2: '1,038' },
  { label: 'Edge', text: 'Edge', text2: '716' },
];
const ListRow5_data: ListRow5Data[] = [
  { text: 'privacy friendly analytics', text2: '1,548' },
  { text: 'cookieless analytics', text2: '1,206' },
  { text: 'google analytics alternative', text2: '972' },
  { text: 'analytics without cookies', text2: '774' },
];
const ListRow6_data: ListRow6Data[] = [
  { text: 'Clicked live demo', text2: '1,994', text3: '2,428' },
  { text: 'Copied install script', text2: '1,240', text3: '1,611' },
  { text: 'Opened pricing', text2: '408', text3: '516' },
  { text: 'Started trial', text2: '228', text3: '284' },
];

/** Hero section — the page's lead block. */
export default function HeroSection({
  textLink2Data3 = TextLink2_data3,
  listRow3Data = ListRow3_data,
  textLink2Data4 = TextLink2_data4,
  listRow4Data = ListRow4_data,
  listRow5Data = ListRow5_data,
  listRow6Data = ListRow6_data,
} = {}) {
  return (
    <section className="block" data-cid="n24" id="audit">
      <div className="mx-auto block max-w-280 px-8 pt-28 max-lg:pt-20" data-cid="n25">
        <div className="mx-auto block max-w-2xl text-center" data-cid="n26">
          <div className="block text-balance" data-cid="n27">
            <h2
              className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15"
              data-cid="n28"
              data-component="heading"
            >
              Website audits that turn crawl data into commercial action.
            </h2>
            <p
              className="mt-1.5 block text-muted-foreground 2xl:text-lg 2xl:leading-7"
              data-cid="n29"
            >
              Paste a URL for a free crawl audit. Sign in to unlock the full free report. Upgrade to
              connect Search Console and GA4.
            </p>
          </div>
          <HeroAuditCtas />
        </div>

        <div className="relative mt-12 block" data-cid="n38">
          <HeroDemoDashboard />

          <div
            className="mt-4 grid w-full grid-cols-2 grid-rows-[238px_206px] gap-4 max-md:grid-cols-1 max-md:grid-rows-[253.25px_221.25px_221.25px_221.25px]"
            data-cid="n260"
          >
            <div
              className="flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5"
              data-cid="n261"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
                <div className="block min-w-0 font-medium leading-[1.1875rem]">Locations</div>
                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-3 max-md:justify-start">
                  <div
                    className="flex flex-wrap items-center gap-3 text-xs font-medium leading-4"
                    aria-label="Locations"
                    role="tablist"
                  >
                    {textLink2Data3.map((d, i) => (
                      <TextLink2
                        key={i}
                        d={d}
                        cids={TextLink2_cids3[i]}
                        styles={TextLink2_styles3[i]}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground"
                      aria-label="Open full breakdown"
                    >
                      <Icon6 cid="n271" />
                    </button>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground"
                      aria-label="Share breakdown"
                    >
                      <Icon3 cid="n273" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
                <ul className="flex h-40 list-outside flex-col [list-style-type:none]">
                  {listRow3Data.map((d, i) => (
                    <ListRow3 key={i} d={d} cids={ListRow3_cids[i]} styles={ListRow3_styles[i]} />
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
                <div className="block min-w-0 font-medium leading-[1.1875rem]">Devices</div>
                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-3 max-md:justify-start">
                  <div
                    className="flex flex-wrap items-center gap-3 text-xs font-medium leading-4"
                    aria-label="Devices"
                    role="tablist"
                  >
                    {textLink2Data4.map((d, i) => (
                      <TextLink2
                        key={i}
                        d={d}
                        cids={TextLink2_cids4[i]}
                        styles={TextLink2_styles4[i]}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground"
                      aria-label="Open full breakdown"
                    >
                      <Icon6 cid="n332" />
                    </button>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground"
                      aria-label="Share breakdown"
                    >
                      <Icon3 cid="n334" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
                <ul className="flex list-outside flex-col [list-style-type:none]">
                  {listRow4Data.map((d, i) => (
                    <ListRow4 key={i} d={d} cids={ListRow4_cids[i]} styles={ListRow4_styles[i]} />
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
                <div className="block min-w-0 font-medium leading-[1.1875rem]">Google Search</div>
                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    className="block rounded-sm text-center"
                    aria-selected="true"
                    role="tab"
                  >
                    Queries
                  </button>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground"
                      aria-label="Open full breakdown"
                    >
                      <Icon6 cid="n374" />
                    </button>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground"
                      aria-label="Share breakdown"
                    >
                      <Icon3 cid="n376" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
                <ul className="flex h-32 list-outside flex-col [list-style-type:none]">
                  {listRow5Data.map((d, i) => (
                    <ListRow5 key={i} d={d} cids={ListRow5_cids[i]} styles={ListRow5_styles[i]} />
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
                <div className="block min-w-0 font-medium leading-[1.1875rem]">Events</div>
                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-3">
                  <div
                    className="flex flex-wrap items-center gap-3 text-xs font-medium leading-4"
                    role="tablist"
                  >
                    <button type="button" className="block rounded-sm text-center" role="tab" aria-selected="true">
                      Count
                    </button>
                    <button
                      type="button"
                      className="block rounded-sm text-center text-muted-foreground"
                      role="tab"
                      aria-selected="false"
                    >
                      Share
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground"
                      aria-label="Open activity log"
                    >
                      <Icon6 cid="n413" />
                    </button>
                    <span className="text-xs font-medium leading-4 text-muted-foreground underline [text-decoration-style:dotted]">
                      Activity log
                    </span>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground"
                      aria-label="Share events breakdown"
                    >
                      <Icon3 cid="n416" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">
                <ul className="flex h-32 list-outside flex-col [list-style-type:none]">
                  {listRow6Data.map((d, i) => (
                    <ListRow6 key={i} d={d} cids={ListRow6_cids[i]} styles={ListRow6_styles[i]} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
