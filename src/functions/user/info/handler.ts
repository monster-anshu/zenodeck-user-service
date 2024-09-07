import { formatJSONResponse } from "@/lib/api-gateway";
import { middyfy } from "@/lib/internal";
import { UserModel } from "@/mongo";
import { Types } from "mongoose";

export const main = middyfy<{}>(async (event) => {
  const user = await UserModel.findOne({
    _id: new Types.ObjectId(event.session?.userId),
  }).lean();

  return formatJSONResponse({
    user,
  });
});
