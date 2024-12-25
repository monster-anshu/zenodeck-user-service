import { handlerPath } from '@/lib/handler-resolver';

export const inviteUserToCompany = {
  handler: `${handlerPath(__dirname)}/handler.sendInvitation`,
};
