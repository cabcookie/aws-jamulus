import { CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from "@aws-cdk/aws-ec2";
import { CfnOutput, Stack } from "@aws-cdk/core";
import { VpcProperties } from "./create-vpc";

export interface JamulusServerProps {
  elasticIpAllocation?: string;
  keyName: string;
  vpcParams: VpcProperties;
};

export const createJamulusServerInstance = (scope: Stack, id: string, {
  elasticIpAllocation, keyName, vpcParams
}: JamulusServerProps): Instance => {

  const host = new Instance(scope, id, {
    instanceName: id,
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
    machineImage: new GenericLinuxImage({
        // an Ubuntu 18.04 arm64 standard image
        // 'eu-central-1': 'ami-01bced7e7239dbd82',
        // Custom image with Ubuntu 18.04 for arm64 with a running Jamulus server
        'eu-central-1': 'ami-03a6b53e1f4869325',
    }),
    ...vpcParams,
    keyName,
      // user data not needed as we are using a customized image with Jamulus running already
      // userData: UserData.custom(readFileSync('./lib/configure-jamulus.sh', 'utf8')),
      // userDataCausesReplacement: true,
  });

  host.connections.allowFromAnyIpv4(new Port({
    stringRepresentation: `${id} access`,
    protocol: Protocol.UDP,
    fromPort: 22120,
    toPort: 22130,
  }));

  if (elasticIpAllocation) new CfnEIPAssociation(scope, `${id}Allocation`, {
    allocationId: elasticIpAllocation,
    instanceId: host.instanceId,
  });

  new CfnOutput(scope, `${id}PublicIp`, { value: host.instancePublicIp });

  return host;
};