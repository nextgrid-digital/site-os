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


export function DomainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Gridicons by Automattic - https://github.com/Automattic/gridicons/blob/trunk/LICENSE.md */}<path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m6.918 6h-3.215a49 49 0 0 0-.565-3.357A8.05 8.05 0 0 1 18.918 8m-5.904-3.928c.068.352.387 2.038.645 3.928h-3.318c.258-1.89.577-3.576.645-3.928C11.319 4.029 11.656 4 12 4s.681.029 1.014.072M14 12c0 .598-.043 1.286-.109 2h-3.782c-.066-.714-.109-1.402-.109-2s.043-1.286.109-2h3.782c.066.714.109 1.402.109 2M8.862 4.643A49 49 0 0 0 8.297 8H5.082a8.05 8.05 0 0 1 3.78-3.357M4.263 10h3.821C8.033 10.668 8 11.344 8 12s.033 1.332.085 2H4.263C4.097 13.359 4 12.692 4 12s.098-1.359.263-2m.819 6h3.215c.188 1.424.42 2.65.565 3.357A8.05 8.05 0 0 1 5.082 16m5.904 3.928A77 77 0 0 1 10.341 16h3.318a78 78 0 0 1-.645 3.928c-.333.043-.67.072-1.014.072s-.681-.029-1.014-.072m4.152-.571c.145-.707.377-1.933.565-3.357h3.215a8.05 8.05 0 0 1-3.78 3.357M19.737 14h-3.821c.051-.668.084-1.344.084-2s-.033-1.332-.085-2h3.821c.166.641.264 1.308.264 2s-.097 1.359-.263 2" /></svg>
  )
}


export function SortIncreasingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>{/* Icon from IconPark Outline by ByteDance - https://github.com/bytedance/IconPark/blob/master/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 16l8-8m0 0v34M23 9h8M23 19h12M23 29h16M23 39h20" /></svg>
  )
}


export function SortDecreasingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>{/* Icon from IconPark Outline by ByteDance - https://github.com/bytedance/IconPark/blob/master/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M23 8h20M14 41l-8-8m8-26v34m9-23h16M23 28h12M23 38h8" /></svg>
  )
}



export function IssuesListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Meteor Icons by zkreations - https://github.com/zkreations/icons/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 7v10l-9 5l-9-5V7l9-5Zl-9 5l-9-5m9 5v10" /></svg>
  )
}


export function OpenTaskIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 80 80" {...props}>{/* Icon from Glyphs by Goran Spasojevic - https://github.com/gorango/glyphs/blob/main/license */}<g fill="currentColor"><path d="M16.104 40.31A8 8 0 0 1 23.638 35h44.686c2.766 0 4.697 2.74 3.767 5.345l-7.143 20A4 4 0 0 1 61.181 63H10.838a2 2 0 0 1-1.883-2.673z" /><path fillRule="evenodd" d="M8 21a4 4 0 0 1 4-4h11.032a4 4 0 0 1 3.252 1.671l3.1 4.329l.376.525l.376.526l.34.474c.213.298.557.475.923.475H60a4 4 0 0 1 4 4v3H23.638a11 11 0 0 0-10.36 7.3L8 54.08zm56 17v16.08l-1.877 5.256a1 1 0 0 1-.942.664H12.257l6.672-18.682A5 5 0 0 1 23.638 38z" clipRule="evenodd" /></g></svg>
  )
}


export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M3 22V4h3V2h2v2h8V2h2v2h3v7.675q-.475-.225-.975-.375T19 11.075V10H5v10h6.3q.175.55.413 1.05t.562.95zm11.463-.462Q13 20.075 13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23t-3.537-1.463m5.212-1.162l.7-.7L18.5 17.8V15h-1v3.2z" /></svg>
  )
}