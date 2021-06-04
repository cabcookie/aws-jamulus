import { mkdirSync, readFileSync } from "fs"
import { flow, join } from "lodash/fp";
import { createEmptyFolders, makePath } from "../../utilities/file-handling";
import { ChannelsSetting, JamulusInstancesProps } from "../digital-workstation-stack";
import { createArdourSession } from "../helper/create-ardour-session";
import { createJamulusStartupServerSh, createReplaceStatementForJamulusStartupSh } from "../helper/create-jamulus-startup-sh";
import { createJamulusClientIni, createJamulusServerInis, createReplaceStatementForJamulusInis, DEFAULTINI_PATH } from "../helper/create-jamulus-inis";

const USER_DIR = '/home/ubuntu';
export const S3_DIR = `${USER_DIR}/.temp-s3`
export const INSTANCE_TARGET_DIR = `${USER_DIR}/Documents`;

export const createMixerChannelName = (channel: string) => `Mix${channel}`;

const createJamulusClientPackages = (targetFolder: string, channels: string[], defaultIni: string) => {
  createEmptyFolders({
    rootFolderName: targetFolder,
    folderNames: channels,
  })
  channels.forEach((channel) => {
    createJamulusClientIni(makePath(targetFolder)(channel), channels, defaultIni)(channel);
  });
};

export interface AdjustPlaceholdersProps extends ChannelsSetting, JamulusInstancesProps {};

export const adjustPlaceholders = ({
  channels,
  jamulusBandServer,
  jamulusMixingServer,
}: AdjustPlaceholdersProps) => (file: string) => !channels ? file : file.replace('%%ADJUST_PLACEHOLDERS%%', flow(
  createReplaceStatementForJamulusStartupSh({
    jamulusBandServer,
    jamulusMixingServer,
  }),
  createReplaceStatementForJamulusInis({
    channels, jamulusMixingServer, jamulusBandServer,
  }),
  join('\n'),
)([]));

export const prepareConfigurationFiles = (channels?: string[]) => (targetFolder: string) => {
  mkdirSync(targetFolder, { recursive: true });
  const serverIniFolder = 'jamulus-inis';
  const ardourFolderName = 'mosaik-live';
  const defaultIni = readFileSync(DEFAULTINI_PATH, 'utf8');

  if (channels) {
    createJamulusServerInis(`${targetFolder}/jamulus/${serverIniFolder}`, channels, defaultIni);
    createJamulusStartupServerSh(makePath(targetFolder)('jamulus'), channels, serverIniFolder, ardourFolderName);
    createJamulusClientPackages(`${targetFolder}/jamulus-clients`, channels, defaultIni);
    createArdourSession(makePath(targetFolder)(ardourFolderName), channels);
  }
}