import { middyfy } from '@/lib/internal';
import schema from './schema';
import { HttpException } from '@/lib/error';
import { HttpStatusCode } from '@/types/http';
import bcrypt from 'bcryptjs';
import { formatJSONResponse } from '@/lib/api-gateway';
import { OtpModel, UserModel } from '@/mongo';
import { generateOTP } from '@/utils/random';
import { sendEmail } from '@/lib/email';

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
      status: 'UNVERIFIED',
    });

    const otpDoc = await OtpModel.findOneAndUpdate(
      {
        flow: 'REGISTER',
        userId: userInfo._id,
      },
      {
        $setOnInsert: {
          flow: 'REGISTER',
          userId: userInfo._id,
          createdAt: new Date(),
        },
        $set: {
          otp: generateOTP(),
          meta: {
            emailId,
            companyName,
            productId,
          },
        },
      },
      {
        new: true,
        upsert: true,
      },
    ).lean();

    session.otp = {
      flow: 'REGISTER',
      id: otpDoc._id.toString(),
    };

    event.session = session;

    await sendEmail({
      template: {
        eventData: {
          otp: otpDoc.otp,
        },
        key: 'REGISTER',
        userId: userInfo._id.toString(),
      },
      to: userInfo.emailId,
    });

    return formatJSONResponse({
      isSuccess: true,
    });
  },
  {
    checkAuth: false,
  },
);
