import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getStoredGoogleInventory,
  listGoogleInventoryCandidates,
  syncGoogleConnectionInventory,
} from '@/lib/db/google-inventory';
import { listUnlockedAuditSessionsForUser } from '@/lib/db/audit-sessions';
import { hasSupabaseConfig } from '@/lib/supabase/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const auth = createClient(cookieStore);
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const sessions = await listUnlockedAuditSessionsForUser(user.id);
    const existingDomains = sessions.map((s) => s.domain).filter(Boolean);
    const stored = await getStoredGoogleInventory(user.id);
    const candidates = await listGoogleInventoryCandidates(user.id, existingDomains);

    return NextResponse.json({
      connected: stored?.connected ?? false,
      operatorEmail: stored?.operatorEmail ?? null,
      syncedAt: stored?.syncedAt ?? null,
      inventory: stored?.inventory ?? { gsc: [], ga4: [], ads: [] },
      candidates,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load inventory.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const auth = createClient(cookieStore);
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const result = await syncGoogleConnectionInventory(user.id);
    const sessions = await listUnlockedAuditSessionsForUser(user.id);
    const existingDomains = sessions.map((s) => s.domain).filter(Boolean);
    const candidates = await listGoogleInventoryCandidates(user.id, existingDomains);

    return NextResponse.json({
      connected: true,
      operatorEmail: (await getStoredGoogleInventory(user.id))?.operatorEmail ?? null,
      syncedAt: result.syncedAt,
      inventory: result.inventory,
      candidates,
      connectionId: result.connectionId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync inventory.' },
      { status: 500 }
    );
  }
}
