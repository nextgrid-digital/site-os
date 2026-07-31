'use client';

import {
  Activity,
  Eye,
  FileText,
  Globe,
  Link2,
  Mail,
  Monitor,
  MousePointerClick,
  Radio,
  Search,
  Share2,
  Smartphone,
  Tablet,
  UserPlus,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { AnalyticsRowKind } from '@/lib/audit/connected-analytics';
import { cn } from '@/lib/utils';

/** Compact country name → flag emoji (GA4 returns English names). */
const COUNTRY_FLAGS: Record<string, string> = {
  'united states': '🇺🇸',
  usa: '🇺🇸',
  us: '🇺🇸',
  germany: '🇩🇪',
  'united kingdom': '🇬🇧',
  uk: '🇬🇧',
  spain: '🇪🇸',
  canada: '🇨🇦',
  france: '🇫🇷',
  india: '🇮🇳',
  australia: '🇦🇺',
  brazil: '🇧🇷',
  netherlands: '🇳🇱',
  italy: '🇮🇹',
  japan: '🇯🇵',
  mexico: '🇲🇽',
  sweden: '🇸🇪',
  poland: '🇵🇱',
  singapore: '🇸🇬',
  ireland: '🇮🇪',
  switzerland: '🇨🇭',
  austria: '🇦🇹',
  belgium: '🇧🇪',
  portugal: '🇵🇹',
  norway: '🇳🇴',
  denmark: '🇩🇰',
  finland: '🇫🇮',
  'new zealand': '🇳🇿',
  'south korea': '🇰🇷',
  korea: '🇰🇷',
  china: '🇨🇳',
  indonesia: '🇮🇩',
  philippines: '🇵🇭',
  israel: '🇮🇱',
  'united arab emirates': '🇦🇪',
  uae: '🇦🇪',
};

function looksLikeHost(label: string) {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(label.trim()) || label.includes('.com') || label.includes('.co');
}

function channelIcon(label: string): { Icon: LucideIcon; color: string; bg: string } {
  const l = label.toLowerCase();
  if (l.includes('direct')) return { Icon: Link2, color: 'text-zinc-700', bg: 'bg-zinc-100' };
  if (l.includes('organic') || l.includes('search'))
    return { Icon: Search, color: 'text-sky-700', bg: 'bg-sky-50' };
  if (l.includes('social')) return { Icon: Share2, color: 'text-violet-700', bg: 'bg-violet-50' };
  if (l.includes('email')) return { Icon: Mail, color: 'text-amber-700', bg: 'bg-amber-50' };
  if (l.includes('paid') || l.includes('cpc'))
    return { Icon: MousePointerClick, color: 'text-rose-700', bg: 'bg-rose-50' };
  if (l.includes('referral')) return { Icon: Globe, color: 'text-emerald-700', bg: 'bg-emerald-50' };
  return { Icon: Globe, color: 'text-zinc-600', bg: 'bg-zinc-100' };
}

function deviceIcon(label: string): { Icon: LucideIcon; color: string; bg: string } {
  const l = label.toLowerCase();
  if (l.includes('mobile')) return { Icon: Smartphone, color: 'text-indigo-700', bg: 'bg-indigo-50' };
  if (l.includes('tablet')) return { Icon: Tablet, color: 'text-fuchsia-700', bg: 'bg-fuchsia-50' };
  return { Icon: Monitor, color: 'text-cyan-700', bg: 'bg-cyan-50' };
}

function browserStyle(label: string): { letter: string; color: string; bg: string } {
  const l = label.toLowerCase();
  if (l.includes('chrome')) return { letter: 'C', color: 'text-yellow-800', bg: 'bg-yellow-100' };
  if (l.includes('safari')) return { letter: 'S', color: 'text-blue-800', bg: 'bg-blue-100' };
  if (l.includes('firefox')) return { letter: 'F', color: 'text-orange-800', bg: 'bg-orange-100' };
  if (l.includes('edge')) return { letter: 'E', color: 'text-sky-800', bg: 'bg-sky-100' };
  if (l.includes('opera')) return { letter: 'O', color: 'text-red-800', bg: 'bg-red-100' };
  return {
    letter: (label[0] || '?').toUpperCase(),
    color: 'text-zinc-700',
    bg: 'bg-zinc-100',
  };
}

function eventIcon(label: string): { Icon: LucideIcon; color: string; bg: string } {
  const l = label.toLowerCase();
  if (l.includes('generate_lead') || l.includes('lead') || l.includes('purchase') || l.includes('sign'))
    return { Icon: Zap, color: 'text-amber-700', bg: 'bg-amber-50' };
  if (l.includes('page_view') || l.includes('view'))
    return { Icon: Eye, color: 'text-sky-700', bg: 'bg-sky-50' };
  if (l.includes('session_start') || l.includes('session'))
    return { Icon: Activity, color: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (l.includes('first_visit') || l.includes('first'))
    return { Icon: UserPlus, color: 'text-violet-700', bg: 'bg-violet-50' };
  if (l.includes('engagement') || l.includes('scroll') || l.includes('click'))
    return { Icon: MousePointerClick, color: 'text-rose-700', bg: 'bg-rose-50' };
  return { Icon: Radio, color: 'text-zinc-700', bg: 'bg-zinc-100' };
}

function LucideMark({
  Icon,
  color,
  bg,
  className,
}: {
  Icon: LucideIcon;
  color: string;
  bg: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-md',
        bg,
        className
      )}
      aria-hidden
    >
      <Icon className={cn('size-3', color)} strokeWidth={2.25} />
    </span>
  );
}

export function AnalyticsRowIcon({
  kind,
  label,
  className,
}: {
  kind: AnalyticsRowKind;
  label: string;
  className?: string;
}) {
  switch (kind) {
    case 'page':
      return (
        <LucideMark Icon={FileText} color="text-zinc-600" bg="bg-zinc-100" className={className} />
      );
    case 'search':
      return (
        <LucideMark Icon={Search} color="text-sky-700" bg="bg-sky-50" className={className} />
      );
    case 'source': {
      if (looksLikeHost(label)) {
        const domain = label.replace(/^https?:\/\//, '').split('/')[0] ?? label;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`}
            alt=""
            width={20}
            height={20}
            className={cn('size-5 shrink-0 rounded-sm object-contain', className)}
            aria-hidden
          />
        );
      }
      const ch = channelIcon(label);
      return <LucideMark Icon={ch.Icon} color={ch.color} bg={ch.bg} className={className} />;
    }
    case 'country': {
      const flag = COUNTRY_FLAGS[label.trim().toLowerCase()];
      if (flag) {
        return (
          <span
            className={cn(
              'inline-flex size-5 shrink-0 items-center justify-center text-sm leading-none',
              className
            )}
            aria-hidden
          >
            {flag}
          </span>
        );
      }
      return (
        <LucideMark Icon={Globe} color="text-emerald-700" bg="bg-emerald-50" className={className} />
      );
    }
    case 'device': {
      const d = deviceIcon(label);
      return <LucideMark Icon={d.Icon} color={d.color} bg={d.bg} className={className} />;
    }
    case 'browser': {
      const b = browserStyle(label);
      return (
        <span
          className={cn(
            'inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold',
            b.bg,
            b.color,
            className
          )}
          aria-hidden
        >
          {b.letter}
        </span>
      );
    }
    case 'event': {
      const e = eventIcon(label);
      return <LucideMark Icon={e.Icon} color={e.color} bg={e.bg} className={className} />;
    }
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
