import { Instance } from "@aws-cdk/aws-ec2";
import { readFileSync } from "fs";
import { flow } from "lodash";
import { JamulusInstancesProps } from "../lib/digital-workstation-stack";
import { DetailedServerMetricsSettings } from "./basic-elements/instance-role";

export const cloudWatchSettingsFileName = 'cloudwatch-linux-settings.json';

export enum IP_TYPES {
  BAND_PRIVATE_IP,
  MIXER_PRIVATE_IP,
  BAND_PUBLIC_IP,
  MIXER_PUBLIC_IP,
}

type Primitive = string | number | boolean | bigint | undefined | null;
type AcceptedLogValues = Primitive | Function | Date | Error | object;
type FunctionWithFlexibleInput = <T extends AcceptedLogValues>(value: T) => T;
export enum SERVER_TYPES {
  BAND,
  MIXER,
};

type ArrayFunctionWithFlexibleInput = <T>(value: T[]) => (item: T) => T[];

export const push: ArrayFunctionWithFlexibleInput = (arr) => (item) => [...arr, item];

export const defaultFn: <T extends object | unknown>(obj: T) => T = obj => obj
export const log: (message: string) => FunctionWithFlexibleInput = (message) => (value) => {
  const returnObjForLogging = (obj: AcceptedLogValues): AcceptedLogValues => {
    if (obj == null) return 'null';
    return obj;
  }
  console.log(`${new Date().toISOString()} [${message}]:`, returnObjForLogging(value));
  return value;
};

const addUserData = (instance: Instance) => (commands: string) => instance.addUserData(commands);
const replaceTimezone = (timezone?: string) => (file: string) => file.replace(/%%TIMEZONE%%/g, timezone || 'UTC');
const replaceVersion = (file: string) => file.replace(/%%VERSION%%/g, require('../package.json').version);
const replaceRegion = (regionName?: string) => (file: string) => regionName ? file.replace(/%%REGION%%/g, regionName) : file;
export const replaceUbuntuPassword = (password: string) => (file: string) => file.replace(/%%UBUNTU_PASSWORD%%/g, password);

interface UserDataProps extends DetailedServerMetricsSettings, JamulusInstancesProps {
  /**
   * Provide the instance for which the user data should be applied.
   */
  instance: Instance;
  /**
   * Provide the file name for the script that should run on instance initialization.
   */
  filename: string;
  /**
   * Provide a function if you want additional processing to be applied to the user data.
   */
  additionalProcessFn?: (file: string) => string;
  /**
   * Provide the region that should be replaced. Expects the string %%REGION%%
   * in the instance initialization script.
   */
  region?: string;
  /**
   * Provide the timezone. Searches for the string %%TIMEZONE%% in the instance
   * initialization script.
   */
  timezone?: string;
};

const stdStrFn = (str: string) => str;
export const returnInputWhenFnIsNull = (fn?: (param: string) => string) => fn || stdStrFn;

export const createUserData = ({
  instance,
  filename,
  additionalProcessFn,
  detailedServerMetrics,
  region,
  jamulusBandServer,
  jamulusMixingServer,
  timezone,
}: UserDataProps) => flow(
  readFileSync,
  replaceVersion,
  replaceIp(SERVER_TYPES.BAND, jamulusBandServer),
  replaceIp(SERVER_TYPES.MIXER, jamulusMixingServer),
  replaceRegion(region),
  replaceTimezone(timezone),
  addCloudWatchAgentInstallScript(detailedServerMetrics),
  returnInputWhenFnIsNull(additionalProcessFn),
  addUserData(instance),
)(filename, 'utf8')

// need to figure out how the script should look like on Windows
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
const addCloudWatchAgentInstallScript = (tobeInstalled: boolean | undefined) => (file: string) => file.replace(/%%CLOUDWATCH_AGENT%%/, tobeInstalled ? cloudWatchAgentInstallationScript.join('\n') : '');

const replaceIp = (serverType: SERVER_TYPES, instance?: Instance) => (file: string) => file.replace(
  serverType == SERVER_TYPES.BAND ? new RegExp(`%%${IP_TYPES[IP_TYPES.BAND_PRIVATE_IP]}%%`, 'g') : new RegExp(`%%${IP_TYPES[IP_TYPES.MIXER_PRIVATE_IP]}%%`, 'g'),
  instance?.instancePrivateIp || ''
).replace(
  serverType == SERVER_TYPES.BAND ? new RegExp(`%%${IP_TYPES[IP_TYPES.BAND_PUBLIC_IP]}%%`, 'g') : new RegExp(`%%${IP_TYPES[IP_TYPES.MIXER_PUBLIC_IP]}%%`, 'g'),
  instance?.instancePublicIp || ''
);
