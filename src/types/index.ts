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
};

export type AwsFunction = AwsFunctionHandler | AwsFunctionImage;
