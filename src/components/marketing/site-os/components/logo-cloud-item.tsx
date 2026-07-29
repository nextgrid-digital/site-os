// @ts-nocheck
import type { LogoCloudItemStyles } from "../_styles";
export type LogoCloudItemData = {
  alt: string;
  height?: string;
  href?: string;
  imgSrc: string;
  rel?: string;
  srcSet?: string;
  target?: string;
  tooltip?: string;
  width?: string;
};
/** logo cloud item component. */
export default function LogoCloudItem({ d, cids, styles }: { d: LogoCloudItemData; cids: string[]; styles: LogoCloudItemStyles }) {
  const image = <img className={styles.imgClassName} data-cid={cids[3]} data-component="image" alt={d.alt} height={d.height} src={d.imgSrc} srcSet={d.srcSet} width={d.width} />;
  return (
    <div className={styles.rootClassName} data-cid={cids[0]}>
      {d.href ? (
        <a className={styles.linkClassName} data-cid={cids[1]} data-component="link" href={d.href} rel={d.rel} target={d.target}>
          <div className={styles.innerClassName} data-cid={cids[2]}>
            {image}
            {d.tooltip ? <div className={styles.tooltipClassName} data-cid={cids[4]}>{d.tooltip}</div> : null}
          </div>
        </a>
      ) : image}
    </div>
  );
}
