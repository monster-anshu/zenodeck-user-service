import { formatJSONResponse } from '@/lib/api-gateway';
import { middyfy } from '@/lib/internal';
import { CompanyService } from '@/services/company.service';

export const main = middyfy<{}>(async (event) => {
  const session = event.session || {};
  const userId = session.userId!;

  const companyList = await CompanyService.get(userId!);

  return formatJSONResponse({
    isSuccess: true,
    companyList,
  });
});
