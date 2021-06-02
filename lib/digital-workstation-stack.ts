import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { createConfigBucket } from '../utilities/basic-elements/config-bucket';
import { createVpc, VpcProperties } from '../utilities/basic-elements/create-vpc';
import { createZoomServer, ZoomMeetingProps } from './zoom-server/create-zoom-server';
import { JamulusServer, JamulusServerSettings } from './jamulus-server/jamulus-server-instance';
import { AudioWorkstation } from './audio-workstation/audio-workstation';

export interface StandardServerSettings {
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

export interface StandardServerProps {
  /**
   * Provide a keyname so the EC2 instance is accessible via SSH with a
   * PEM key (see details here: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html).
   */
   keyName: string;
  /**
   * Provide the details for the VPC, the Security Group to be used and the
   * IAM Instance Role so that the EC2 instance can access other resources.
   */
  vpcParams: VpcProperties; 
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

    const bandServer = new JamulusServer(this, 'JamulusBandServer', {
      vpcParams,
      keyName,
      ...bandServerSettings,
    });

    const mixingServer = new JamulusServer(this, 'JamulusMixingServer', {
      vpcParams,
      keyName,
      ...mixingServerSettings,
    });

    if (zoomServerSettings) {
      createZoomServer(this, 'WindowsZoomServer', {
        jamulusMixingInstance: mixingServer,
        jamulusBandInstance: bandServer,
        vpcParams,
        elasticIpAllocation: zoomServerSettings.elasticIpAllocation,
        imageId: zoomServerSettings.imageId,
        zoomMeeting: zoomServerSettings.zoomMeeting,
        keyName,
      });
    };

    new AudioWorkstation(this, 'AudioWorkstation', {
      jamulusBandServer: bandServer,
      jamulusMixingServer: mixingServer,
      vpc: vpcParams.vpc,
      role: vpcParams.role,
      keyName,
      elasticIpAllocation: audioWorkstationSettings?.elasticIpAllocation,
      imageId: audioWorkstationSettings?.imageId,
      ubuntuPassword: audioWorkstationSettings?.ubuntuPassword,
      channels,
    });
  }
}
