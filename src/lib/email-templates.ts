import { User as MongoUser } from '@/mongo';

type User = Pick<MongoUser, 'firstName' | 'lastName' | 'emailId'>;

const combineName = (...args: (string | undefined | null)[]) => {
  return args.filter((cur) => cur).join(' ');
};

type TemplateData<Extra extends object> = {
  user?: User | null;
  eventData: Extra;
};

type InvitationMailData = TemplateData<{
  acceptInvitationLink: string;
  productId: string;
  companyName: string;
}>;

type PasswordChangeData = TemplateData<{
  otp: string;
}>;

type PasswordResetData = TemplateData<{
  otp: string;
}>;

type RegisterData = TemplateData<{
  otp: string;
}>;

export type TemplateEventData = Pick<
  InvitationMailData | PasswordChangeData | PasswordResetData,
  'eventData'
>['eventData'];

export const emailTemplates = {
  INVITATION: ({ user, eventData }: InvitationMailData) => {
    return {
      subject: 'Invitation',
      html: `
Hello ${combineName(user?.firstName, user?.lastName)},
<br>
You are invited to ${eventData.companyName} from ${eventData.productId}.
Accept invite from <p>${eventData.acceptInvitationLink}</p>
`,
    };
  },
  PASSWORD_CHANGE: ({ eventData }: PasswordChangeData) => {
    return {
      subject: 'Change Password',
      html: `Your otp for change password is ${eventData.otp}`,
    };
  },
  PASSWORD_RESET: ({ eventData }: PasswordResetData) => {
    return {
      subject: 'Password Reset',
      html: `Your otp for forgot password is ${eventData.otp}`,
    };
  },
  REGISTER: ({ eventData, user }: RegisterData) => {
    return {
      subject: 'Registration',
      html: `Hi ${combineName(user?.firstName, user?.lastName)}, Your otp for registration is ${eventData.otp}`,
    };
  },
};
