import type { CSSProperties } from 'react';

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'astro-island': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      'astro-slot': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

/** Allow Ditto-captured style objects on list-row flag markers. */
export type SiteOsStyle = CSSProperties | string;
