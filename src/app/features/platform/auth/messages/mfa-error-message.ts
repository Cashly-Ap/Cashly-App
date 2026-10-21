const MFA_LOCKOUT_MESSAGE = 'Too many MFA attempts; try again in 15 minutes';

export function mfaErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null || !('error' in error)) return fallback;
  const body: unknown = error.error;
  if (typeof body !== 'object' || body === null || !('message' in body)) return fallback;
  return body.message === MFA_LOCKOUT_MESSAGE
    ? 'Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.'
    : fallback;
}
