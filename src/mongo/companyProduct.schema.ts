import "./connection";

import { PRODUCT_IDS } from "@/common/const";
import { InferSchemaType, model, Schema } from "mongoose";

const COMPANY_PRODUCT_STATUS = ["ACTIVE", "DELETED"] as const;

const CompanyProductSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productId: { type: String, required: true, enum: PRODUCT_IDS },
    status: { type: String, enum: COMPANY_PRODUCT_STATUS, required: true },
  },
  {
    timestamps: true,
  }
);

export const CompanyProductModel = model(
  "companyProduct",
  CompanyProductSchema
);
export type CompanyProduct = InferSchemaType<typeof CompanyProductSchema>;
