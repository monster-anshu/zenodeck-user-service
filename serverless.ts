import { Serverless } from "serverless/aws";
import * as functions from "./src/functions";

const serverlessConfiguration: Serverless = {
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
      SESSION_JWT_SECRET: "${env:SESSION_JWT_SECRET}",
      STAGE: "${env:STAGE}",
      TZ: "Asia/Kolkata",
    },
    apiGateway: {
      // disableDefaultEndpoint: true,
    } as never,
  },
  package: { individually: true },
  functions: functions,
};

module.exports = serverlessConfiguration;
