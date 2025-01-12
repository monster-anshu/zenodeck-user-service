import { Product, PRODUCT_IDS } from '@/common/const';
import { UserCompany } from '@/mongo/company.schema';
import { Session } from '@/types';

const sessionCompanyKeyMap = {
  BOOKINGS: 'bookingsApp',
  PROJECTS: 'projectsApp',
  CHAT_APP: 'chatApp',
  CAMPAIGN: 'campaignApp',
} as const;

export const setSessionCompanyId = (
  session: Session,
  productId: Product,
  companyId: string,
) => {
  const existingCompanyId =
    session?.[sessionCompanyKeyMap[productId]]?.companyId;
  if (!existingCompanyId || existingCompanyId != companyId) {
    session[sessionCompanyKeyMap[productId]] = {
      companyId,
    };
  }
};

export const setAllProductCompanyId = (
  session: Session,
  companies: UserCompany[],
  companyId?: string, //if provided priority to this companyId
) => {
  const companyList = [...companies];
  if (companyId) {
    const index = companyList.findIndex(
      (cur) => cur._id.toString() == companyId,
    );
    if (index >= 0) {
      companyList.unshift(companyList.splice(index, 1)[0]!);
    }
  }

  for (const company of companies) {
    for (const productId of PRODUCT_IDS) {
      if (company.allowedProductIds.includes(productId)) {
        setSessionCompanyId(session, productId, company._id.toString());
      }
    }
  }
};
