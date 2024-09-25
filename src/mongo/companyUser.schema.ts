import './connection';

import { PRODUCT_IDS } from '@/common/const';
import { InferSchemaType, model, Schema } from 'mongoose';

export const COMPANY_USER_STATUS = ['ACTIVE', 'DELETED'] as const;

const CompanyUserSchema = new Schema({
  companyId: {
    required: true,
    type: Schema.Types.ObjectId,
  },
  products: [
    {
      enum: PRODUCT_IDS,
      type: String,
    },
  ],
  status: {
    default: 'ACTIVE',
    enum: COMPANY_USER_STATUS,
    type: String,
  },
  userId: {
    required: true,
    type: Schema.Types.ObjectId,
  },
  role: String,
});

export const CompanyUserModel = model('companyUser', CompanyUserSchema);
export type CompanyUser = InferSchemaType<typeof CompanyUserSchema>;
