import { ISource, Source } from "@aws-cdk/aws-s3-deployment";
import { existsSync } from "fs";
import { flow } from "lodash/fp";
import { makePath } from "../file-handling";

type DynamicFileCreation = (targetFolder: string) => void;

export interface SourcePathType {
  /**
   * The directory from which the static and the dynamic files are picked.
   * The static files are fetched from `./server-config/${path}/`.
   * The dynamic files will be fetched from
   * `./build-bucket-deployment/${path}/`.
   */
  path: string;
  /**
   * Function which creates the dynamic files. It will have to put the files
   * in the folder `./build-bucket-deployment/${path}/`.
   * 
   * @param targetFolder The path where the function will deploy the files
   * that are to be transferred to the S3 bucket.
   */
  createDynamicFiles?: DynamicFileCreation;
};

const pushSource = (sources: ISource[]) => (newSource: ISource) => [...sources, newSource];

const addSourceIfPathExists = (sources: ISource[]) => (path: string) => existsSync(path)
  ? flow(
    Source.asset,
    pushSource(sources)
  )(path)
  : sources;

const addSource = (rootFolder: string, path: string) => (sources: ISource[]) => flow(
  makePath(rootFolder),
  addSourceIfPathExists(sources),
)(path);

const createDynamicFilesAndReturnSources = (path: string, createDynamicFiles?: DynamicFileCreation) => (sources: ISource[]) => {
  const rootName = './build-bucket-deployment';
  const baseFolder = makePath(rootName)(path);
  if (createDynamicFiles) createDynamicFiles(baseFolder);
  return addSource(rootName, path)(sources)
};

export const createSources = ({
  path, createDynamicFiles,
}: SourcePathType) => flow(
  addSource('./server-config', path),
  createDynamicFilesAndReturnSources(path, createDynamicFiles),
)([]);
