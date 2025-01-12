import { Serverless } from 'serverless/aws';
import * as functions from './functions';
import type { BuildOptions } from 'esbuild';

const serverlessConfiguration: Serverless = {
  service: 'zenodeck-user-service',

  frameworkVersion: '3',
  useDotenv: true,

  plugins: [
    'serverless-deployment-bucket',
    'serverless-prune-plugin',
    'serverless-offline',
    'serverless-esbuild',
  ],

  custom: {
    prune: {
      automatic: true,
      number: 1,
    },
    logRetentionInDays: {
      dev: 1,
    },
    apiPrefix: '/api/v1/user',
    esbuild: {
      external: ['@aws-sdk/*'],
      sourcemap: false,
      minify: true,
      bundle: true,
      target: ['node20'],
      platform: 'node',
    } as BuildOptions,
    'serverless-offline': {},
  },
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    memorySize: 128,
    timeout: 30,
    region: 'us-east-1',
    stage: '${env:STAGE}',
    deploymentBucket: {
      name: '${env:SERVERLESS_DEPLOYMENT_BUCKET}',
    },
    logRetentionInDays: 1,
    environment: {
      API_PREFIX: '${self:custom.apiPrefix}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      BASE_DOMAIN: '${env:BASE_DOMAIN}',
      CAMPAIGN_APP_API_KEY: '${env:CAMPAIGN_APP_API_KEY}',
      CAMPAIGN_APP_API_URI: '${env:CAMPAIGN_APP_API_URI}',
      ENCRYPTION_IV: '${env:ENCRYPTION_IV}',
      ENCRYPTION_KEY: '${env:ENCRYPTION_KEY}',
      MONGO_URI: '${env:MONGO_URI}',
      RESEND_API_KEY: '${env:RESEND_API_KEY}',
      S3_HOST: '${env:S3_HOST}',
      S3_TEMP_BUCKET: '${env:S3_TEMP_BUCKET}',
      S3_USER_UPLOAD: '${env:S3_USER_UPLOAD}',
      SESSION_JWT_SECRET: '${env:SESSION_JWT_SECRET}',
      STAGE: '${env:STAGE}',
      TZ: 'Asia/Kolkata',
    },
    apiGateway: {
      // disableDefaultEndpoint: true,
    } as never,
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Resource: '*',
            Action: 's3:*',
          },
        ],
      },
    },
  },
  package: { individually: true },
  functions: functions,
};

module.exports = serverlessConfiguration;
