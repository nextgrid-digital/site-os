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


export function SitesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Unicons Monochrome by Iconscout - https://github.com/Iconscout/unicons/blob/master/LICENSE */}<path fill="currentColor" d="M12 12.3L3.5 7.05L12 1.8l8.5 5.25z" /><path fill="currentColor" d="M12 22.2v-9.9l8.5-5.25v9.9z" opacity=".25" /><path fill="currentColor" d="m12 22.2l-8.5-5.25v-9.9L12 12.3z" opacity=".5" /></svg>
  )
}


export function ChatgptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>{/* Icon from Arcticons by Donnnno - https://creativecommons.org/licenses/by-sa/4.0/ */}<path fill="none" stroke="currentColor" strokeLinejoin="round" d="M18.38 27.94v-14.4l11.19-6.46c6.2-3.58 17.3 5.25 12.64 13.33" /><path fill="none" stroke="currentColor" strokeLinejoin="round" d="m18.38 20.94l12.47-7.2l11.19 6.46c6.2 3.58 4.1 17.61-5.23 17.61" /><path fill="none" stroke="currentColor" strokeLinejoin="round" d="m24.44 17.44l12.47 7.2v12.93c0 7.16-13.2 12.36-17.86 4.28" /><path fill="none" stroke="currentColor" strokeLinejoin="round" d="M30.5 21.2v14.14L19.31 41.8c-6.2 3.58-17.3-5.25-12.64-13.33" /><path fill="none" stroke="currentColor" strokeLinejoin="round" d="m30.5 27.94l-12.47 7.2l-11.19-6.46c-6.21-3.59-4.11-17.61 5.22-17.61" /><path fill="none" stroke="currentColor" strokeLinejoin="round" d="m24.44 31.44l-12.47-7.2V11.31c0-7.16 13.2-12.36 17.86-4.28" /></svg>
  )
}


export function GeminiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Remix Icon by Remix Design - https://github.com/cyberalien/RemixIcon/blob/master/License */}<path fill="currentColor" d="M24 12.024c-6.437.388-11.59 5.539-11.977 11.976h-.047C11.588 17.563 6.436 12.412 0 12.024v-.047C6.437 11.588 11.588 6.437 11.976 0h.047c.388 6.437 5.54 11.588 11.977 11.977z" /></svg>
  )
}


export function ClaudeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Meteor Icons by zkreations - https://github.com/zkreations/icons/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4 6l8 6M2 12h10m-8 6l8-6m-5 8l5-8m5 8l-5-8m8 6l-8-6m10 2l-10-2m10-2l-10 2m7-8l-7 8M7 2l5 10m2-9l-2 9m0 0l-1 10" /></svg>
  )
}


export function CursorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Remix Icon by Remix Design - https://github.com/cyberalien/RemixIcon/blob/master/License */}<path fill="currentColor" d="M21.121 6.33L12.45 1.353a.9.9 0 0 0-.9 0L2.879 6.33a.75.75 0 0 0-.379.652v10.036c0 .27.144.518.379.652l8.671 4.977c.278.16.622.16.9 0l8.672-4.977a.75.75 0 0 0 .378-.652V6.982a.75.75 0 0 0-.379-.652m-.544 1.054l-8.371 14.414c-.057.097-.206.057-.206-.055v-9.438a.53.53 0 0 0-.266-.458L3.512 7.128c-.097-.056-.057-.204.056-.204H20.31c.237 0 .386.256.267.46" /></svg>
  )
}


export function PerplexityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE */}<g fill="none"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" /><path fill="currentColor" d="M11 21v-4.086l-3.793 3.793A1 1 0 0 1 5.5 20v-3H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1h1.5V4a1 1 0 0 1 1.633-.774L11 6.39V3a1 1 0 1 1 2 0v3.39l3.867-3.164A1 1 0 0 1 18.5 4v3.5H20a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1h-1.5v3a1 1 0 0 1-1.707.707L13 16.914V21a1 1 0 1 1-2 0m-3.5-6.586v3.172l3.5-3.5v-3.172zm5.5-.328l3.5 3.5v-3.172l-3.5-3.5zm5.207-.793A1 1 0 0 1 18.5 14v1h.5V9.5h-4.586zM5 15h.5v-1a1 1 0 0 1 .293-.707L9.586 9.5H5zm9.802-7.5H16.5V6.11zM7.5 7.5h1.698L7.5 6.11z" /></g></svg>
  )
}


