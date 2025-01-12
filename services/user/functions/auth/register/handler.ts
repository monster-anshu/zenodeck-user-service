import { middyfy } from '@/lib/internal';
import schema from './schema';
import { HttpException } from '@/lib/error';
import { HttpStatusCode } from '@/types/http';
import bcrypt from 'bcryptjs';
import { setSessionCompanyId } from '@/services/session';
import { formatJSONResponse } from '@/lib/api-gateway';
import { CompanyModel, UserModel } from '@/mongo';
import { CompanyService } from '@/services/company.service';
import { ProductService } from '@/services/product.service';

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
      status: 'ACTIVE',
    });

    if (existingUserInfo) {
      throw new HttpException('USER_EXISTS', HttpStatusCode.Conflict);
    }

    const hash = await bcrypt.hash(password, 10);

    const userInfo = await UserModel.create({
      countryCode: countryCode,
      emailId: emailId,
      firstName: firstName,
      lastName: lastName,
      mobileNo: mobileNo,
      password: hash,
      status: 'ACTIVE',
    });
    session.userId = userInfo._id.toString();

    // TODO : add email verification before creating company
    let companyInfo;
    let productInfo;

    if (companyName) {
      companyInfo = await CompanyModel.create({
        companyName: companyName,
        primaryUserId: userInfo._id,
        status: 'ACTIVE',
      });
    }

    if (productId && companyInfo) {
      productInfo = await CompanyService.addProduct({
        companyId: companyInfo._id.toString(),
        productId: productId,
        userId: userInfo._id.toString(),
      });

      await CompanyService.addProductPermissionToUser({
        companyId: companyInfo._id.toString(),
        userId: userInfo._id.toString(),
        products: [productId],
        role: 'SUPER_ADMIN',
      });

      await ProductService.populateDefaultAppData({
        companyId: companyInfo._id.toString(),
        companyName: companyInfo.companyName,
        productId: productId,
        userId: userInfo._id.toString(),
      });

      setSessionCompanyId(
        session,
        productInfo.productId,
        companyInfo._id.toString(),
      );
    }

    event.session = session;

    return formatJSONResponse({
      isSuccess: true,
    });
  },
  {
    checkAuth: false,
  },
);
