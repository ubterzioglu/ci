import 'server-only';

import type { Transporter } from 'nodemailer';

/**
 * Outgoing mail, sent through the restaurant's own Zoho mailbox over SMTP.
 *
 * Zoho hosts info@cineocucina.com, so sending from there needs no separate
 * domain verification — the mail leaves the same account that receives it and
 * lands with correct SPF/DKIM. (This replaced a Resend integration that never
 * actually sent: its API key was blank and its sender was still the
 * onboarding@resend.dev placeholder.)
 *
 * Zoho requires an APP-SPECIFIC password, not the account password.
 */

export interface SendNotificationEmailParams {
  /**
   * One address, or several separated by commas — the notification addresses
   * come straight from environment variables, and a restaurant may well want a
   * form to reach both the business mailbox and someone's personal one.
   */
  to: string;
  subject: string;
  text: string;
  /**
   * Address the recipient's "Reply" should go to — the guest, on a reservation
   * notification, so the restaurant can answer without copying the address out
   * of the message body.
   */
  replyTo?: string;
  /**
   * Blind copy, so the restaurant keeps its own record of what a guest was
   * told. Blind on purpose: the guest must not see an internal address, and
   * must not be able to reply to it by hitting "Reply all".
   *
   * Accepts several comma-separated addresses, like `to`. Empty or unset
   * means no copy.
   */
  bcc?: string;
}

/**
 * `skipped` means mail is not configured at all (no SMTP credentials), which is
 * the normal state in local development. It is deliberately distinct from a
 * real failure so callers can tell the restaurant which one happened.
 */
export type EmailResult =
  | { sent: true }
  | { sent: false; skipped: true }
  | { sent: false; skipped?: false; error: string };

interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

function readSmtpSettings(): SmtpSettings | null {
  const host = process.env.ZOHO_SMTP_HOST;
  const user = process.env.ZOHO_SMTP_USER;
  const password = process.env.ZOHO_SMTP_PASSWORD;
  if (!host || !user || !password) return null;

  return {
    host,
    port: Number(process.env.ZOHO_SMTP_PORT ?? 465),
    user,
    password,
    // Falling back to the SMTP user keeps the sender aligned with the mailbox;
    // Zoho rejects a From that the account is not allowed to send as.
    from: process.env.MAIL_FROM ?? `Çi Neo Cucina <${user}>`,
  };
}

let cachedTransporter: Transporter | null = null;
let cachedFor: string | null = null;

/**
 * One transporter per credential set, reused so we keep the SMTP connection pool.
 *
 * nodemailer is imported lazily: it is a Node-only library and pulling it into
 * the module graph of the pages that reference the reservation server action
 * breaks Next's prerender pass. Loading it only when mail is actually sent also
 * keeps it out of builds that never send.
 */
async function getTransporter(settings: SmtpSettings): Promise<Transporter> {
  const key = `${settings.host}:${settings.port}:${settings.user}`;
  if (cachedTransporter && cachedFor === key) return cachedTransporter;

  const { default: nodemailer } = await import('nodemailer');
  cachedTransporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: settings.port === 465,
    auth: { user: settings.user, pass: settings.password },
    pool: true,
  });
  cachedFor = key;
  return cachedTransporter;
}

/**
 * Send one plain-text notification.
 *
 * Never throws: every caller is in the middle of something more important than
 * the email (saving a reservation, confirming one), so the outcome comes back
 * as a value for the caller to surface or ignore.
 */
export async function sendNotificationEmail(
  params: SendNotificationEmailParams,
): Promise<EmailResult> {
  const settings = readSmtpSettings();
  if (!settings) {
    console.info('[email] SMTP not configured — skipping notification email.');
    return { sent: false, skipped: true };
  }

  try {
    const transporter = await getTransporter(settings);
    await transporter.sendMail({
      from: settings.from,
      to: splitRecipients(params.to),
      ...(params.bcc ? { bcc: splitRecipients(params.bcc) } : {}),
      subject: params.subject,
      text: params.text,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    });
    return { sent: true };
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[email] send failed:', detail);
    return { sent: false, error: detail };
  }
}

/**
 * Split a recipient setting into addresses.
 *
 * Tolerates the shapes a human types into an env var: spaces around commas, a
 * trailing comma, or a single address with no comma at all.
 */
export function splitRecipients(value: string): string[] {
  return value
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);
}

/** Is outgoing mail configured at all? Lets the admin UI explain itself. */
export function isEmailConfigured(): boolean {
  return readSmtpSettings() !== null;
}
