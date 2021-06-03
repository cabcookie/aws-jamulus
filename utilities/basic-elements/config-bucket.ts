import { Bucket } from "@aws-cdk/aws-s3";
import { Construct, RemovalPolicy } from "@aws-cdk/core";

export interface ConfigBucketName {
  /**
   * The name for the bucket where the configuration and
   * installation files for the EC2 instances should be hosted. This name must
   * be unique in the region and across all AWS Accounts. If no name is provided
   * it will create a bucket with the name `jamulus-config-bucket`.
   */
  configBucketName?: string;
};

export class ConfigBucket extends Bucket {
  /**
   * Creates a bucket to deploy config and installation files into, which
   * the instances will use for further configuration.
   * 
   * @param scope The parent Stack or Construct.
   * @param id unique ID of this resource
   * @param bucketName The name for the bucket where the configuration and
   * installation files for the EC2 instances should be hosted. This name must
   * be unique in the region and across all AWS Accounts. If no name is provided
   * it will create a bucket with the name `jamulus-config-bucket`.
   */
  constructor(scope: Construct, id: string, bucketName?: string) {
    super(scope, id, {
      bucketName: bucketName || 'jamulus-config-bucket',
      removalPolicy: RemovalPolicy.DESTROY,
    });
  };
};
