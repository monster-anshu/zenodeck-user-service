import { formatJSONResponse } from '@/lib/api-gateway';
import { middyfy } from '@/lib/internal';
import schema from './schema';
import { CompanyModel } from '@/mongo';
import { CompanyService } from '@/services/company.service';
import { ProductService } from '@/services/product.service';
import { Types } from 'mongoose';

export const main = middyfy<typeof schema>(async (event) => {
  const { companyName, productId } = event.body;
  const session = event.session || {};
  const userId = session.userId!;

  const companyInfo = await CompanyModel.create({
    companyName: companyName,
    primaryUserId: userId,
    status: 'ACTIVE',
  });

  const productInfo = await CompanyService.addProduct({
    companyId: companyInfo._id.toString(),
    productId: productId,
    userId: userId.toString(),
  });

  await CompanyService.addProductPermissionToUser({
    companyId: companyInfo._id.toString(),
    userId: userId.toString(),
    products: [productInfo.productId],
    role: 'SUPER_ADMIN',
  });

  await ProductService.populateDefaultAppData({
    companyId: companyInfo._id.toString(),
    companyName: companyInfo.companyName,
    productId: productInfo.productId,
    userId: userId.toString(),
  }).catch(async (err) => {
    await ProductService.revertOnPoplulateDataError(
      {
        companyId: companyInfo._id,
        companyProductId: productInfo._id,
        productId: productId,
        userId: new Types.ObjectId(userId),
      },
      {
        removeCompany: true,
      },
    );
    throw err;
  });

  event.session = session;

  return formatJSONResponse({
    isSuccess: true,
  });
});
