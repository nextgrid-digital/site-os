// @ts-nocheck
import Tile2, { type Tile2Data } from "../components/tile2";
import CardGridItem from "../components/card-grid-item";
import ConversionPeakHeatmap from "../components/conversion-peak-heatmap";
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
        <div className="h-[95.0375rem] block relative mt-8 max-md:h-auto md:max-lg:h-[141.125rem]" data-cid="n767">
            <div className="h-[95.0375rem] block max-md:h-auto md:max-lg:h-[141.125rem]" data-cid="n769">
                  <div className="block w-full" data-cid="n772">
                    <section className="block mt-2 mb-4 -mx-2 p-2" data-cid="n773" aria-label="Insight metrics">
                      <div className="grid relative gap-3 grid-rows-[166px] grid-cols-6 max-md:grid-rows-[77px_77px_77px] max-md:grid-cols-2 md:max-lg:grid-rows-[77px_77px] md:max-lg:grid-cols-3" data-cid="n774">
                        {tile2Data.map((d, i) => <Tile2 key={i} d={d} cids={Tile2_cids[i]} />)}
                      </div>
                    </section>
                    <div className="w-full grid mb-4 gap-4 justify-items-center grid-rows-[301px_264px_301px] max-md:flex max-md:w-auto max-md:-mx-8 max-md:px-[calc(50%-9.71875rem)] max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:[scrollbar-width:none] max-md:*:shrink-0 max-md:*:snap-center md:max-lg:grid-rows-[301px_301px_227px_264px_301px_264px] grid-cols-1 lg:grid-cols-2" data-cid="n811">
                      {cards.map((d) => <CardGridItem key={d.variant} d={d} />)}
                    </div>
                    <div className="w-full border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3 h-full" data-cid="n1101">
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
                      <div className="w-full block min-w-0 pb-4 max-md:pb-3" data-cid="n1107">
                        <div className="block px-4 max-md:px-3" data-cid="n1108">
                          <div className="w-full block overflow-visible" data-cid="n1109">
                            <div className="w-full block min-w-0" data-cid="n1110">
                              <ConversionPeakHeatmap />
                            </div>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
            </div>
        </div>
        <div className="grid mt-8 gap-4 grid-rows-[88px] text-center text-balance grid-cols-3 max-md:grid-rows-[88px_88px_88px] max-md:grid-cols-1 max-lg:[text-align:inherit] md:max-lg:grid-rows-[108px]" data-cid="n1322">
          {featureCardData.map((d, i) => <FeatureCard key={i} d={d} cids={FeatureCard_cids[i]} />)}
        </div>
      </div>
    </section>
  );
}
