import { Instance } from "@aws-cdk/aws-ec2";

type Primitive = string | number | boolean | bigint | undefined | null;
type AcceptedLogValues = Primitive | Function | Date | Error | object;
type FunctionWithFlexibleInput = <T extends AcceptedLogValues>(value: T) => T;

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