export type DashboardLock = 'login' | 'connect' | null;

/**
 * The Dashboard needs real Google data. It stays locked until the viewer is
 * signed in and has connected Search Console or Analytics for this site.
 */
export function dashboardLockReason(input: {
  signedIn: boolean;
  gscConnected: boolean;
  ga4Connected: boolean;
}): DashboardLock {
  if (!input.signedIn) return 'login';
  if (!input.gscConnected && !input.ga4Connected) return 'connect';
  return null;
}

export const DASHBOARD_LOCK_MESSAGE: Record<
  Exclude<DashboardLock, null>,
  string
> = {
  login:
    'The Dashboard is locked. Log in, then connect Google Analytics and Search Console for this site to see it.',
  connect:
    'The Dashboard is locked. Connect Google Analytics or Search Console for this site in Setup to see it.',
};
