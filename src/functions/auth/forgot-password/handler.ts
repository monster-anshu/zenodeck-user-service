import { middyfy } from "@/lib/internal";
import schema from "./schema";
import { formatJSONResponse } from "@/lib/api-gateway";
import { generateOTP } from "@/utils/random";
import { OtpModel, UserModel } from "@/mongo";
import { HttpException } from "@/lib/error";
import { HttpStatusCode } from "@/types/http";
import { sendEmail } from "@/lib/email";

export const main = middyfy<typeof schema>(
  async (event) => {
    const { password, emailId } = event.body;
    const session = event.session || {};

    const userInfo = await UserModel.findOne({
      emailId: emailId,
      status: "ACTIVE",
    }).lean();

    if (!userInfo) {
      throw new HttpException("USER_NOT_FOUND", HttpStatusCode.NotFound);
    }

    const otpDoc = await OtpModel.findOneAndUpdate(
      {
        flow: "FORGOT_PASSWORD",
        userId: userInfo._id,
      },
      {
        $setOnInsert: {
          flow: "FORGOT_PASSWORD",
          userId: userInfo._id,
          createdAt: new Date(),
        },
        $set: {
          otp: generateOTP(),
          meta: {
            password,
            emailId,
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    ).lean();

    await sendEmail({
      to: userInfo.emailId,
      html: `Your otp for forgot password is ${otpDoc.otp}`,
      subject: "Forgot Password",
    });

    session.otp = {
      flow: "FORGOT_PASSWORD",
      id: otpDoc._id.toString(),
    };

    event.session = session;

    return formatJSONResponse({
      isSuccess: true,
    });
  },
  {
    checkAuth: false,
  }
);
