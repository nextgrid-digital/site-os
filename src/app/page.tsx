// Homepage must stay on the Site-OS visual shell — do not restore the old slate form.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SiteOsLanding } from '@/components/marketing/site-os/site-os-landing';
import { hasSupabaseConfig } from '@/lib/supabase/server';
import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {
  if (hasSupabaseConfig()) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect('/app');
    }
  }

  return <SiteOsLanding userInitials={null} signedIn={false} />;
}
