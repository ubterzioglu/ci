import { z } from 'zod';

import { findSlotProblem, RESERVATION_MAX_PARTY } from '@/lib/reservation-rules';

/**
 * Zod schemas for the public forms. Shared between the client (RHF / native)
 * and the server actions so validation rules live in one place.
 *
 * Messages are in Turkish (site default language).
 */

const optionalEmail = z
  .string()
  .trim()
  .email('Geçerli bir e-posta adresi girin.')
  .optional()
  .or(z.literal(''));

const optionalPhone = z
  .string()
  .trim()
  .max(40, 'Telefon numarası çok uzun.')
  .optional()
  .or(z.literal(''));

export const reservationSchema = z
  .object({
    name: z.string().trim().min(2, 'Lütfen adınızı girin.').max(120),
    email: optionalEmail,
    phone: optionalPhone,
    partySize: z.coerce
      .number()
      .int('Kişi sayısı tam sayı olmalı.')
      .min(1, 'En az 1 kişi.')
      .max(
        RESERVATION_MAX_PARTY,
        `${RESERVATION_MAX_PARTY + 1} kişi ve üzeri gruplar için lütfen bizimle iletişime geçin.`,
      ),
    requestedDate: z.string().min(1, 'Lütfen bir tarih seçin.'),
    requestedTime: z.string().min(1, 'Lütfen bir saat seçin.'),
    message: z.string().trim().max(2000).optional().or(z.literal('')),
    // Honeypot — must stay empty (spam bots fill it).
    company: z.string().max(0).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Size ulaşabilmemiz için e-posta veya telefon girin.',
    path: ['email'],
  })
  // Opening hours, lead time and the Sunday closure are checked here rather
  // than only in the form: the form is a convenience, this is the rule.
  .superRefine((data, ctx) => {
    const problem = findSlotProblem(data.requestedDate, data.requestedTime);
    if (problem) {
      ctx.addIssue({ code: 'custom', path: [problem.field], message: problem.message });
    }
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Lütfen adınızı girin.').max(120),
  email: optionalEmail,
  phone: optionalPhone,
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Lütfen bir mesaj yazın.').max(5000),
  company: z.string().max(0).optional(),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
