// @ts-nocheck
import ListRow from "../components/list-row";
import Icon2 from "../svgs/svg-icon2";
import { ListRow_cids } from "../_cids";
import { ListRow_styles } from "../_styles";
import { listRowData as listRowDataContent } from "../content";
/** Top navigation bar. */
export default function Navbar({ listRowData = listRowDataContent } = {}) {
  return (
    <header className="w-full h-14 block sticky top-0 z-40 bg-background max-md:h-16" data-cid="n1">
      <div className="h-full block max-w-280 mx-auto px-8" data-cid="n2">
        <div className="h-full flex py-4 justify-between items-center gap-3" data-cid="n3">
          <a className="h-6 flex min-w-0 items-center gap-1 font-semibold tracking-[-0.4px] cursor-pointer" data-cid="n4" data-component="link" aria-label="Site-OS homepage" href="/">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-color-002 text-[0.625rem] font-semibold text-color-007" data-cid="n5">
              SO
            </span>
            <span className="block" data-cid="n6">
              Site-OS
            </span>
          </a>
          <astro-island class="contents min-w-0" data-cid="n7">
            <div className="flex items-center gap-3 max-md:gap-2" data-cid="n8">
              <nav className="flex relative justify-center items-center flex-1" data-cid="n9" data-component="nav">
                <ul className="flex justify-end items-center flex-1 gap-4 [list-style-type:none] list-outside" data-cid="n10">
                  {listRowData.map((d, i) => <ListRow key={i} d={d} cids={ListRow_cids[i]} styles={ListRow_styles[i]} />)}
                </ul>
              </nav>
              <div className="hidden min-w-0 max-md:block" data-cid="n19">
                <button className="w-8 h-8 inline-flex rounded-lg justify-center items-center text-muted-foreground text-center cursor-default" data-cid="n20" aria-expanded="false" aria-haspopup="menu" id="base-ui-_r13R_e_" type="button">
                  <Icon2 cid={"n21"} />
                  <span className="w-px h-px block absolute min-w-0 -m-px overflow-hidden whitespace-nowrap text-nowrap [clip-path:inset(50%)]" data-cid="n22">
                    Open menu
                  </span>
                </button>
              </div>
            </div>
          </astro-island>
        </div>
      </div>
    </header>
  );
}
