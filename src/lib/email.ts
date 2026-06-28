import 'server-only';

// TODO: Replace onboarding@resend.dev with a verified sender domain before going live.

interface SendNotificationEmailParams {
  to: string;
  subject: string;
  text: string;
}

type EmailResult = { sent: true } | { sent: false; skipped?: true; error?: unknown };

export async function sendNotificationEmail(
  params: SendNotificationEmailParams,
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info('[email] RESEND_API_KEY not set — skipping notification email.');
    return { sent: false, skipped: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Çi Neo Cucina <onboarding@resend.dev>',
        to: params.to,
        subject: params.subject,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return { sent: false, error: detail };
    }

    return { sent: true };
  } catch (error: unknown) {
    return { sent: false, error };
  }
}
