import "./connection";

import { Product } from "@/common/const";
import { InferSchemaType, model, Schema, Types } from "mongoose";

export const COMPANY_STATUS = ["ACTIVE", "DELETED"] as const;

const CompanySchema = new Schema(
  {
    companyLogo: {
      type: String,
    },
    companyName: {
      required: true,
      type: String,
    },
    primaryUserId: {
      required: true,
      type: Schema.Types.ObjectId,
    },
    status: {
      default: "ACTIVE",
      enum: COMPANY_STATUS,
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const CompanyModel = model("company", CompanySchema);
export type Company = InferSchemaType<typeof CompanySchema>;
export type CompanyDocument = Company & { _id: Types.ObjectId };
export type UserCompany = {
  _id: Types.ObjectId;
  companyName: string;
  companyLogo?: string;
  isOwner: boolean;
  allowedProductIds: Product[];
};
