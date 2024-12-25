import { InvitationService } from '@/services/invitation.service';
import type { Handler } from 'aws-lambda';

export const sendInvitation: Handler = async (event) => {
  const { companyId, emailIds, productId, userId } = event;

  const data = await InvitationService.send({
    companyId,
    emailIds,
    productId,
    userId,
  });

  return data;
};
