import { BlockDeviceVolume, CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from "@aws-cdk/aws-ec2";
import { CfnOutput, Stack } from "@aws-cdk/core";
import { flow } from "lodash/fp";
import { ConfigBucketDeployment } from "../../utilities/basic-elements/config-bucket-deployment";
import { createSecurityGroup } from "../../utilities/basic-elements/create-security-group";
import { getStandardVpc } from "../../utilities/basic-elements/get-standard-vpc";
import { Ec2InstanceRole } from "../../utilities/basic-elements/instance-role";
import { createUserData, replaceUbuntuPassword } from "../../utilities/utilities";
import { ChannelsSetting, JamulusInstancesProps, StandardServerProps, StandardServerSettings } from "../digital-workstation-stack";
import { adjustPlaceholders, prepareConfigurationFiles } from "./prepare-configuration-files";

export interface AudioWorkstationSettings extends StandardServerSettings {
  /**
   * The password for the user `ubuntu` to be used for the RDP authentication.
   */
  ubuntuPassword: string;
};

/**
 * Interface for online mixing console properties.
 */
export interface AudioWorkstationProps extends AudioWorkstationSettings, StandardServerProps, ChannelsSetting, JamulusInstancesProps {};

const replaceChannelsConfig = (channels: string[] | undefined) => (file: string) => channels ? file.replace(
  /%%CHANNELS%%/,
  JSON.stringify({ channels }).replace(/"/g, String.fromCharCode(92,34))
) : file;

/**
 * A construct to create an EC2 instance with an Ardour mixing console installed.
 */
export class AudioWorkstation extends Instance {
  public readonly publicIp: string;

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
    timezone,
    publicIp,
  }: AudioWorkstationProps) {
    const userDataFileName = './lib/audio-workstation/configure-audio-workstation.sh';
    const defindedVpc = vpc || getStandardVpc(scope, id);
    if (!jamulusBandServer) throw(new TypeError(`${id}: An Audio Workstation makes no sense when there is no Jamulus band server`));
    
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

    if (publicIp) this.publicIp = publicIp;

    if (!imageId) {
      console.log(`${id}: Providing user data (${userDataFileName})`);
      if (bucket) new ConfigBucketDeployment(scope, `${id}BucketDeploy`, {
        bucket,
        path: id,
        createDynamicFiles: prepareConfigurationFiles(jamulusBandServer, channels),
      });
      createUserData({
        instance: this,
        region: scope.region,
        filename: userDataFileName,
        detailedServerMetrics,
        timezone,
        relevantConfigChanges: [
          'bandServerSettings',
          'mixingServerSettings',
          'audioWorkstationSettings',
          'zoomServerSettings',
          'channels',
        ],
        jamulusBandServer,
        additionalProcessFn: flow(
          replaceUbuntuPassword(ubuntuPassword),
          replaceChannelsConfig(channels),
          adjustPlaceholders({
            channels,
            jamulusBandServer,
            jamulusMixingServer,
          }),
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
