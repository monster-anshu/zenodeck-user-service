import { generatePath, handlerPath } from "@/lib/handler-resolver";
import { AwsFunction } from "@/types";

export const update: AwsFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "patch",
        path: generatePath(__dirname),
      },
    },
  ],
};
