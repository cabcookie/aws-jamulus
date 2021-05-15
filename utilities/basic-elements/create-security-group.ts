import { IVpc, Peer, Port, SecurityGroup } from "@aws-cdk/aws-ec2";
import { Construct, Stack } from "@aws-cdk/core";

export const createSecurityGroup = (scope: Stack | Construct, id: string, vpc: IVpc): SecurityGroup => {
  const securityGroup = new SecurityGroup(scope, id, {
    description: 'Allows access for SSH and for Jamulus clients',
    vpc,
    allowAllOutbound: true,
  });
  
  securityGroup.addIngressRule(
    Peer.anyIpv4(),
    Port.tcp(22),
    'Allows SSH access from Internet'
  );

  return securityGroup;
};