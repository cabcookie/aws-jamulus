import { Instance } from "@aws-cdk/aws-ec2";

type Primitive = string | number | boolean | bigint | undefined | null;
type AcceptedLogValues = Primitive | Function | Date | Error | object;
type FunctionWithFlexibleInput = <T extends AcceptedLogValues>(value: T) => T;
export enum SERVER_TYPES {
  BAND,
  MIXER,
};

export const defaultFn: <T extends object | unknown>(obj: T) => T = obj => obj
export const log: (message: string) => FunctionWithFlexibleInput = (message) => (value) => {
  const returnObjForLogging = (obj: AcceptedLogValues): AcceptedLogValues => {
    if (obj == null) return 'null';
    return obj;
  }
  console.log(`${new Date().toISOString()} [${message}]:`, returnObjForLogging(value));
  return value;
};

export const addUserData = (instance: Instance) => (commands: string) => instance.addUserData(commands);
export const replaceVersion = () => (file: string) => file.replace(/%%VERSION%%/g, require('../package.json').version);
export const replaceRegion = (regionName: string) => (file: string) => file.replace(/%%REGION%%/g, regionName);
export const replaceUbuntuPassword = (password: string) => (file: string) => file.replace(/%%UBUNTU_PASSWORD%%/g, password);

// see download links for different OS here: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/download-cloudwatch-agent-commandline.html
const cloudWatchAgentInstallationScript = [
  "LOG install the CloudWatch agent",
  "wget https://s3.%%REGION%%.amazonaws.com/amazoncloudwatch-agent-%%REGION%%/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",
  "echo yes | sudo dpkg -i -E ./amazon-cloudwatch-agent.deb",
  "rm amazon-cloudwatch-agent.deb  ",
  "LOG load the CloudWatch config file",
  "aws s3 cp s3://jamulus-config-bucket/cloudwatch-linux-settings.json config.json",
  "LOG move the config file and start the CloudWatch agent",
  "sudo mv config.json /opt/aws/amazon-cloudwatch-agent/bin/",
  "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s",
  "SHOW_FILE /opt/aws/amazon-cloudwatch-agent/bin/config.json",
];
export const addCloudWatchAgentInstallScript = (tobeInstalled: boolean | undefined) => (file: string) => file.replace(/%%CLOUDWATCH_AGENT%%/, tobeInstalled ? cloudWatchAgentInstallationScript.join('\n') : '');

export const replaceIp = (serverType: SERVER_TYPES, instance: Instance) => (file: string) => file.replace(
  serverType == SERVER_TYPES.BAND ? /%%BAND_PRIVATE_IP%%/g : /%%MIXER_PRIVATE_IP%%/g,
  instance.instancePrivateIp
).replace(
  serverType == SERVER_TYPES.BAND ? /%%BAND_PUBLIC_IP%%/g : /%%MIXER_PUBLIC_IP%%/g,
  instance.instancePublicIp
);
