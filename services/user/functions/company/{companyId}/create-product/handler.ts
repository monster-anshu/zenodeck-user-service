import { middyfy } from "@/lib/internal";
import schema from "./schema";
import { CompanyModel, CompanyProductModel } from "@/mongo";
import { Types } from "mongoose";
import { formatJSONResponse } from "@/lib/api-gateway";
import { CompanyService } from "@/services/company.service";
import { setSessionCompanyId } from "@/services/session";

export const main = middyfy<typeof schema>(async (event) => {
  const { productId } = event.body;
  const session = event.session || {};
  const userId = session.userId!;
  const companyId = event.pathParameters?.["companyId"]!;

  const [companyInfo, companyProduct] = await Promise.all([
    CompanyModel.findOne({
      primaryUserId: new Types.ObjectId(userId),
      _id: new Types.ObjectId(companyId),
    }).lean(),
    CompanyProductModel.findOne({
      companyId: new Types.ObjectId(companyId),
      productId: productId,
    }).lean(),
  ]);

  if (!companyInfo) {
    return formatJSONResponse({
      isSuccess: false,
      error: "INVALID_COMPANY",
    });
  }

  if (!companyProduct) {
    const productInfo = await CompanyService.addProduct({
      companyId: companyInfo._id.toString(),
      productId: productId,
      userId: userId,
    });

    await CompanyService.addProductPermissionToUser({
      companyId: companyInfo._id.toString(),
      userId: userId,
      products: [productInfo.productId],
      role: "SUPER_ADMIN",
    });
  }

  setSessionCompanyId(session, productId, companyInfo._id.toString());

  event.session = session;

  return formatJSONResponse({
    isSuccess: true,
  });
});
