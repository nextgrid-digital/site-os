export function shouldShowReportNextStep(input: {
  gscConnected: boolean;
  ga4Connected: boolean;
  isTeaser: boolean;
}): boolean {
  if (input.isTeaser) return true;
  return !input.gscConnected || !input.ga4Connected;
}