export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Boxicons by Boxicons - https://github.com/box-icons/boxicons-core/blob/main/LICENSE */}<path fill="currentColor" d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10s10-4.49 10-10S17.51 2 12 2m0 18c-4.41 0-8-3.59-8-8c0-.35.03-.7.08-1.04q.18.09.42.09c.83-.03 1.72.18 2 .45s.72 1.29 1 2.25s.67 1.64.88 1.5s.43-.48.5-.75c.07-.28.35-.73.62-1c.28-.28.73-.53 1.01-.57s.61.03.74.15s.27.38.33.57c.05.19.23.39.39.45c.16.05.34.39.41.74c.06.35.22.75.35.87s.36.24.51.26s.19-.18.08-.43c-.11-.26-.05-.43.13-.38s.5-.02.72-.17c.22-.14.38-.44.35-.67c-.02-.23-.15-.51-.29-.63c-.13-.12-.24-.32-.24-.45s.17-.27.37-.31s.65-.28 1.01-.55s.73-.74.82-1.06s.08-.74-.01-.95s-.13-.66-.07-1.02c.06-.35.2-.43.32-.18c.11.26.3.41.4.33c.11-.07.19-.45.18-.82s.31-1.24.71-1.91c.05-.08.08-.16.1-.24A7.98 7.98 0 0 1 20 12c0 4.41-3.59 8-8 8" /><path fill="currentColor" d="M13.48 16.93c-.2-.16-.52-.4-.72-.54c-.19-.13-.45-.24-.57-.24s-.18.11-.13.25s.2.36.34.5l.5.5c.14.14.35.28.47.32s.32.09.45.11c.13.03.26-.09.29-.27c.03-.17-.01-.32-.1-.33c-.09 0-.33-.14-.53-.31Zm4.09-7.43c-.23.56-.41 1.24-.41 1.51s.16.26.35-.03s.5-.81.68-1.16s.28-.78.2-.97s-.2-.35-.27-.35s-.32.44-.55 1m-1.17 5.9c-.14-.02-.42.14-.62.36c-.21.22-.54.51-.75.65s-.32.39-.26.56c.07.17.34.32.62.34c.28.01.65-.22.84-.51s.35-.72.38-.94c.02-.23-.07-.43-.21-.45Z" /></svg>
  )
}


export function PdfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from BoxIcons v2 by Boxicons - https://github.com/box-icons/boxicons/blob/main/LICENSE */}<path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023c.479 0 .774-.242.774-.651c0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018c.817.006 1.349-.444 1.349-1.396c.006-.83-.479-1.268-1.255-1.268z" fill="currentColor" /><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319c.254.202.426.533.426.923c-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515c-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426c.415.308.675.799.675 1.504c0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z" fill="currentColor" /></svg>
  )
}


export function MappingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" {...props}>{/* Icon from OpenSearch UI by OpenSearch Contributors - https://github.com/opensearch-project/oui/blob/main/LICENSE.txt */}<path fill="currentColor" d="M8 8H4.915a1.5 1.5 0 1 1 0-1H8V2.5A1.5 1.5 0 0 1 9.5 1h2.585a1.5 1.5 0 1 1 0 1H9.5a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h2.585a1.5 1.5 0 1 1 0 1H9.5A1.5 1.5 0 0 1 8 12.5zM3.5 3a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3m0 12a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3m10-6a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" /></svg>
  )
}


export function DevicesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}<path fill="currentColor" d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1m-1 9h-4v-7h4z" /></svg>
  )
}

export function PageRouteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}<path fill="currentColor" d="m9.78 11.16l-1.42 1.42a7.3 7.3 0 0 1-1.79-2.94l1.94-.49c.32.89.77 1.5 1.27 2.01m.37-6.01l-2.8-2.8c-.2-.2-.51-.2-.71 0l-2.79 2.8a.5.5 0 0 0 .36.85h1.81c.02.81.08 1.54.19 2.17l1.94-.49C8.08 7.2 8.03 6.63 8.02 6H9.8a.5.5 0 0 0 .35-.85m10 0l-2.79-2.79c-.2-.2-.51-.2-.71 0l-2.79 2.79c-.32.31-.1.85.35.85h1.78c-.1 3.68-1.28 4.75-2.54 5.88c-.5.44-1.01.92-1.45 1.55c-.34-.49-.73-.88-1.13-1.24L9.46 13.6c.93.85 1.54 1.54 1.54 3.4v4c0 .55.45 1 1 1s1-.45 1-1v-4c0-2.02.71-2.66 1.79-3.63c1.38-1.24 3.08-2.78 3.2-7.37h1.8a.5.5 0 0 0 .36-.85" /></svg>
  )
}