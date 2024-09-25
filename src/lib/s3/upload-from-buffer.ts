import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  correctFileName,
  getUploadPath,
} from '@user-functions/file/upload/utills';

const client = new S3Client({});

export const getRandomFilePath = ({
  fileName,
  ext,
  prependKey,
}: {
  fileName: string;
  ext?: string;
  prependKey?: string;
}) => {
  const finalExtenstion = ext;
  let finalFileName = Date.now() + '';
  if (fileName) {
    const fileNameWoExt = fileName.substring(0, fileName.lastIndexOf('.'));
    finalFileName += '/' + correctFileName(fileNameWoExt);
  }
  let Key = '';
  const processedPrependKey = prependKey
    ? prependKey.replace(/^\/+|\/+$/g, '')
    : '';
  if (processedPrependKey) {
    Key += processedPrependKey + '/';
  }
  Key += getUploadPath() + finalFileName + '.' + finalExtenstion;
  return {
    Key,
  };
};

export const uploadFromBuffer = async ({
  data,
  fileName,
  bucket = process.env.S3_TEMP_BUCKET,
  prependKey = '',
  contentType,
  acl,
  customFileKey,
  ext,
}: {
  data: any;
  fileName: string;
  bucket?: string;
  prependKey?: string;
  contentType?: string;
  acl?: ObjectCannedACL;
  customFileKey?: string;
  ext: string;
}) => {
  let destinationKey = customFileKey;
  if (!destinationKey) {
    const { Key } = getRandomFilePath({
      fileName,
      ext,
      prependKey,
    });
    destinationKey = Key;
  }
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: destinationKey,
      Body: data,
      ACL: acl || undefined,
      ContentType: contentType,
    }),
  );
  return {
    key: destinationKey,
  };
};
