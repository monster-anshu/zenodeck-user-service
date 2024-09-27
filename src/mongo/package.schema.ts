import './connection';

import { PRODUCT_IDS } from '@/common/const';
import { InferSchemaType, Schema, model } from 'mongoose';
import { PriceSchema } from './addon.schema';

const PACKAGE_STATUS = ['ACTIVE', 'INACTIVE'] as const;

const PackageSchema = new Schema({
  addons: [
    {
      addonId: Schema.Types.ObjectId,
      quantity: Number,
    },
  ],
  displayName: String,
  features: [
    {
      feature: String,
      quantity: Number,
    },
  ],
  isDefaultPackage: Boolean,
  isFreemiumPackage: Boolean,
  key: {
    required: true,
    type: String,
  },
  price: PriceSchema,
  priority: Number,
  productId: {
    enum: PRODUCT_IDS,
    required: true,
    type: String,
  },
  status: {
    default: 'ACTIVE',
    enum: PACKAGE_STATUS,
    type: String,
  },
  trialDuration: Number,
});

export const PackageModel = model('package', PackageSchema);
export type Package = InferSchemaType<typeof PackageSchema>;
export type Price = InferSchemaType<typeof PriceSchema>;
