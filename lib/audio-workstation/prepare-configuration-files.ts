import { mkdirSync, writeFileSync } from "fs"
import { concat, flow, join } from "lodash/fp";
import { createEmptyFolders, emptyAndCreateFolder, makePath, toFile } from "../../utilities/file-handling";
import { IP_TYPES, log, push } from "../../utilities/utilities";
import { ChannelsSetting, JamulusInstancesProps } from "../digital-workstation-stack";
import { JamulusServer } from "../jamulus-server/jamulus-server-instance";

const USER_DIR = '/home/ubuntu';
const S3_DIR = `${USER_DIR}/.temp-s3`
const INSTANCE_TARGET_DIR = `${USER_DIR}/Documents`;
const JAMULUS_STARTUP_SH = `jamulus/jamulus-startup.sh`;

const makeJamulusStartupCommand = {
  linux: (ip: IP_TYPES, folderName: string) => (clientName: string) => `jamulus -c %${IP_TYPES[ip]}% --clientname "${clientName}" -i "${folderName}/${clientName}.ini" -M`,
  macOS: (ip: IP_TYPES, folderName: string) => (clientName: string) => `/Applications/Jamulus.app/Contents/MacOS/Jamulus -c %${IP_TYPES[ip]}% --clientname "${clientName}" -i "${clientName}.ini"`,
};

const createMixerChannelName = (channel: string) => `Mix${channel}`;

const createJamulusServerInis = (targetFolder: string, channels: string[]) => {
  createEmptyFolders({ folderNames: [targetFolder] });
};

const createJamulusStartupScript = (targetFolder: string, channels: string[], serverIniFolderName: string, ardourFolderName: string) => {
  const jamulusStartup = ['/usr/bin/jackd -ddummy -r48000 -p1024'];

  channels.forEach(flow(
    createMixerChannelName,
    makeJamulusStartupCommand.linux(IP_TYPES.BAND_PRIVATE_IP, makePath(INSTANCE_TARGET_DIR)(serverIniFolderName)),
    push(jamulusStartup),
  ));
  jamulusStartup.push(makeJamulusStartupCommand.linux(IP_TYPES.MIXER_PRIVATE_IP, makePath(INSTANCE_TARGET_DIR)(serverIniFolderName))('MixToZoom'));
  jamulusStartup.push(`ardour5 ${makePath(INSTANCE_TARGET_DIR)(ardourFolderName)}/mosaik-live.ardour`);

  emptyAndCreateFolder(false)(targetFolder);
  flow(
    join(' &\n'),
    toFile({ folderName: targetFolder, fileName: 'jamulus-startup.sh' }),
  )(jamulusStartup);
};

const createJamulusClientPackages = (targetFolder: string, channels: string[]) => {};

const createArdourSession = (targetFolder: string, channels: string[]) => {
  log('targetFolder')(targetFolder);
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

interface AdjustPlaceholdersProps extends ChannelsSetting, JamulusInstancesProps {};

const addReplaceStatementIfInstanceAvailable = (ip: IP_TYPES, instance?: JamulusServer) => (statements: string[]): string[] => !instance ? statements : [
  ...statements,
  `sed -i "s/%${IP_TYPES[ip]}%/${instance.instancePrivateIp}/g" "${S3_DIR}/${JAMULUS_STARTUP_SH}"`
];

const createReplaceStatementForJamulusStartupSh = ({
  jamulusBandServer,
  jamulusMixingServer,
}: JamulusInstancesProps) => flow(
  addReplaceStatementIfInstanceAvailable(IP_TYPES.BAND_PRIVATE_IP, jamulusBandServer),
  addReplaceStatementIfInstanceAvailable(IP_TYPES.MIXER_PRIVATE_IP, jamulusMixingServer),
)

const makeJamulusIniIpReplaceStatementFromChannel = (channelName: string) => `echo "creating an sed -i replace statement for ${channelName}"`;

const createReplaceStatementForJamulusInis = ({
  channels,
  jamulusBandServer,
  jamulusMixingServer,
}: AdjustPlaceholdersProps) => concat(channels?.map(makeJamulusIniIpReplaceStatementFromChannel));

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
  if (channels) {
    createJamulusServerInis(`${targetFolder}/jamulus/${serverIniFolder}`, channels);
    createJamulusStartupScript(makePath(targetFolder)('jamulus'), channels, serverIniFolder, ardourFolderName);
    createJamulusClientPackages(`${targetFolder}/jamulus-clients`, channels);
    createArdourSession(makePath(targetFolder)(ardourFolderName), channels);
  }
}