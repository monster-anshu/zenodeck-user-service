import { middyfy } from '@/lib/internal';
import schema from './schema';
import { formatJSONResponse } from '@/lib/api-gateway';
import { HttpException } from '@/lib/error';
import { HttpStatusCode } from '@/types/http';
import bcrypt from 'bcryptjs';
import { CompanyModel, Otp, OtpModel, UserModel } from '@/mongo';
import { FilterQuery, Types } from 'mongoose';
import { Product } from '@/common/const';
import { CompanyService } from '@/services/company.service';
import { ProductService } from '@/services/product.service';
import { Session } from '@/types';
import { setSessionCompanyId } from '@/services/session';

async function registerVerifiedUser(otpDoc: Otp, session: Session) {
  const companyName: string | null = otpDoc.meta.companyName || null;
  const productId: Product | null = otpDoc.meta.productId || null;
  const userId = otpDoc.userId;

  let companyInfo;
  let productInfo;

  const user = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      status: 'UNVERIFIED',
    },
    {
      $set: {
        status: 'ACTIVE',
      },
    },
  ).lean();

  if (!user) {
    return;
  }

  session.userId = userId.toString();

  if (companyName) {
    companyInfo = await CompanyModel.create({
      companyName: companyName,
      primaryUserId: userId,
      status: 'ACTIVE',
    });
  }

  if (productId && companyInfo) {
    productInfo = await CompanyService.addProduct({
      companyId: companyInfo._id.toString(),
      productId: productId,
      userId: userId.toString(),
    });

    await CompanyService.addProductPermissionToUser({
      companyId: companyInfo._id.toString(),
      userId: userId.toString(),
      products: [productId],
      role: 'SUPER_ADMIN',
    });

    await ProductService.populateDefaultAppData({
      companyId: companyInfo._id.toString(),
      companyName: companyInfo.companyName,
      productId: productId,
      userId: userId.toString(),
    });

    setSessionCompanyId(
      session,
      productInfo.productId,
      companyInfo._id.toString(),
    );
  }
}

export const main = middyfy<typeof schema>(
  async (event) => {
    const { otp } = event.body;
    const session = event.session || {};

    if (!session.otp) {
      throw new HttpException('OTP_NOT_FOUND', HttpStatusCode.BadRequest);
    }

    const filter: FilterQuery<Otp> = {
      otp: otp,
      flow: session.otp.flow,
      _id: new Types.ObjectId(session.otp.id),
    };

    const otpDoc = await OtpModel.findOne(filter).lean();

    if (!otpDoc) {
      throw new HttpException('INVALID_OTP', HttpStatusCode.Forbidden);
    }

    delete session.otp;

    if (otpDoc.flow === 'CHANGE_PASSWORD') {
      const password = otpDoc.meta.password;

      if (!password) {
        throw new HttpException('INVALID_DATA', HttpStatusCode.Forbidden);
      }

      const hash = await bcrypt.hash(password, 10);

      await UserModel.updateOne(
        {
          _id: session.userId,
        },
        {
          $set: {
            password: hash,
          },
        },
      );
    } else if (otpDoc.flow === 'FORGOT_PASSWORD') {
      const password = otpDoc.meta.password;
      const userId = otpDoc.userId;

      if (!password) {
        throw new HttpException('INVALID_DATA', HttpStatusCode.Forbidden);
      }

      const hash = await bcrypt.hash(password, 10);

      await UserModel.updateOne(
        {
          _id: userId,
        },
        {
          $set: {
            password: hash,
          },
        },
      );
    } else if (otpDoc.flow === 'REGISTER') {
      await registerVerifiedUser(otpDoc, session);
    }

    await OtpModel.deleteOne({
      _id: otpDoc._id,
    });

    event.session = session;

    return formatJSONResponse({
      isSuccess: true,
    });
  },
  {
    checkAuth: false,
  },
);
