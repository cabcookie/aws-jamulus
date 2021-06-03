import { Policy, PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { Bucket } from "@aws-cdk/aws-s3";
import { Construct } from "@aws-cdk/core";
import { createGetObjectPermissions, createListBucketPermissions } from "../policies/bucket-permissions";
import { createCloudWatchPermissions, createSsmParameterPermissions } from "../policies/cloud-watch-agent-permission";
import { createSsmPermissions } from "../policies/ssm-permissions";

export interface DetailedServerMetricsSettings {
  /**
   * Provide `true` if you want to have detailed metrics about the state of your
   * servers (i.e., memory usage, disk space etc.). The CloudWatch Agent will be
   * installed on the server to retrieve those detailed metrics.
   */
   detailedServerMetrics?: boolean;  
};

export interface Ec2InstanceRoleProps {
  /**
   * Add policy statements to give additional permissions to your EC2 instance.
   * Your servers will automatically give permissions to the Systems
   * Manager and when the `detailedServerMetrics` are switched on, it will also
   * give permission to CloudWatch already. If there is a bucket provided,
   * the server will also have GetObject and ListBucket permissions on S3 and
   * this bucket.
   */
   policyStatments?: PolicyStatement[];
   /**
    * An S3 bucket where the server should have access to.
    */
   bucket?: Bucket;
};

interface CombinedEc2InstanceRoleProps extends Ec2InstanceRoleProps, DetailedServerMetricsSettings {};

export class Ec2InstanceRole extends Role {
  constructor(scope: Construct, id: string, {
    bucket,
    detailedServerMetrics,
    policyStatments,
  }: CombinedEc2InstanceRoleProps) {
    policyStatments = policyStatments || [];
    policyStatments.push(createSsmPermissions());
    if (detailedServerMetrics) {
      policyStatments.push(createCloudWatchPermissions());
      policyStatments.push(createSsmParameterPermissions());
    }
    if (bucket) {
      policyStatments.push(createGetObjectPermissions(bucket));
      policyStatments.push(createListBucketPermissions(bucket));
    }

    super(scope, `${id}Role`, { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });
    this.attachInlinePolicy(new Policy(scope, `${id}RolePolicy`, { statements: policyStatments }));
  };
};
