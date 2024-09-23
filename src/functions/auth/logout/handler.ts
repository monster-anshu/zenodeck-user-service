import { formatJSONResponse } from "@/lib/api-gateway";
import { middyfy } from "@/lib/internal";

export const main = middyfy<{}>(
  async (event) => {
    event.session = {};

    const response = formatJSONResponse({
      isSuccess: true,
    });

    return response;
  },
  {
    checkAuth: false,
  }
);
