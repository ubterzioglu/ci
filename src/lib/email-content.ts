import { siteConfig } from '@/lib/site-config';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { renderEmailLayout } from '@/lib/email-layout';

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

/** Locale used when a reservation carries none (rows saved before the column existed). */
const fallbackEmailLocale: Locale = 'en';

/** Narrow a stored/unknown locale to one we have copy for. */
export function resolveEmailLocale(value: string | null | undefined): Locale {
  return value && isLocale(value) ? value : fallbackEmailLocale;
}

const declinedCopy: Record<
  Locale,
  {
    subject: (restaurantName: string) => string;
    greeting: (name: string) => string;
    message: (restaurantName: string) => string;
    callUs: string;
  }
> = {
  en: {
    subject: (name) => `About your reservation request — ${name}`,
    greeting: (name) => `Dear ${name},`,
    message: (name) =>
      `Thank you for your interest in ${name}. Unfortunately we are unable to accommodate your request at the moment. We are sorry for the inconvenience.`,
    callUs: 'If you wish, please call us and we will gladly help you find another time:',
  },
  tr: {
    subject: (name) => `Rezervasyon talebiniz hakkında — ${name}`,
    greeting: (name) => `Sayın ${name},`,
    message: (name) =>
      `${name} olarak gösterdiğiniz ilgi için teşekkür ederiz. Ne yazık ki talebinizi şu an karşılayamıyoruz, rahatsızlık için özür dileriz.`,
    callUs:
      'Dilerseniz bizi arayabilirsiniz, size uygun başka bir zaman bulmaktan memnuniyet duyarız:',
  },
  de: {
    subject: (name) => `Zu Ihrer Reservierungsanfrage — ${name}`,
    greeting: (name) => `Guten Tag ${name},`,
    message: (name) =>
      `Vielen Dank für Ihr Interesse am ${name}. Leider können wir Ihre Anfrage im Moment nicht berücksichtigen. Wir bitten um Ihr Verständnis.`,
    callUs: 'Gerne können Sie uns anrufen, dann finden wir gemeinsam einen anderen Termin für Sie:',
  },
  ru: {
    subject: (name) => `По вашему запросу на бронирование — ${name}`,
    greeting: (name) => `Уважаемый(-ая) ${name}!`,
    message: (name) =>
      `Благодарим вас за интерес к ресторану ${name}. К сожалению, сейчас мы не можем принять ваш запрос. Приносим извинения за неудобства.`,
    callUs: 'При желании позвоните нам — мы с радостью подберём другое время:',
  },
  fr: {
    subject: (name) => `Concernant votre demande de réservation — ${name}`,
    greeting: (name) => `Cher/chère ${name},`,
    message: (name) =>
      `Merci de l'intérêt que vous portez au ${name}. Malheureusement, nous ne sommes pas en mesure de donner suite à votre demande pour le moment. Nous nous en excusons.`,
    callUs: 'Si vous le souhaitez, appelez-nous : nous trouverons volontiers un autre créneau :',
  },
};

/** Contact block shared by every guest mail. */
function layoutContact(intro: string, locale: Locale) {
  const { contact } = siteConfig;
  const c = copy[locale];
  return {
    intro,
    phoneLabel: c.phone,
    phoneDisplay: contact.phoneDisplay,
    phoneE164: contact.phoneE164,
    emailLabel: c.email,
    emailAddress: contact.email,
  };
}

/** Polite one-language "we can't take this booking right now" note, inviting a phone call. */
export function buildReservationDeclined(
  reservation: Pick<ReservationConfirmationInput, 'name'>,
  locale: Locale,
): EmailBody {
  const { contact, name: restaurantName } = siteConfig;
  const t = declinedCopy[locale];
  const c = copy[locale];

  const text = [
    t.greeting(reservation.name),
    '',
    t.message(restaurantName),
    '',
    t.callUs,
    `${c.phone}: ${contact.phoneDisplay}`,
    `${c.email}: ${contact.email}`,
    '',
    restaurantName,
    contact.region,
  ].join('\n');

  const html = renderEmailLayout({
    lang: locale,
    brandName: restaurantName,
    greeting: t.greeting(reservation.name),
    paragraphs: [t.message(restaurantName)],
    contact: layoutContact(t.callUs, locale),
    region: contact.region,
    siteUrl: siteConfig.url,
  });

  return { subject: t.subject(restaurantName), text, html };
}

/** One-language confirmation, in the language the guest booked in. */
export function buildReservationConfirmation(
  reservation: ReservationConfirmationInput,
  locale: Locale,
): EmailBody {
  const { contact, name: restaurantName } = siteConfig;
  const t = copy[locale];
  const when = formatDateTime(reservation.requestedDate, reservation.requestedTime, locale);

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

  const html = renderEmailLayout({
    lang: locale,
    brandName: restaurantName,
    greeting: t.greeting(reservation.name),
    paragraphs: [t.confirmation(restaurantName)],
    details: [
      { label: t.dateTime, value: when },
      { label: t.partySize, value: String(reservation.partySize) },
    ],
    contact: layoutContact(t.changes, locale),
    region: contact.region,
    siteUrl: siteConfig.url,
  });

  return { subject: t.subject(restaurantName), text, html };
}
