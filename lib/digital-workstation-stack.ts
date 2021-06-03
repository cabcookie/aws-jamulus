import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { ConfigBucket, ConfigBucketName } from '../utilities/basic-elements/config-bucket';
import { ZoomServer, ZoomServerSettings } from './zoom-server/zoom-server';
import { JamulusServer, JamulusServerSettings } from './jamulus-server/jamulus-server-instance';
import { AudioWorkstation, AudioWorkstationSettings } from './audio-workstation/audio-workstation';
import { ConfigBucketDeployment } from '../utilities/basic-elements/config-bucket-deployment';
import { Vpc } from '@aws-cdk/aws-ec2';
import { DetailedServerMetricsSettings, Ec2InstanceRoleProps } from '../utilities/basic-elements/instance-role';

export interface StandardServerSettings extends DetailedServerMetricsSettings {
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

interface KeyNameProp {
  /**
   * Provide a keyname so the EC2 instance is accessible via SSH with a
   * PEM key (see details here: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html).
   */
  keyName?: string;
};

interface TimeZoneProp {
  /**
   * Provide the timezone for your server instance.
   */
  timezone?: string;
};

export interface StandardServerProps extends KeyNameProp, Ec2InstanceRoleProps, TimeZoneProp {
  /**
   * Provide the VPC where the resources should be created in. If no VPC is
   * provided, the standard VPC will be used.
   */
  vpc?: Vpc;
};

interface DigitalWorkstationProps extends StackProps, KeyNameProp, ConfigBucketName, TimeZoneProp {
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
    timezone,
    channels,
    ...rest
  }: DigitalWorkstationProps) {
    super(scope, id, { ...rest });
    if (zoomServerSettings && !mixingServerSettings) throw new TypeError(
      `${id}: When setting up a Zoom server you also need to setup a Jamulus mixing server`
    );
    if (mixingServerSettings && !audioWorkstationSettings) throw new TypeError(
      `${id}: It only makes sense to have a Jamulus mixing server if you have an audio workstation as well`
    );

    const configBucket = new ConfigBucket(this, 'ConfigBucket', configBucketName);
    new ConfigBucketDeployment(this, 'ConfigBucketDeployment', {
      bucket: configBucket,
    });

    const bandServer = new JamulusServer(this, 'JamulusBandServer', {
      keyName,
      ...bandServerSettings,
      timezone,
      bucket: configBucket,
    });

    let mixingServer;
    if (mixingServerSettings) {
      mixingServer = new JamulusServer(this, 'JamulusMixingServer', {
        keyName,
        ...mixingServerSettings,
        timezone,
        bucket: configBucket,
      });
    }

    if (audioWorkstationSettings) {
      new AudioWorkstation(this, 'AudioWorkstation', {
        jamulusBandServer: bandServer,
        jamulusMixingServer: mixingServer,
        keyName,
        ...audioWorkstationSettings,
        timezone,
        channels,
        bucket: configBucket,
      });
    }

    if (zoomServerSettings && mixingServer) {
      new ZoomServer(this, 'WindowsZoomServer', {
        jamulusMixingInstance: mixingServer,
        jamulusBandInstance: bandServer,
        keyName,
        ...zoomServerSettings,
        bucket: configBucket,
      });
    };
  }
}
