import { Vpc } from "@aws-cdk/aws-ec2";
import { Construct } from "@aws-cdk/core";

export const getStandardVpc = (scope: Construct, id: string) => Vpc.fromLookup(scope, `${id}Vpc`, { isDefault: true });
