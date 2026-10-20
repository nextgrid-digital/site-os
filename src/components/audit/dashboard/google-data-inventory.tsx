import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';

/** Full GA4 event + GSC inventory for Dashboard (post-audit snapshot). */
export function GoogleDataInventory({
  connected,
}: {
  connected: ConnectedAuditMetrics | null;
}) {
  if (!connected) return null;

  const keyEvents = connected.ga4KeyEvents;
  const events = connected.ga4Events;
  const gscCountries = connected.gscByCountry.slice(0, 12);
  const gscDevices = connected.gscByDevice;
  const channelGroups = connected.ga4ChannelGroups.slice(0, 12);
  const campaigns = connected.ga4Campaigns
    .filter((c) => c.label && c.label !== '(not set)')
    .slice(0, 12);

  const hasAnything =
    keyEvents.length > 0 ||
    events.length > 0 ||
    gscCountries.length > 0 ||
    gscDevices.length > 0 ||
    channelGroups.length > 0 ||
    campaigns.length > 0;

  if (!hasAnything) {
    return (
      <div className="rounded-xl bg-raised p-4">
        <h3 className="text-sm font-semibold text-foreground">Google data inventory</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Re-run a full audit to pull key events, full event counts, campaigns, and Search Console
          country/device cuts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-raised p-4">
        <h3 className="text-sm font-semibold text-foreground">GA4 key events</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Configured conversion / key events from the property (Admin API)
        </p>
        {keyEvents.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {keyEvents.map((event) => (
              <span
                key={event.eventName}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground/90"
              >
                {event.eventName}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No key events returned from Admin API. Mark events as key events in GA4 to track
            conversions.
          </p>
        )}
      </div>

      <div className="rounded-xl bg-raised p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Event inventory</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ordered by event count · key events highlighted
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{events.length} events in window</p>
        </div>
        {events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Event</th>
                  <th className="pb-2 text-right font-medium">Count</th>
                  <th className="pb-2 text-right font-medium">Sessions</th>
                  <th className="pb-2 text-right font-medium">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 40).map((event) => (
                  <tr key={event.eventName} className="border-t border-border">
                    <td className="py-2 pr-2 font-medium text-foreground">
                      {event.eventName}
                      {event.isKeyEvent ? (
                        <span className="ml-2 text-[11px] font-semibold tracking-wide text-success-ink uppercase">
                          key
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 text-right tabular-nums text-foreground/80">
                      {event.eventCount.toLocaleString()}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {event.sessions.toLocaleString()}
                    </td>
                    <td className="py-2 text-right tabular-nums text-foreground/80">
                      {event.conversions.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No events in this audit window.</p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InventoryTable
          title="GA4 channel groups"
          empty="No sessionDefaultChannelGroup rows yet."
          nameLabel="Channel"
          columns={['Sessions', 'Conversions']}
          rows={channelGroups.map((row) => ({
            label: row.label,
            values: [row.sessions, row.conversions],
          }))}
        />
        <InventoryTable
          title="GA4 campaigns"
          empty="No campaign traffic in this window."
          nameLabel="Campaign"
          columns={['Sessions', 'Conversions']}
          rows={campaigns.map((row) => ({
            label: row.label,
            values: [row.sessions, row.conversions],
          }))}
        />
        <InventoryTable
          title="Search Console by country"
          empty="No GSC country rows yet — re-run full audit."
          nameLabel="Country"
          columns={['Clicks', 'Impressions']}
          rows={gscCountries.map((row) => ({
            label: row.label,
            values: [row.clicks, row.impressions],
          }))}
        />
        <InventoryTable
          title="Search Console by device"
          empty="No GSC device rows yet — re-run full audit."
          nameLabel="Device"
          columns={['Clicks', 'Impressions']}
          rows={gscDevices.map((row) => ({
            label: row.label,
            values: [row.clicks, row.impressions],
          }))}
        />
      </div>
    </div>
  );
}

function InventoryTable({
  title,
  empty,
  nameLabel,
  columns,
  rows,
}: {
  title: string;
  empty: string;
  nameLabel: string;
  columns: string[];
  rows: Array<{ label: string; values: number[] }>;
}) {
  return (
    <div className="rounded-xl bg-raised p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {rows.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="pb-2 font-medium">{nameLabel}</th>
                {columns.map((col) => (
                  <th key={col} className="pb-2 text-right font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="max-w-[14rem] truncate py-2 pr-2 font-medium text-foreground">
                    {row.label}
                  </td>
                  {row.values.map((value, i) => (
                    <td
                      key={`${row.label}-${columns[i]}`}
                      className={`py-2 text-right tabular-nums ${
                        i === 0 ? 'text-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {value.toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
