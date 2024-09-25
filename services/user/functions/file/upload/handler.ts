import { middyfy } from '@/lib/middyfy';
import schema from './schema';
import { extension } from './extension-map';
import { formatJSONResponse } from '@/lib/api-gateway';
import { correctFileName, getUploadPath } from './utills';
import { S3_TEMP_BUCKET } from '@/env';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({});

interface UploadSetting {
  bucket: string;
  maxFileSizeInMB?: number;
}

const moduleBucketMapping: Record<string, UploadSetting> = {
  default: {
    bucket: S3_TEMP_BUCKET,
  },
  userUploads: {
    bucket: S3_TEMP_BUCKET,
    maxFileSizeInMB: 5,
  },
};

export const main = middyfy<typeof schema>(async (event) => {
  const { mimeType } = event.body;
  const body = event.body;

  let fileName = Date.now() + '';

  const ext = extension(mimeType);
  if (!ext) {
    return formatJSONResponse({
      isSuccess: false,
      error: 'MIME_TYPE_NOT_SUPPORTED',
    });
  }

  if (body.fileName) {
    const fileNameWoExt = fileName.substring(0, body.fileName.lastIndexOf('.'));
    fileName += '_' + correctFileName(fileNameWoExt);
  }

  const Key = getUploadPath() + fileName + '.' + ext;
  const module = body.module || 'default';
  const bucketSetting = moduleBucketMapping[module];

  const { url, fields } = await createPresignedPost(client, {
    Bucket: bucketSetting.bucket,
    Key,
    Conditions: [
      [
        'content-length-range',
        0,
        (bucketSetting.maxFileSizeInMB || 5) * 1000000 || 512000000,
      ],
    ],
    Fields: {
      ContentType: body.mimeType,
    },
    Expires: 300,
  });

  return formatJSONResponse({
    isSuccess: true,
    url: url.replace(/\/$/, ''),
    fields,
  });
});
