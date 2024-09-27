import './connection';

import { PRODUCT_IDS } from '@/common/const';
import { InferSchemaType, Schema, Types, model } from 'mongoose';
import { Price } from './package.schema';

const ADDON_STATUS = ['ACTIVE', 'INACTIVE'] as const;

const CurrencySchema = new Schema(
  {
    inr: { type: Number, required: true },
    usd: { type: Number, required: true },
  },
  {
    _id: false,
  },
);

export const PriceSchema = new Schema(
  {
    annual: { type: CurrencySchema, required: true },
    monthly: { type: CurrencySchema, required: true },
  },
  {
    _id: false,
  },
);

const AddonSchema = new Schema({
  configuration: {
    agentCount: Number,
    storageAmount: Number,
  },
  displayName: String,
  key: {
    required: true,
    type: String,
  },
  packageIds: [Schema.Types.ObjectId],
  price: {
    required: true,
    type: PriceSchema,
  },
  productId: {
    enum: PRODUCT_IDS,
    required: true,
    type: String,
  },
  status: {
    default: 'ACTIVE',
    enum: ADDON_STATUS,
    required: true,
    type: String,
  },
  type: {
    type: String,
  },
});

export const AddonModel = model('addon', AddonSchema);
export type Addon = InferSchemaType<typeof AddonSchema>;
