import { CfnEIPAssociation, GenericLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Protocol } from "@aws-cdk/aws-ec2";
import { CfnOutput, Stack } from "@aws-cdk/core";
import { readFileSync } from "fs";
import { flow } from 'lodash/fp';
import { addUserData, replaceRegion } from "../../utilities/utilities";
import { createSecurityGroup } from "../../utilities/basic-elements/create-security-group";
import { StandardServerProps, StandardServerSettings } from "../digital-workstation-stack";

export interface JamulusServerSettings extends StandardServerSettings {
  /**
   * If no image is provided a server settings file name should be provided.
   * This file should be available on an S3 bucket as the user data will try to
   * copy the file from there. The user data file will include a line comparable
   * to this:
   * 
   * ```bash
   * aws s3 cp s3://jamulus-config-bucket/%%SERVER-SETTINGS-FILE-NAME%% jamulus.service
   * ```
   * 
   * So, you need to ensure the mentioned file name exists on the represented
   * bucket.
   */
  settingsFileName?: string;
};

/**
 * Interface for Jamalus server properties.
 */
export interface JamulusServerProps extends JamulusServerSettings, StandardServerProps {};

const replaceServerSettingsFileName = (newFileName: string) => (file: string) => file.replace('%%SERVER-SETTINGS-FILE-NAME%%', newFileName);

export class JamulusServer extends Instance {
  /**
   * Will create an EC2 instance with a running Jamulus server. This server will
   * be created either by providing a `settingsFileName` which
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
  constructor(scope: Stack, id: string, props: JamulusServerProps) {
    const {
      elasticIpAllocation, keyName, vpcParams, imageId, settingsFileName,
    } = props;
    const userDataFileName = './lib/jamulus-server/configure-jamulus.sh';

    if (imageId && settingsFileName) console.log(`${id}: If both an imageId and a settingsFileName is provided, only the imageId is considered and the settings from the configuration file are ignored.`);
    if (!imageId && !settingsFileName) throw(new TypeError(`${id}: You should either provide an AMI ID or a server settings file name`));

    super(scope, id, {
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

    if (!imageId && settingsFileName) {
      console.log(`${id}: Providing user data (${userDataFileName})`);
      flow(
        readFileSync,
        replaceServerSettingsFileName(settingsFileName),
        replaceRegion(scope.region),
        addUserData(this),
      )(userDataFileName, 'utf8');
    };
  
    this.connections.allowFromAnyIpv4(new Port({
      stringRepresentation: `${id} access`,
      protocol: Protocol.UDP,
      fromPort: 22120,
      toPort: 22130,
    }));
  
    if (elasticIpAllocation) new CfnEIPAssociation(scope, `${id}Allocation`, {
      allocationId: elasticIpAllocation,
      instanceId: this.instanceId,
    });
  
    new CfnOutput(scope, `${id}PublicIp`, { value: this.instancePublicIp });
  };
};
