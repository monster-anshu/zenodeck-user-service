import { formatJSONResponse } from "@/lib/api-gateway";
import { HttpException } from "@/lib/error";
import { UserModel } from "@/mongo";
import { Session } from "@/types";
import middy from "@middy/core";
import { HttpStatusCode } from "@/types/http";
import { Types } from "mongoose";

export interface MiddyOptions {
  checkAuth?: boolean;
}

export const userAuthMiddleware = (options?: MiddyOptions) => {
  const { checkAuth = true } = options || {};
  const userAuthMiddlewareBefore = async (request: middy.Request) => {
    const session: Session = request.event?.session || {};
    const userId = session.userId;

    if (!checkAuth) return;
    let user;

    if (userId) {
      user = await UserModel.findOne({
        _id: new Types.ObjectId(userId),
        status: "ACTIVE",
      })
        .select("-password")
        .lean();
    }

    if (!user) {
      throw new HttpException("UNAUTHORIZED", HttpStatusCode.Unauthorized);
    }

    session.userId = user._id.toString();
    request.event.session = session;
  };

  return {
    before: userAuthMiddlewareBefore,
  };
};
