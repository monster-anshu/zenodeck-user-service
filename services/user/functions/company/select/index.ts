import { generatePath, handlerPath } from "@/lib/handler-resolver";
import { AwsFunction } from "@/types";
import schema from "./schema";

export const companySelect: AwsFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: generatePath(__dirname),
        request: {
          schemas: {
            "application/json": schema,
          },
        },
      },
    },
  ],
};
