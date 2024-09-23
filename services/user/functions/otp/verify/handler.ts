import { middyfy } from "@/lib/internal";
import schema from "./schema";
import { formatJSONResponse } from "@/lib/api-gateway";
import { HttpException } from "@/lib/error";
import { HttpStatusCode } from "@/types/http";
import bcrypt from "bcryptjs";
import { Otp, OtpModel, UserModel } from "@/mongo";
import { FilterQuery, Types } from "mongoose";

export const main = middyfy<typeof schema>(
  async (event) => {
    const { otp } = event.body;
    const session = event.session || {};

    if (!session.otp) {
      throw new HttpException("OTP_NOT_FOUND", HttpStatusCode.BadRequest);
    }

    const filter: FilterQuery<Otp> = {
      otp: otp,
      flow: session.otp.flow,
      _id: new Types.ObjectId(session.otp.id),
    };

    const otpDoc = await OtpModel.findOne(filter).lean();

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
    } else if (otpDoc.flow === "FORGOT_PASSWORD") {
      const password = otpDoc.meta.password;
      const userId = otpDoc.userId;

      if (!password) {
        throw new HttpException("INVALID_DATA", HttpStatusCode.Forbidden);
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
  },
  {
    checkAuth: false,
  }
);
