import type { ConnectorDefinition } from '@/lib/connectors/types';
import { getConnectorDefinition } from '@/lib/connectors/registry';

/** Phase 2/3 connectors — no sync yet. */
export function comingSoonSyncSkipped(id: ConnectorDefinition['id']) {
  const def = getConnectorDefinition(id);
  return {
    connectorId: id,
    outcome: 'skipped' as const,
    hasData: false,
    message: `${def.label} is coming later.`,
  };
}
