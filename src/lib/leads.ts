import type { LeadStage, LeadStatus } from '@/lib/supabase/types';

export const LEAD_STAGES: LeadStage[] = ['new', 'qualified', 'proposal', 'won', 'lost'];
export const LEAD_STATUSES: LeadStatus[] = ['open', 'follow_up', 'stalled', 'closed'];

export function leadStageLabel(stage: LeadStage) {
  switch (stage) {
    case 'new':
      return 'New';
    case 'qualified':
      return 'Qualified';
    case 'proposal':
      return 'Proposal';
    case 'won':
      return 'Won';
    case 'lost':
      return 'Lost';
    default: {
      const _exhaustive: never = stage;
      return _exhaustive;
    }
  }
}

export function leadStatusLabel(status: LeadStatus) {
  switch (status) {
    case 'open':
      return 'Open';
    case 'follow_up':
      return 'Follow up';
    case 'stalled':
      return 'Stalled';
    case 'closed':
      return 'Closed';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
