// @ts-nocheck
export type FeatureCardData = {
  title: string;
  description: string;
};
/** A feature card. */
export default function FeatureCard({ d, cids }: { d: FeatureCardData; cids: string[] }) {
  return (
    <div data-cid={cids[0]} className="block">
      <h3 data-cid={cids[1]} className="block font-medium" data-component="heading">
        {d.title}
      </h3>
      <p data-cid={cids[2]} className="block mt-1 text-muted-foreground text-sm font-medium leading-5">
        {d.description}
      </p>
    </div>
  );
}
