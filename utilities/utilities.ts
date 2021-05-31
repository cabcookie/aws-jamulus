import { Instance } from "@aws-cdk/aws-ec2";

type Primitive = string | number | boolean | bigint | undefined | null;
type AcceptedLogValues = Primitive | Function | Date | Error | object;
type FunctionWithFlexibleInput = <T extends AcceptedLogValues>(value: T) => T;
export enum SERVER_TYPES {
  BAND,
  MIXER,
};
export enum IP_TYPES {
  PRIVATE,
  PUBLIC,
}

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

export const replaceRegion = (regionName: string) => (file: string) => file.replace(/%%REGION%%/g, regionName);

export const replaceUbuntuPassword = (password: string | undefined) => (file: string) => {
  if (!password) return file;
  return file.replace(/%%UBUNTU_PASSWORD%%/g, password);
};

export const replaceIp = (serverType: SERVER_TYPES, ipType: IP_TYPES, instance: Instance) => (file: string) => file.replace(
  serverType == SERVER_TYPES.BAND ? /%%BAND_IP%%/g : /%%MIXER_IP%%/g,
  ipType == IP_TYPES.PRIVATE ? instance.instancePrivateIp : instance.instancePublicIp
);
