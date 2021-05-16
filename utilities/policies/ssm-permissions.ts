import { Effect, PolicyStatement } from "@aws-cdk/aws-iam";

/**
 * Creates an IAM policy statement to give Session Manager access to the resource.
 * 
 * @returns A PolicyStatement allowing Session Manager to access resource
 */
export const createSsmPermissions = (): PolicyStatement => new PolicyStatement({
  actions: [
    "ssmmessages:*",
    "ssm:UpdateInstanceInformation",
    "ec2messages:*"
  ],
  effect: Effect.ALLOW,
  resources: ['*'],
});
