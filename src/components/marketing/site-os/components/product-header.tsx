const MetricTile = ({
  borderClass,
  label,
  delta,
  deltaClass,
  value,
}: {
  borderClass: string;
  label: string;
  delta: string;
  deltaClass: string;
  value: string;
}) => (
  <div
    className={`flex min-w-0 flex-1 flex-col justify-between gap-5 rounded-[14px] border border-solid ${borderClass} bg-surface-3 p-2.5 text-left pointer-events-none`}
  >
    <div className="flex min-w-0 items-baseline justify-between gap-1 text-[0.6875rem] font-medium leading-4">
      <span className="min-w-0 truncate text-muted-foreground">{label}</span>
      <span className={`shrink-0 ${deltaClass}`}>{delta}</span>
    </div>
    <span className="text-base font-medium leading-5 tracking-[-0.4px]">
      {value}
    </span>
  </div>
);

export const ProductCrawlFindings = () => {
  return (
    <div className="flex w-full max-w-xs gap-2 pointer-events-none">
      <MetricTile
        borderClass="border-color-008"
        label="Visitors"
        delta="+18.4%"
        deltaClass="text-primary"
        value="47"
      />
      <MetricTile
        borderClass="border-surface"
        label="Revenue"
        delta="77 paid"
        deltaClass="text-muted-foreground"
        value="82"
      />
    </div>
  );
};

const BreakdownRow = ({
  className,
  width,
  label,
  value,
}: {
  className?: string;
  width: string;
  label: string;
  value: string;
}) => (
  <li
    className={`relative overflow-hidden rounded-lg border border-solid border-surface bg-surface-3 p-1 ${className ?? ""}`}
  >
    <div
      aria-hidden="true"
      className="absolute top-1 bottom-1 left-1 rounded-md bg-color-001 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both]"
      style={{ width: `calc(${width} - 0.5rem)` }}
    />
    <div className="relative z-10 flex items-center justify-between gap-3 px-1.5 py-1 text-xs leading-4">
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
        {value}
      </span>
    </div>
  </li>
);

export const ProductRevenueImpact = () => {
  return (
    <ul className="flex w-full max-w-xs flex-col gap-1.5 [list-style-type:none] pointer-events-none">
      <BreakdownRow className="-rotate-1" width="72%" label="Priority" value="342" />
      <BreakdownRow className="rotate-1" width="46%" label="Severity" value="A1" />
    </ul>
  );
};

const CARD =
  "w-full border border-solid border-surface rounded-[14px] bg-surface-3 p-2.5 text-xs leading-4 pointer-events-none";

