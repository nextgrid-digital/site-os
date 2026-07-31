// Homepage must stay on the Site-OS visual shell — do not restore the old slate form.
import { cookies } from 'next/headers';
import { SiteOsLanding } from '@/components/marketing/site-os/site-os-landing';
import { hasSupabaseConfig } from '@/lib/supabase/server';
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

export default async function HomePage() {
  let userInitials: string | null = null;
  let signedIn = false;

  if (hasSupabaseConfig()) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
    userInitials = initialsFromEmail(user?.email);
  }

  return <SiteOsLanding userInitials={userInitials} signedIn={signedIn} />;
}
