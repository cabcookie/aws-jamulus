import { ISource, Source } from "@aws-cdk/aws-s3-deployment";
import { flow } from "lodash/fp";

interface SourcePathType {
  /**
   * Define the root folder for the assets you list. The default folder is ''.
   */
  baseFolder?: string;
  /**
   * A list of static files or directories. The static files will be fetched
   * from `./server-config/${basefolder}/`.
   */
  staticPathes?: string[];
  /**
   * A list of dynamic files or directories which will be created during the
   * creation of the AWS resources. The dynamic files will be fetched
   * from `./build-bucket-deployment/${basefolder}/`.
   */
  dynamicPathes?: string[];
};

const pushSource = (sources: ISource[]) => (newSource: ISource) => [...sources, newSource];
const makePath = (rootFolder: string, baseFolder?: string) => (file: string) => `${rootFolder}/${baseFolder || ''}/${file}`.replace(/\/+/g, '/');
const addSource = (rootFolder: string, baseFolder?: string) => (prev: ISource[], curr: string) => flow(
  makePath(rootFolder, baseFolder),
  Source.asset,
  pushSource(prev)
)(curr);
export const createSources = ({
  baseFolder, dynamicPathes, staticPathes,
}: SourcePathType) => [
  ...(staticPathes
    ? staticPathes.reduce(addSource('./server-config', baseFolder), [])
    : []),
  ...(dynamicPathes
    ? dynamicPathes.reduce(addSource('./build-bucket-deployment', baseFolder), [])
    : []),
];