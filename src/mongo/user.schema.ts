import './connection';

import { InferSchemaType, Schema, Types, model } from 'mongoose';

const USER_STATUS = ['ACTIVE', 'UNVERIFIED', 'DELETED'] as const;

const UserSchema = new Schema(
  {
    countryCode: {
      type: String,
    },
    emailId: {
      required: true,
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    mobileNo: {
      type: String,
    },
    password: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    status: {
      default: 'ACTIVE',
      enum: USER_STATUS,
      type: String,
    },
    timezone: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model('User', UserSchema);
export type User = InferSchemaType<typeof UserSchema>;
