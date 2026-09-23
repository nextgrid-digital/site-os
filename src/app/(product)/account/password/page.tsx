import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PasswordForm } from '@/components/audit/password-form';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PasswordPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account/password');
  }

  return <PasswordForm />;
}
