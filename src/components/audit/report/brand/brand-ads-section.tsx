'use client';

import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { BrandEmptyState } from '@/components/audit/report/brand/brand-section-nav';
import { SectionHeading } from '@/components/audit/report/section-heading';

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function BrandAdsSection({
  connected,
  connectHref,
}: {
  connected: ConnectedAuditMetrics | null;
  connectHref: string;
}) {
  const ads = connected?.googleAds;
  const mapped = Boolean(connected?.adsConnected);

  if (!mapped) {
    return (
      <section id="ads" className="block scroll-mt-24 pt-4">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-12">
          <SectionHeading
            title="Ads"
            lead="Campaign and keyword efficiency once Google Ads is mapped."
          />
          <BrandEmptyState
            title="Google Ads not connected"
            body="Connect Ads in Setup, then re-run a full audit."
            connectHref={connectHref}
          />
        </div>
      </section>
    );
  }

  if (!ads || (ads.campaigns.length === 0 && ads.spend <= 0)) {
    return (
      <section id="ads" className="block scroll-mt-24 pt-4">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-12">
          <SectionHeading
            title="Ads"
            lead={`Account ${connected?.adsAccountLabel ?? 'mapped'} — waiting for campaign data.`}
          />
          <BrandEmptyState
            title="No Ads data in this audit"
            body="Account mapped — re-run a full audit to pull campaigns."
            connectHref={connectHref}
          />
        </div>
      </section>
    );
  }

  return (
    <section id="ads" className="block scroll-mt-24 pt-4">
      <div className="mx-auto max-w-280 space-y-8 px-8 py-12">
        <SectionHeading
          title="Ads"
          lead={`${connected?.adsAccountLabel ?? 'Google Ads'} · ~${money(ads.spend)} spend · ${money(ads.conversions)} conversions`}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] bg-white p-4">
            <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Spend</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{money(ads.spend)}</p>
          </div>
          <div className="rounded-[14px] bg-white p-4">
            <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Conversions</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{money(ads.conversions)}</p>
          </div>
          <div className="rounded-[14px] bg-white p-4">
            <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Waste signals</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{ads.wasteSignals.length}</p>
          </div>
        </div>

        {ads.campaigns.length > 0 ? (
          <div className="overflow-x-auto rounded-[14px]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-[11px] tracking-wide text-zinc-500 uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Campaign</th>
                  <th className="px-3 py-2 font-medium">Clicks</th>
                  <th className="px-3 py-2 font-medium">Spend</th>
                  <th className="px-3 py-2 font-medium">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {ads.campaigns.slice(0, 12).map((c) => (
                  <tr key={c.campaignId || c.campaignName} className="border-t border-zinc-100">
                    <td className="px-3 py-2 font-medium text-zinc-900">{c.campaignName}</td>
                    <td className="px-3 py-2 tabular-nums">{money(c.clicks)}</td>
                    <td className="px-3 py-2 tabular-nums">{money(c.costMicros / 1_000_000)}</td>
                    <td className="px-3 py-2 tabular-nums">{money(c.conversions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {ads.wasteSignals.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-950">Wasted spend</h3>
            <ul className="space-y-2">
              {ads.wasteSignals.slice(0, 6).map((w) => (
                <li
                  key={`${w.kind}-${w.label}`}
                  className="rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                >
                  <span className="font-medium">{w.label}</span>
                  <span className="text-amber-800"> — {w.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {ads.landingMismatches.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-950">Ad intent vs landing page</h3>
            <ul className="space-y-2">
              {ads.landingMismatches.slice(0, 6).map((m) => (
                <li
                  key={m.landingPath + m.finalUrl}
                  className="rounded-[12px] bg-white px-3 py-2 text-sm"
                >
                  <p className="font-medium text-zinc-900">{m.landingPath}</p>
                  <p className="mt-0.5 text-zinc-500">{m.meaning}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
