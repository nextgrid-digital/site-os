'use client';

import type { ComponentType } from 'react';
import {
  AtSign,
  BarChart3,
  Globe2,
  Megaphone,
  Search,
  Video,
} from 'lucide-react';
import type { ConnectorId, } from '@/lib/connectors/types';

export const CONNECTOR_ICONS: Record<
  ConnectorId,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  website: Globe2,
  search_console: Search,
  ga4: BarChart3,
  google_ads: Megaphone,
  instagram: AtSign,
  x: AtSign,
  youtube: Video,
  tiktok: Video,
};
