import { Serverless } from "serverless/aws";
import * as functions from "./functions";
import type { BuildOptions } from "esbuild";

const serverlessConfiguration: Serverless & {
  build: unknown;
} = {
  service: "user-service",

  frameworkVersion: "4",
  useDotenv: true,

  plugins: ["serverless-deployment-bucket", "serverless-prune-plugin"],

  custom: {
    prune: {
      automatic: true,
      number: 1,
    },
    logRetentionInDays: {
      dev: 1,
    },
    apiPrefix: "/api/v1/user",
  },

  build: {
    esbuild: {
      external: ["@aws-sdk/*"],
      sourcemap: false,
      minify: true,
      bundle: true,
      target: ["node20"],
    } as BuildOptions,
  },

  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    memorySize: 128,
    timeout: 30,
    region: "us-east-1",
    stage: "${env:STAGE}",
    deploymentBucket: {
      name: "${env:SERVERLESS_DEPLOYMENT_BUCKET}",
    },
    logRetentionInDays: 1,
    environment: {
      API_PREFIX: "${self:custom.apiPrefix}",
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      BASE_DOMAIN: "${env:BASE_DOMAIN}",
      ENCRYPTION_IV: "${env:ENCRYPTION_IV}",
      ENCRYPTION_KEY: "${env:ENCRYPTION_KEY}",
      MONGO_URI: "${env:MONGO_URI}",
      RESEND_API_KEY: "${env:RESEND_API_KEY}",
      S3_HOST: "${env:S3_HOST}",
      S3_TEMP_BUCKET: "${env:S3_TEMP_BUCKET}",
      S3_USER_UPLOAD: "${env:S3_USER_UPLOAD}",
      SESSION_JWT_SECRET: "${env:SESSION_JWT_SECRET}",
      STAGE: "${env:STAGE}",
      TZ: "Asia/Kolkata",
    },
    apiGateway: {
      // disableDefaultEndpoint: true,
    } as never,
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Resource: "*",
            Action: "s3:*",
          },
        ],
      },
    },
  },
  package: { individually: true },
  functions: functions,
};

module.exports = serverlessConfiguration;
