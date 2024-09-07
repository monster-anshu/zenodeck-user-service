import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { Session } from "@/types";

export type ValidatedAPIGatewayProxyEvent<S extends JSONSchema> = Omit<
  APIGatewayProxyEvent & {
    session?: Session;
  },
  "body"
> & {
  rawBody: string;
  body: FromSchema<S>;
};

export type ValidatedEventAPIGatewayProxyEvent<S extends JSONSchema> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export const formatJSONResponse = (
  body: object,
  meta?: Omit<APIGatewayProxyStructuredResultV2, "body">,
) => {
  return {
    ...meta,
    statusCode: meta?.statusCode || 200,
    body: JSON.stringify(body),
  };
};

export const formatRedirectResponse = (
  Location: string,
  meta?: APIGatewayProxyStructuredResultV2,
) => {
  return {
    ...meta,
    headers: {
      ...meta?.headers,
      Location,
    },
    statusCode: meta?.statusCode || 302,
    body: "",
  };
};
