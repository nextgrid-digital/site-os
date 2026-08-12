import { cookies } from 'next/headers';
import { AppShell } from '@/components/audit/app-shell';
import { createClient } from '@/utils/supabase/server';

function initialsFromEmail(email: string | null | undefined) {
  if (!email) return null;
  const local = email.split('@')[0] || email;
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

/**
 * Shared chrome for /app and /audit/* so navigating Sites ↔ workspace
 * does not remount the header shell.
 */
export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedIn = Boolean(user);

  return (
    <AppShell
      userInitials={initialsFromEmail(user?.email)}
      signedIn={signedIn}
      showSignIn={!signedIn}
    >
      {children}
    </AppShell>
  );
}
