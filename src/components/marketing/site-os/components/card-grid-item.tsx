// @ts-nocheck
import Icon3 from "../svgs/svg-icon3";
export type CardGridItemData = {
  variant: string;
  title: string;
  price?: string;
  stat: string;
  description?: string;
};
/** card grid item component. */
export default function CardGridItem({ d }: { d: CardGridItemData }) {
  switch (d.variant) {
    case "top-sources":
      return (
        <div className="w-130 border border-solid border-surface flex min-w-0 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n812">
          <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_2.75px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n813">
            <div className="block font-medium leading-[1.1875rem]" data-cid="n814">
              {d.title}
            </div>
            <div className="flex pt-0.5 items-center self-start gap-0.5 col-start-2 row-start-1 row-end-[span_2]" data-cid="n815">
              <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n816" data-component="button" aria-hidden="true" aria-label="Share Top sources" type="button">
                <Icon3 cid={"n817"} />
              </button>
            </div>
          </div>
          <div className="w-129.5 h-[14.8125rem] block min-w-0 pb-5 px-4 max-md:w-[19.3125rem] max-md:h-[14.5625rem] max-md:pb-4 max-md:px-3 md:max-lg:w-175.5" data-cid="n818">
            <div className="block relative w-full" data-cid="n819">
              <table className="h-[13.5625rem] table [table-layout:fixed] [border-collapse:collapse] w-full" data-cid="n820">
                <thead className="table-header-group align-middle [border-collapse:collapse]" data-cid="n821">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n822">
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-left whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[44%]" data-cid="n823">
                      Source
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[22%]" data-cid="n824">
                      Views
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[16%]" data-cid="n825">
                      Share
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[18%]" data-cid="n826">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="h-[184.5px] table-row-group align-middle [border-collapse:collapse]" data-cid="n827">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n828">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n829">
                      <span className="w-[13.3625rem] flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n830">
                        <img className="w-4 h-4 block max-w-full rounded-md shrink-0 overflow-clip object-contain aspect-[auto_16/16] align-middle bg-surface-7 [border-collapse:collapse]" data-cid="n831" data-component="image" alt="" height="16" src="/assets/cloned/images/4afefff04e61.png" title="google.com" width="16" />
                        <span className="w-20.5 block min-w-0 overflow-hidden [border-collapse:collapse]" data-cid="n832" title="google.com">
                          google.com
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n833">
                      6,140
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n834">
                      29%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n835">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n836">
                        $4,120
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n837">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n838">
                      <span className="w-[13.3625rem] flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n839">
                        <img className="w-4 h-4 block max-w-full rounded-md shrink-0 overflow-clip object-contain aspect-[auto_16/16] align-middle bg-surface-7 [border-collapse:collapse]" data-cid="n840" data-component="image" alt="" height="16" src="/assets/cloned/images/7da7fa93e500.png" title="t.co" width="16" />
                        <span className="w-6.5 block min-w-0 overflow-hidden [border-collapse:collapse]" data-cid="n841" title="t.co">
                          t.co
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n842">
                      2,284
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n843">
                      10.8%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n844">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n845">
                        $2,860
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n846">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n847">
                      <span className="w-[13.3625rem] flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n848">
                        <img className="w-4 h-4 block max-w-full rounded-md shrink-0 overflow-clip object-contain aspect-[auto_16/16] align-middle bg-surface-7 [border-collapse:collapse]" data-cid="n849" data-component="image" alt="" height="16" src="/assets/cloned/images/5a4e0f1b4609.png" title="github.com" width="16" />
                        <span className="w-19.5 block min-w-0 overflow-hidden [border-collapse:collapse]" data-cid="n850" title="github.com">
                          github.com
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n851">
                      1,903
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n852">
                      9%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n853">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n854">
                        $1,180
                      </span>
                    </td>
                  </tr>
                  <tr className="h-[2.3125rem] table-row align-middle [border-collapse:collapse]" data-cid="n855">
                    <td className="h-[2.3125rem] border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n856">
                      <span className="w-[13.3625rem] h-5 flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n857">
                        <img className="w-4 h-4 block max-w-full rounded-md shrink-0 overflow-clip object-contain aspect-[auto_16/16] align-middle bg-surface-7 [border-collapse:collapse]" data-cid="n858" data-component="image" alt="" height="16" src="/assets/cloned/images/32d2558b75df.png" title="producthunt.com" width="16" />
                        <span className="w-[7.4375rem] h-5 block min-w-0 overflow-hidden [border-collapse:collapse] max-md:w-[6.3375rem]" data-cid="n859" title="producthunt.com">
                          producthunt.com
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n860">
                      1,522
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n861">
                      7.2%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n862">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n863">
                        $2,240
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n864">
                    <td className="table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n865">
                      <span className="w-[13.3625rem] flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n866">
                        <img className="w-4 h-4 block max-w-full rounded-md shrink-0 overflow-clip object-contain aspect-[auto_16/16] align-middle bg-surface-7 [border-collapse:collapse]" data-cid="n867" data-component="image" alt="" height="16" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" title="direct" width="16" />
                        <span className="w-10 block min-w-0 overflow-hidden [border-collapse:collapse]" data-cid="n868" title="direct">
                          direct
                        </span>
                      </span>
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n869">
                      {d.stat}
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n870">
                      5.6%
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n871">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n872">
                        {d.price}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    case "top-countries":
      return (
        <div className="w-130 border border-solid border-surface flex min-w-0 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n873">
          <div className="h-15.5 grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_2.75px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:h-13.5 max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n874">
            <div className="block font-medium leading-[1.1875rem]" data-cid="n875">
              {d.title}
            </div>
            <div className="flex pt-0.5 items-center self-start gap-0.5 col-start-2 row-start-1 row-end-[span_2]" data-cid="n876">
              <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n877" data-component="button" aria-hidden="true" aria-label="Share Top countries" type="button">
                <Icon3 cid={"n878"} />
              </button>
            </div>
          </div>
          <div className="w-129.5 h-[14.8125rem] block min-w-0 pb-5 px-4 max-md:w-[19.3125rem] max-md:h-[14.5625rem] max-md:pb-4 max-md:px-3 md:max-lg:w-175.5" data-cid="n879">
            <div className="block relative w-full" data-cid="n880">
              <table className="h-[13.5625rem] table [table-layout:fixed] [border-collapse:collapse] w-full" data-cid="n881">
                <thead className="table-header-group align-middle [border-collapse:collapse]" data-cid="n882">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n883">
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-left whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[44%]" data-cid="n884">
                      Country
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[22%]" data-cid="n885">
                      Views
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[16%]" data-cid="n886">
                      Share
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[18%]" data-cid="n887">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="h-[184.5px] table-row-group align-middle [border-collapse:collapse]" data-cid="n888">
                  <tr className="h-[2.3125rem] table-row align-middle [border-collapse:collapse]" data-cid="n889">
                    <td className="h-[2.3125rem] border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n890">
                      <span className="w-[13.3625rem] h-5 flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n891">
                        <div className="w-[18.7px] h-3.5 block relative rounded-xs shrink-0 overflow-hidden leading-3.5 bg-contain [background-position:50%_50%] bg-no-repeat [border-collapse:collapse] before:content-[' '] before:text-foreground before:text-sm before:font-medium before:leading-3.5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-us'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23bd3d44'%20d='M0%200h640v480H0'/%3e%3cpath%20stroke='%23fff'%20stroke-width='37'%20d='M0%2055.3h640M0%20129h640M0%20203h640M0%20277h640M0%20351h640M0%20425h640'/%3e%3cpath%20fill='%23192f5d'%20d='M0%200h364.8v258.5H0'/%3e%3cmarker%20id='us-a'%20markerHeight='30'%20markerWidth='30'%3e%3cpath%20fill='%23fff'%20d='m14%200%209%2027L0%2010h28L5%2027z'/%3e%3c/marker%3e%3cpath%20fill='none'%20marker-mid='url(\"data:image/gif" }} data-cid="n892" aria-hidden="true" title="US" />
                        <span className="w-[5.9375rem] h-5 block min-w-0 overflow-hidden [border-collapse:collapse]" data-cid="n893" title="United States">
                          United States
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n894">
                      4,126
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n895">
                      19.5%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n896">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n897">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n898">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n899">
                      <span className="w-[13.3625rem] flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n900">
                        <div className="w-[18.7px] h-3.5 block relative rounded-xs shrink-0 overflow-hidden leading-3.5 bg-contain [background-position:50%_50%] bg-no-repeat [border-collapse:collapse] before:content-[' '] before:text-foreground before:text-sm before:font-medium before:leading-3.5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-de'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23fc0'%20d='M0%20320h640v160H0z'/%3e%3cpath%20fill='%23000001'%20d='M0%200h640v160H0z'/%3e%3cpath%20fill='red'%20d='M0%20160h640v160H0z'/%3e%3c/svg%3e\")" }} data-cid="n901" aria-hidden="true" title="DE" />
                        <span className="w-[3.9375rem] block min-w-0 overflow-hidden [border-collapse:collapse]" data-cid="n902" title="Germany">
                          Germany
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n903">
                      1,804
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n904">
                      8.5%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n905">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n906">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="h-[2.3125rem] table-row align-middle [border-collapse:collapse]" data-cid="n907">
                    <td className="h-[2.3125rem] border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n908">
                      <span className="w-[13.3625rem] h-5 flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n909">
                        <div className="w-[18.7px] h-3.5 block relative rounded-xs shrink-0 overflow-hidden leading-3.5 bg-contain [background-position:50%_50%] bg-no-repeat [border-collapse:collapse] before:content-[' '] before:text-foreground before:text-sm before:font-medium before:leading-3.5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-gb'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23012169'%20d='M0%200h640v480H0z'/%3e%3cpath%20fill='%23FFF'%20d='m75%200%20244%20181L562%200h78v62L400%20241l240%20178v61h-80L320%20301%2081%20480H0v-60l239-178L0%2064V0z'/%3e%3cpath%20fill='%23C8102E'%20d='m424%20281%20216%20159v40L369%20281zm-184%2020%206%2035L54%20480H0zM640%200v3L391%20191l2-44L590%200zM0%200l239%20176h-60L0%2042z'/%3e%3cpath%20fill='%23FFF'%20d='M241%200v480h160V0zM0%20160v160h640V160z'/%3e%3cpath%20fill='%23C8102E'%20d='M0%20193v96h640v-96zM273%200v480h96V0z'/%3e%3c/svg%3e\")" }} data-cid="n910" aria-hidden="true" title="GB" />
                        <span className="w-[6.9375rem] h-5 block min-w-0 overflow-hidden [border-collapse:collapse] max-md:w-[98.7px]" data-cid="n911" title="United Kingdom">
                          {d.description}
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n912">
                      1,662
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n913">
                      7.8%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n914">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n915">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n916">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n917">
                      <span className="w-[13.3625rem] flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n918">
                        <div className="w-[18.7px] h-3.5 block relative rounded-xs shrink-0 overflow-hidden leading-3.5 bg-contain [background-position:50%_50%] bg-no-repeat [border-collapse:collapse] before:content-[' '] before:text-foreground before:text-sm before:font-medium before:leading-3.5" style={{ backgroundImage: "url(\"/assets/cloned/svg/ab71e3ed135f.svg\")" }} data-cid="n919" aria-hidden="true" title="ES" />
                        <span className="w-10 block min-w-0 overflow-hidden [border-collapse:collapse]" data-cid="n920" title="Spain">
                          Spain
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n921">
                      1,214
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n922">
                      5.7%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n923">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n924">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n925">
                    <td className="table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n926">
                      <span className="w-[13.3625rem] flex items-center gap-2 [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n927">
                        <div className="w-[18.7px] h-3.5 block relative rounded-xs shrink-0 overflow-hidden leading-3.5 bg-contain [background-position:50%_50%] bg-no-repeat [border-collapse:collapse] before:content-[' '] before:text-foreground before:text-sm before:font-medium before:leading-3.5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='flag-icons-ca'%20viewBox='0%200%20640%20480'%3e%3cpath%20fill='%23fff'%20d='M150.1%200h339.7v480H150z'/%3e%3cpath%20fill='%23d52b1e'%20d='M-19.7%200h169.8v480H-19.7zm509.5%200h169.8v480H489.9zM201%20232l-13.3%204.4%2061.4%2054c4.7%2013.7-1.6%2017.8-5.6%2025l66.6-8.4-1.6%2067%2013.9-.3-3.1-66.6%2066.7%208c-4.1-8.7-7.8-13.3-4-27.2l61.3-51-10.7-4c-8.8-6.8%203.8-32.6%205.6-48.9%200%200-35.7%2012.3-38%205.8l-9.2-17.5-32.6%2035.8c-3.5.9-5-.5-5.9-3.5l15-74.8-23.8%2013.4q-3.2%201.3-5.2-2.2l-23-46-23.6%2047.8q-2.8%202.5-5%20.7L264%20130.8l13.7%2074.1c-1.1%203-3.7%203.8-6.7%202.2l-31.2-35.3c-4%206.5-6.8%2017.1-12.2%2019.5s-23.5-4.5-35.6-7c4.2%2014.8%2017%2039.6%209%2047.7'/%3e%3c/svg%3e\")" }} data-cid="n928" aria-hidden="true" title="CA" />
                        <span className="w-[3.4375rem] block min-w-0 overflow-hidden [border-collapse:collapse]" data-cid="n929" title="Canada">
                          Canada
                        </span>
                      </span>
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n930">
                      {d.stat}
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n931">
                      4.6%
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n932">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n933">
                        —
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    case "devices":
      return (
        <div className="w-130 border border-solid border-surface flex min-w-0 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n934">
          <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_2.75px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n935">
            <div className="block font-medium leading-[1.1875rem]" data-cid="n936">
              {d.title}
            </div>
            <div className="flex pt-0.5 items-center self-start gap-0.5 col-start-2 row-start-1 row-end-[span_2]" data-cid="n937">
              <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n938" data-component="button" aria-hidden="true" aria-label="Share Devices" type="button">
                <Icon3 cid={"n939"} />
              </button>
            </div>
          </div>
          <div className="w-129.5 block min-w-0 pb-5 px-4 max-md:w-[19.3125rem] max-md:pb-4 max-md:px-3 md:max-lg:w-175.5" data-cid="n940">
            <div className="block relative w-full" data-cid="n941">
              <table className="table [table-layout:fixed] [border-collapse:collapse] w-full" data-cid="n942">
                <thead className="table-header-group align-middle [border-collapse:collapse]" data-cid="n943">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n944">
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-left whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[44%]" data-cid="n945">
                      Name
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[22%]" data-cid="n946">
                      Views
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[16%]" data-cid="n947">
                      Share
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[18%]" data-cid="n948">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="table-row-group align-middle [border-collapse:collapse]" data-cid="n949">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n950">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n951">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n952" title="Desktop">
                        Desktop
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n953">
                      5,842
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n954">
                      27.6%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n955">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n956">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n957">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n958">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n959" title="Mobile">
                        Mobile
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n960">
                      3,182
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n961">
                      15%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n962">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n963">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n964">
                    <td className="table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n965">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n966" title="Tablet">
                        Tablet
                      </span>
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n967">
                      {d.stat}
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n968">
                      2.1%
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n969">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n970">
                        —
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    case "browsers":
      return (
        <div className="w-130 border border-solid border-surface flex min-w-0 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n971">
          <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_2.75px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n972">
            <div className="block font-medium leading-[1.1875rem]" data-cid="n973">
              {d.title}
            </div>
            <div className="flex pt-0.5 items-center self-start gap-0.5 col-start-2 row-start-1 row-end-[span_2]" data-cid="n974">
              <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n975" data-component="button" aria-hidden="true" aria-label="Share Browsers" type="button">
                <Icon3 cid={"n976"} />
              </button>
            </div>
          </div>
          <div className="w-129.5 block min-w-0 pb-5 px-4 max-md:w-[19.3125rem] max-md:pb-4 max-md:px-3 md:max-lg:w-175.5" data-cid="n977">
            <div className="block relative w-full" data-cid="n978">
              <table className="table [table-layout:fixed] [border-collapse:collapse] w-full" data-cid="n979">
                <thead className="table-header-group align-middle [border-collapse:collapse]" data-cid="n980">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n981">
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-left whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[44%]" data-cid="n982">
                      Name
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[22%]" data-cid="n983">
                      Views
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[16%]" data-cid="n984">
                      Share
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[18%]" data-cid="n985">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="table-row-group align-middle [border-collapse:collapse]" data-cid="n986">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n987">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n988">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n989" title="Chrome">
                        Chrome
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n990">
                      5,924
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n991">
                      28%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n992">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n993">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n994">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n995">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n996" title="Safari">
                        Safari
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n997">
                      2,622
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n998">
                      12.4%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n999">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1000">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n1001">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1002">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1003" title="Firefox">
                        Firefox
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1004">
                      1,038
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1005">
                      4.9%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1006">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1007">
                        —
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n1008">
                    <td className="table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1009">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1010" title="Edge">
                        Edge
                      </span>
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1011">
                      {d.stat}
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1012">
                      3.4%
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1013">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1014">
                        —
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    case "top-pages":
      return (
        <div className="w-130 border border-solid border-surface flex min-w-0 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n1015">
          <div className="grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_2.75px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n1016">
            <div className="block font-medium leading-[1.1875rem]" data-cid="n1017">
              {d.title}
            </div>
            <div className="flex pt-0.5 items-center self-start gap-0.5 col-start-2 row-start-1 row-end-[span_2]" data-cid="n1018">
              <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1019" data-component="button" aria-hidden="true" aria-label="Share Top pages" type="button">
                <Icon3 cid={"n1020"} />
              </button>
            </div>
          </div>
          <div className="w-129.5 h-[14.8125rem] block min-w-0 pb-5 px-4 max-md:w-[19.3125rem] max-md:h-[14.5625rem] max-md:pb-4 max-md:px-3 md:max-lg:w-175.5" data-cid="n1021">
            <div className="block relative w-full" data-cid="n1022">
              <table className="h-[13.5625rem] table [table-layout:fixed] [border-collapse:collapse] w-full" data-cid="n1023">
                <thead className="table-header-group align-middle [border-collapse:collapse]" data-cid="n1024">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n1025">
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-left whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[44%]" data-cid="n1026">
                      Page
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[22%]" data-cid="n1027">
                      Views
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[16%]" data-cid="n1028">
                      Share
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[18%]" data-cid="n1029">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="h-[184.5px] table-row-group align-middle [border-collapse:collapse]" data-cid="n1030">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n1031">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1032">
                      <span className="w-[13.3625rem] block overflow-hidden [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n1033" title="/">
                        /
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1034">
                      9,842
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1035">
                      46.4%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1036">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1037">
                        $4,180
                      </span>
                    </td>
                  </tr>
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n1038">
                    <td className="border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1039">
                      <span className="w-[13.3625rem] block overflow-hidden [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n1040" title="/pricing">
                        /pricing
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1041">
                      4,118
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1042">
                      19.4%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1043">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1044">
                        $6,240
                      </span>
                    </td>
                  </tr>
                  <tr className="h-[2.3125rem] table-row align-middle [border-collapse:collapse]" data-cid="n1045">
                    <td className="h-[2.3125rem] border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1046">
                      <span className="w-[13.3625rem] h-5 block overflow-hidden [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n1047" title="/docs/install-astro">
                        /docs/install-astro
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1048">
                      2,906
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1049">
                      13.7%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1050">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1051">
                        $1,820
                      </span>
                    </td>
                  </tr>
                  <tr className="h-[2.3125rem] table-row align-middle [border-collapse:collapse]" data-cid="n1052">
                    <td className="h-[2.3125rem] border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1053">
                      <span className="w-[13.3625rem] h-5 block overflow-hidden [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n1054" title="/docs/overview">
                        /docs/overview
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1055">
                      2,442
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1056">
                      11.5%
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1057">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1058">
                        $940.00
                      </span>
                    </td>
                  </tr>
                  <tr className="h-[36.5px] table-row align-middle [border-collapse:collapse]" data-cid="n1059">
                    <td className="h-[36.5px] table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1060">
                      <span className="w-[13.3625rem] h-5 block overflow-hidden [border-collapse:collapse] max-md:w-[7.8375rem] md:max-lg:w-[18.425rem]" data-cid="n1061" title="/audit/report">
                        /audit/report
                      </span>
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1062">
                      {d.stat}
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1063">
                      8.9%
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1064">
                      <span className="block overflow-hidden [border-collapse:collapse]" data-cid="n1065">
                        {d.price}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    case "top-converting-events":
      return (
        <div className="w-130 border border-solid border-surface flex min-w-0 rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n1066">
          <div className="h-15.5 grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_2.75px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:h-13.5 max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n1067">
            <div className="block font-medium leading-[1.1875rem]" data-cid="n1068">
              {d.title}
            </div>
            <div className="flex pt-0.5 items-center self-start gap-0.5 col-start-2 row-start-1 row-end-[span_2]" data-cid="n1069">
              <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1070" data-component="button" aria-hidden="true" aria-label="Share Top converting events" type="button">
                <Icon3 cid={"n1071"} />
              </button>
            </div>
          </div>
          <div className="w-129.5 h-50 block min-w-0 pb-5 px-4 max-md:w-[19.3125rem] max-md:h-49 max-md:pb-4 max-md:px-3 md:max-lg:w-175.5" data-cid="n1072">
            <div className="block relative w-full" data-cid="n1073">
              <table className="h-45 table [table-layout:fixed] [border-collapse:collapse] w-full" data-cid="n1074">
                <thead className="table-header-group align-middle [border-collapse:collapse]" data-cid="n1075">
                  <tr className="table-row align-middle [border-collapse:collapse]" data-cid="n1076">
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-left whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[52%]" data-cid="n1077">
                      Event
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[22%]" data-cid="n1078">
                      Views
                    </th>
                    <th className="border-b border-solid border-b-surface-6 table-cell py-2 align-middle text-muted-foreground text-xs font-medium leading-4 text-right whitespace-nowrap text-nowrap [border-collapse:collapse] h-auto w-[26%]" data-cid="n1079">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="h-[147.5px] table-row-group align-middle [border-collapse:collapse]" data-cid="n1080">
                  <tr className="h-[2.3125rem] table-row align-middle [border-collapse:collapse]" data-cid="n1081">
                    <td className="h-[2.3125rem] border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1082">
                      <span className="h-5 block overflow-hidden [border-collapse:collapse]" data-cid="n1083" title="Clicked live demo">
                        Clicked live demo
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1084">
                      2,428
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1085">
                      11.5%
                    </td>
                  </tr>
                  <tr className="h-[2.3125rem] table-row align-middle [border-collapse:collapse]" data-cid="n1086">
                    <td className="h-[2.3125rem] border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1087">
                      <span className="h-5 block overflow-hidden [border-collapse:collapse]" data-cid="n1088" title="Copied install script">
                        {d.description}
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1089">
                      1,611
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1090">
                      7.6%
                    </td>
                  </tr>
                  <tr className="h-[2.3125rem] table-row align-middle [border-collapse:collapse]" data-cid="n1091">
                    <td className="h-[2.3125rem] border-b border-solid border-b-surface-2 table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1092">
                      <span className="h-5 block overflow-hidden [border-collapse:collapse]" data-cid="n1093" title="Opened pricing">
                        Opened pricing
                      </span>
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1094">
                      516
                    </td>
                    <td className="border-b border-solid border-b-surface-2 table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1095">
                      2.4%
                    </td>
                  </tr>
                  <tr className="h-[36.5px] table-row align-middle [border-collapse:collapse]" data-cid="n1096">
                    <td className="h-[36.5px] table-cell max-w-0 py-2 align-middle font-medium whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1097">
                      <span className="h-5 block overflow-hidden [border-collapse:collapse]" data-cid="n1098" title="Started trial">
                        Started trial
                      </span>
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1099">
                      {d.stat}
                    </td>
                    <td className="table-cell py-2 align-middle text-muted-foreground text-right whitespace-nowrap text-nowrap [border-collapse:collapse]" data-cid="n1100">
                      1.3%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
