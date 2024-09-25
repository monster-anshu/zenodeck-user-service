import { RESEND_API_KEY } from '@/env';

type SendEmailOptions = {
  to: string | string[];
  html: string;
  subject: string;
};

export const sendEmail = async ({ html, subject, to }: SendEmailOptions) => {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'User Service <no-reply@himanshu-gunwant.com>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
      }),
    });

    if (!res.ok) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
