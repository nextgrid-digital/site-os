"use client";

import { useCallback, useEffect, useState } from "react";
import type { ValueSettings } from "@/lib/audit/opportunity";
import type { FixActionView } from "@/lib/db/fix-actions";
import type { JoinedChainBreak } from "@/lib/audit/joined-traffic-story";

async function readJson<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok)
    throw new Error(body.error ?? "Something went wrong. Try again.");
  return body;
}

export function fixKey(issueId: string, target: string) {
  return `${issueId}::${target}`;
}

/** Done-state and before/after proof for the Issues section. */
export function useFixActions(projectId: string) {
  const [actions, setActions] = useState<FixActionView[]>([]);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const base = `/api/projects/${projectId}/fix-actions`;

  useEffect(() => {
    let cancelled = false;
    fetch(base)
      .then((res) => readJson<{ actions: FixActionView[] }>(res))
      .then((body) => {
        if (!cancelled) setActions(body.actions);
      })
      // Tracking is an extra: the issue list still works if this fails to load.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [base]);

  const run = useCallback(
    async (key: string, request: () => Promise<Response>) => {
      setPendingKey(key);
      setError(null);
      try {
        const body = await readJson<{ actions: FixActionView[] }>(
          await request(),
        );
        setActions(body.actions);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Something went wrong. Try again.",
        );
      } finally {
        setPendingKey(null);
      }
    },
    [],
  );

  const markDone = useCallback(
    (item: JoinedChainBreak) =>
      run(fixKey(item.id, item.target), () =>
        fetch(base, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueId: item.id,
            target: item.target,
            targetKind: item.targetKind,
            title: item.title,
          }),
        }),
      ),
    [base, run],
  );

  const reopen = useCallback(
    (item: JoinedChainBreak) =>
      run(fixKey(item.id, item.target), () =>
        fetch(
          `${base}?issueId=${encodeURIComponent(item.id)}&target=${encodeURIComponent(item.target)}`,
          { method: "DELETE" },
        ),
      ),
    [base, run],
  );

  return { actions, pendingKey, error, markDone, reopen };
}

/** What one conversion is worth, used to turn missed conversions into money. */
export function useValueSettings(projectId: string) {
  const [settings, setSettings] = useState<ValueSettings>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = `/api/projects/${projectId}/value-settings`;

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => readJson<{ settings: ValueSettings }>(res))
      .then((body) => {
        if (!cancelled) setSettings(body.settings);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

  const save = useCallback(
    async (valuePerConversion: number | null, currency = "USD") => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valuePerConversion, currency }),
        });
        const body = await readJson<{ settings: ValueSettings }>(res);
        setSettings(body.settings);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save. Try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [url],
  );

  return { settings, saving, error, save };
}
