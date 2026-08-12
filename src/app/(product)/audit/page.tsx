import { redirect } from 'next/navigation';

/** Legacy entry — public funnel starts at `/`. */
export default function AuditLandingPage() {
  redirect('/');
}
