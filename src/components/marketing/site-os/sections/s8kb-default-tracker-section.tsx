// @ts-nocheck
import ListRow7, { type ListRow7Data } from "../components/list-row7";
import { ListRow7_cids } from "../_cids";
import { ListRow7_styles } from "../_styles";
const ListRow7_data: ListRow7Data[] = [
    { text: "Free URL crawl" },
    { ariahidden: "true", text: "·" },
    { text: "Scored findings" },
    { ariahidden: "true", text: "·" },
    { text: "GSC + GA4 upgrade" },
    { ariahidden: "true", text: "·" },
    { text: "Growth briefs" }
];
/** S8kb Default Tracker section. */
export default function S8kbDefaultTrackerSection({ listRow7Data = ListRow7_data } = {}) {
  return (
    <section className="block" data-cid="n452">
      <div className="block max-w-280 mx-auto py-4 px-8" data-cid="n453">
        <ul className="w-[44.8125rem] flex mx-auto flex-wrap gap-2 text-lg font-medium leading-7 text-center [list-style-type:none] list-outside max-md:w-[19.4375rem] md:max-lg:w-176" data-cid="n454">
          {listRow7Data.map((d, i) => <ListRow7 key={i} d={d} cids={ListRow7_cids[i]} styles={ListRow7_styles[i]} />)}
        </ul>
      </div>
    </section>
  );
}
