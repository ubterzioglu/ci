import { z } from 'zod';

import { findSlotProblem, RESERVATION_MAX_PARTY } from '@/lib/reservation-rules';
import { defaultLocale, type Locale } from '@/lib/i18n/config';

/**
 * Zod schemas for the public forms. Shared between the client (RHF / native)
 * and the server actions so validation rules live in one place.
 *
 * Messages are in Turkish (site default language).
 */

const validationMessages: Record<
  Locale,
  {
    email: string;
    phoneLong: string;
    name: string;
    partyInteger: string;
    partyMinimum: string;
    partyMaximum: string;
    date: string;
    time: string;
    contactRequired: string;
    message: string;
  }
> = {
  tr: {
    email: 'Geçerli bir e-posta adresi girin.',
    phoneLong: 'Telefon numarası çok uzun.',
    name: 'Lütfen adınızı girin.',
    partyInteger: 'Kişi sayısı tam sayı olmalı.',
    partyMinimum: 'En az 1 kişi.',
    partyMaximum: `${RESERVATION_MAX_PARTY + 1} kişi ve üzeri gruplar için lütfen bizimle iletişime geçin.`,
    date: 'Lütfen bir tarih seçin.',
    time: 'Lütfen bir saat seçin.',
    contactRequired: 'Size ulaşabilmemiz için e-posta veya telefon girin.',
    message: 'Lütfen bir mesaj yazın.',
  },
  en: {
    email: 'Enter a valid email address.',
    phoneLong: 'The phone number is too long.',
    name: 'Please enter your name.',
    partyInteger: 'The number of guests must be a whole number.',
    partyMinimum: 'At least 1 guest is required.',
    partyMaximum: `Please contact us for groups of ${RESERVATION_MAX_PARTY + 1} or more.`,
    date: 'Please select a date.',
    time: 'Please select a time.',
    contactRequired: 'Enter an email address or phone number so we can reach you.',
    message: 'Please enter a message.',
  },
  de: {
    email: 'Geben Sie eine gültige E-Mail-Adresse ein.',
    phoneLong: 'Die Telefonnummer ist zu lang.',
    name: 'Bitte geben Sie Ihren Namen ein.',
    partyInteger: 'Die Anzahl der Gäste muss eine ganze Zahl sein.',
    partyMinimum: 'Mindestens 1 Gast ist erforderlich.',
    partyMaximum: `Für Gruppen ab ${RESERVATION_MAX_PARTY + 1} Personen kontaktieren Sie uns bitte.`,
    date: 'Bitte wählen Sie ein Datum.',
    time: 'Bitte wählen Sie eine Uhrzeit.',
    contactRequired: 'Geben Sie eine E-Mail-Adresse oder Telefonnummer an, damit wir Sie erreichen können.',
    message: 'Bitte geben Sie eine Nachricht ein.',
  },
  ru: {
    email: 'Введите корректный адрес электронной почты.',
    phoneLong: 'Номер телефона слишком длинный.',
    name: 'Введите ваше имя.',
    partyInteger: 'Количество гостей должно быть целым числом.',
    partyMinimum: 'Минимум 1 гость.',
    partyMaximum: `Для групп от ${RESERVATION_MAX_PARTY + 1} человек свяжитесь с нами.`,
    date: 'Выберите дату.',
    time: 'Выберите время.',
    contactRequired: 'Укажите электронную почту или телефон, чтобы мы могли связаться с вами.',
    message: 'Введите сообщение.',
  },
};

export function createReservationSchema(locale: Locale = defaultLocale) {
  const messages = validationMessages[locale];
  const optionalEmail = z.string().trim().email(messages.email).optional().or(z.literal(''));
  const optionalPhone = z.string().trim().max(40, messages.phoneLong).optional().or(z.literal(''));

  return z
  .object({
    name: z.string().trim().min(2, messages.name).max(120),
    email: optionalEmail,
    phone: optionalPhone,
    partySize: z.coerce
      .number()
      .int(messages.partyInteger)
      .min(1, messages.partyMinimum)
      .max(RESERVATION_MAX_PARTY, messages.partyMaximum),
    requestedDate: z.string().min(1, messages.date),
    requestedTime: z.string().min(1, messages.time),
    message: z.string().trim().max(2000).optional().or(z.literal('')),
    // Honeypot — must stay empty (spam bots fill it).
    company: z.string().max(0).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: messages.contactRequired,
    path: ['email'],
  })
  // Opening hours, lead time and the Sunday closure are checked here rather
  // than only in the form: the form is a convenience, this is the rule.
  .superRefine((data, ctx) => {
    const problem = findSlotProblem(data.requestedDate, data.requestedTime, new Date(), locale);
    if (problem) {
      ctx.addIssue({ code: 'custom', path: [problem.field], message: problem.message });
    }
  });
}

export function createContactSchema(locale: Locale = defaultLocale) {
  const messages = validationMessages[locale];
  const optionalEmail = z.string().trim().email(messages.email).optional().or(z.literal(''));
  const optionalPhone = z.string().trim().max(40, messages.phoneLong).optional().or(z.literal(''));

  return z.object({
    name: z.string().trim().min(2, messages.name).max(120),
    email: optionalEmail,
    phone: optionalPhone,
    subject: z.string().trim().max(200).optional().or(z.literal('')),
    message: z.string().trim().min(5, messages.message).max(5000),
    company: z.string().max(0).optional(),
  });
}

export const reservationSchema = createReservationSchema();
export const contactSchema = createContactSchema();

export type ReservationFormValues = z.infer<typeof reservationSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
