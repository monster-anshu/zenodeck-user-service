import { InferSchemaType, Schema, model } from 'mongoose';
import { CompanyModel } from './company.schema';
import { UserModel } from './user.schema';
import { PRODUCT_IDS } from '@/common/const';

const USER_INVITATION_STATUS = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;

const UserInvitationSchema = new Schema(
  {
    acceptedAt: {
      type: Date,
    },
    companyId: {
      ref: CompanyModel,
      required: true,
      type: Schema.Types.ObjectId,
    },
    emailId: {
      required: true,
      type: String,
    },
    invitationUuid: {
      type: String,
    },
    invitedBy: {
      ref: UserModel,
      required: true,
      type: Schema.Types.ObjectId,
    },
    productId: {
      enum: PRODUCT_IDS,
      required: true,
      type: String,
    },
    rejectedAt: {
      type: Date,
    },
    status: {
      enum: USER_INVITATION_STATUS,
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const UserInvitationModel = model('user-invitation', UserInvitationSchema);
export type UserInvitation = InferSchemaType<typeof UserInvitationSchema>;

export default UserInvitationModel;
