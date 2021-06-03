import { BlockDeviceVolume, CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from "@aws-cdk/aws-ec2";
import { CfnOutput, Stack } from "@aws-cdk/core";
import { flow } from "lodash/fp";
import { createSecurityGroup } from "../../utilities/basic-elements/create-security-group";
import { getStandardVpc } from "../../utilities/basic-elements/get-standard-vpc";
import { Ec2InstanceRole } from "../../utilities/basic-elements/instance-role";
import { createUserData, replaceUbuntuPassword } from "../../utilities/utilities";
import { StandardServerProps, StandardServerSettings } from "../digital-workstation-stack";

export interface AudioWorkstationSettings extends StandardServerSettings {
  /**
   * The password for the user `ubuntu` to be used for the RDP authentication.
   */
  ubuntuPassword: string;
};

/**
 * Interface for online mixing console properties.
 */
export interface AudioWorkstationProps extends AudioWorkstationSettings, StandardServerProps {
  /**
   * The Jamulus EC2 instance where the band connects to
   */
  jamulusBandServer: Instance;
  /**
   * The Jamulus EC2 instance where the mixing console and the
   * presenter connects to.
   */
  jamulusMixingServer?: Instance;
  /**
   * Provide the channel names. These will be used to name the Jamulus client
   * instances and connect those to the associated Ardour channels.
   */
  channels?: string[];
};

const replaceChannelsConfig = (channels: string[] | undefined) => (file: string) => channels ? file.replace(
  /%%CHANNELS%%/,
  JSON.stringify({ channels }).replace(/"/g, String.fromCharCode(92,34))
) : file;

/**
 * A construct to create an EC2 instance with an Ardour mixing console installed.
 */
export class AudioWorkstation extends Instance {
  /**
   * Creates an audio workstation with Jack, Jamulus, and Ardour installed
   * and everything interconnected.
   * 
   * @param scope Parent stack, usually an `App` or a `Stage`, but could be any construct.
   * @param id The id for the server; will be used for the EC2 instance name.
   * @param props 
   */
  constructor(scope: Stack, id: string, {
    jamulusBandServer,
    jamulusMixingServer,
    elasticIpAllocation,
    keyName,
    imageId,
    ubuntuPassword,
    channels,
    detailedServerMetrics,
    bucket,
    policyStatments,
    vpc,
  }: AudioWorkstationProps) {
    const userDataFileName = './lib/audio-workstation/configure-audio-workstation.sh';
    const defindedVpc = vpc || getStandardVpc(scope, id);
    
    super(scope, id, {
      instanceName: id,
      machineImage: new GenericLinuxImage({
        // use the provided custom image with a running Ubuntu Desktop and Ardour or an Ubuntu 20.04 AMD standard image
        'eu-central-1': imageId || 'ami-05f7491af5eef733a',
      }),
      vpc: defindedVpc,
      role: new Ec2InstanceRole(scope, id, { bucket, detailedServerMetrics, policyStatments }),
      securityGroup: createSecurityGroup(scope, `${id}Sg`, defindedVpc),
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
      createUserData({
        instance: this,
        region: scope.region,
        filename: userDataFileName,
        detailedServerMetrics,
        bandServer: jamulusBandServer,
        additionalProcessFn: flow(
          replaceUbuntuPassword(ubuntuPassword),
          replaceChannelsConfig(channels),
        ),
      });
    };
  
    this.connections.allowFromAnyIpv4(new Port({
      stringRepresentation: 'Remote Desktop',
      protocol: Protocol.TCP,
      fromPort: 3389,
      toPort: 3389,
    }));

    if (elasticIpAllocation) new CfnEIPAssociation(this, 'MixerIp', {
      allocationId: elasticIpAllocation,
      instanceId: this.instanceId,
    });

    new CfnOutput(this, 'MixingConsoleIp', { value: this.instancePublicIp });
  };
};
