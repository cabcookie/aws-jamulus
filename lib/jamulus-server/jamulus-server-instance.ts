import { CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from "@aws-cdk/aws-ec2";
import { CfnOutput, Stack } from "@aws-cdk/core";
import { VpcProperties } from "../../utilities/basic-elements/create-vpc";
import { readFileSync } from "fs";
import { flow } from 'lodash/fp';
import { addUserData } from "../../utilities/utilities";
import { createSecurityGroup } from "../../utilities/basic-elements/create-security-group";

/**
 * Interface for Jamalus server properties.
 */
export interface JamulusServerProps {
  /**
   * Provides an allocation ID for an Elastic IP so that this server will
   * always be available under the same public IP address.
   */
  elasticIpAllocation?: string;
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
  /**
   * Provide an AMI ID if you have created an image with a running Jamulus
   * server already. This image will then be used instead of running a
   * launch script (i.e., user data) to install and configure the Jamulus
   * server instance.
   */
  imageId?: string;
  /**
   * If no image is provided a server settings file name should be provided.
   * This file should be available on an S3 bucket as the user data will try to
   * copy the file from there. The user data file name is
   * `./lib/configure.jamulus.sh` and it will include a line comparable to this:
   *   aws s3 cp s3://jamulus-config-bucket/%%SERVER-SETTINGS-FILE-NAME%% jamulus.service
   * So, you need to ensure the mentioned file name exists on the represented
   * bucket.
   */
  jamulusServerSettingsFileName?: string;
};

const replaceServerSettingsFileName = (newFileName: string) => (file: string) => file.replace('%%SERVER-SETTINGS-FILE-NAME%%', newFileName);
const replaceRegion = (regionName: string) => (file: string) => file.replace(/%%REGION%%/g, regionName);

/**
 * Will create an EC2 instance with a running Jamulus server. This server will
 * be created either by providing a `jamulusServerSettingsFileName` which
 * results in creating user data (i.e., a launch script) which installs the
 * Jamulus server and its dependencies and starts it as a service with the
 * provided configuration file.
 * If a server settings file name is not provided, an ID for an AMI can be
 * provided (i.e., `imageId`) which should be a snapshot of a running Jamulus
 * server image.
 * 
 * @param scope Parent stack, usually an `App` or a `Stage`, but could be any construct.
 * @param id The id for the Jamulus server; will be used for the EC2 instance name.
 * @param props Properties for the Jamulus server
 * @returns The EC2 instance and its properties
 */
export const createJamulusServerInstance = (scope: Stack, id: string, props: JamulusServerProps): Instance => {
  const {
    elasticIpAllocation, keyName, vpcParams, imageId, jamulusServerSettingsFileName
  } = props;
  const userDataFileName = './lib/jamulus-server/configure-jamulus.sh';

  if (imageId && jamulusServerSettingsFileName) console.log(`${id}: If both an imageId and a jamulusServerSettingsFileName is provided, only the imageId is considered and the settings from the configuration file are ignored.`);
  if (!imageId && !jamulusServerSettingsFileName) throw(new TypeError(`${id}: You should either provide an AMI ID or a server settings file name`));

  const host = new Instance(scope, id, {
    instanceName: id,
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
    machineImage: new GenericLinuxImage({
      // use the provided custom image with a running Jamulus server or an Ubuntu 18.04 arm64 standard image
      'eu-central-1': imageId || 'ami-01bced7e7239dbd82',
    }),
    vpc: vpcParams.vpc,
    role: vpcParams.role,
    securityGroup: createSecurityGroup(scope, `${id}Sg`, vpcParams.vpc),
    keyName,
    userDataCausesReplacement: true,
  });

  if (!imageId && jamulusServerSettingsFileName) {
    console.log(`${id}: Providing user data (${userDataFileName})`);
    flow(
      readFileSync,
      replaceServerSettingsFileName(jamulusServerSettingsFileName),
      replaceRegion(scope.region),
      addUserData(host),
    )(userDataFileName, 'utf8');
  };

  host.connections.allowFromAnyIpv4(new Port({
    stringRepresentation: `${id} access`,
    protocol: Protocol.UDP,
    fromPort: 22120,
    toPort: 22130,
  }));

  if (elasticIpAllocation) new CfnEIPAssociation(scope, `${id}Allocation`, {
    allocationId: elasticIpAllocation,
    instanceId: host.instanceId,
  });

  new CfnOutput(scope, `${id}PublicIp`, { value: host.instancePublicIp });

  return host;
};