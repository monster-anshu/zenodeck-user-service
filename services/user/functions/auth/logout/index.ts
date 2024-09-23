import { generatePath, handlerPath } from "@/lib/handler-resolver";
import { AwsFunction } from "@/types";

export const authLogout: AwsFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: generatePath(__dirname),
      },
    },
  ],
};
