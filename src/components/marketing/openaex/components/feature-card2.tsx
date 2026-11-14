// @ts-nocheck
import type { FeatureCard2Styles } from "../_styles";
import { cn } from "../lib/utils";
export type FeatureCard2Data = {
  href: string;
  title: string;
  description: string;
};
/** A feature card. */
export default function FeatureCard2({ d, cids, styles }: { d: FeatureCard2Data; cids: string[]; styles: FeatureCard2Styles }) {
  return (
    <li data-cid={cids[0]} className={cn("list-item", styles.className)}>
      <div data-cid={cids[1]} className="block">
        <h4 data-cid={cids[2]} className="block font-medium" data-component="heading">
          <a data-cid={cids[3]} className="inline cursor-pointer hover:underline" data-component="link" href={d.href}>
            {d.title}
          </a>
        </h4>
        <p data-cid={cids[4]} className="block mt-1 text-muted-foreground text-sm font-medium leading-5">
          {d.description}
        </p>
      </div>
    </li>
  );
}
