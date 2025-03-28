import { Product } from '@/common/const';
import {
  CAMPAIGN_APP_API_KEY,
  CAMPAIGN_APP_API_URI,
  CONNECT_APP_API_KEY,
  CONNECT_APP_API_URI,
} from '@/env';

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

    const data = await res.json();

    return data;
  };
}
