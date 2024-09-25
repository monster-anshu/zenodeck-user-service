import './connection';

import { InferSchemaType, model, Schema } from 'mongoose';

const OTP_FLOWS = ['CHANGE_PASSWORD', 'FORGOT_PASSWORD'] as const;
export type OtpFlow = (typeof OTP_FLOWS)[number];

const OtpSchema = new Schema({
  createdAt: {
    default: Date.now(),
    expires: 5 * 60,
    type: Date,
  },
  flow: {
    enum: OTP_FLOWS,
    required: true,
    type: String,
  },
  meta: Schema.Types.Mixed,
  otp: {
    required: true,
    type: String,
  },
  userId: {
    required: true,
    type: Schema.Types.ObjectId,
  },
});

export const OtpModel = model('otp', OtpSchema);
export type Otp = InferSchemaType<typeof OtpSchema>;
