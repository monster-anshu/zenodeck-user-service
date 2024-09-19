import { OtpFlow } from "@/mongo/otp.schema";
import {
  AwsFunctionHandler,
  AwsFunctionImage,
} from "serverless/plugins/aws/provider/awsProvider";

export type Session = {
  userId?: string;
  bookingsApp?: {
    companyId?: string;
  };
  projectsApp?: {
    companyId?: string;
  };
  otp?: {
    flow: OtpFlow;
  };
};

export type AwsFunction = AwsFunctionHandler | AwsFunctionImage;
