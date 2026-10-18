'use client';

import {
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';

import type {  ConnectorStatus } from '@/lib/connectors/types';
import { getConnectorDefinition } from '@/lib/connectors/registry';

export function stateLabel(state: ConnectorStatus['state']) {
  switch (state) {
    case 'connected':
      return 'Connected';
    case 'partial':
      return 'Partial';
    case 'disconnected':
      return 'Not connected';
    case 'error':
      return 'Error';
    case 'coming_soon':
      return 'Coming soon';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function stateClass(state: ConnectorStatus['state']) {
  switch (state) {
    case 'connected':
      return 'bg-emerald-50 text-emerald-800';
    case 'partial':
      return 'bg-amber-50 text-amber-900';
    case 'coming_soon':
      return 'bg-zinc-50 text-zinc-500';
    case 'error':
      return 'bg-red-50 text-red-800';
    case 'disconnected':
      return 'bg-zinc-50 text-zinc-600';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function iconShellClass(state: ConnectorStatus['state']) {
  switch (state) {
    case 'connected':
      return 'bg-emerald-50 text-emerald-700';
    case 'partial':
      return 'bg-amber-50 text-amber-800';
    case 'error':
      return 'bg-red-50 text-red-700';
    case 'coming_soon':
      return 'bg-zinc-100 text-zinc-400';
    case 'disconnected':
      return 'bg-zinc-100 text-zinc-500';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function formatSync(iso: string | null) {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
}

export function signalRows(status: ConnectorStatus): string[] {
  const def = getConnectorDefinition(status.connectorId);
  if (status.availableSignals.length > 0) {
    return status.availableSignals.slice(0, 4);
  }
  return def.signals.slice(0, 4);
}

