import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account/billing');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Free for every account</CardTitle>
          <CardDescription>There are no paid plans, so there is nothing to pay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Google Analytics 4, Google Search Console and the Dashboard are free for every user.
            Connecting your Google account and running the connected audit on your projects is
            free too.
          </p>
          <p>There is no upgrade step.</p>
        </CardContent>
      </Card>
    </div>
  );
}
