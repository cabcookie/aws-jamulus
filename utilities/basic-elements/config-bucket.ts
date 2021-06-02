import { Bucket } from "@aws-cdk/aws-s3";
import { Construct, RemovalPolicy } from "@aws-cdk/core";

export class ConfigBucket extends Bucket {
  /**
   * Creates a bucket to deploy config and installation files into, which
   * the instances will use for further configuration.
   * 
   * @param scope The parent Stack or Construct.
   * @param id unique ID of this resource
   * @param bucketName the name of the bucket to be created; it must be unique for the region
   */
  constructor(scope: Construct, id: string, bucketName?: string) {
    super(scope, id, {
      bucketName: bucketName || 'jamulus-config-bucket',
      removalPolicy: RemovalPolicy.DESTROY,
    });
  };
};
