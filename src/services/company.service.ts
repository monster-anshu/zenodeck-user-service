import { Product } from "@/common/const";
import {
  CompanyModel,
  CompanyUser,
  CompanyUserModel,
  UserCompany,
} from "@/mongo";
import { FilterQuery, Types } from "mongoose";

export class CompanyService {
  static async get(userId: string, product?: Product): Promise<UserCompany[]> {
    const query: FilterQuery<CompanyUser> = {
      userId: new Types.ObjectId(userId),
      status: "ACTIVE",
    };

    if (product) {
      query["products"] = product;
    } else {
      query["products.0"] = { $exists: true };
    }

    const userCompanies = await CompanyUserModel.find(query).lean();

    const allowedProducts = userCompanies.reduce(
      (acc, curr) => {
        acc[curr.companyId.toString()] = curr.products;
        return acc;
      },
      {} as Record<string, string[]>
    );

    const companies = await CompanyModel.find(
      {
        _id: {
          $in: userCompanies.map((item) => item._id),
        },
        status: "ACTIVE",
      },
      {
        _id: 1,
        companyName: 1,
        primaryUserId: 1,
        companyLogo: 1,
      }
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
          status: "ACTIVE",
        },
        $setOnInsert: {
          userId,
          companyId,
          role,
        },
      }
    );
  }
}
