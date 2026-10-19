/** Agency Google account clients invite. Comes only from OPERATOR_EMAIL; null when unset. */
export function getOperatorEmail(): string | null {
  return process.env.OPERATOR_EMAIL?.trim() || null;
}
