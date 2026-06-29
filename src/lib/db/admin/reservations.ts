import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isReservationStatus, type AdminReservation, type ReservationStatus } from './reservation-types';

/**
 * Admin data layer for reservation requests. The panel is gated by the shared
 * admin password (requireAdmin() must be called by the page/action first), so
 * these run through the service-role client which bypasses RLS — there is no
 * Supabase user session to satisfy the is_admin() policies.
 *
 * Status constants + types live in ./reservation-types (no `server-only`) so
 * client components can share them; re-exported here for convenience.
 */

export {
  RESERVATION_STATUSES,
  type AdminReservation,
  type ReservationStatus,
} from './reservation-types';

/** All reservation requests, newest first. Empty array when not configured. */
export async function listReservations(): Promise<AdminReservation[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('reservation_requests')
    .select(
      'id, name, email, phone, party_size, requested_date, requested_time, message, status, created_at',
    )
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    partySize: row.party_size,
    requestedDate: row.requested_date,
    requestedTime: row.requested_time,
    message: row.message,
    status: isReservationStatus(row.status) ? row.status : 'new',
    createdAt: row.created_at,
  }));
}

/** Updates a reservation's status. Throws on failure so the action can surface it. */
export async function setReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  const { error } = await supabase
    .from('reservation_requests')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
