export type SourceSyncResult =
  | { status: 'synced'; count: number }
  /** The client did not grant this feature on the consent screen. */
  | { status: 'missing_scope' }
  /** The API call failed. Previously synced data is kept. */
  | { status: 'error'; message: string };

export type SourceOutcome<T> = {
  result: SourceSyncResult;
  /** Fresh rows, or null when the previous data should be kept or cleared. */
  rows: T[] | null;
};

/**
 * Run one Google source without letting it break the others. A source that
 * wasn't granted is reported as missing; a failing call is reported with its
 * message so the client can see why.
 */
export async function loadSource<T>(options: {
  label: string;
  granted: boolean;
  load: () => Promise<T[]>;
}): Promise<SourceOutcome<T>> {
  if (!options.granted) return { result: { status: 'missing_scope' }, rows: null };
  try {
    const rows = await options.load();
    return { result: { status: 'synced', count: rows.length }, rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google request failed.';
    console.error(`[google] ${options.label} sync failed`, message);
    return { result: { status: 'error', message }, rows: null };
  }
}
