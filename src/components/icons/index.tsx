import { SVGProps } from "react";

export function GoogleAdsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 48 48"
      {...props}
    >
      {/* Icon from IconPark TwoTone by ByteDance - https://github.com/bytedance/IconPark/blob/master/LICENSE */}
      <defs>
        <mask id="SVG2XVrbdSD">
          <g fill="none" stroke="#fff" strokeWidth="4">
            <path
              fill="#555"
              d="M41.355 34.153L29.522 8.776a6 6 0 0 0-10.876 5.072L30.48 39.224a6 6 0 1 0 10.876-5.071Z"
            />
            <path
              strokeLinecap="round"
              d="M23.438 26.536L17.52 39.224a6 6 0 0 1-7.974 2.902v0a6 6 0 0 1-2.902-7.973L18.374 9"
            />
            <circle
              cx="12.083"
              cy="36.688"
              r="6"
              fill="#555"
              transform="rotate(25 12.083 36.688)"
            />
          </g>
        </mask>
      </defs>
      <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#SVG2XVrbdSD)" />
    </svg>
  );
}

export function GoogleAnalyticsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Ultimate free icons by Streamline - https://creativecommons.org/licenses/by/4.0/ */}
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M17.12 20.25a3 3 0 0 0 6 0V3.75a3 3 0 0 0-6 0zm-8.24 0a3 3 0 0 0 6 0v-5.5a3 3 0 0 0-6 0zm-8 0a3 3 0 1 0 6 0a3 3 0 0 0-6 0"
      />
    </svg>
  );
}


export function GoogleSearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M2 19v-2h10v2zm0-5v-2h5v2zm0-5V7h5v2zm18.6 10l-3.85-3.85q-.6.425-1.312.638T14 16q-2.075 0-3.537-1.463T9 11t1.463-3.537T14 6t3.538 1.463T19 11q0 .725-.213 1.438t-.637 1.312L22 17.6zM14 14q1.25 0 2.125-.875T17 11t-.875-2.125T14 8t-2.125.875T11 11t.875 2.125T14 14" /></svg>
  )
}


export function GoogleFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE */}<path fill="currentColor" d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1-1.265.06a6 6 0 1 0 2.103 6.836l.001-.004h-3.66a1 1 0 0 1-.992-.883L13 13v-2a1 1 0 0 1 1-1h6.945a1 1 0 0 1 .994.89q.06.55.061 1.11c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2" /></svg>
  )
}