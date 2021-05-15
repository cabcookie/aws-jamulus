import { Effect, PolicyStatement } from "@aws-cdk/aws-iam";
import { Bucket } from "@aws-cdk/aws-s3";

export const createGetObjectPermissions = (bucket: Bucket): PolicyStatement => new PolicyStatement({
  actions: ["s3:GetObject"],
  resources: [`${bucket.bucketArn}/*`],
  effect: Effect.ALLOW,
});

export const createListBucketPermissions = (bucket: Bucket): PolicyStatement => new PolicyStatement({
  actions: ["s3:ListBucket"],
  resources: [bucket.bucketArn],
  effect: Effect.ALLOW,
});
