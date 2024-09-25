import { generatePath, handlerPath } from '@/lib/handler-resolver';
import schema from './schema';
import { AwsFunction } from '@/types';

export const authLogin: AwsFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: generatePath(__dirname),
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
