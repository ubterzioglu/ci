import { siteConfig } from '@/lib/site-config';
import { isLocale, type Locale } from '@/lib/i18n/config';

/** Reservation details used to build a guest confirmation email. */
export interface ReservationConfirmationInput {
  name: string;
  requestedDate: string;
  requestedTime: string;
  partySize: number;
}

export interface EmailBody {
  subject: string;
  text: string;
  html: string;
}

const copy: Record<
  Locale,
  {
    subject: (restaurantName: string) => string;
    greeting: (name: string) => string;
    confirmation: (restaurantName: string) => string;
    dateTime: string;
    partySize: string;
    changes: string;
    phone: string;
    email: string;
  }
> = {
  en: {
    subject: (name) => `Your reservation is confirmed — ${name}`,
    greeting: (name) => `Dear ${name},`,
    confirmation: (name) =>
      `Your reservation at ${name} is confirmed. We look forward to welcoming you.`,
    dateTime: 'Date and time',
    partySize: 'Party size',
    changes: 'If your plans change, please let us know:',
    phone: 'Phone',
    email: 'Email',
  },
  tr: {
    subject: (name) => `Rezervasyonunuz onaylandı — ${name}`,
    greeting: (name) => `Sayın ${name},`,
    confirmation: (name) =>
      `${name} rezervasyonunuz onaylanmıştır. Sizi ağırlamayı dört gözle bekliyoruz.`,
    dateTime: 'Tarih ve saat',
    partySize: 'Kişi sayısı',
    changes: 'Planınız değişirse bize haber vermeniz yeterli:',
    phone: 'Telefon',
    email: 'E-posta',
  },
  de: {
    subject: (name) => `Ihre Reservierung ist bestätigt — ${name}`,
    greeting: (name) => `Guten Tag ${name},`,
    confirmation: (name) =>
      `Ihre Reservierung im ${name} ist bestätigt. Wir freuen uns darauf, Sie bei uns begrüßen zu dürfen.`,
    dateTime: 'Datum und Uhrzeit',
    partySize: 'Personenzahl',
    changes: 'Falls sich Ihre Pläne ändern, geben Sie uns bitte Bescheid:',
    phone: 'Telefon',
    email: 'E-Mail',
  },
  ru: {
    subject: (name) => `Ваше бронирование подтверждено — ${name}`,
    greeting: (name) => `Уважаемый(-ая) ${name}!`,
    confirmation: (name) =>
      `Ваше бронирование в ресторане ${name} подтверждено. Будем рады видеть вас.`,
    dateTime: 'Дата и время',
    partySize: 'Количество гостей',
    changes: 'Если ваши планы изменятся, пожалуйста, сообщите нам:',
    phone: 'Телефон',
    email: 'Эл. почта',
  },
  fr: {
    subject: (name) => `Votre réservation est confirmée — ${name}`,
    greeting: (name) => `Cher/chère ${name},`,
    confirmation: (name) =>
      `Votre réservation au ${name} est confirmée. Nous serons ravis de vous accueillir.`,
    dateTime: 'Date et heure',
    partySize: 'Nombre de convives',
    changes: 'Si vos plans changent, merci de nous en informer :',
    phone: 'Téléphone',
    email: 'E-mail',
  },
};

function formatDateTime(date: string, time: string, locale: Locale): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return `${date} ${time}`;
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
  return `${formattedDate} ${time}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Locale used when a reservation carries none (rows saved before the column existed). */
const fallbackEmailLocale: Locale = 'en';

/** Narrow a stored/unknown locale to one we have copy for. */
export function resolveEmailLocale(value: string | null | undefined): Locale {
  return value && isLocale(value) ? value : fallbackEmailLocale;
}

/** One-language confirmation, in the language the guest booked in. */
export function buildReservationConfirmation(
  reservation: ReservationConfirmationInput,
  locale: Locale,
): EmailBody {
  const { contact, name: restaurantName } = siteConfig;
  const t = copy[locale];
  const when = formatDateTime(reservation.requestedDate, reservation.requestedTime, locale);
  const phone = escapeHtml(contact.phoneDisplay);
  const email = escapeHtml(contact.email);

  const text = [
    t.greeting(reservation.name),
    '',
    t.confirmation(restaurantName),
    '',
    `${t.dateTime}: ${when}`,
    `${t.partySize}: ${reservation.partySize}`,
    '',
    t.changes,
    `${t.phone}: ${contact.phoneDisplay}`,
    `${t.email}: ${contact.email}`,
    '',
    restaurantName,
    contact.region,
  ].join('\n');

  const html = [
    `<div lang="${locale}" style="max-width:640px;margin:0 auto;padding:24px;color:#292821;font:15px/1.6 Arial,sans-serif">`,
    `<p>${escapeHtml(t.greeting(reservation.name))}</p>`,
    `<p>${escapeHtml(t.confirmation(restaurantName))}</p>`,
    `<p><strong>${escapeHtml(t.dateTime)}:</strong> ${escapeHtml(when)}<br>`,
    `<strong>${escapeHtml(t.partySize)}:</strong> ${reservation.partySize}</p>`,
    `<p>${escapeHtml(t.changes)}<br>`,
    `<strong>${escapeHtml(t.phone)}:</strong> ${phone}<br>`,
    `<strong>${escapeHtml(t.email)}:</strong> ${email}</p>`,
    `<p><strong>${escapeHtml(restaurantName)}</strong><br>${escapeHtml(contact.region)}</p>`,
    '</div>',
  ].join('');

  return { subject: t.subject(restaurantName), text, html };
}
