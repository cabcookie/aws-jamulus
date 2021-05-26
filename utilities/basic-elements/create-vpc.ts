import { IVpc, Vpc } from "@aws-cdk/aws-ec2";
import { Policy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { Bucket } from "@aws-cdk/aws-s3";
import { Stack } from "@aws-cdk/core";
import { createGetObjectPermissions, createListBucketPermissions } from "../policies/bucket-permissions";
import { createCloudWatchPermissions, createSsmParameterPermissions } from "../policies/cloud-watch-agent-permission";
import { createSsmPermissions } from "../policies/ssm-permissions";

export interface VpcProperties {
  vpc: IVpc;
  role: Role;
};

export const createVpc = (stack: Stack, configBucket: Bucket): VpcProperties => {
  const vpc = Vpc.fromLookup(stack, 'VPC', { isDefault: true });

  const role = new Role(stack, 'InstanceRole', { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });
  role.attachInlinePolicy(new Policy(stack, 'InstanceRolePolicy', {
    statements: [
      createSsmPermissions(),
      createGetObjectPermissions(configBucket),
      createListBucketPermissions(configBucket),
      createSsmParameterPermissions(),
      createCloudWatchPermissions(),
    ],
  }));

  return { vpc, role };
};
