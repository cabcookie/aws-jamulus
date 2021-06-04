import { mkdirSync, readFileSync } from "fs"
import { flow, join } from "lodash/fp";
import { createEmptyFolders, makePath } from "../../utilities/file-handling";
import { ChannelsSetting, JamulusInstancesProps } from "../digital-workstation-stack";
import { createArdourSession } from "../helper/create-ardour-session";
import { createJamulusStartupClientSh, createJamulusStartupServerSh, createReplaceStatementForJamulusStartupSh } from "../helper/create-jamulus-startup-sh";
import { createJamulusClientIni, createJamulusServerInis, DEFAULTINI_PATH } from "../helper/create-jamulus-inis";
import { JamulusServer } from "../jamulus-server/jamulus-server-instance";

const USER_DIR = '/home/ubuntu';
export const S3_DIR = `${USER_DIR}/.temp-s3`
export const INSTANCE_TARGET_DIR = `${USER_DIR}/Documents`;

export const createMixerChannelName = (channel: string) => `Mix${channel}`;

const createJamulusClientPackages = (targetFolder: string, channels: string[], defaultIni: string, jamulusBandServer: JamulusServer) => {
  createEmptyFolders({
    rootFolderName: targetFolder,
    folderNames: channels,
  })
  channels.forEach((channel) => {
    const clientFolder = makePath(targetFolder)(channel);
    createJamulusClientIni(clientFolder, channels, defaultIni, channel);
    createJamulusStartupClientSh(clientFolder, channel, jamulusBandServer);
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
  join('\n'),
)([]));

export const prepareConfigurationFiles = (jamulusBandServer: JamulusServer, channels?: string[]) => (targetFolder: string) => {
  mkdirSync(targetFolder, { recursive: true });
  const serverIniFolder = 'jamulus-inis';
  const ardourFolderName = 'mosaik-live';
  const defaultIni = readFileSync(DEFAULTINI_PATH, 'utf8');

  if (channels) {
    createJamulusServerInis(`${targetFolder}/jamulus/${serverIniFolder}`, channels, defaultIni);
    createJamulusStartupServerSh(makePath(targetFolder)('jamulus'), channels, serverIniFolder, ardourFolderName);
    createJamulusClientPackages(`${targetFolder}/jamulus-clients`, channels, defaultIni, jamulusBandServer);
    createArdourSession(makePath(targetFolder)(ardourFolderName), channels);
  }
}