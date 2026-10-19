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
import { GoogleAdsIcon, GoogleAnalyticsIcon, GoogleSearchIcon } from '@/components/icons';
import type { ConnectorId, } from '@/lib/connectors/types';

export const CONNECTOR_ICONS: Record<
  ConnectorId,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  website: Globe2,
  search_console: GoogleSearchIcon,
  ga4: GoogleAnalyticsIcon,
  google_ads: GoogleAdsIcon,
  instagram: AtSign,
  x: AtSign,
  youtube: Video,
  tiktok: Video,
};
