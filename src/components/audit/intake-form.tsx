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

const SUCCESS_OPTIONS = [
  { value: 'qualified_leads', label: 'More qualified leads' },
  { value: 'higher_conversion', label: 'Higher conversion rate' },
  { value: 'lower_cpl', label: 'Lower cost per lead' },
  { value: 'demo_bookings', label: 'More demo bookings' },
  { value: 'more_revenue', label: 'More revenue' },
  { value: 'funnel_visibility', label: 'Better funnel visibility' },
];

const CONVERSION_OPTIONS = [
  { value: 'demo_requests', label: 'Demo requests' },
  { value: 'form_fills', label: 'Form fills' },
  { value: 'purchases', label: 'Purchases' },
  { value: 'signups', label: 'Signups' },
  { value: 'booked_calls', label: 'Booked calls' },
  { value: 'newsletter', label: 'Newsletter signups' },
];

const BUYER_OPTIONS = [
  { value: 'founders', label: 'Founders / owners' },
  { value: 'marketing_leaders', label: 'Marketing leaders' },
  { value: 'sales_leaders', label: 'Sales leaders' },
  { value: 'product_managers', label: 'Product managers' },
  { value: 'agency_buyers', label: 'Agency buyers' },
  { value: 'consumers', label: 'Consumers / end users' },
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

const PROBLEM_OPTIONS = [
  { value: 'not_enough_traffic', label: 'Not enough traffic' },
  { value: 'traffic_doesnt_convert', label: "Traffic doesn't convert" },
  { value: 'weak_messaging', label: 'Weak messaging' },
  { value: 'unclear_funnel', label: 'Unclear funnel' },
  { value: 'poor_seo', label: 'Poor SEO visibility' },
  { value: 'trust_gaps', label: 'Trust / proof gaps' },
  { value: 'ux_issues', label: 'Slow pages / UX issues' },
];

const PAGE_OPTIONS = [
  { value: 'homepage', label: 'Homepage' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'product', label: 'Product / services' },
  { value: 'demo_contact', label: 'Demo / contact' },
  { value: 'blog', label: 'Blog / content' },
  { value: 'landing_pages', label: 'Landing pages' },
];

interface IntakeFormProps {
  projectId: string;
}

type MultiKey =
  | 'goal_categories'
  | 'success_metrics'
  | 'conversion_types'
  | 'primary_buyers'
  | 'priority_channels'
  | 'funnel_stages'
  | 'problems'
  | 'priority_pages';

export function IntakeForm({ projectId }: IntakeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Record<MultiKey, string[]>>({
    goal_categories: [],
    success_metrics: [],
    conversion_types: [],
    primary_buyers: [],
    priority_channels: [],
    funnel_stages: [],
    problems: [],
    priority_pages: [],
  });

  function toggle(field: MultiKey, value: string) {
    setForm((prev) => {
      const selected = prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value];
      return { ...prev, [field]: selected };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/audit/${projectId}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_category: form.goal_categories[0] ?? 'leads',
          goal_categories: form.goal_categories,
          business_goal: joinOrNull(form.goal_categories),
          success_metric: joinOrNull(form.success_metrics),
          conversion_type: joinOrNull(form.conversion_types),
          primary_buyer: joinOrNull(form.primary_buyers),
          priority_channel: joinOrNull(form.priority_channels),
          funnel_stage_focus: joinOrNull(form.funnel_stages),
          problem_statement: joinOrNull(form.problems),
          priority_pages: joinOrNull(form.priority_pages),
        }),
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
      <div className="space-y-5">
        <Field label="What are your main business goals?">
          <ChipGroup
            options={GOAL_OPTIONS}
            selected={form.goal_categories}
            onToggle={(v) => toggle('goal_categories', v)}
            ariaLabel="Business goals"
          />
        </Field>

        <Field label="What counts as success for you?">
          <ChipGroup
            options={SUCCESS_OPTIONS}
            selected={form.success_metrics}
            onToggle={(v) => toggle('success_metrics', v)}
            ariaLabel="Success metrics"
          />
        </Field>

        <Field label="What types of leads or conversions matter?">
          <ChipGroup
            options={CONVERSION_OPTIONS}
            selected={form.conversion_types}
            onToggle={(v) => toggle('conversion_types', v)}
            ariaLabel="Conversion types"
          />
        </Field>

        <Field label="Who are your primary buyers?">
          <ChipGroup
            options={BUYER_OPTIONS}
            selected={form.primary_buyers}
            onToggle={(v) => toggle('primary_buyers', v)}
            ariaLabel="Primary buyers"
          />
        </Field>

        <Field label="Which channels matter most?">
          <ChipGroup
            options={CHANNEL_OPTIONS}
            selected={form.priority_channels}
            onToggle={(v) => toggle('priority_channels', v)}
            ariaLabel="Priority channels"
          />
        </Field>

        <Field label="Which funnel stages matter most?">
          <ChipGroup
            options={FUNNEL_STAGES}
            selected={form.funnel_stages}
            onToggle={(v) => toggle('funnel_stages', v)}
            ariaLabel="Funnel stages"
          />
        </Field>

        <Field label="What problems do you want solved?">
          <ChipGroup
            options={PROBLEM_OPTIONS}
            selected={form.problems}
            onToggle={(v) => toggle('problems', v)}
            ariaLabel="Problems to solve"
          />
        </Field>

        <Field label="Which pages or offers matter most?">
          <ChipGroup
            options={PAGE_OPTIONS}
            selected={form.priority_pages}
            onToggle={(v) => toggle('priority_pages', v)}
            ariaLabel="Priority pages"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit requirements'}
      </button>

      {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
    </form>
  );
}

function joinOrNull(values: string[]) {
  return values.length ? values.join(',') : null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
  ariaLabel,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const isSelected = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(o.value)}
            className={
              isSelected
                ? 'rounded-xl  bg-zinc-950 px-3.5 py-2 text-sm font-medium text-white transition'
                : 'rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50'
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
