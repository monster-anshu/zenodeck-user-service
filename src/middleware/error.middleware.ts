import { formatJSONResponse } from '@/lib/api-gateway';
import { HttpException } from '@/lib/error';
import middy from '@middy/core';

export const errorMiddleware = () => {
  const onError = async (request: middy.Request) => {
    const { error } = request;
    if (error instanceof HttpException) {
      request.response = {
        ...request.response,
        ...formatJSONResponse(
          {
            isSuccess: false,
            error: error.message,
            data: error.data,
          },
          {
            statusCode: error.statusCode,
          },
        ),
      };
    } else {
      console.log('Error : ', error);
      request.response = {
        ...request.response,
        ...formatJSONResponse(
          {
            isSuccess: false,
            error: error,
          },
          {
            statusCode: 500,
          },
        ),
      };
      throw request;
    }
  };

  return {
    onError: onError,
  };
};
