import { CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from '@aws-cdk/aws-ec2';
import { Stack, Construct, StackProps, CfnOutput } from '@aws-cdk/core';
import { createConfigBucket } from './create-config-bucket';
import { createVpc } from './create-vpc';
import { createJamulusServerInstance } from './jamulus-server-instance';
import { OnlineMixingConsole } from './online-mixing-console';

export class DigitalWorkstation extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // this must be defined in cdk.json
    const keyName = 'JamulusKey';

    const configBucket = createConfigBucket(this);
    const vpcParams = createVpc(this, configBucket);

    const bandServer = createJamulusServerInstance(this, 'JamulusBandServer', {
      vpcParams,
      keyName,
      // this must be defined in cdk.json
      elasticIpAllocation: 'eipalloc-4d0de976',
    });

    const jamulusMixingResult = createJamulusServerInstance(this, 'JamulusMixingServer', {
      vpcParams,
      keyName,
      // this must be defined in cdk.json
    elasticIpAllocation: 'eipalloc-7680094d',
    });

    const onlineMixer = new OnlineMixingConsole(this, 'OnlineMixer', {
      jamulusBandServerIp: bandServer.instancePublicIp,
      jamulusMixingServerIp: jamulusMixingResult.instancePublicIp,
      vpc: vpcParams.vpc,
      keyName,
      // this must be defined in cdk.json
      elasticIpAllocation: 'eipalloc-3baa7e00',
    });
  }
}
