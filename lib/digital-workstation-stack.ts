import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { ConfigBucket, ConfigBucketName } from '../utilities/basic-elements/config-bucket';
import { createVpc, VpcProperties } from '../utilities/basic-elements/create-vpc';
import { ZoomServer, ZoomServerSettings } from './zoom-server/zoom-server';
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
  detailedServerMetrics?: boolean;
};

interface KeyNameProp {
  /**
   * Provide a keyname so the EC2 instance is accessible via SSH with a
   * PEM key (see details here: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html).
   */
  keyName?: string;
};

export interface StandardServerProps extends KeyNameProp {
  /**
   * Provide the details for the VPC, the Security Group to be used and the
   * IAM Instance Role so that the EC2 instance can access other resources.
   */
  vpcParams: VpcProperties; 
};

interface DigitalWorkstationProps extends StackProps, KeyNameProp, ConfigBucketName {
  /**
   * The settings for the Jamulus server the band members connect to.
   */
  bandServerSettings: JamulusServerSettings;
  /**
   * The settings for the audio workstation which is routing the signals of
   * every band member into separate channels in a Digital Workstation (i.e.,
   * Ardour), so it can be mixed live. The mixed signal is routed to the Zoom
   * server through the Jamulus mixing server.
   */
  audioWorkstationSettings?: AudioWorkstationSettings;
  /**
   * The settings for the Jamulus mixing server where the mixed signal will be
   * routed to. The Zoom server will take the signal from there to feed it into
   * the Zoom meeting.
   */
  mixingServerSettings?: JamulusServerSettings;
  /**
   * The settings for the Windows server where Zoom will be running. Zoom will
   * connect to the Zoom meeting and will feed the mixed signal to it.
   */
  zoomServerSettings?: ZoomServerSettings;
  /**
   * The channels that should be created in the Ardour session (i.e., the
   * Digital Audio Workstation). This setting also creates the `ini` files for
   * the Jamulus instances and adds the launch of one Jamulus instance per
   * channel to only route the signal of such particular band member into its
   * dedicated channel in Ardour.
   */
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
      new ZoomServer(this, 'WindowsZoomServer', {
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
