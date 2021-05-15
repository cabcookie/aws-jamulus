import { Effect, PolicyStatement } from "@aws-cdk/aws-iam";

export const createSsmPermissions = (): PolicyStatement => new PolicyStatement({
  actions: [
    "ssmmessages:*",
    "ssm:UpdateInstanceInformation",
    "ec2messages:*"
  ],
  effect: Effect.ALLOW,
  resources: ['*'],
});
