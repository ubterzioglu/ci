import { siteConfig } from '@/lib/site-config';
import { formatReservationDateTime } from '@/lib/utils';

/**
 * Turkish bodies for the mails the restaurant sends out.
 *
 * Kept apart from src/lib/email.ts (which is only transport) and free of
 * `server-only` so the wording can be read and tested without a mail server.
 */

export interface ReservationConfirmationInput {
  name: string;
  requestedDate: string;
  requestedTime: string;
  partySize: number;
}

export interface EmailBody {
  subject: string;
  text: string;
}

/**
 * The note a guest gets once the restaurant accepts their request.
 *
 * Deliberately plain text: it reaches every mail client intact, and a
 * reservation confirmation is information rather than marketing. The phone
 * number is included so a guest who needs to change something can call instead
 * of replying and waiting.
 */
export function buildReservationConfirmation(reservation: ReservationConfirmationInput): EmailBody {
  const when = formatReservationDateTime(reservation.requestedDate, reservation.requestedTime);
  const { contact, name: restaurantName } = siteConfig;

  return {
    subject: `Rezervasyonunuz onaylandı — ${restaurantName}`,
    text: [
      `Sayın ${reservation.name},`,
      '',
      `${restaurantName} rezervasyonunuz onaylanmıştır. Sizi ağırlamayı dört gözle bekliyoruz.`,
      '',
      `Tarih ve saat: ${when}`,
      `Kişi sayısı: ${reservation.partySize}`,
      '',
      'Planınız değişirse bize haber vermeniz yeterli:',
      `Telefon: ${contact.phoneDisplay}`,
      `E-posta: ${contact.email}`,
      '',
      restaurantName,
      contact.region,
    ].join('\n'),
  };
}
