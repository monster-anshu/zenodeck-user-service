import { Product } from '@/common/const';
import { Addon, AddonModel } from '@/mongo';
import { FilterQuery } from 'mongoose';

export class PackageService {
  static getAddons = async (
    productId: Product,
    packageId: string,
    type?: string,
  ) => {
    if (!packageId) {
      return [];
    }
    const filter: FilterQuery<Addon> = {
      productId,
      status: 'ACTIVE',
      $or: [{ packageIds: packageId }, { 'packageIds.0': { $exists: false } }],
    };
    if (type) {
      filter.type = type;
    }
    const addons = await AddonModel.find(filter).lean();
    return addons;
  };
}
