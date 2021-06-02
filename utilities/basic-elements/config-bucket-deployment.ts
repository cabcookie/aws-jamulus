import { Bucket } from "@aws-cdk/aws-s3";
import { BucketDeployment, ISource, Source } from "@aws-cdk/aws-s3-deployment";
import { Construct } from "@aws-cdk/core";

interface ConfigBucketDeploymentProps {
  /**
   * The bucket in which the sources should be deployed.
   */
  bucket: Bucket;
  /**
   * The source files and folders which should be deployed to the S3 bucket.
   * If this is empty, sources from the folder `./server-config` are being
   * deployed.
   */
  sources?: ISource[];
};

export class ConfigBucketDeployment extends BucketDeployment {
  /**
   * Deploys source files and folders into a defined bucket.
   * 
   * @param scope The parent `App`, `Stack` or `Construct`.
   * @param id unique identifier of the component
   * @param props the props to customize the deployment 
   */
  constructor(scope: Construct, id: string, {
    bucket, sources,
  }: ConfigBucketDeploymentProps) {
    super(scope, id, {
      destinationBucket: bucket,
      sources: sources || [Source.asset('./server-config')],
      retainOnDelete: false,
    });
  };
};
