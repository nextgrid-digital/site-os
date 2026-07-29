'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GOAL_OPTIONS = [
  { value: 'leads', label: 'More leads' },
  { value: 'signups', label: 'More signups' },
  { value: 'sales', label: 'More sales' },
  { value: 'traffic', label: 'More traffic' },
  { value: 'funnel_clarity', label: 'Funnel clarity' },
];

const CHANNEL_OPTIONS = [
  { value: 'organic_search', label: 'Organic search' },
  { value: 'paid', label: 'Paid ads' },
  { value: 'social', label: 'Social media' },
  { value: 'email', label: 'Email' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct', label: 'Direct' },
];

const FUNNEL_STAGES = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'consideration', label: 'Consideration' },
  { value: 'decision', label: 'Decision' },
  { value: 'retention', label: 'Retention' },
];

interface IntakeFormProps {
  projectId: string;
}

export function IntakeForm({ projectId }: IntakeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    goal_category: 'leads',
    business_goal: '',
    success_metric: '',
    conversion_type: '',
    primary_buyer: '',
    priority_channel: '',
    funnel_stage_focus: '',
    problem_statement: '',
    priority_pages: '',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/audit/${projectId}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
        return;
      }
      router.push(`/audit/${projectId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Field label="What is your main business goal?">
          <select
            value={form.goal_category}
            onChange={(e) => update('goal_category', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          >
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="What counts as success for you?">
          <input
            type="text"
            value={form.success_metric}
            onChange={(e) => update('success_metric', e.target.value)}
            placeholder="e.g. 50 qualified leads per month"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </Field>

        <Field label="What type of leads or conversions matter?">
          <input
            type="text"
            value={form.conversion_type}
            onChange={(e) => update('conversion_type', e.target.value)}
            placeholder="e.g. demo requests, form fills, purchases"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </Field>

        <Field label="Who is your primary buyer?">
          <input
            type="text"
            value={form.primary_buyer}
            onChange={(e) => update('primary_buyer', e.target.value)}
            placeholder="e.g. Marketing directors at mid-market SaaS companies"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </Field>

        <Field label="What channel matters most?">
          <select
            value={form.priority_channel}
            onChange={(e) => update('priority_channel', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Select a channel</option>
            {CHANNEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="What stage of the funnel matters most?">
          <select
            value={form.funnel_stage_focus}
            onChange={(e) => update('funnel_stage_focus', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Select a stage</option>
            {FUNNEL_STAGES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="What problem do you want solved?">
          <textarea
            value={form.problem_statement}
            onChange={(e) => update('problem_statement', e.target.value)}
            placeholder="Describe the challenge you're facing…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </Field>

        <Field label="What pages or offers matter most?">
          <input
            type="text"
            value={form.priority_pages}
            onChange={(e) => update('priority_pages', e.target.value)}
            placeholder="e.g. /pricing, /demo, /product"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit requirements'}
      </button>

      {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
