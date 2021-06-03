import { Bucket } from "@aws-cdk/aws-s3";
import { BucketDeployment } from "@aws-cdk/aws-s3-deployment";
import { Construct } from "@aws-cdk/core";
import { createSources, SourcePathType } from "./create-sources";

interface ConfigBucketDeploymentProps extends SourcePathType {
  /**
   * The bucket in which the sources should be deployed.
   */
  bucket: Bucket;
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
    bucket, path, createDynamicFiles,
  }: ConfigBucketDeploymentProps) {
    super(scope, id, {
      destinationBucket: bucket,
      destinationKeyPrefix: path,
      sources: createSources({ path, createDynamicFiles }),
      retainOnDelete: false,
    });
  };
};
