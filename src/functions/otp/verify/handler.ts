import { middyfy } from "@/lib/internal";
import schema from "./schema";
import { formatJSONResponse } from "@/lib/api-gateway";
import { HttpException } from "@/lib/error";
import { HttpStatusCode } from "axios";
import bcrypt from "bcryptjs";
import { OtpModel, UserModel } from "@/mongo";

export const main = middyfy<typeof schema>(async (event) => {
  const { otp } = event.body;
  const session = event.session || {};

  if (!session.otp) {
    throw new HttpException("OTP_NOT_FOUND", HttpStatusCode.BadRequest);
  }

  const otpDoc = await OtpModel.findOne({
    userId: session.userId,
    otp: otp,
    flow: session.otp.flow,
  }).lean();

  if (!otpDoc) {
    throw new HttpException("INVALID_OTP", HttpStatusCode.Forbidden);
  }

  delete session.otp;

  if (otpDoc.flow === "CHANGE_PASSWORD") {
    const password = otpDoc.meta.password;

    if (!password) {
      throw new HttpException("INVALID_DATA", HttpStatusCode.Forbidden);
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
      }
    );
  }

  await OtpModel.deleteOne({
    _id: otpDoc._id,
  });

  event.session = session;

  return formatJSONResponse({
    isSuccess: true,
  });
});
