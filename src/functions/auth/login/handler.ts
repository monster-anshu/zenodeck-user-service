import { formatJSONResponse } from "@/lib/api-gateway";
import { HttpException } from "@/lib/error";
import bcrypt from "bcryptjs";
import { HttpStatusCode } from "axios";
import { setAllProductCompanyId } from "@/services/session";
import { CompanyService } from "@/services/company.service";
import { UserModel } from "@/mongo";
import { middyfy } from "@/lib/internal";
import schema from "./schema";

export const main = middyfy<typeof schema>(
  async (event) => {
    let session = event.session || {};
    const { emailId, password, productId } = event.body;

    const user = await UserModel.findOne({
      emailId: emailId,
      status: "ACTIVE",
    }).lean();

    if (!user) {
      throw new HttpException("USER_NOT_FOUND", HttpStatusCode.NotFound);
    }

    if (!user.password) {
      throw new HttpException(
        "INVALID_CREDENTIAL",
        HttpStatusCode.Unauthorized
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new HttpException(
        "INVALID_CREDENTIAL",
        HttpStatusCode.Unauthorized
      );
    }

    session = {
      userId: user._id.toString(),
    };

    const companyList = await CompanyService.get(
      user._id.toString(),
      productId
    );

    if (companyList.length === 1) {
      setAllProductCompanyId(session, companyList);
    }

    event.session = session;

    const response = formatJSONResponse({
      isSuccess: true,
      companyList,
    });

    return response;
  },
  {
    checkAuth: false,
  }
);
