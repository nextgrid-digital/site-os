import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountSettingsForm } from '@/components/audit/account-settings-form';
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

  return (
    <div className="py-4">
      <h1 className="mb-8 text-xl font-semibold">Account</h1>
      <AccountSettingsForm email={user.email ?? ''} name={name} />
    </div>
  );
}
