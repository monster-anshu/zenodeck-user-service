import middy from "@middy/core";
import { ValidatedEventAPIGatewayProxyEvent } from "./api-gateway";
import { JSONSchema } from "json-schema-to-ts";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { jwtSessionMiddleware } from "@/middleware/jwt-session";
import { errorMiddleware } from "@/middleware/error.middleware";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";

const bodyStringMiddleware = () => {
  const bodyStringMiddlewareBefore = (request: middy.Request) => {
    const { body = "" } = request.event;
    const data = request.event.isBase64Encoded
      ? Buffer.from(body, "base64").toString()
      : body;
    request.event.rawBody = data;
  };

  return {
    before: bodyStringMiddlewareBefore,
  };
};

export const middyfy = <T extends JSONSchema = {}>(
  handler: ValidatedEventAPIGatewayProxyEvent<T>
) => {
  return middy({ timeoutEarlyInMillis: 0 })
    .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
    .use(bodyStringMiddleware())
    .use(
      middyJsonBodyParser({
        disableContentTypeError: true,
      })
    )
    .use(jwtSessionMiddleware())
    .use(errorMiddleware())
    .handler(handler as never);
};
