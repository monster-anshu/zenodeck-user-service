import { middyfy } from '@/lib/internal';
import schema from './schema';
import { moveTempFileToAnotherBucket } from '@/lib/s3/move-file-asset';
import { S3_BUCKETS } from '@/lib/s3/folder';
import { CompanyModel } from '@/mongo';
import { Types } from 'mongoose';
import { formatJSONResponse } from '@/lib/api-gateway';

export const main = middyfy<typeof schema>(async (event) => {
  const { companyName, companyLogo } = event.body;
  const userId = event.session?.userId!;
  const companyId = event.pathParameters?.['companyId']!;

  let companyLogoToUse = undefined;
  if (companyLogo) {
    const { url } = await moveTempFileToAnotherBucket({
      url: companyLogo,
      bucketToMove: S3_BUCKETS.USER_UPLOAD,
      prependKey: 'company-documents/' + companyId + '/logo/',
      acl: 'public-read',
    });
    companyLogoToUse = url;
  }

  const companyInfo = await CompanyModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(companyId),
      primaryUserId: new Types.ObjectId(userId),
      status: 'ACTIVE',
    },
    {
      $set: {
        companyLogo: companyLogoToUse,
        companyName,
      },
    },
    {
      new: true,
    },
  ).lean();

  if (!companyInfo) {
    return formatJSONResponse({
      isSuccess: false,
    });
  }

  return formatJSONResponse({
    isSuccess: true,
    companyInfo,
  });
});
