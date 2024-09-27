import './connection';

import { PRODUCT_IDS } from '@/common/const';
import { InferSchemaType, model, Schema } from 'mongoose';
import { PriceSchema } from './addon.schema';
import { BillingDetailSchema } from './cart.schema';

const COMPANY_PRODUCT_STATUS = ['ACTIVE', 'DELETED'] as const;
const BILLING_FREQUENCY = ['MONTHLY', 'ANNUAL'] as const;
const CURRENCY = ['INR', 'USD'] as const;

const CurrentPlanAddonSchema = new Schema(
  {
    addonId: Schema.Types.ObjectId,
    price: PriceSchema,
    quantity: Number,
    type: String,
  },
  {
    timestamps: true,
  },
);

const CurrentPlanSchema = new Schema(
  {
    addons: [CurrentPlanAddonSchema],
    billingDetails: BillingDetailSchema,
    billingFrequency: {
      enum: BILLING_FREQUENCY,
      required: true,
      type: String,
    },
    currencyCode: {
      enum: CURRENCY,
      required: true,
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    features: [
      {
        feature: String,
        quantity: Number,
      },
    ],
    isAutoDowngraded: Boolean,
    isFreemiumPackage: Boolean,
    isRecurring: Boolean,
    isStopped: {
      default: false,
      type: Boolean,
    },
    isTrialPlan: Boolean,
    packageId: {
      required: true,
      type: Schema.Types.ObjectId,
    },
    packagePrice: {
      required: true,
      type: PriceSchema,
    },
    paymentGateway: String,
    startDate: {
      required: true,
      type: Date,
    },
    subscriptionId: String,
    totalAmount: {
      required: true,
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const CompanyProductSchema = new Schema(
  {
    companyId: {
      required: true,
      type: Schema.Types.ObjectId,
    },
    currentPlan: CurrentPlanSchema,
    productId: {
      enum: PRODUCT_IDS,
      required: true,
      type: String,
    },
    status: {
      enum: COMPANY_PRODUCT_STATUS,
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const CompanyProductModel = model(
  'companyProduct',
  CompanyProductSchema,
);

export type CompanyProduct = InferSchemaType<typeof CompanyProductSchema>;
export type CurrentPlanAddon = InferSchemaType<typeof CurrentPlanAddonSchema>;
export type CurrentPlan = InferSchemaType<typeof CurrentPlanSchema>;
