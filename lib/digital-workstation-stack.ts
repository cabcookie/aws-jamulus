import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { createConfigBucket } from '../utilities/basic-elements/create-config-bucket';
import { createVpc } from '../utilities/basic-elements/create-vpc';
import { createZoomServer, ZoomMeetingProps } from './zoom-server/create-zoom-server';
import { createJamulusServerInstance } from './jamulus-server/jamulus-server-instance';
import { AudioWorkstation, AudioWorkstationProps } from './audio-workstation/audio-workstation';

interface StandardServerSettings {
  elasticIpAllocation?: string;
  imageId?: string;
};

export interface JamulusServerSettings extends StandardServerSettings {
  settingsFileName?: string;
};

export interface AudioWorkstationSettings extends StandardServerSettings {
  ubuntuPassword?: string;
};

export interface ZoomServerSettings extends StandardServerSettings {
  zoomMeeting: ZoomMeetingProps;
};

interface DigitalWorkstationProps extends StackProps {
  keyName: string;
  configBucketName?: string;
  bandServerSettings?: JamulusServerSettings;
  mixingServerSettings?: JamulusServerSettings;
  zoomServerSettings?: ZoomServerSettings;
  audioWorkstationSettings?: AudioWorkstationSettings;
  channels?: string[];
};

export class DigitalWorkstation extends Stack {
  constructor(scope: Construct, id: string, {
    keyName,
    configBucketName,
    bandServerSettings,
    mixingServerSettings,
    audioWorkstationSettings,
    zoomServerSettings,
    channels,
    ...rest
  }: DigitalWorkstationProps) {
    super(scope, id, { ...rest });

    const configBucket = createConfigBucket(this, configBucketName);
    const vpcParams = createVpc(this, configBucket);

    const bandServer = createJamulusServerInstance(this, 'JamulusBandServer', {
      vpcParams,
      keyName,
      elasticIpAllocation: bandServerSettings?.elasticIpAllocation,
      jamulusServerSettingsFileName: bandServerSettings?.settingsFileName,
      imageId: bandServerSettings?.imageId,
    });

    const jamulusMixingResult = createJamulusServerInstance(this, 'JamulusMixingServer', {
      vpcParams,
      keyName,
      elasticIpAllocation: mixingServerSettings?.elasticIpAllocation,
      jamulusServerSettingsFileName: mixingServerSettings?.settingsFileName,
      imageId: mixingServerSettings?.imageId,
    });

    if (zoomServerSettings) {
      createZoomServer(this, 'WindowsZoomServer', {
        jamulusMixingInstance: jamulusMixingResult,
        jamulusBandInstance: bandServer,
        vpcParams,
        elasticIpAllocation: zoomServerSettings.elasticIpAllocation,
        imageId: zoomServerSettings.imageId,
        zoomMeeting: zoomServerSettings.zoomMeeting,
        keyName,
      });
    };

    const mixingConsoleProps: AudioWorkstationProps = {
      jamulusBandServer: bandServer,
      jamulusMixingServer: jamulusMixingResult,
      vpc: vpcParams.vpc,
      role: vpcParams.role,
      keyName,
      elasticIpAllocation: audioWorkstationSettings?.elasticIpAllocation,
      imageId: audioWorkstationSettings?.imageId,
      ubuntuPassword: audioWorkstationSettings?.ubuntuPassword,
      channels,
    };
    new AudioWorkstation(this, 'AudioWorkstation', mixingConsoleProps);
  }
}
