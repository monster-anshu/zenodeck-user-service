import { formatJSONResponse } from "@/lib/api-gateway";
import { middyfy } from "@/lib/internal";
import { UserModel } from "@/mongo";
import { Types } from "mongoose";
import schema from "./schema";

export const main = middyfy<typeof schema>(async (event) => {
  const { firstName, lastName } = event.body;

  const user = await UserModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(event.session?.userId),
    },
    {
      $set: {
        firstName,
        lastName,
      },
    },
    {
      new: true,
    }
  )
    .select("-password")
    .lean();

  return formatJSONResponse({
    user,
  });
});
