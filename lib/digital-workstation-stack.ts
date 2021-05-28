import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { createConfigBucket } from '../utilities/basic-elements/create-config-bucket';
import { createVpc } from '../utilities/basic-elements/create-vpc';
import { createZoomServer, ZoomMeetingProps } from './zoom-server/create-zoom-server';
import { createJamulusServerInstance } from './jamulus-server/jamulus-server-instance';
import { OnlineMixingConsole } from './online-mixing-server/online-mixing-console';

interface ServerProps {
  ipId?: string;
  settingsFileName?: string;
  imageId?: string;
};

interface ZoomServerProps extends ServerProps {
  zoomMeeting: ZoomMeetingProps;
};

interface DigitalWorkstationProps extends StackProps {
  keyName: string;
  configBucketName?: string;
  bandServerSettings?: ServerProps;
  mixingResultServerSettings?: ServerProps;
  zoomServerSettings?: ZoomServerProps;
  onlineMixerSettings?: ServerProps;
};

export class DigitalWorkstation extends Stack {
  constructor(scope: Construct, id: string, {
    keyName,
    configBucketName,
    bandServerSettings,
    mixingResultServerSettings,
    onlineMixerSettings,
    zoomServerSettings,
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

    if (zoomServerSettings) {
      createZoomServer(this, 'JamulusZoomServer', {
        jamulusMixingInstance: jamulusMixingResult,
        jamulusBandInstance: bandServer,
        vpcParams,
        elasticIpAllocation: zoomServerSettings.ipId,
        imageId: zoomServerSettings.imageId,
        zoomMeeting: zoomServerSettings.zoomMeeting,
        keyName,
      });
    };

    new OnlineMixingConsole(this, 'OnlineMixer', {
      jamulusBandServerIp: bandServer.instancePublicIp,
      jamulusMixingServerIp: jamulusMixingResult.instancePublicIp,
      vpc: vpcParams.vpc,
      role: vpcParams.role,
      keyName,
      elasticIpAllocation: onlineMixerSettings?.ipId,
      imageId: onlineMixerSettings?.imageId,
    });
  }
}
