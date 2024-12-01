import { Product } from '@/common/const';
import {
  CompanyModel,
  CompanyProductModel,
  CompanyUser,
  CompanyUserModel,
  CurrentPlan,
  CurrentPlanAddon,
  PackageModel,
  UserCompany,
} from '@/mongo';
import { FilterQuery, Types } from 'mongoose';
import { PackageService } from './package.service';

export class CompanyService {
  static async get(userId: string, product?: Product): Promise<UserCompany[]> {
    const query: FilterQuery<CompanyUser> = {
      userId: new Types.ObjectId(userId),
      status: 'ACTIVE',
    };

    if (product) {
      query['products'] = product;
    } else {
      query['products.0'] = { $exists: true };
    }

    const userCompanies = await CompanyUserModel.find(query).lean();

    const allowedProducts = userCompanies.reduce(
      (acc, curr) => {
        acc[curr.companyId.toString()] = curr.products;
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const companies = await CompanyModel.find(
      {
        _id: {
          $in: userCompanies.map((item) => item.companyId),
        },
        status: 'ACTIVE',
      },
      {
        _id: 1,
        companyName: 1,
        primaryUserId: 1,
        companyLogo: 1,
      },
    ).lean();

    return companies.map((cur) => {
      return {
        _id: cur._id,
        companyName: cur.companyName,
        companyLogo: cur.companyLogo || undefined,
        isOwner: cur.primaryUserId.toString() === userId.toString(),
        allowedProductIds: (allowedProducts[cur._id.toString()] ||
          []) as Product[],
      };
    });
  }

  static async addProductPermissionToUser({
    companyId,
    products,
    role,
    userId,
  }: {
    userId: string;
    companyId: string;
    products: Product[];
    role?: string;
  }) {
    await CompanyUserModel.findOneAndUpdate(
      {
        companyId: companyId,
        userId: userId,
      },
      {
        $addToSet: {
          products: { $each: products },
        },
        $set: {
          status: 'ACTIVE',
        },
        $setOnInsert: {
          userId,
          companyId,
          role,
        },
      },
      {
        upsert: true,
        new: true,
      },
    ).lean();
  }

  static async addProduct({
    companyId,
    productId,
    plan,
  }: {
    companyId: string;
    productId: Product;
    plan?: string;
    userId: string;
  }) {
    let selectedPackage;

    if (plan) {
      selectedPackage = await PackageModel.findOne({
        key: plan,
        productId: productId,
        status: 'ACTIVE',
      }).lean();
    }

    if (!selectedPackage) {
      selectedPackage = await PackageModel.findOne({
        isDefaultPackage: true,
        productId: productId,
        status: 'ACTIVE',
      }).lean();
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    const TRIAL_DURATION = 14;

    endDate.setDate(
      endDate.getDate() + (selectedPackage?.trialDuration || TRIAL_DURATION),
    );

    const addons: CurrentPlanAddon[] = [];

    if (selectedPackage) {
      const list = await PackageService.getAddons(
        productId as Product,
        selectedPackage._id.toString(),
        'AGENT',
      );

      list.forEach((addon) => {
        addons.push({
          addonId: addon._id,
          quantity: 1,
          type: addon.type!,
          price: addon.price,
        } as CurrentPlanAddon);
      });
    }

    const companyProduct = await CompanyProductModel.create({
      companyId: companyId,
      status: 'ACTIVE',
      productId: productId,
      currentPlan: selectedPackage
        ? ({
            packageId: selectedPackage._id,
            addons,
            billingFrequency: 'MONTHLY',
            startDate,
            expiryDate: selectedPackage.isFreemiumPackage ? null : endDate,
            billingDetails: null,
            isRecurring: false,
            totalAmount: 0,
            isTrialPlan: selectedPackage.isFreemiumPackage ? false : true,
            isFreemiumPackage: selectedPackage.isFreemiumPackage ? true : false,
            packagePrice: selectedPackage.price,
            currencyCode: 'INR',
            features: selectedPackage.features,
          } as CurrentPlan)
        : null,
    });

    return companyProduct;
  }
}
