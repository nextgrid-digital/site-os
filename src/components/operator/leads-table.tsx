'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { LEAD_STAGES, LEAD_STATUSES, leadStageLabel, leadStatusLabel } from '@/lib/leads';
import type { Lead, LeadStage, LeadStatus } from '@/lib/supabase/types';
import { toast } from 'sonner';

function emptyDraft() {
  return {
    name: '',
    email: '',
    company: '',
    channel: '',
    source: '',
    medium: '',
    campaign: '',
    stage: 'new' as LeadStage,
    status: 'open' as LeadStatus,
    value: '',
    notes: '',
  };
}

export function LeadsTable({
  projectId,
  initialLeads,
}: {
  projectId: string;
  initialLeads: Lead[];
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [draft, setDraft] = useState(emptyDraft);
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    return {
      total: leads.length,
      open: leads.filter((lead) => lead.status !== 'closed').length,
    };
  }, [leads]);

  function updateDraft<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function createLead() {
    if (!draft.name.trim()) {
      toast.error('Lead name is required');
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          value: draft.value.trim() ? Number(draft.value) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to create lead');
        return;
      }
      setLeads((prev) => [json.lead as Lead, ...prev]);
      setDraft(emptyDraft());
      router.refresh();
      toast.success('Lead added');
    });
  }

  async function updateLeadField(leadId: string, field: 'stage' | 'status', value: string) {
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update lead');
        return;
      }
      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? (json.lead as Lead) : lead)));
      router.refresh();
      toast.success('Lead updated');
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <p className="mb-2 text-sm font-medium text-white">Add lead</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Name" value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} />
            <Input placeholder="Company" value={draft.company} onChange={(e) => updateDraft('company', e.target.value)} />
            <Input placeholder="Email" value={draft.email} onChange={(e) => updateDraft('email', e.target.value)} />
            <Input placeholder="Channel" value={draft.channel} onChange={(e) => updateDraft('channel', e.target.value)} />
            <Input placeholder="Source" value={draft.source} onChange={(e) => updateDraft('source', e.target.value)} />
            <Input placeholder="Medium" value={draft.medium} onChange={(e) => updateDraft('medium', e.target.value)} />
            <Input placeholder="Campaign" value={draft.campaign} onChange={(e) => updateDraft('campaign', e.target.value)} />
            <Input placeholder="Expected value" value={draft.value} onChange={(e) => updateDraft('value', e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Pipeline defaults</p>
          <select
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={draft.stage}
            onChange={(e) => updateDraft('stage', e.target.value as LeadStage)}
          >
            {LEAD_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {leadStageLabel(stage)}
              </option>
            ))}
          </select>
          <select
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={draft.status}
            onChange={(e) => updateDraft('status', e.target.value as LeadStatus)}
          >
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabel(status)}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {totals.total} leads tracked, {totals.open} still active.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Notes</p>
          <Textarea
            placeholder="Context, next step, owner, or qualification notes"
            value={draft.notes}
            onChange={(e) => updateDraft('notes', e.target.value)}
          />
          <Button onClick={createLead} disabled={pending}>
            Add lead
          </Button>
        </div>
      </div>

      {leads.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Source / Medium</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.company ?? lead.email ?? 'No company or email'}</p>
                  </div>
                </TableCell>
                <TableCell>{lead.channel}</TableCell>
                <TableCell>{[lead.source, lead.medium].filter(Boolean).join('/') || '—'}</TableCell>
                <TableCell>
                  <select
                    className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                    value={lead.stage}
                    onChange={(e) => updateLeadField(lead.id, 'stage', e.target.value)}
                    disabled={pending}
                  >
                    {LEAD_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {leadStageLabel(stage)}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <select
                    className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                    value={lead.status}
                    onChange={(e) => updateLeadField(lead.id, 'status', e.target.value)}
                    disabled={pending}
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {leadStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-right">{lead.value != null ? lead.value.toFixed(0) : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-2xl bg-zinc-50 px-6 py-8 text-sm text-zinc-600">
          No CRM leads yet — traffic and GA4 conversions live on Dashboard. Add a lead here to
          track stage and status.
        </div>
      )}
    </div>
  );
}
