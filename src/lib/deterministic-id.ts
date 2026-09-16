/**
 * Stable uuid derived from a string.
 *
 * The local content files identify things by human-readable slugs ("chef-simge")
 * while the database columns are uuid. Deriving the uuid from the slug means the
 * seed, the admin panel and the public read path all land on the same row
 * without needing a lookup table.
 *
 * Not a real UUIDv5 — it only has to be deterministic and well-formed. Shared by
 * scripts/seed-supabase.ts and the site-image slots so the two can never derive
 * different ids for the same slug.
 */
export function deterministicUuid(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  const hex = (Math.abs(hash).toString(16) + '0'.repeat(32)).slice(0, 32);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '5' + hex.slice(13, 16),
    '8' + hex.slice(17, 20),
    hex.slice(20, 32),
  ].join('-');
}
