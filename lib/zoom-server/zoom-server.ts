import { CfnEIPAssociation, GenericWindowsImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from "@aws-cdk/aws-ec2";
import { CfnOutput, Stack } from "@aws-cdk/core";
import { readFileSync } from "fs";
import { flow, replace } from "lodash/fp";
import { addUserData } from "../../utilities/utilities";
import { VpcProperties } from "../../utilities/basic-elements/create-vpc";
import { createSecurityGroup } from "../../utilities/basic-elements/create-security-group";
import { StandardServerProps, StandardServerSettings } from "../digital-workstation-stack";

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

export interface ZoomServerSettings extends StandardServerSettings {
  /**
   * The Zoom meeting properties this instance should connect and send the mixed
   * signal to.
   */
  zoomMeeting: ZoomMeetingProps;
};

/**
 * Interface for server sending the mixed signal to a Zoom session.
 */
export interface ZoomServerProps extends ZoomServerSettings, StandardServerProps {
  /**
   * The EC2 instance where the Jamulus server is running where the band
   * members will connect to.
   */
  jamulusBandInstance: Instance,
  /**
   * The EC2 instance where the Jamulus server with the mixed signal is
   * running. The local Jamulus client will connect to this Jamulus
   * instance to send its signal to the Zoom instance it connects to.
   */
  jamulusMixingInstance: Instance;
};

const replaceParameters = (
  jamulusMixingInstance: Instance,
  jamulusBandInstance: Instance,
  zoomMeeting: ZoomMeetingProps,
) => flow(
  replace('%%JAMULUS_MIXER_IP%%', jamulusMixingInstance.instancePublicIp),
  replace('%%JAMULUS_BAND_IP%%', jamulusBandInstance.instancePublicIp),
  replace('%%MEETING_ID%%', zoomMeeting.meetingId),
  replace('%%MEETING_PASSWORD%%', zoomMeeting.password ? `?pwd=${zoomMeeting.password}` : ''),
);

/**
 * Will create an EC2 Windows Server with a Jamulus client and a Zoom client.
 * The Jamulus client will connect to the Jamulus server which provides the 
 * mixed signal. The Zoom client will connect to the meeting where the
 * mixed signal should be send to.
 * 
 * @param scope Parent stack, usually an `App` or a `Stage`, but could be any construct.
 * @param id The id for the Zoom server; will be used for the EC2 instance name.
 * @param props Properties for the Zoom server
 * @returns The EC2 instance and its properties
*/
export const createZoomServer = (scope: Stack, id: string, props: ZoomServerProps): Instance => {
  const {
    jamulusMixingInstance,
    jamulusBandInstance,
    zoomMeeting,
    vpcParams,
    imageId,
    elasticIpAllocation,
    keyName,
  } = props;
  const userDataFileName = './lib/zoom-server/configure-zoom-server.ps1';

  const host = new Instance(scope, id, {
    instanceName: id,
    instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.MEDIUM),
    machineImage: new GenericWindowsImage({
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
      replaceParameters(jamulusMixingInstance, jamulusBandInstance, zoomMeeting),
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
