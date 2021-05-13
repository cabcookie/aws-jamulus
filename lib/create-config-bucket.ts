import { Bucket, BucketProps } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { Construct, RemovalPolicy, Stack } from "@aws-cdk/core";

class BucketWithDeleteOnStackDestroy extends Bucket {
  constructor(scope: Construct, id: string, props?: BucketProps) {
    super(scope, id, {
      ...props,
      removalPolicy: RemovalPolicy.DESTROY,
      bucketName: 'jamulus-config-bucket',
    })

  };
};

export const createConfigBucket = (scope: Stack) => {
  const bucket = new BucketWithDeleteOnStackDestroy(scope, 'JamulusConfigBucket');
  new BucketDeployment(scope, 'BucketDeployment', {
    destinationBucket: bucket,
    sources: [Source.asset('./server-config')],
  });
  return bucket;
};