import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { ConfigBucket } from '../utilities/basic-elements/config-bucket';
import { createVpc, VpcProperties } from '../utilities/basic-elements/create-vpc';
import { createZoomServer, ZoomServerSettings } from './zoom-server/create-zoom-server';
import { JamulusServer, JamulusServerSettings } from './jamulus-server/jamulus-server-instance';
import { AudioWorkstation, AudioWorkstationSettings } from './audio-workstation/audio-workstation';
import { ConfigBucketDeployment } from '../utilities/basic-elements/config-bucket-deployment';

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
  /**
   * Install the CloudWatch agent.
   */
  installCloudWatchAgent?: boolean;
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

    const configBucket = new ConfigBucket(this, 'ConfigBucket', configBucketName);
    new ConfigBucketDeployment(this, 'ConfigBucketDeployment', {
      bucket: configBucket,
    });
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
        keyName,
        vpcParams,
        ...zoomServerSettings,
      });
    };

    new AudioWorkstation(this, 'AudioWorkstation', {
      jamulusBandServer: bandServer,
      jamulusMixingServer: mixingServer,
      vpcParams,
      keyName,
      ...audioWorkstationSettings,
      channels,
    });
  }
}
