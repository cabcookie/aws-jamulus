import { CfnEIPAssociation, GenericWindowsImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from "@aws-cdk/aws-ec2";
import { CfnOutput, Stack } from "@aws-cdk/core";
import { flow, replace } from "lodash/fp";
import { createUserData } from "../../utilities/utilities";
import { createSecurityGroup } from "../../utilities/basic-elements/create-security-group";
import { JamulusInstancesProps, StandardServerProps, StandardServerSettings } from "../digital-workstation-stack";
import { getStandardVpc } from "../../utilities/basic-elements/get-standard-vpc";
import { Ec2InstanceRole } from "../../utilities/basic-elements/instance-role";
import { ConfigBucketDeployment } from "../../utilities/basic-elements/config-bucket-deployment";

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
export interface ZoomServerProps extends ZoomServerSettings, StandardServerProps, JamulusInstancesProps {};

export class ZoomServer extends Instance {
  public readonly publicIp: string;

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
  constructor(scope: Stack, id: string, {
    jamulusMixingServer,
    jamulusBandServer,
    zoomMeeting,
    imageId,
    elasticIpAllocation,
    keyName,
    bucket,
    detailedServerMetrics,
    policyStatments,
    vpc,
    timezone,
    publicIp,
  }: ZoomServerProps) {
    const userDataFileName = './lib/zoom-server/configure-zoom-server.ps1';
    const defindedVpc = vpc || getStandardVpc(scope, id);

    if (!imageId && !bucket) throw(new TypeError(`${id}: When no machine image ID is provided, a bucket must be provided where the configuration files can be deployed to`));

    super(scope, id, {
      instanceName: id,
      instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.MEDIUM),
      machineImage: new GenericWindowsImage({
        // use the provided custom image Id, or a standard Windows 2019 server
        'eu-central-1': imageId || 'ami-086d0be14ab5129e1',
      }),
      vpc: defindedVpc,
      role: new Ec2InstanceRole(scope, id, { policyStatments, detailedServerMetrics, bucket }),
      securityGroup: createSecurityGroup(scope, `${id}Sg`, defindedVpc),
      userDataCausesReplacement: true,
      keyName,  
    });

    if (publicIp) this.publicIp = publicIp;

    if (!imageId) {
      console.log(`${id}: Providing user data (${userDataFileName})`);
      if (bucket) new ConfigBucketDeployment(scope, `${id}BucketDeploy`, {
        bucket,
        path: id
      });
      createUserData({
        instance: this,
        filename: userDataFileName,
        detailedServerMetrics,
        jamulusBandServer,
        jamulusMixingServer,
        timezone,
        additionalProcessFn: flow(
          replace('%%MEETING_ID%%', zoomMeeting.meetingId),
          replace('%%MEETING_PASSWORD%%', zoomMeeting.password ? `?pwd=${zoomMeeting.password}` : ''),
        ),
      });
    }
  
    this.connections.allowFromAnyIpv4(new Port({
      stringRepresentation: 'Remote Desktop',
      protocol: Protocol.TCP,
      fromPort: 3389,
      toPort: 3389,
    }));
  
    if (elasticIpAllocation) new CfnEIPAssociation(scope, `${id}Allocation`, {
      allocationId: elasticIpAllocation,
      instanceId: this.instanceId,
    });
  
    new CfnOutput(scope, `${id}PublicIp`, { value: this.instancePublicIp });
  };
};
