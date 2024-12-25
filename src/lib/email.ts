import { RESEND_API_KEY } from '@/env';
import { emailTemplates, TemplateEventData } from './email-templates';
import { UserModel } from '@/mongo';

type SendEmailOptions =
  | {
      to: string | string[];
      subject: string;
      html: string;
    }
  | {
      to: string | string[];
      template: {
        key: keyof typeof emailTemplates;
        eventData: TemplateEventData;
        userId?: string;
      };
    };

export const sendEmail = async ({ to, ...props }: SendEmailOptions) => {
  let subject = '';
  let html = '';

  if ('template' in props) {
    let user;
    if (props.template.userId) {
      user = await UserModel.findOne({
        _id: props.template.userId,
      }).lean();
    } else {
      user = null;
    }
    const template = emailTemplates[props.template.key];

    const result = template({
      eventData: props.template.eventData as never,
      user: user,
    });

    subject = result.subject;
    html = result.html;
  } else {
    subject = props.subject;
    html = props.html;
  }

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
