export const API_PREFIX = process.env.API_PREFIX as string;
export const BASE_DOMAIN = process.env.BASE_DOMAIN as string;
export const USER_SERVICE_DOMAIN = 'accounts.' + BASE_DOMAIN;
export const ENCRYPTION_IV = process.env.ENCRYPTION_IV;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const MONGO_URI = process.env.MONGO_URI as string;
export const SESSION_JWT_SECRET = process.env.SESSION_JWT_SECRET as string;
export const STAGE = process.env.STAGE as string;
export const RESEND_API_KEY = process.env.RESEND_API_KEY as string;
export const SESSION_COOKIE_SECRET = process.env
  .SESSION_COOKIE_SECRET as string;
export const S3_TEMP_BUCKET = process.env.S3_TEMP_BUCKET as string;
export const S3_HOST = process.env.S3_HOST as string;
export const S3_USER_UPLOAD = process.env.S3_USER_UPLOAD as string;

export const CAMPAIGN_APP_API_URI = process.env.CAMPAIGN_APP_API_URI as string;
export const CAMPAIGN_APP_API_KEY = process.env.CAMPAIGN_APP_API_KEY as string;
export const IS_OFFLINE = process.env.IS_OFFLINE === 'true';
