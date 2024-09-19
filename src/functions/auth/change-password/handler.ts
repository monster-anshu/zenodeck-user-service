import { middyfy } from "@/lib/internal";
import schema from "./schema";
import { formatJSONResponse } from "@/lib/api-gateway";
import { OtpModel } from "@/mongo/otp.schema";
import { generateOTP } from "@/utils/random";

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
