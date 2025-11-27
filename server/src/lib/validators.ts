const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Lightweight UUID check so we fail fast before hitting Supabase.
 */
export function isUuid(value: string | undefined | null): value is string {
  return typeof value === 'string' && UUID_V4_REGEX.test(value);
}

