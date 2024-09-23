import { S3_HOST } from "@/env";
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

const client = new S3Client({});

export const moveTempFileToAnotherBucket = async ({
  url,
  bucketToMove,
  prependKey = "",
  acl,
}: {
  url: string;
  bucketToMove: string;
  prependKey?: string;
  acl?: ObjectCannedACL;
}) => {
  const sourceBucket = process.env.S3_TEMP_BUCKET;
  const urlWithoutPorotocl = url.replace(/^https?:\/\//, "");
  const sourceKey = urlWithoutPorotocl
    .replace(`${S3_HOST}/${sourceBucket}/`, "")
    .replace(`${sourceBucket}.${S3_HOST}/`, "");
  if (sourceKey == urlWithoutPorotocl) {
    return {
      url,
    };
  }
  let destinationKey = prependKey;
  if (prependKey && !prependKey.endsWith("/")) {
    destinationKey + "/";
  }
  destinationKey += sourceKey;
  const copyCommand = new CopyObjectCommand({
    CopySource: sourceBucket + "/" + sourceKey,
    Bucket: bucketToMove,
    Key: destinationKey,
    ACL: acl || undefined,
  });
  await client.send(copyCommand);
  const deleteComand = new DeleteObjectCommand({
    Bucket: sourceBucket,
    Key: sourceKey,
  });
  await client.send(deleteComand);

  return {
    url: "https://" + S3_HOST + "/" + bucketToMove + "/" + destinationKey,
  };
};
