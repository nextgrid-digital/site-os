import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountInfoForm } from '@/components/audit/account-info-form';
import { GoogleDisconnectCard } from '@/components/audit/google-disconnect-card';
import { getUserGoogleConnectionSummary } from '@/lib/db/google';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account');
  }

  const name = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';

  const google = await getUserGoogleConnectionSummary(user.id);

  return (
    <div className="space-y-6">
      <AccountInfoForm email={user.email ?? ''} name={name} />
      {google ? <GoogleDisconnectCard {...google} /> : null}
    </div>
  );
}
