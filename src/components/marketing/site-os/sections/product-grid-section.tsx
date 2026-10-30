import { products as productsContent } from "../content";
import { ProductHeader } from "../components/product-header";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
// Literal class names so Tailwind can see them.
const SPAN_CLASS = { 2: "md:col-span-2", 3: "md:col-span-3" } as const;

/** Product Grid section. */
export default function ProductGridSection({
  products = productsContent,
} = {}) {
  return (
    <section className="block pt-8" data-cid="n462" id="how-it-works">
      <div className="block max-w-280 mx-auto py-20 px-8" data-cid="n463">
        <div className="block mx-auto text-center max-w-xl" data-cid="n464">
          <div className="block text-balance" data-cid="n465">
            <h2
              className="block [font-family:LTRemark,_Georgia,_serif] text-4xl leading-10 max-md:text-2xl max-md:leading-8 md:max-lg:text-3xl md:max-lg:leading-9 2xl:text-6xl 2xl:leading-15"
              data-cid="n466"
              data-component="heading"
            >
              Every audit should answer a commercial question.
            </h2>
            <p
              className="block mt-1.5 text-muted-foreground 2xl:text-lg 2xl:leading-7"
              data-cid="n467"
            >
              Free crawl findings, AI answer readiness, knowledge graph, fix
              prompts, and growth briefs. Sign in to test whether AI search
              cites you, then connect GSC and GA4 when you need depth.
            </p>
          </div>
        </div>
        <div className="block mt-12" data-cid="n468">
          {/* Mobile: horizontal swipe row. md+: grid. */}
          <BentoGrid className="mx-auto">
            {products.map((item, i) => (
              <BentoGridItem
                key={i}
                index={i}
                title={item.description}
                description={item.description2}
                header={
                  <div className="relative h-36 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
                    <img
                      src={item.imgSrc}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover [filter:blur(8px)] [scale:1.1] transition-transform duration-500 group-hover/bento:[scale:1.18]"
                    />
                    <div className="relative z-10 flex h-full items-center justify-center overflow-hidden px-4 py-2">
                      <ProductHeader variant={item.variant} />
                    </div>
                  </div>
                }
                className={item.span ? SPAN_CLASS[item.span] : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}
