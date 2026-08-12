/** Default agency Google account clients invite. */
export const DEFAULT_OPERATOR_EMAIL = 'hello@nextgrid.digital';

export function getOperatorEmail() {
  return process.env.OPERATOR_EMAIL?.trim() || DEFAULT_OPERATOR_EMAIL;
}
