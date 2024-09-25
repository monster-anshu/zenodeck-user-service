import { middyfy } from '@/lib/internal';
import schema from './schema';
import { formatJSONResponse } from '@/lib/api-gateway';
import { generateOTP } from '@/utils/random';
import { OtpModel, UserModel } from '@/mongo';
import { sendEmail } from '@/lib/email';

export const main = middyfy<typeof schema>(async (event) => {
  const { password } = event.body;
  const session = event.session || {};

  const userInfo = await UserModel.findOne({
    _id: session.userId,
    status: 'ACTIVE',
  }).lean();

  const otpDoc = await OtpModel.findOneAndUpdate(
    {
      flow: 'CHANGE_PASSWORD',
      userId: session.userId,
    },
    {
      $setOnInsert: {
        flow: 'CHANGE_PASSWORD',
        userId: session.userId,
        createdAt: new Date(),
      },
      $set: {
        otp: generateOTP(),
        meta: {
          password,
        },
      },
    },
    {
      new: true,
      upsert: true,
    },
  ).lean();

  await sendEmail({
    to: userInfo!.emailId,
    html: `Your otp for change password is ${otpDoc.otp}`,
    subject: 'Change Password',
  });

  session.otp = {
    flow: 'CHANGE_PASSWORD',
    id: otpDoc._id.toString(),
  };

  event.session = session;

  return formatJSONResponse({
    isSuccess: true,
  });
});
