import { OtpFlow } from '@/mongo/otp.schema';
import {
  AwsFunctionHandler,
  AwsFunctionImage,
} from 'serverless/plugins/aws/provider/awsProvider';

export type Session = {
  userId?: string;
  bookingsApp?: {
    companyId?: string;
  };
  projectsApp?: {
    companyId?: string;
  };
  chatApp?: {
    companyId: string;
  };
  otp?: {
    flow: OtpFlow;
    id: string;
  };
  campaignApp?: {
    companyId: string;
  };
};

export type AwsFunction = AwsFunctionHandler | AwsFunctionImage;
