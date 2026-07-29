// @ts-nocheck
export default function Icon12({ cid }: { cid?: string }) {
  return (
    <svg className="w-auto block overflow-hidden align-middle h-6" data-component="icon" aria-hidden="true" fill="none" viewBox="0 0 124 155" xmlns="http://www.w3.org/2000/svg" data-cid={cid}>
      <g clipPath="url(#aland-flag-clip)">
        <path d="M122.729 15.9559L63.4249 0L0.113977 15.9559C0.113977 31.38 -1.48882 63.8238 7.32662 97.3313C16.1421 130.839 47.1297 146.529 63.4249 154.773C95.4811 138.817 109.426 116.478 117.119 97.3313C124.812 78.1841 123.797 35.1031 122.729 15.9559Z" fill="#0454A5" />
        <mask id="aland-flag-mask" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="124" height="155">
          <path d="M122.729 15.9559L63.4249 0L0.113977 15.9559C0.113977 31.38 -1.48882 63.8238 7.32662 97.3313C16.1421 130.839 47.1297 146.529 63.4249 154.773C95.4811 138.817 109.426 116.478 117.119 97.3313C124.812 78.1841 123.797 35.1031 122.729 15.9559Z" fill="white" />
        </mask>
        <g mask="url(#aland-flag-mask)">
          <rect x="0.264282" y="77" width="32" height="123" transform="rotate(-90 0.264282 77)" fill="#FECE0A" />
          <rect x="25.2643" width="32" height="155" fill="#FECE0A" />
          <rect x="33" width="16" height="155" fill="#DD1823" />
          <rect y="69" width="16" height="123" transform="rotate(-90 0 69)" fill="#DD1823" />
        </g>
      </g>
      <defs>
        <clipPath id="aland-flag-clip">
          <rect width="123.46" height="154.773" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
