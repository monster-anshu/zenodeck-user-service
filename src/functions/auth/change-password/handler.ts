import { middyfy } from "@/lib/internal";
import schema from "./schema";
import { formatJSONResponse } from "@/lib/api-gateway";
import { generateOTP } from "@/utils/random";
import { OtpModel } from "@/mongo";

export const main = middyfy<typeof schema>(async (event) => {
  const { password } = event.body;
  const session = event.session || {};

  await OtpModel.findOneAndUpdate(
    {
      flow: "CHANGE_PASSWORD",
      userId: session.userId,
    },
    {
      $setOnInsert: {
        flow: "CHANGE_PASSWORD",
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
    }
  ).lean();

  session.otp = {
    flow: "CHANGE_PASSWORD",
  };

  event.session = session;

  return formatJSONResponse({
    isSuccess: true,
  });
});
