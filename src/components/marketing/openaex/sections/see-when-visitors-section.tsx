// @ts-nocheck
"use client";
import { useState } from "react";
import Tile2, { type Tile2Data } from "../components/tile2";
import { RevealCard, RevealGrid } from "../components/reveal";
import InsightTables from "../components/insight-tables";
import CardTitleIcon from "../components/card-title-icon";
import { CircleDollarSign, LogOut, MousePointerClick, Timer, UserRound, Users } from "lucide-react";
import ConversionPeakHeatmap from "../components/conversion-peak-heatmap";
import FeatureCard from "../components/feature-card";
import { Tile2_cids, FeatureCard_cids } from "../_cids";
import { featureCardData as featureCardDataContent } from "../content";
const USD0 = { style: "currency", currency: "USD", maximumFractionDigits: 0 };
const Tile2_data: Tile2Data[] = [
    { text: "Avg. daily visitors", text2: "379", amount: 379, icon: Users },
    { text: "Single-visit share", text2: "38.2%", amount: 0.382, format: { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }, icon: LogOut },
    { text: "Custom events", text2: "4,839", amount: 4839, icon: MousePointerClick },
    { text: "Avg. daily revenue", text2: "$1,814", amount: 1814, format: USD0, icon: CircleDollarSign },
    { text: "Revenue / visitor", text2: "$4.79", amount: 4.79, format: { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }, icon: UserRound },
    { text: "Median time to purchase", text2: "—", icon: Timer }
];
/** See When Visitors section. */
export default function SeeWhenVisitorsSection({ tile2Data = Tile2_data, featureCardData = featureCardDataContent } = {}) {
  const [sel, setSel] = useState(0);
  const [race, setRace] = useState(0);
  return (
    <section className="block pt-8" data-cid="n761">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n762">
        <div className="block mx-auto text-center max-w-3xl" data-cid="n763">
          <div className="block text-balance" data-cid="n764">
            <h2 className="block [font-family:var(--font-display),_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n765" data-component="heading">
              See where buyers get stuck.
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n766">
              Open Insights for severity mix, priority scores, channel gaps, and buyer-path breaks without leaving the audit.
            </p>
          </div>
        </div>
        <div className="mt-8 block w-full" data-cid="n767">
          <section className="block mt-2 mb-4 -mx-2 p-2" data-cid="n773" aria-label="Insight metrics">
            <RevealGrid className="grid relative gap-3 grid-cols-6 max-md:grid-cols-2 md:max-lg:grid-cols-3 lg:grid-rows-[166px]" data-cid="n774">
              {tile2Data.map((d, i) => <Tile2
                  key={i}
                  d={d}
                  cids={Tile2_cids[i]}
                  selected={sel === i}
                  raceKey={sel === i ? race : 0}
                  onSelect={() => {
                    setSel(i);
                    setRace((n) => n + 1);
                  }}
                />)}
            </RevealGrid>
          </section>
          <div className="mb-4">
            <InsightTables />
          </div>
          <RevealGrid>
          <RevealCard className="group/card w-full border border-solid border-surface flex rounded-[14px] flex-col text-sm leading-5 bg-surface-3" data-cid="n1101">
            <div className="flex items-center gap-2 px-4 pt-5 pb-4 max-md:px-3 max-md:pt-4 max-md:pb-3" data-cid="n1102">
              <CardTitleIcon kind="peak" />
              <h3 className="min-w-0 truncate text-[clamp(0.875rem,0.82rem+0.2vw,1rem)] font-medium leading-[1.3] tracking-[-0.005em]" data-cid="n1103">
                Conversion peak
              </h3>
            </div>
            <div className="w-full block min-w-0 pb-4 max-md:pb-3" data-cid="n1107">
              <div className="block px-4 max-md:px-3" data-cid="n1108">
                <div className="w-full block min-w-0" data-cid="n1110">
                  <ConversionPeakHeatmap />
                </div>
              </div>
            </div>
          </RevealCard>
          </RevealGrid>
        </div>
        <div className="grid mt-8 gap-4 grid-rows-[88px] text-center text-balance grid-cols-3 max-md:grid-rows-[88px_88px_88px] max-md:grid-cols-1 max-lg:[text-align:inherit] md:max-lg:grid-rows-[108px]" data-cid="n1322">
          {featureCardData.map((d, i) => <FeatureCard key={i} d={d} cids={FeatureCard_cids[i]} />)}
        </div>
      </div>
    </section>
  );
}
