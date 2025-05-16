import { Product } from '@/common/const';
import {
  CAMPAIGN_APP_API_KEY,
  CAMPAIGN_APP_API_URI,
  CONNECT_APP_API_KEY,
  CONNECT_APP_API_URI,
} from '@/env';
import { HttpException } from '@/lib/error';
import { CompanyModel, CompanyProductModel } from '@/mongo';
import { HttpStatusCode } from '@/types/http';
import { Types } from 'mongoose';
import { CompanyService } from './company.service';

const headers: Partial<Record<Product, object>> = {
  CAMPAIGN: { 'x-api-key': CAMPAIGN_APP_API_KEY },
  CONNECT: { 'x-api-key': CONNECT_APP_API_KEY },
};

const apiObj: Partial<Record<Product, string>> = {
  CAMPAIGN: CAMPAIGN_APP_API_URI + '/api/v1/campaign/internal/populate-default',
  CONNECT: CONNECT_APP_API_URI + '/api/v1/connect/internal/populate-default',
};

export class ProductService {
  static populateDefaultAppData = async ({
    companyId,
    companyName,
    userId,
    productId,
  }: {
    companyId: string;
    companyName: string;
    userId: string;
    productId: Product;
  }) => {
    const apiUrl = apiObj[productId];

    if (!apiUrl) {
      return;
    }
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers[productId],
      },
      body: JSON.stringify({
        companyId,
        companyName,
        userId,
      }),
    });

    if (res.status !== 201) {
      console.error(
        'Response from product service',
        res.status,
        await res.text(),
      );
      throw new HttpException(
        'UNABLE_TO_CREATE_PRODUCT',
        HttpStatusCode.InternalServerError,
      );
    }
  };

  static async revertOnPoplulateDataError(
    {
      companyId,
      companyProductId,
      productId,
      userId,
    }: {
      companyId: Types.ObjectId;
      companyProductId: Types.ObjectId;
      productId: Product;
      userId: Types.ObjectId;
    },
    {
      removeCompany = false,
    }: {
      removeCompany?: boolean;
    } = {},
  ) {
    if (removeCompany) {
      await CompanyModel.deleteOne({ _id: companyId });
    }
    // revert changes from CompanyService.addProduct
    await CompanyProductModel.deleteOne({
      _id: companyProductId,
      companyId: companyId,
      productId: productId,
    });
    await CompanyService.removeProductPermissionFromUser({
      companyId: companyId.toString(),
      userId: userId.toString(),
      products: [productId],
    });
  }
}
