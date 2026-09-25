import { siteConfig } from '@/lib/site-config';
import { reservationEmailLocales, type Locale } from '@/lib/i18n/config';

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

const copy: Record<Locale, {
  subject: (restaurantName: string) => string;
  greeting: (name: string) => string;
  confirmation: (restaurantName: string) => string;
  dateTime: string;
  partySize: string;
  changes: string;
  phone: string;
  email: string;
}> = {
  en: {
    subject: (name) => `Your reservation is confirmed — ${name}`,
    greeting: (name) => `Dear ${name},`,
    confirmation: (name) => `Your reservation at ${name} is confirmed. We look forward to welcoming you.`,
    dateTime: 'Date and time',
    partySize: 'Party size',
    changes: 'If your plans change, please let us know:',
    phone: 'Phone',
    email: 'Email',
  },
  tr: {
    subject: (name) => `Rezervasyonunuz onaylandı — ${name}`,
    greeting: (name) => `Sayın ${name},`,
    confirmation: (name) => `${name} rezervasyonunuz onaylanmıştır. Sizi ağırlamayı dört gözle bekliyoruz.`,
    dateTime: 'Tarih ve saat',
    partySize: 'Kişi sayısı',
    changes: 'Planınız değişirse bize haber vermeniz yeterli:',
    phone: 'Telefon',
    email: 'E-posta',
  },
  de: {
    subject: (name) => `Ihre Reservierung ist bestätigt — ${name}`,
    greeting: (name) => `Guten Tag ${name},`,
    confirmation: (name) => `Ihre Reservierung im ${name} ist bestätigt. Wir freuen uns darauf, Sie bei uns begrüßen zu dürfen.`,
    dateTime: 'Datum und Uhrzeit',
    partySize: 'Personenzahl',
    changes: 'Falls sich Ihre Pläne ändern, geben Sie uns bitte Bescheid:',
    phone: 'Telefon',
    email: 'E-Mail',
  },
  ru: {
    subject: (name) => `Ваше бронирование подтверждено — ${name}`,
    greeting: (name) => `Уважаемый(-ая) ${name}!`,
    confirmation: (name) => `Ваше бронирование в ресторане ${name} подтверждено. Будем рады видеть вас.`,
    dateTime: 'Дата и время',
    partySize: 'Количество гостей',
    changes: 'Если ваши планы изменятся, пожалуйста, сообщите нам:',
    phone: 'Телефон',
    email: 'Эл. почта',
  },
  fr: {
    subject: (name) => `Votre réservation est confirmée — ${name}`,
    greeting: (name) => `Cher/chère ${name},`,
    confirmation: (name) => `Votre réservation au ${name} est confirmée. Nous serons ravis de vous accueillir.`,
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

/** Plain text is reliable across mail clients and keeps the confirmation easy to read. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const tabLabels: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
  de: 'Deutsch',
  ru: 'Русский',
  fr: 'Français',
};

export function buildReservationConfirmation(reservation: ReservationConfirmationInput): EmailBody {
  const { contact, name: restaurantName } = siteConfig;
  const safe = {
    restaurantName: escapeHtml(restaurantName),
    phone: escapeHtml(contact.phoneDisplay),
    email: escapeHtml(contact.email),
    region: escapeHtml(contact.region),
  };
  const localized = reservationEmailLocales.map((locale) => {
    const t = copy[locale];
    const when = formatDateTime(reservation.requestedDate, reservation.requestedTime, locale);
    return {
      locale,
      label: tabLabels[locale],
      subject: t.subject(restaurantName),
      text: [
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
      ].join('\n'),
      html: [
        `<p>${escapeHtml(t.greeting(reservation.name))}</p>`,
        `<p>${escapeHtml(t.confirmation(restaurantName))}</p>`,
        `<p><strong>${escapeHtml(t.dateTime)}:</strong> ${escapeHtml(when)}<br>`,
        `<strong>${escapeHtml(t.partySize)}:</strong> ${reservation.partySize}</p>`,
        `<p>${escapeHtml(t.changes)}<br>`,
        `<strong>${escapeHtml(t.phone)}:</strong> ${safe.phone}<br>`,
        `<strong>${escapeHtml(t.email)}:</strong> ${safe.email}</p>`,
        `<p><strong>${safe.restaurantName}</strong><br>${safe.region}</p>`,
      ].join(''),
    };
  });

  const nav = localized.map(({ locale, label }) =>
    `<a href="#reservation-${locale}" style="display:inline-block;padding:9px 14px;margin:0 6px 8px 0;border:1px solid #d9d1c4;border-radius:18px;color:#536044;text-decoration:none;font:600 14px Arial,sans-serif">${label}</a>`,
  ).join('');
  const sections = localized.map(({ locale, label, html }) =>
    `<section id="reservation-${locale}" style="padding:18px 0;border-top:1px solid #e5dfd4"><h2 style="margin:0 0 14px;color:#536044;font:600 18px Arial,sans-serif">${label}</h2>${html}</section>`,
  ).join('');
  const text = localized.map(({ label, text: body }) => `${label}\n${'─'.repeat(label.length)}\n\n${body}`).join('\n\n\n');

  return {
    subject: localized[0]!.subject,
    text,
    html: `<div style="max-width:640px;margin:0 auto;padding:24px;color:#292821;font:15px/1.6 Arial,sans-serif"><p style="margin:0 0 8px;color:#777">Choose your language / Dilinizi seçin / Sprache wählen / Выберите язык / Choisissez votre langue</p><nav style="margin:0 0 12px">${nav}</nav>${sections}</div>`,
  };
}
