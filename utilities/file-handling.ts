import { existsSync, mkdirSync, readdirSync, rmdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { flow } from "lodash/fp";

interface FolderListProps {
  rootFolderName?: string;
  folderNames: string[];
};

const deleteIfFile = (fileName: string) => {
  if (!existsSync(fileName)) return;
  if (!statSync(fileName).isFile()) return;
  unlinkSync(fileName);
};

export const deleteAllFilesInFolder = (folderName: string) => {
  if (!existsSync(folderName)) return;
  if (!statSync(folderName).isDirectory()) return;
  readdirSync(folderName).forEach(flow(
    makePath(folderName),
    deleteIfFile,
  ));
};

interface ToFileProps {
  folderName?: string;
  fileName: string;
};

export const toFile = ({
  folderName,
  fileName,
}: ToFileProps) => (data: string) => {
  const path = makePath(folderName || '.')(fileName);
  writeFileSync(path, data);
};

export const makePath = (rootFolder: string) => (folder: string) => `${rootFolder}/${folder}`.replace(/\/+/g, '/');

export const emptyAndDeleteFolder = (recursive?: boolean) => (folderName: string) => {
  if (!existsSync(folderName)) return;
  if (statSync(folderName).isDirectory()) {
    deleteAllFilesInFolder(folderName);
    if (recursive) {
      readdirSync(folderName).forEach(flow(
        makePath(folderName),
        emptyAndDeleteFolder(recursive),
      ));
    };
    if (!readdirSync(folderName)) rmdirSync(folderName);
    return;
  };
  unlinkSync(folderName);
};

export const emptyAndCreateFolder = (recursive?: boolean) => (folderName: string) => {
  emptyAndDeleteFolder(recursive)(folderName);
  mkdirSync(folderName, { recursive: true });
};

export const createEmptyFolders = ({
  rootFolderName,
  folderNames,
}: FolderListProps) => folderNames.forEach(flow(
  makePath(rootFolderName || '.'),
  emptyAndCreateFolder(true),
));