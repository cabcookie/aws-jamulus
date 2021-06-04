import { writeFileSync } from "fs";
import { createEmptyFolders } from "../../utilities/file-handling";

export const createArdourSession = (targetFolder: string, channels: string[]) => {
  createEmptyFolders({
    rootFolderName: targetFolder,
    folderNames: [
      'analysis',
      'dead',
      'export',
      'externals',
      'interchange/mosaik-live/audiofiles',
      'interchange/mosaik-live/midifiles',
      'peaks',
      'plugins',
    ],
  });
  // TODO: we need to create the Ardour session file here
  writeFileSync(`${targetFolder}/test.txt`, `${new Date()}: a test`);
};

