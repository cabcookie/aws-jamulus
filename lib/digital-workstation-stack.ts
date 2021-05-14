import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { createConfigBucket } from './create-config-bucket';
import { createVpc } from './create-vpc';
import { createJamulusServerInstance } from './jamulus-server-instance';
import { OnlineMixingConsole } from './online-mixing-console';

interface ServerProps {
  ipId?: string;
  settingsFileName?: string;
  imageId?: string;
};

interface DigitalWorkstationProps extends StackProps {
  keyName: string;
  configBucketName?: string;
  bandServerSettings?: ServerProps;
  mixingResultServerSettings?: ServerProps;
  onlineMixerSettings?: ServerProps;
};

export class DigitalWorkstation extends Stack {
  constructor(scope: Construct, id: string, {
    keyName,
    configBucketName,
    bandServerSettings,
    mixingResultServerSettings,
    onlineMixerSettings,
    ...rest
  }: DigitalWorkstationProps) {
    super(scope, id, { ...rest });

    const configBucket = createConfigBucket(this, configBucketName);
    const vpcParams = createVpc(this, configBucket);

    const bandServer = createJamulusServerInstance(this, 'JamulusBandServer', {
      vpcParams,
      keyName,
      elasticIpAllocation: bandServerSettings?.ipId,
      jamulusServerSettingsFileName: bandServerSettings?.settingsFileName,
      imageId: bandServerSettings?.imageId,
    });

    const jamulusMixingResult = createJamulusServerInstance(this, 'JamulusMixingServer', {
      vpcParams,
      keyName,
      elasticIpAllocation: mixingResultServerSettings?.ipId,
      jamulusServerSettingsFileName: mixingResultServerSettings?.settingsFileName,
      imageId: mixingResultServerSettings?.imageId,
    });

    const onlineMixer = new OnlineMixingConsole(this, 'OnlineMixer', {
      jamulusBandServerIp: bandServer.instancePublicIp,
      jamulusMixingServerIp: jamulusMixingResult.instancePublicIp,
      vpc: vpcParams.vpc,
      keyName,
      elasticIpAllocation: onlineMixerSettings?.ipId,
      imageId: onlineMixerSettings?.imageId,
    });
  }
}
