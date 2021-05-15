import { CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from "@aws-cdk/aws-ec2";
import { CfnOutput, Stack } from "@aws-cdk/core";
import { readFileSync } from "fs";
import { flow } from "lodash/fp";
import { addUserData } from "../../utilities/utilities";
import { VpcProperties } from "../../utilities/basic-elements/create-vpc";
import { createSecurityGroup } from "../../utilities/basic-elements/create-security-group";

/**
 * Settings for the Zoom meeting this instance should connect and send the
 * mixed signal to.
 */
export interface ZoomMeetingProps {
  /**
   * The Zoom meeting ID.
   */
  meetingId: string;
  /**
   * The Zoom meeting password.
   */
  password?: string;
};

/**
 * Interface for server sending the mixed signal to a Zoom session.
 */
export interface ZoomServerProps {
  /**
   * Provides an allocation ID for an Elastic IP so that this server will
   * always be available under the same public IP address.
   */
   elasticIpAllocation?: string;
  /**
   * The EC2 instance where the Jamulus server with the mixed signal is
   * running. The local Jamulus client will connect to this Jamulus
   * instance to send its signal to the Zoom instance it connects to.
   */
  jamulusMixingInstance: Instance;
  /**
   * Provide a keyname so the EC2 instance is accessible via SSH with a
   * PEM key or via a remote desktop connection (see details here:
   * https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/connecting_to_windows_instance.html).
   */
  keyName: string;
   /**
   * The Zoom meeting properties this instance should connect and send the mixed
   * signal to.
   */
  zoomMeeting: ZoomMeetingProps;
  /**
   * Provide the details for the VPC, the Security Group to be used and the
   * IAM Instance Role so that the EC2 instance can access other resources.
   */
   vpcParams: VpcProperties;
   /**
    * Provide an AMI ID if you have created an image with a running Jamulus
    * client and a Zoom client already. This image will then be used instead of
    * running a launch script (i.e., user data) to install and configure the
    * Zoom server instance.
    */
   imageId?: string;
 
};

/**
 * Will create an EC2 Windows Server with a Jamulus client and a Zoom client.
 * The Jamulus client will connect to the Jamulus server which provides the 
 * mixed signal. The Zoom client will connect to the meeting where the
 * mixed signal should be send to.
 * @param scope Parent stack, usually an `App` or a `Stage`, but could be any construct.
 * @param id The id for the Zoom server; will be used for the EC2 instance name.
 * @param props Properties for the Zoom server
 * @returns The EC2 instance and its properties
*/
export const createZoomServer = (scope: Stack, id: string, props: ZoomServerProps): Instance => {
  const {
    jamulusMixingInstance,
    zoomMeeting: { meetingId, password },
    vpcParams,
    imageId,
    elasticIpAllocation,
    keyName,
  } = props;
  const userDataFileName = './lib/zoom-server/configure-zoom-server.sh';

  const host = new Instance(scope, id, {
    instanceName: id,
    instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.MEDIUM),
    machineImage: new GenericLinuxImage({
      // use the provided custom image Id, or a standard Windows 2019 server
      'eu-central-1': imageId || 'ami-086d0be14ab5129e1',
    }),
    vpc: vpcParams.vpc,
    role: vpcParams.role,
    securityGroup: createSecurityGroup(scope, `${id}Sg`, vpcParams.vpc),
    userDataCausesReplacement: true,
    keyName,
  });

  if (!imageId) {
    console.log(`${id}: Providing user data (${userDataFileName})`);
    flow(
      readFileSync,
      addUserData(host),
    )(userDataFileName, 'utf8');
  }

  host.connections.allowFromAnyIpv4(new Port({
    stringRepresentation: 'Remote Desktop',
    protocol: Protocol.TCP,
    fromPort: 3389,
    toPort: 3389,
  }));

  if (elasticIpAllocation) new CfnEIPAssociation(scope, `${id}Allocation`, {
    allocationId: elasticIpAllocation,
    instanceId: host.instanceId,
  });

  new CfnOutput(scope, `${id}PublicIp`, { value: host.instancePublicIp });

  return host;
};
