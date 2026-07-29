// @ts-nocheck
import ProductCard from "../components/product-card";
import { ProductCard_cids } from "../_cids";
import { ProductCard_styles } from "../_styles";
import { products as productsContent } from "../content";
/** Product Grid section. */
export default function ProductGridSection({ products = productsContent } = {}) {
  return (
    <section className="block pt-8" data-cid="n462" id="how-it-works">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n463">
        <div className="block mx-auto text-center max-w-xl" data-cid="n464">
          <div className="block text-balance" data-cid="n465">
            <h2 className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15" data-cid="n466" data-component="heading">
              Every audit should answer a commercial question.
            </h2>
            <p className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7" data-cid="n467">
              Free crawl findings, AEO, knowledge graph, fix prompts, and growth briefs—then connect GSC and GA4 when you need depth.
            </p>
          </div>
        </div>
        <div className="h-[77.5rem] block mt-12 max-md:h-[3675.3px] md:max-lg:h-532.5" data-cid="n468">
          <astro-island class="contents" data-cid="n469">
            <div className="w-full grid relative items-start gap-y-20 gap-x-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" data-cid="n470">
              {products.map((d, i) => <ProductCard key={d.variant} d={d} cids={ProductCard_cids[i]} styles={ProductCard_styles[i]} />)}
            </div>
          </astro-island>
        </div>
      </div>
    </section>
  );
}
