import { BlockDeviceVolume, CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, IVpc, Port, Protocol } from "@aws-cdk/aws-ec2";
import { Policy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { CfnOutput, Construct, Stack } from "@aws-cdk/core";
import { readFileSync } from "fs";
import { flow } from "lodash/fp";
import { createSecurityGroup } from "../../utilities/basic-elements/create-security-group";
import { createSsmPermissions } from "../../utilities/policies/ssm-permissions";
import { addCloudWatchAgentInstallScript, addUserData, replaceIp, replaceRegion, replaceUbuntuPassword, SERVER_TYPES } from "../../utilities/utilities";

/**
 * Interface for online mixing console properties.
 */
export interface AudioWorkstationProps {
  /**
   * The Jamulus EC2 instance where the band connects to
   */
  jamulusBandServer: Instance;
  /**
   * The Jamulus EC2 instance where the mixing console and the
   * presenter connects to.
   */
  jamulusMixingServer: Instance;
  /**
   * Provide a keyname so the EC2 instance is accessible via SSH with a
   * PEM key (see details here: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html).
   */
  keyName: string;
  /**
   * Provides an allocation ID for an Elastic IP so that this mixing console will
   * always be available under the same public IP address.
   */
  elasticIpAllocation?: string;
  /**
   * Instance role to define access to relevant resources.
   */
  role?: Role;
  /**
   * Provide the VPC where the online mixing console should be created in.
   */
  vpc: IVpc;
  /**
   * Provide an AMI ID if you have created an image with a running Jamulus
   * server already. This image will then be used instead of running a
   * launch script (i.e., user data) to install and configure the Jamulus
   * server instance.
   * If no image is provided a standard image will be used.
   */
  imageId?: string;
  /**
   * The password for the user `ubuntu` to be used for the RDP authentication.
   */
  ubuntuPassword?: string;
  /**
   * Provide the channel names. These will be used to name the Jamulus client
   * instances and connect those to the associated Ardour channels.
   */
  channels?: string[];
  /**
   * Install the CloudWatch agent.
   */
  installCloudWatchAgent?: boolean;
};

const createInstanceRole = (scope: Construct) => {
  const role = new Role(scope, 'MixRole', { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });
  role.attachInlinePolicy(new Policy(scope, 'MixerRolePolicy', {
    statements: [ createSsmPermissions() ],
  }));
  return role;
};

const replaceChannelsConfig = (channels: string[] | undefined) => (file: string) => channels ? file.replace(
  /%%CHANNELS%%/,
  JSON.stringify({ channels }).replace(/"/g, String.fromCharCode(92,34))
) : file;

/**
 * A construct to create an EC2 instance with an Ardour mixing console installed.
 */
export class AudioWorkstation extends Construct {
  /**
   * Creates an audio workstation with Jack, Jamulus, and Ardour installed
   * and everything interconnected.
   * 
   * @param scope Parent stack, usually an `App` or a `Stage`, but could be any construct.
   * @param id The id for the server; will be used for the EC2 instance name.
   * @param props 
   */
  constructor(scope: Stack, id: string, props: AudioWorkstationProps) {
    super(scope, id);

    const { jamulusBandServer, jamulusMixingServer, elasticIpAllocation, keyName, vpc, imageId, role, ubuntuPassword, channels, installCloudWatchAgent } = props;
    const userDataFileName = './lib/audio-workstation/configure-audio-workstation.sh';

    const mixer = new Instance(this, `${id}Instance`, {
      instanceName: id,
      machineImage: new GenericLinuxImage({
        // use the provided custom image with a running Ubuntu Desktop and Ardour or an Ubuntu 20.04 AMD standard image
        'eu-central-1': imageId || 'ami-05f7491af5eef733a',
      }),
      vpc,
      role: role || createInstanceRole(this),
      securityGroup: createSecurityGroup(this, `${id}Sg`, vpc),
      instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.XLARGE),
      keyName,
      blockDevices: [{
        volume: BlockDeviceVolume.ebs(20),
        deviceName: '/dev/sda1',
      }],
      userDataCausesReplacement: true,
    });

    if (!imageId) {
      console.log(`${id}: Providing user data (${userDataFileName})`);
      flow(
        readFileSync,
        replaceRegion(scope.region),
        replaceUbuntuPassword(ubuntuPassword),
        replaceChannelsConfig(channels),
        replaceIp(SERVER_TYPES.BAND, jamulusBandServer),
        addCloudWatchAgentInstallScript(installCloudWatchAgent),
        addUserData(mixer),
      )(userDataFileName, 'utf8');
    };
  
    mixer.connections.allowFromAnyIpv4(new Port({
      stringRepresentation: 'Remote Desktop',
      protocol: Protocol.TCP,
      fromPort: 3389,
      toPort: 3389,
    }));

    if (elasticIpAllocation) new CfnEIPAssociation(this, 'MixerIp', {
      allocationId: elasticIpAllocation,
      instanceId: mixer.instanceId,
    });

    new CfnOutput(this, 'MixingConsoleIp', { value: mixer.instancePublicIp });
  };
};
