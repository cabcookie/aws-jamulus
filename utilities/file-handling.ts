import { existsSync, mkdirSync, readdirSync, rmdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { flow } from "lodash/fp";

interface FolderListProps {
  rootFolderName?: string;
  folderNames: string[];
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

export const makePath = (rootFolder: string) => (folder: string) => `${rootFolder}/${folder}`.replace(/\/+/g, '/').replace(/\.\/+/g, './');

export const makeFolders = ({
  rootFolderName,
  folderNames,
}: FolderListProps) => folderNames.forEach(flow(
  makePath(rootFolderName || '.'),
  (folder) => mkdirSync(folder, { recursive: true }),
));

const emptyFolder = (folderName: string) => {
  readdirSync(folderName).forEach(flow(
    makePath(folderName),
    deleteFolder
  ))
};

const isDirectory = (path: string) => statSync(path).isDirectory();

export const deleteFolder = (folderName: string) => {
  if (!existsSync(folderName)) return;
  if (isDirectory(folderName)) {
    emptyFolder(folderName);
    rmdirSync(folderName);
    return;
  }
  unlinkSync(folderName);
};
