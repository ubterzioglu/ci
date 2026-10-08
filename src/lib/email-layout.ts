/**
 * Branded HTML shell for guest-facing mails.
 *
 * Mail clients ignore most modern CSS, so this is deliberately old-school:
 * a centred table, inline styles only, web-safe font stacks. Palette mirrors
 * the site (olive / terracotta / cream, see globals.css).
 */

const color = {
  page: '#f3efe6',
  card: '#ffffff',
  ink: '#23211c',
  muted: '#6b6759',
  olive: '#5a6240',
  oliveDeep: '#434a30',
  terracotta: '#b5623c',
  creamDeep: '#ece5d6',
  stone: '#ded6c4',
} as const;

const serif = "Georgia,'Times New Roman',serif";
const sans = "'Helvetica Neue',Helvetica,Arial,sans-serif";

export interface EmailLayoutInput {
  /** BCP-47 language of the mail, set on the wrapper. */
  lang: string;
  brandName: string;
  greeting: string;
  /** Main message paragraphs, plain text (escaped here). */
  paragraphs: string[];
  /** Booking facts shown in a highlighted card; omitted when empty. */
  details?: Array<{ label: string; value: string }>;
  contact: {
    intro: string;
    phoneLabel: string;
    phoneDisplay: string;
    phoneE164: string;
    emailLabel: string;
    emailAddress: string;
  };
  region: string;
  siteUrl: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function detailsCard(details: Array<{ label: string; value: string }>): string {
  const rows = details
    .map(
      (d) =>
        `<tr><td style="padding:6px 0;font:12px/1.4 ${sans};letter-spacing:.12em;text-transform:uppercase;color:${color.muted}">${escapeHtml(d.label)}</td></tr>` +
        `<tr><td style="padding:0 0 10px;font:600 17px/1.4 ${serif};color:${color.ink}">${escapeHtml(d.value)}</td></tr>`,
    )
    .join('');
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;background:${color.creamDeep};border-left:4px solid ${color.terracotta};border-radius:4px">` +
    `<tr><td style="padding:14px 20px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>` +
    '</table>'
  );
}

export function renderEmailLayout(input: EmailLayoutInput): string {
  const { contact } = input;
  const paragraphs = input.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font:16px/1.7 ${sans};color:${color.ink}">${escapeHtml(p)}</p>`,
    )
    .join('');
  const details = input.details?.length ? detailsCard(input.details) : '';

  return (
    `<div lang="${escapeHtml(input.lang)}" style="margin:0;padding:24px 12px;background:${color.page}">` +
    `<table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${color.card};border:1px solid ${color.stone};border-radius:6px;overflow:hidden">` +
    // Header
    `<tr><td style="background:${color.olive};padding:28px 32px;text-align:center">` +
    `<a href="${escapeHtml(input.siteUrl)}" style="text-decoration:none;font:600 26px/1.2 ${serif};letter-spacing:.04em;color:#f3efe6">${escapeHtml(input.brandName)}</a>` +
    `</td></tr>` +
    `<tr><td style="height:3px;background:${color.terracotta};font-size:0;line-height:0">&nbsp;</td></tr>` +
    // Body
    `<tr><td style="padding:32px 32px 8px">` +
    `<p style="margin:0 0 18px;font:600 20px/1.4 ${serif};color:${color.oliveDeep}">${escapeHtml(input.greeting)}</p>` +
    paragraphs +
    details +
    `</td></tr>` +
    // Contact
    `<tr><td style="padding:0 32px 32px">` +
    `<p style="margin:0 0 12px;font:15px/1.6 ${sans};color:${color.muted}">${escapeHtml(contact.intro)}</p>` +
    `<a href="tel:${escapeHtml(contact.phoneE164)}" style="display:inline-block;padding:12px 24px;background:${color.olive};border-radius:999px;font:600 15px/1 ${sans};color:#f3efe6;text-decoration:none">${escapeHtml(contact.phoneLabel)}: ${escapeHtml(contact.phoneDisplay)}</a>` +
    `<p style="margin:14px 0 0;font:14px/1.6 ${sans};color:${color.muted}">${escapeHtml(contact.emailLabel)}: ` +
    `<a href="mailto:${escapeHtml(contact.emailAddress)}" style="color:${color.terracotta};text-decoration:underline">${escapeHtml(contact.emailAddress)}</a></p>` +
    `</td></tr>` +
    // Footer
    `<tr><td style="padding:20px 32px;background:${color.creamDeep};text-align:center;font:13px/1.6 ${sans};color:${color.muted}">` +
    `<strong style="color:${color.ink}">${escapeHtml(input.brandName)}</strong><br>${escapeHtml(input.region)}` +
    `</td></tr>` +
    '</table></div>'
  );
}
