import { Bucket } from "@aws-cdk/aws-s3";
import { RemovalPolicy, Stack } from "@aws-cdk/core";

export const createConfigBucket = (scope: Stack, bucketName?: string) => {
  const bucket = new Bucket(scope, 'JamulusConfigBucket', {
    bucketName: bucketName || 'jamulus-config-bucket',
    removalPolicy: RemovalPolicy.DESTROY,
  });
  return bucket;
};