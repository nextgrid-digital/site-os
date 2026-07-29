// @ts-nocheck
import Tile2, { type Tile2Data } from "../components/tile2";
import CardGridItem from "../components/card-grid-item";
import Icon3 from "../svgs/svg-icon3";
import FeatureCard from "../components/feature-card";
import { Tile2_cids, FeatureCard_cids } from "../_cids";
import { cards as cardsContent, featureCardData as featureCardDataContent } from "../content";
const Tile2_data: Tile2Data[] = [
    { text: "Avg. daily visitors", text2: "379" },
    { text: "Single-visit share", text2: "38.2%" },
    { text: "Custom events", text2: "4,839" },
    { text: "Avg. daily revenue", text2: "$1,814" },
    { text: "Revenue / visitor", text2: "$4.79" },
    { text: "Median time to purchase", text2: "—" }
];
/** See When Visitors section. */
export default function SeeWhenVisitorsSection({ tile2Data = Tile2_data, cards = cardsContent, featureCardData = featureCardDataContent } = {}) {
  return (
    <section className="block pt-8" data-cid="n761">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n762">
        <div className="block mx-auto text-center max-w-3xl" data-cid="n763">
          <div className="block text-balance" data-cid="n764">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n765" data-component="heading">
              See where buyers get stuck.
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n766">
              Open Insights for severity mix, priority scores, channel gaps, and buyer-path breaks without leaving the audit.
            </p>
          </div>
        </div>
        <div className="h-[95.0375rem] block relative mt-8 max-md:h-[140.8875rem] md:max-lg:h-[141.125rem]" data-cid="n767">
          <astro-island class="contents" data-cid="n768">
            <div className="h-[95.0375rem] block max-md:h-[140.8875rem] md:max-lg:h-[141.125rem]" data-cid="n769">
              <astro-slot class="contents" data-cid="n770">
                <astro-island class="contents" data-cid="n771">
                  <div className="block w-full" data-cid="n772">
                    <section className="block mt-2 mb-4 -mx-2 p-2" data-cid="n773" aria-label="Insight metrics">
                      <div className="grid relative gap-3 grid-rows-[166px] grid-cols-6 max-md:grid-rows-[77px_77px_77px] max-md:grid-cols-2 md:max-lg:grid-rows-[77px_77px] md:max-lg:grid-cols-3" data-cid="n774">
                        {tile2Data.map((d, i) => <Tile2 key={i} d={d} cids={Tile2_cids[i]} />)}
                      </div>
                    </section>
                    <div className="w-full grid mb-4 gap-4 grid-rows-[301px_264px_301px] max-md:grid-rows-[289px_289px_215px_252px_289px_252px] md:max-lg:grid-rows-[301px_301px_227px_264px_301px_264px] grid-cols-1 lg:grid-cols-2" data-cid="n811">
                      {cards.map((d) => <CardGridItem key={d.variant} d={d} />)}
                    </div>
                    <div className="w-264 border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n1101">
                      <div className="h-15.5 grid pt-5 pb-4 px-4 rounded-tl-md rounded-tr-md items-start gap-1 grid-rows-[19.25px_2.75px] [grid-auto-rows:min-content] grid-cols-[1fr_auto] max-md:h-13.5 max-md:pt-4 max-md:pb-3 max-md:px-3" data-cid="n1102">
                        <div className="block font-medium leading-[1.1875rem]" data-cid="n1103">
                          Conversion peak
                        </div>
                        <div className="flex pt-0.5 items-center self-start gap-0.5 col-start-2 row-start-1 row-end-[span_2]" data-cid="n1104">
                          <button className="w-6 h-6 flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n1105" data-component="button" aria-hidden="true" aria-label="Share conversion peak" type="button">
                            <Icon3 cid={"n1106"} />
                          </button>
                        </div>
                      </div>
                      <div className="w-263.5 block min-w-0 pb-4 max-md:w-[19.3125rem] max-md:pb-3 md:max-lg:w-175.5" data-cid="n1107">
                        <div className="block px-4 max-md:px-3" data-cid="n1108">
                          <div className="w-255.5 block overflow-auto max-md:w-[17.8125rem] md:max-lg:w-167.5" data-cid="n1109">
                            <div className="w-255.5 block min-w-160 max-md:w-160 md:max-lg:w-167.5" data-cid="n1110">
                              <div className="grid gap-0.5 grid-rows-[14.2812px_38.9219px_38.9219px_38.9219px_38.9219px_38.9219px_38.9219px_38.9219px_25.875px] text-muted-foreground text-[0.625rem] leading-[0.875rem] grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] max-md:grid-rows-[14.2812px_23px_23px_23px_23px_23px_23px_23px_25.875px] md:max-lg:grid-rows-[14.2812px_24.25px_24.25px_24.25px_24.25px_24.25px_24.25px_24.25px_25.875px]" data-cid="n1111">
                                <div className="block" data-cid="n1112" />
                                <div className="block text-center" data-cid="n1113">
                                  0
                                </div>
                                <div className="block text-center" data-cid="n1114" />
                                <div className="block text-center" data-cid="n1115" />
                                <div className="block text-center" data-cid="n1116">
                                  3
                                </div>
                                <div className="block text-center" data-cid="n1117" />
                                <div className="block text-center" data-cid="n1118" />
                                <div className="block text-center" data-cid="n1119">
                                  6
                                </div>
                                <div className="block text-center" data-cid="n1120" />
                                <div className="block text-center" data-cid="n1121" />
                                <div className="block text-center" data-cid="n1122">
                                  9
                                </div>
                                <div className="block text-center" data-cid="n1123" />
                                <div className="block text-center" data-cid="n1124" />
                                <div className="block text-center" data-cid="n1125">
                                  12
                                </div>
                                <div className="block text-center" data-cid="n1126" />
                                <div className="block text-center" data-cid="n1127" />
                                <div className="block text-center" data-cid="n1128">
                                  15
                                </div>
                                <div className="block text-center" data-cid="n1129" />
                                <div className="block text-center" data-cid="n1130" />
                                <div className="block text-center" data-cid="n1131">
                                  18
                                </div>
                                <div className="block text-center" data-cid="n1132" />
                                <div className="block text-center" data-cid="n1133" />
                                <div className="block text-center" data-cid="n1134">
                                  21
                                </div>
                                <div className="block text-center" data-cid="n1135" />
                                <div className="block text-center" data-cid="n1136" />
                                <div className="flex pr-1 items-center text-xs leading-4" data-cid="n1137">
                                  Sun
                                </div>
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1138" aria-label="Sun 0:00 UTC, 3 events" title="Sun 0:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1139" aria-label="Sun 1:00 UTC, 4 events" title="Sun 1:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1140" aria-label="Sun 2:00 UTC, 4 events" title="Sun 2:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1141" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1142" aria-label="Sun 4:00 UTC, 2 events" title="Sun 4:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1143" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1144" aria-label="Sun 6:00 UTC, 2 events" title="Sun 6:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1145" aria-label="Sun 7:00 UTC, 3 events" title="Sun 7:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1146" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1147" aria-label="Sun 9:00 UTC, 2 events" title="Sun 9:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1148" aria-label="Sun 10:00 UTC, 2 events" title="Sun 10:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1149" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1150" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1151" aria-label="Sun 13:00 UTC, 1 events" title="Sun 13:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1152" aria-label="Sun 14:00 UTC, 4 events" title="Sun 14:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1153" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1154" aria-label="Sun 16:00 UTC, 3 events" title="Sun 16:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1155" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1156" aria-label="Sun 18:00 UTC, 1 events" title="Sun 18:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1157" aria-label="Sun 19:00 UTC, 3 events" title="Sun 19:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1158" aria-label="Sun 20:00 UTC, 1 events" title="Sun 20:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1159" aria-label="Sun 21:00 UTC, 4 events" title="Sun 21:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1160" aria-label="Sun 22:00 UTC, 3 events" title="Sun 22:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1161" aria-label="Sun 23:00 UTC, 2 events" title="Sun 23:00 UTC, 2 events" />
                                <div className="flex pr-1 items-center text-xs leading-4" data-cid="n1162">
                                  Mon
                                </div>
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1163" aria-label="Mon 0:00 UTC, 1 events" title="Mon 0:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1164" aria-label="Mon 1:00 UTC, 1 events" title="Mon 1:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1165" aria-label="Mon 2:00 UTC, 4 events" title="Mon 2:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1166" aria-label="Mon 3:00 UTC, 3 events" title="Mon 3:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1167" aria-label="Mon 4:00 UTC, 1 events" title="Mon 4:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1168" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1169" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1170" aria-label="Mon 7:00 UTC, 2 events" title="Mon 7:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1171" aria-label="Mon 8:00 UTC, 1 events" title="Mon 8:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1172" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1173" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1174" aria-label="Mon 11:00 UTC, 3 events" title="Mon 11:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1175" aria-label="Mon 12:00 UTC, 2 events" title="Mon 12:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1176" aria-label="Mon 13:00 UTC, 2 events" title="Mon 13:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1177" aria-label="Mon 14:00 UTC, 4 events" title="Mon 14:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1178" aria-label="Mon 15:00 UTC, 1 events" title="Mon 15:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1179" aria-label="Mon 16:00 UTC, 3 events" title="Mon 16:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1180" aria-label="Mon 17:00 UTC, 2 events" title="Mon 17:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1181" aria-label="Mon 18:00 UTC, 1 events" title="Mon 18:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1182" aria-label="Mon 19:00 UTC, 1 events" title="Mon 19:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1183" aria-label="Mon 20:00 UTC, 2 events" title="Mon 20:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1184" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1185" aria-label="Mon 22:00 UTC, 1 events" title="Mon 22:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1186" aria-label="Mon 23:00 UTC, 2 events" title="Mon 23:00 UTC, 2 events" />
                                <div className="flex pr-1 items-center text-xs leading-4" data-cid="n1187">
                                  Tue
                                </div>
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1188" aria-label="Tue 0:00 UTC, 3 events" title="Tue 0:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1189" aria-label="Tue 1:00 UTC, 1 events" title="Tue 1:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1190" aria-label="Tue 2:00 UTC, 1 events" title="Tue 2:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1191" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1192" aria-label="Tue 4:00 UTC, 2 events" title="Tue 4:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1193" aria-label="Tue 5:00 UTC, 3 events" title="Tue 5:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1194" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1195" aria-label="Tue 7:00 UTC, 2 events" title="Tue 7:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1196" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1197" aria-label="Tue 9:00 UTC, 1 events" title="Tue 9:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1198" aria-label="Tue 10:00 UTC, 1 events" title="Tue 10:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1199" aria-label="Tue 11:00 UTC, 2 events" title="Tue 11:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1200" aria-label="Tue 12:00 UTC, 2 events" title="Tue 12:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1201" aria-label="Tue 13:00 UTC, 2 events" title="Tue 13:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.273387] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1202" aria-label="Tue 14:00 UTC, 9 events" title="Tue 14:00 UTC, 9 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.273387] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1203" aria-label="Tue 15:00 UTC, 9 events" title="Tue 15:00 UTC, 9 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.245968] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1204" aria-label="Tue 16:00 UTC, 7 events" title="Tue 16:00 UTC, 7 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.341935] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1205" aria-label="Tue 17:00 UTC, 14 events" title="Tue 17:00 UTC, 14 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.273387] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1206" aria-label="Tue 18:00 UTC, 9 events" title="Tue 18:00 UTC, 9 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.232258] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1207" aria-label="Tue 19:00 UTC, 6 events" title="Tue 19:00 UTC, 6 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.314516] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1208" aria-label="Tue 20:00 UTC, 12 events" title="Tue 20:00 UTC, 12 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.314516] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1209" aria-label="Tue 21:00 UTC, 12 events" title="Tue 21:00 UTC, 12 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.300806] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1210" aria-label="Tue 22:00 UTC, 11 events" title="Tue 22:00 UTC, 11 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.300806] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1211" aria-label="Tue 23:00 UTC, 11 events" title="Tue 23:00 UTC, 11 events" />
                                <div className="flex pr-1 items-center text-xs leading-4" data-cid="n1212">
                                  Wed
                                </div>
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.328226] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1213" aria-label="Wed 0:00 UTC, 13 events" title="Wed 0:00 UTC, 13 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.369355] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1214" aria-label="Wed 1:00 UTC, 16 events" title="Wed 1:00 UTC, 16 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.273387] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1215" aria-label="Wed 2:00 UTC, 9 events" title="Wed 2:00 UTC, 9 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.273387] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1216" aria-label="Wed 3:00 UTC, 9 events" title="Wed 3:00 UTC, 9 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.273387] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1217" aria-label="Wed 4:00 UTC, 9 events" title="Wed 4:00 UTC, 9 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.273387] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1218" aria-label="Wed 5:00 UTC, 9 events" title="Wed 5:00 UTC, 9 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.314516] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1219" aria-label="Wed 6:00 UTC, 12 events" title="Wed 6:00 UTC, 12 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.259677] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1220" aria-label="Wed 7:00 UTC, 8 events" title="Wed 7:00 UTC, 8 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.328226] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1221" aria-label="Wed 8:00 UTC, 13 events" title="Wed 8:00 UTC, 13 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.328226] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1222" aria-label="Wed 9:00 UTC, 13 events" title="Wed 9:00 UTC, 13 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.383065] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1223" aria-label="Wed 10:00 UTC, 17 events" title="Wed 10:00 UTC, 17 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.328226] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1224" aria-label="Wed 11:00 UTC, 13 events" title="Wed 11:00 UTC, 13 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.410484] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1225" aria-label="Wed 12:00 UTC, 19 events" title="Wed 12:00 UTC, 19 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1226" aria-label="Wed 13:00 UTC, 62 events" title="Wed 13:00 UTC, 62 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1227" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1228" aria-label="Wed 15:00 UTC, 3 events" title="Wed 15:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1229" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.218548] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1230" aria-label="Wed 17:00 UTC, 5 events" title="Wed 17:00 UTC, 5 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1231" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1232" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1233" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1234" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1235" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1236" aria-label="Wed 23:00 UTC, 3 events" title="Wed 23:00 UTC, 3 events" />
                                <div className="flex pr-1 items-center text-xs leading-4" data-cid="n1237">
                                  Thu
                                </div>
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1238" aria-label="Thu 0:00 UTC, 1 events" title="Thu 0:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.218548] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1239" aria-label="Thu 1:00 UTC, 5 events" title="Thu 1:00 UTC, 5 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.232258] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1240" aria-label="Thu 2:00 UTC, 6 events" title="Thu 2:00 UTC, 6 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1241" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1242" aria-label="Thu 4:00 UTC, 1 events" title="Thu 4:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1243" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1244" aria-label="Thu 6:00 UTC, 3 events" title="Thu 6:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1245" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1246" aria-label="Thu 8:00 UTC, 2 events" title="Thu 8:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1247" aria-label="Thu 9:00 UTC, 2 events" title="Thu 9:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.245968] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1248" aria-label="Thu 10:00 UTC, 7 events" title="Thu 10:00 UTC, 7 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1249" aria-label="Thu 11:00 UTC, 1 events" title="Thu 11:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1250" aria-label="Thu 12:00 UTC, 1 events" title="Thu 12:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1251" aria-label="Thu 13:00 UTC, 1 events" title="Thu 13:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1252" aria-label="Thu 14:00 UTC, 3 events" title="Thu 14:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1253" aria-label="Thu 15:00 UTC, 1 events" title="Thu 15:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1254" aria-label="Thu 16:00 UTC, 1 events" title="Thu 16:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1255" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1256" aria-label="Thu 18:00 UTC, 1 events" title="Thu 18:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1257" aria-label="Thu 19:00 UTC, 1 events" title="Thu 19:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1258" aria-label="Thu 20:00 UTC, 2 events" title="Thu 20:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1259" aria-label="Thu 21:00 UTC, 4 events" title="Thu 21:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1260" aria-label="Thu 22:00 UTC, 1 events" title="Thu 22:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1261" />
                                <div className="flex pr-1 items-center text-xs leading-4" data-cid="n1262">
                                  Fri
                                </div>
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1263" aria-label="Fri 0:00 UTC, 1 events" title="Fri 0:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1264" aria-label="Fri 1:00 UTC, 2 events" title="Fri 1:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1265" aria-label="Fri 2:00 UTC, 2 events" title="Fri 2:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1266" aria-label="Fri 3:00 UTC, 2 events" title="Fri 3:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1267" aria-label="Fri 4:00 UTC, 1 events" title="Fri 4:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1268" aria-label="Fri 5:00 UTC, 4 events" title="Fri 5:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1269" aria-label="Fri 6:00 UTC, 2 events" title="Fri 6:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1270" aria-label="Fri 7:00 UTC, 1 events" title="Fri 7:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1271" aria-label="Fri 8:00 UTC, 3 events" title="Fri 8:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1272" aria-label="Fri 9:00 UTC, 3 events" title="Fri 9:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1273" aria-label="Fri 10:00 UTC, 1 events" title="Fri 10:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1274" aria-label="Fri 11:00 UTC, 1 events" title="Fri 11:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.218548] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1275" aria-label="Fri 12:00 UTC, 5 events" title="Fri 12:00 UTC, 5 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1276" aria-label="Fri 13:00 UTC, 3 events" title="Fri 13:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.204839] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1277" aria-label="Fri 14:00 UTC, 4 events" title="Fri 14:00 UTC, 4 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1278" aria-label="Fri 15:00 UTC, 1 events" title="Fri 15:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1279" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1280" aria-label="Fri 17:00 UTC, 1 events" title="Fri 17:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1281" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1282" aria-label="Fri 19:00 UTC, 1 events" title="Fri 19:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1283" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1284" aria-label="Fri 21:00 UTC, 3 events" title="Fri 21:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1285" aria-label="Fri 22:00 UTC, 1 events" title="Fri 22:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1286" aria-label="Fri 23:00 UTC, 1 events" title="Fri 23:00 UTC, 1 events" />
                                <div className="flex pr-1 items-center text-xs leading-4" data-cid="n1287">
                                  Sat
                                </div>
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1288" aria-label="Sat 0:00 UTC, 2 events" title="Sat 0:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1289" aria-label="Sat 1:00 UTC, 1 events" title="Sat 1:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1290" aria-label="Sat 2:00 UTC, 2 events" title="Sat 2:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1291" aria-label="Sat 3:00 UTC, 1 events" title="Sat 3:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.232258] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1292" aria-label="Sat 4:00 UTC, 6 events" title="Sat 4:00 UTC, 6 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1293" aria-label="Sat 5:00 UTC, 2 events" title="Sat 5:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1294" aria-label="Sat 6:00 UTC, 2 events" title="Sat 6:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1295" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1296" aria-label="Sat 8:00 UTC, 2 events" title="Sat 8:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1297" aria-label="Sat 9:00 UTC, 3 events" title="Sat 9:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1298" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1299" aria-label="Sat 11:00 UTC, 2 events" title="Sat 11:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1300" aria-label="Sat 12:00 UTC, 1 events" title="Sat 12:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1301" aria-label="Sat 13:00 UTC, 3 events" title="Sat 13:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1302" aria-label="Sat 14:00 UTC, 2 events" title="Sat 14:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1303" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1304" aria-label="Sat 16:00 UTC, 1 events" title="Sat 16:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1305" aria-label="Sat 17:00 UTC, 2 events" title="Sat 17:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block rounded-md bg-surface-5 aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1306" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1307" aria-label="Sat 19:00 UTC, 2 events" title="Sat 19:00 UTC, 2 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1308" aria-label="Sat 20:00 UTC, 3 events" title="Sat 20:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.16371] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1309" aria-label="Sat 21:00 UTC, 1 events" title="Sat 21:00 UTC, 1 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.191129] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1310" aria-label="Sat 22:00 UTC, 3 events" title="Sat 22:00 UTC, 3 events" />
                                <div className="h-[2.4375rem] min-h-3 border border-solid border-border block opacity-[0.177419] rounded-md bg-foreground aspect-square max-md:h-[1.4375rem] md:max-lg:h-[24.3px]" data-cid="n1311" aria-label="Sat 23:00 UTC, 2 events" title="Sat 23:00 UTC, 2 events" />
                                <div className="block" data-cid="n1312" />
                                <div className="flex pt-2 justify-start items-center gap-1.5 col-start-[span_24] col-end-[span_24] text-[0.6875rem] leading-[1.125rem]" data-cid="n1313" aria-hidden="true">
                                  <span className="block" data-cid="n1314">
                                    Less
                                  </span>
                                  <div className="flex items-center gap-0.5" data-cid="n1315">
                                    <span className="w-2 h-2 block rounded-xs shrink-0 bg-surface-5" data-cid="n1316" />
                                    <span className="w-2 h-2 block rounded-xs shrink-0 bg-clr-10" data-cid="n1317" />
                                    <span className="w-2 h-2 block rounded-xs shrink-0 bg-clr-11" data-cid="n1318" />
                                    <span className="w-2 h-2 block rounded-xs shrink-0 bg-clr-12" data-cid="n1319" />
                                    <span className="w-2 h-2 block rounded-xs shrink-0 bg-foreground" data-cid="n1320" />
                                  </div>
                                  <span className="block" data-cid="n1321">
                                    More
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </astro-island>
              </astro-slot>
            </div>
          </astro-island>
        </div>
        <div className="grid mt-8 gap-4 grid-rows-[88px] text-center text-balance grid-cols-3 max-md:grid-rows-[88px_88px_88px] max-md:grid-cols-1 max-lg:[text-align:inherit] md:max-lg:grid-rows-[108px]" data-cid="n1322">
          {featureCardData.map((d, i) => <FeatureCard key={i} d={d} cids={FeatureCard_cids[i]} />)}
        </div>
      </div>
    </section>
  );
}
