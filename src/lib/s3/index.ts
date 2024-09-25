import { S3_TEMP_BUCKET } from '@/env';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({});
export const createPresignedUrl = async ({
  bucket = S3_TEMP_BUCKET,
  key,
}: {
  bucket?: string;
  key: string;
}) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 899 });
};
