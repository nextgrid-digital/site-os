import { format, subDays } from 'date-fns';
import { NextResponse } from 'next/server';
import {
  AI_REFERRAL_WINDOW_DAYS,
  summarizeAiReferrals,
} from '@/lib/aeo/ai-referrals';
import { getSelectedGa4Property, loadAiReferrals, saveAiReferrals } from '@/lib/db/aeo';
import { requireSignedInSession, SessionRequiredError } from '@/lib/db/profiles';
import { ProjectAccessError, requireProjectOwner } from '@/lib/db/projects';
import { fetchGa4AiReferrals, fetchGa4Overview } from '@/lib/google/ga4';
import { getFreshGoogleConnection } from '@/lib/google/fresh-connection';
import { getAuthorizedClient, GOOGLE_ANALYTICS_SCOPE } from '@/lib/google/oauth';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { GoogleConnection } from '@/lib/supabase/types';

export const maxDuration = 60;

const REFRESH_COOLDOWN_MS = 60_000;

type RouteContext = { params: Promise<{ projectId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }
    const { projectId } = await context.params;
    await requireSignedInSession();
    await requireProjectOwner(projectId);

    const property = await getSelectedGa4Property(projectId);
    if (!property?.connection_id) {
      return NextResponse.json({ error: 'Connect Google Analytics first.' }, { status: 409 });
    }

    const existing = await loadAiReferrals(projectId);
    if (existing && Date.now() - new Date(existing.fetchedAt).getTime() < REFRESH_COOLDOWN_MS) {
      return NextResponse.json({ error: 'Please wait a moment before refreshing.' }, { status: 429 });
    }

    // The property row is project-scoped, but never trust a connection that
    // belongs to another project.
    const { data: row } = await getSupabaseAdmin()
      .from('google_connections')
      .select('*')
      .eq('id', property.connection_id)
      .eq('project_id', projectId)
      .maybeSingle();
    const stored = row as GoogleConnection | null;
    if (!stored) {
      return NextResponse.json({ error: 'Google connection not found. Reconnect Google.' }, { status: 409 });
    }
    if (!(stored.scopes ?? []).includes(GOOGLE_ANALYTICS_SCOPE)) {
      return NextResponse.json(
        { error: 'Google Analytics access was not granted. Reconnect and tick Analytics.' },
        { status: 409 }
      );
    }

    const { connection, needsReconnect } = await getFreshGoogleConnection(stored);
    if (needsReconnect) {
      return NextResponse.json({ error: 'Google access expired. Reconnect Google.' }, { status: 409 });
    }
    const auth = getAuthorizedClient({
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
      expiry_date: connection.token_expiry ? new Date(connection.token_expiry).getTime() : null,
    });

    const rangeEnd = format(new Date(), 'yyyy-MM-dd');
    const rangeStart = format(subDays(new Date(), AI_REFERRAL_WINDOW_DAYS), 'yyyy-MM-dd');
    let data;
    try {
      const [referrals, overview] = await Promise.all([
        fetchGa4AiReferrals(auth, property.property_id, rangeStart, rangeEnd),
        fetchGa4Overview(auth, property.property_id, rangeStart, rangeEnd),
      ]);
      data = summarizeAiReferrals({
        ...referrals,
        totalSessions: overview?.sessions ?? 0,
        rangeStart,
        rangeEnd,
      });
    } catch (error) {
      console.error('[ai-referrals] GA4 fetch failed', error);
      return NextResponse.json(
        { error: 'Google Analytics did not return data. Try again in a moment.' },
        { status: 502 }
      );
    }

    const fetchedAt = await saveAiReferrals(projectId, data);
    return NextResponse.json({ aiReferrals: { data, fetchedAt } });
  } catch (error) {
    if (error instanceof SessionRequiredError || error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI traffic failed.' },
      { status: 500 }
    );
  }
}
