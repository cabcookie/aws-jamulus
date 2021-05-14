import { Bucket, BucketProps } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { Construct, RemovalPolicy, Stack } from "@aws-cdk/core";

interface BucketWithDeleteOnStackDestroyProps extends BucketProps {
  bucketName?: string;
};

class BucketWithDeleteOnStackDestroy extends Bucket {
  constructor(scope: Construct, id: string, props?: BucketWithDeleteOnStackDestroyProps) {
    super(scope, id, {
      bucketName: props?.bucketName || 'jamulus-config-bucket',
      removalPolicy: RemovalPolicy.DESTROY,
      ...props,
    })

  };
};

export const createConfigBucket = (scope: Stack, bucketName?: string) => {
  const bucket = new BucketWithDeleteOnStackDestroy(scope, 'JamulusConfigBucket');
  new BucketDeployment(scope, 'BucketDeployment', {
    destinationBucket: bucket,
    sources: [Source.asset('./server-config')],
  });
  return bucket;
};