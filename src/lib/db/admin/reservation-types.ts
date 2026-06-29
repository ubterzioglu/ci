/**
 * Shared reservation status constants + types. Kept free of `server-only` so
 * both server repositories/actions and client components can import them. The
 * actual data-access functions live in reservations.ts (server-only).
 */

export const RESERVATION_STATUSES = [
  'new',
  'confirmed',
  'declined',
  'cancelled',
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export interface AdminReservation {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  partySize: number;
  requestedDate: string;
  requestedTime: string;
  message: string | null;
  status: ReservationStatus;
  createdAt: string;
}

export function isReservationStatus(value: string): value is ReservationStatus {
  return (RESERVATION_STATUSES as readonly string[]).includes(value);
}
