// Homepage must stay on the Site-OS visual shell — do not restore the old slate form.
import { cookies } from 'next/headers';
import { SiteOsLanding } from '@/components/marketing/site-os/site-os-landing';
import { hasSupabaseConfig } from '@/lib/supabase/server';
import { createClient } from '@/utils/supabase/server';

function initialsFromEmail(email?: string | null): string | null {
  if (!email) return null;
  const parts = email.split('@');
  const name = parts[0]?.split(/[._-]/) ?? [];
  return name.slice(0, 2).map((p) => p?.[0]?.toUpperCase()).join('') || null;
}

export default async function HomePage() {
  let userInitials: string | null = null;
  let isSignedIn = false;

  if (hasSupabaseConfig()) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isSignedIn = true;
      userInitials = initialsFromEmail(user.email);
    }
  }

  return <SiteOsLanding userInitials={userInitials} signedIn={isSignedIn} />;
}
