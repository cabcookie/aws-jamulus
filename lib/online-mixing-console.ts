import { BlockDeviceVolume, CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, IVpc, Peer, Port, Protocol, SecurityGroup, Vpc } from "@aws-cdk/aws-ec2";
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { CfnOutput, Construct } from "@aws-cdk/core";
import { readFileSync } from "fs";
import { flow } from "lodash/fp";
import { addUserData } from "../utilities/utilities";

/**
 * Interface for online mixing console properties.
 */
export interface OnlineMixingConsoleProps {
  /**
   * The IP address for the Jamulus server where band members connect to.
   */
  jamulusBandServerIp: string;
  /**
   * The IP address for the Jamulus server where the mixing console and the
   * presenter connects to.
   */
  jamulusMixingServerIp: string;
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
};

/**
 * A construct to create an EC2 instance with an Ardour mixing console installed.
 */
export class OnlineMixingConsole extends Construct {
  /**
   * 
   * @param scope Parent stack, usually an `App` or a `Stage`, but could be any construct.
   * @param id The id for the server; will be used for the EC2 instance name.
   * @param props 
   */
  constructor(scope: Construct, id: string, props: OnlineMixingConsoleProps) {
    super(scope, id);

    const { jamulusBandServerIp, jamulusMixingServerIp, elasticIpAllocation, keyName, vpc, imageId } = props;
    const userDataFileName = './lib/configure-online-mixer.sh';

    const securityGroup = new SecurityGroup(this, 'SSHandJamulusAccess', {
      description: 'Allows access for SSH and for Jamulus clients',
      vpc,
      allowAllOutbound: true,
    });
    
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22),
      'Allows SSH access from Internet'
    );
  
    const role = new Role(this, 'MixRole', { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });
    role.attachInlinePolicy(new Policy(this, 'MixerRolePolicy', {
      statements: [
        new PolicyStatement({
          actions: [
            "ssmmessages:*",
            "ssm:UpdateInstanceInformation",
            "ec2messages:*"
          ],
          effect: Effect.ALLOW,
          resources: ['*'],
        }),
      ],
    }));
  
    const mixer = new Instance(this, `${id}Instance`, {
      instanceName: id,
      machineImage: new GenericLinuxImage({
        // use the provided custom image with a running Ubuntu Desktop and Ardour or an Ubuntu 20.04 AMD standard image
        'eu-central-1': imageId || 'ami-05f7491af5eef733a',
      }),
      vpc,
      securityGroup,
      role,
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
        // don't use the user data for now; manual installation is needed
        addUserData(mixer),
      )(userDataFileName, 'utf8');
    };
  
    mixer.connections.allowFromAnyIpv4(new Port({
      stringRepresentation: 'Remote Desktop',
      protocol: Protocol.RDP,
    }));

    if (elasticIpAllocation) new CfnEIPAssociation(this, 'MixerIp', {
      allocationId: elasticIpAllocation,
      instanceId: mixer.instanceId,
    });

    new CfnOutput(this, 'MixingConsoleIp', { value: mixer.instancePublicIp });
  };
};
