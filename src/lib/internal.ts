import middy from '@middy/core';
import { ValidatedEventAPIGatewayProxyEvent } from './api-gateway';
import type { JSONSchema } from 'json-schema-to-ts';
import { MiddyOptions, userAuthMiddleware } from '@/middleware/user.middleware';
import { middyfy as simpleMiddyFy } from './middyfy';

/**
 *  This function is used to validate use session
 */
export const middyfy = <T extends JSONSchema = {}>(
  handler: ValidatedEventAPIGatewayProxyEvent<T>,
  options?: MiddyOptions,
) => {
  return simpleMiddyFy(handler as never)
    .use(userAuthMiddleware(options))
    .handler(handler as never);
};
