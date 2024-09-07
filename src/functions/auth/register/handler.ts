import { middyfy } from "@/lib/internal";
import schema from "./schema";
import { HttpException } from "@/lib/error";
import { HttpStatusCode } from "axios";
import bcrypt from "bcryptjs";
import { setSessionCompanyId } from "@/services/session";
import { formatJSONResponse } from "@/lib/api-gateway";
import { CompanyModel, CompanyProductModel, UserModel } from "@/mongo";

export const main = middyfy<typeof schema>(
  async (event) => {
    const {
      countryCode,
      firstName,
      lastName,
      mobileNo,
      password,
      companyName,
      productId,
    } = event.body;
    const session = event.session || {};

    const emailId = event.body.emailId.toLowerCase();
    const existingUserInfo = await UserModel.findOne({
      emailId: emailId,
      status: "ACTIVE",
    });

    if (existingUserInfo) {
      throw new HttpException("USER_EXISTS", HttpStatusCode.Conflict);
    }

    const hash = await bcrypt.hash(password, 10);

    const userInfo = await UserModel.create({
      countryCode: countryCode,
      emailId: emailId,
      firstName: firstName,
      lastName: lastName,
      mobileNo: mobileNo,
      password: hash,
      status: "ACTIVE",
    });
    session.userId = userInfo._id.toString();

    let companyInfo;
    let productInfo;

    if (companyName) {
      companyInfo = await CompanyModel.create({
        companyName: companyName,
        primaryUserId: userInfo._id,
        status: "ACTIVE",
      });
    }

    if (productId && companyInfo) {
      productInfo = await CompanyProductModel.create({
        companyId: companyInfo._id,
        status: "ACTIVE",
        productId: productId,
      });

      setSessionCompanyId(
        session,
        productInfo.productId,
        companyInfo._id.toString()
      );
    }

    return formatJSONResponse({
      isSuccess: true,
    });
  },
  {
    checkAuth: false,
  }
);
