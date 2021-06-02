import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { createConfigBucket } from '../utilities/basic-elements/create-config-bucket';
import { createVpc } from '../utilities/basic-elements/create-vpc';
import { createZoomServer, ZoomMeetingProps } from './zoom-server/create-zoom-server';
import { createJamulusServerInstance } from './jamulus-server/jamulus-server-instance';
import { AudioWorkstation, AudioWorkstationProps } from './audio-workstation/audio-workstation';

interface StandardServerSettings {
  /**
   * Provides an allocation ID for an Elastic IP so that this server will
   * always be available under the same public IP address.
   */
  elasticIpAllocation?: string;
  /**
   * Provide an AMI ID if you have created an image with a running Jamulus
   * server already. This image will then be used instead of running a
   * launch script (i.e., user data) to install and configure the Jamulus
   * server instance.
   */
  imageId?: string;
};

export interface JamulusServerSettings extends StandardServerSettings {
  /**
   * If no image is provided a server settings file name should be provided.
   * This file should be available on an S3 bucket as the user data will try to
   * copy the file from there. The user data file will include a line comparable
   * to this:
   * 
   * ```bash
   * aws s3 cp s3://jamulus-config-bucket/%%SERVER-SETTINGS-FILE-NAME%% jamulus.service
   * ```
   * 
   * So, you need to ensure the mentioned file name exists on the represented
   * bucket.
   */
  settingsFileName?: string;
};

export interface AudioWorkstationSettings extends StandardServerSettings {
  /**
   * The password for the user `ubuntu` to be used for the RDP authentication.
   */
  ubuntuPassword?: string;
};

export interface ZoomServerSettings extends StandardServerSettings {
  /**
   * The Zoom meeting properties this instance should connect and send the mixed
   * signal to.
   */
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
