import { Schema } from 'mongoose';

export const BillingDetailSchema = new Schema(
  {
    name: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    postalCode: { type: String },
    taxNumber: { type: String },
  },
  {
    _id: false,
  },
);
