import { S3_TEMP_BUCKET, S3_USER_UPLOAD } from '@/env';

export const S3_BUCKET_FOLDER = {
  PROFILE: 'profile',
  COMPANY_LOGO: 'company-logo',
} as const;

export const S3_BUCKETS = {
  USER_UPLOAD: S3_USER_UPLOAD,
  TEMP: S3_TEMP_BUCKET,
} as const;