export const ProductKnowledgeGraph = () => {
  const chain = ["ICP", "Offer", "Proof", "CTA"];
  return (
    <div className={`${CARD} max-w-xs`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">Graph</span>
        <span className="text-primary font-medium">12 gaps</span>
      </div>
      <ol className="flex items-center gap-1 [list-style-type:none]">
        {chain.map((node, i) => (
          <li key={node} className="flex flex-1 items-center gap-0.5">
            <span
              className={`block flex-1 rounded-md border border-solid px-1 py-1 text-center text-[0.6875rem] ${
                node === "Proof"
                  ? "border-dashed border-primary text-primary"
                  : "border-surface bg-background"
              }`}
            >
              {node}
            </span>
            {i < chain.length - 1 && (
              <span aria-hidden="true" className="text-muted-foreground">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-2 truncate text-muted-foreground">Missing proof on /pricing</p>
    </div>
  );
};

export const ProductSearchConsole = () => {
  const rows = [
    { query: "privacy friendly analytics", clicks: "764", width: "88%" },
    { query: "cookieless analytics", clicks: "612", width: "70%" },
    { query: "ga4 alternative", clicks: "341", width: "42%" },
  ];
  return (
    <ul className="flex w-full max-w-xs flex-col gap-1.5 [list-style-type:none] pointer-events-none">
      {rows.map((r) => (
        <BreakdownRow key={r.query} width={r.width} label={r.query} value={r.clicks} />
      ))}
    </ul>
  );
};

export const ProductGA4 = () => {
  const bars = [38, 52, 44, 68, 60, 82, 74];
  return (
    <div className={`${CARD} max-w-xs`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-muted-foreground font-medium">Sessions</div>
          <div className="mt-1 font-medium tracking-[-0.4px]">6,952</div>
        </div>
        <span className="rounded-md bg-background px-1.5 py-0.5 text-[0.6875rem] text-primary font-medium">
          2.4% conv.
        </span>
      </div>
      <div className="mt-2 flex h-8 items-end gap-1" aria-hidden="true">
        {bars.map((h, i) => (
          <span
            key={i}
            className="block flex-1 rounded-sm bg-foreground opacity-30 [animation-name:siteOsBreakdownBarGrow] [animation-duration:0.72s] [animation-timing-function:ease-out] [animation-fill-mode:both]"
            style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export const ProductFixPrompts = () => {
  return (
    <div className={`${CARD} max-w-xs`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-medium">
          Missing H1 on /pricing
        </span>
        <span className="shrink-0 rounded-md bg-background px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
          A1
        </span>
      </div>
      <div className="rounded-lg bg-background p-2 text-[0.6875rem] leading-[1.0625rem] text-muted-foreground [font-family:ui-monospace,_SFMono-Regular,_Menlo,_monospace]">
        <p className="line-clamp-2">
          Add one H1 to /pricing that names the offer and the buyer it is for.
        </p>
      </div>
      <div className="mt-2 rounded-md bg-color-001 py-1.5 text-center font-medium">
        Copy prompt
      </div>
    </div>
  );
};

export const ProductGrowthBrief = () => {
  const lines = ["12 graph gaps ranked by revenue", "47 findings, 6 critical", "Next: add proof to /pricing"];
  return (
    <div className={`${CARD} max-w-xs`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">Growth brief</span>
        <span className="rounded-md bg-background px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
          PDF
        </span>
      </div>
      <ul className="flex flex-col gap-1.5 [list-style-type:none]">
        {lines.map((l) => (
          <li key={l} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="block h-2 w-2 shrink-0 rounded-xs bg-clr-7" />
            <span className="min-w-0 truncate">{l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ProductAnswerReadiness = () => {
  const checks = [
    { label: "Direct answer", pass: false },
    { label: "FAQ schema", pass: false },
    { label: "Author and date", pass: true },
  ];
  return (
    <div className={`${CARD} max-w-xs`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">AI answer readiness</span>
        <span className="text-primary font-medium">68 / 100</span>
      </div>
      <ul className="flex flex-col gap-1.5 [list-style-type:none]">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate">{c.label}</span>
            <span
              className={`shrink-0 text-[0.6875rem] font-medium ${c.pass ? "text-primary" : "text-muted-foreground"}`}
            >
              {c.pass ? "Pass" : "Fix"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ProductCitationProbe = () => {
  const rows = [
    { q: "best crm for small agencies", cited: true },
    { q: "crm with client reporting", cited: false },
    { q: "how to choose an agency crm", cited: true },
  ];
  return (
    <ul className="flex w-full max-w-xs flex-col gap-1.5 [list-style-type:none] pointer-events-none">
      {rows.map((r) => (
        <li
          key={r.q}
          className="flex items-center gap-2 rounded-lg border border-solid border-surface bg-surface-3 px-2 py-1.5 text-xs leading-4"
        >
          <span
            aria-hidden="true"
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.625rem] ${r.cited ? "bg-primary text-background" : "bg-background text-muted-foreground"}`}
          >
            {r.cited ? "✓" : "×"}
          </span>
          <span className="min-w-0 flex-1 truncate">{r.q}</span>
          <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
            {r.cited ? "Cited" : "Missed"}
          </span>
        </li>
      ))}
    </ul>
  );
};

export const ProductTopicMap = () => {
  const topics = [
    { name: "Pricing", tone: "bg-primary" },
    { name: "Integrations", tone: "bg-primary" },
    { name: "Case studies", tone: "bg-muted-foreground" },
    { name: "Security", tone: "bg-muted-foreground" },
  ];
  return (
    <div className={`${CARD} max-w-xs`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">Topic map</span>
        <span className="text-primary font-medium">2 missing</span>
      </div>
      <ul className="grid grid-cols-2 gap-1.5 [list-style-type:none]">
        {topics.map((t) => (
          <li
            key={t.name}
            className="flex items-center gap-1.5 rounded-md border border-solid border-surface bg-background px-1.5 py-1 text-[0.6875rem]"
          >
            <span aria-hidden="true" className={`block h-1.5 w-1.5 shrink-0 rounded-full ${t.tone}`} />
            <span className="min-w-0 truncate">{t.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ProductAiTraffic = () => {
  const rows = [
    { label: "ChatGPT", visits: "142", width: "88%" },
    { label: "Perplexity", visits: "61", width: "40%" },
    { label: "Gemini", visits: "24", width: "18%" },
  ];
  return (
    <ul className="flex w-full max-w-xs flex-col gap-1.5 [list-style-type:none] pointer-events-none">
      {rows.map((r) => (
        <BreakdownRow key={r.label} width={r.width} label={r.label} value={r.visits} />
      ))}
    </ul>
  );
};

/** Header mockup shown above each product tile's image, keyed by product variant. */
export const ProductHeader = ({ variant }: { variant: string }) => {
  switch (variant) {
    case "traffic-overview":
      return <ProductCrawlFindings />;
    case "conversions":
      return <ProductRevenueImpact />;
    case "pin-notes-to-specific-days-on-your-traffic":
      return <ProductKnowledgeGraph />;
    case "connect-search-console-to-see-which-querie":
      return <ProductSearchConsole />;
    case "see-who-is-on-your-site-right-now-where-th":
      return <ProductGA4 />;
    case "flag-your-not-found-page-once-then-see-bro":
      return <ProductFixPrompts />;
    case "connect-cursor-claude-code-or-codex-to-pul":
      return <ProductGrowthBrief />;
    case "ai-answer-readiness":
      return <ProductAnswerReadiness />;
    case "citation-probe":
      return <ProductCitationProbe />;
    case "topic-map":
      return <ProductTopicMap />;
    case "ai-traffic":
      return <ProductAiTraffic />;
    default:
      return null;
  }
};
