import { Effect, PolicyStatement } from "@aws-cdk/aws-iam";


/**
 * Creates an IAM policy statement to allow EC2 to create a service linked role.
 * 
 * @returns A PolicyStatement to allow creation of a service linked role
 */
 export const createSsmParameterPermissions = (): PolicyStatement => new PolicyStatement({
  actions: [
    "ssm:GetParameter",
  ],
  effect: Effect.ALLOW,
  resources: [
    "arn:aws:ssm:*:*:parameter/AmazonCloudWatch-*",
  ],
});

/**
 * Creates an IAM policy statement to give EC2 access to CloudWatch.
 * 
 * @returns A PolicyStatement giving CloudWatch full access to EC2
 */
export const createCloudWatchPermissions = (): PolicyStatement => new PolicyStatement({
  actions: [
    "cloudwatch:PutMetricData",
    "ec2:DescribeVolumes",
    "ec2:DescribeTags",
    "logs:PutLogEvents",
    "logs:DescribeLogStreams",
    "logs:DescribeLogGroups",
    "logs:CreateLogStream",
    "logs:CreateLogGroup",
  ],
  effect: Effect.ALLOW,
  resources: ['*'],
});
