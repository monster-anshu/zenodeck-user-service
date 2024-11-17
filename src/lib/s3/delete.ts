import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_BUCKETS } from './folder';
import { S3_HOST } from '@/env';

const client = new S3Client({});

export const deleteFile = async ({
  bucketKey,
  url,
}: {
  url: string;
  bucketKey: keyof typeof S3_BUCKETS;
}) => {
  const sourceBucket = S3_BUCKETS[bucketKey];

  const urlWithoutPorotocl = url.replace(/^https?:\/\//, '');
  const sourceKey = urlWithoutPorotocl
    .replace(`${S3_HOST}/${sourceBucket}/`, '')
    .replace(`${sourceBucket}.${S3_HOST}/`, '');
  const deleteComand = new DeleteObjectCommand({
    Bucket: sourceBucket,
    Key: sourceKey,
  });

  await client.send(deleteComand);
};
