import { flow, join } from "lodash/fp";
import { emptyAndCreateFolder, makePath, toFile } from "../../utilities/file-handling";
import { IP_TYPES } from "../../utilities/utilities";
import { createMixerChannelName, INSTANCE_TARGET_DIR, S3_DIR } from "../audio-workstation/prepare-configuration-files";
import { JamulusInstancesProps } from "../digital-workstation-stack";
import { JamulusServer } from "../jamulus-server/jamulus-server-instance";

const JAMULUS_STARTUP_SH = `jamulus/jamulus-startup.sh`;

const makeJamulusStartupCommand = {
  linux: (ip: IP_TYPES, folderName: string) => (clientName: string) => `jamulus -c %${IP_TYPES[ip]}% --clientname "${clientName}" -i "${folderName}/${clientName}.ini" -M`,
  macOS: (ip: IP_TYPES, folderName: string) => (clientName: string) => `/Applications/Jamulus.app/Contents/MacOS/Jamulus -c %${IP_TYPES[ip]}% --clientname "${clientName}" -i "${clientName}.ini"`,
};

const addReplaceStatementIfInstanceAvailable = (ip: IP_TYPES, instance?: JamulusServer) => (statements: string[]): string[] => !instance ? statements : [
  ...statements,
  `sed -i "s/%${IP_TYPES[ip]}%/${instance.instancePrivateIp}/g" "${S3_DIR}/${JAMULUS_STARTUP_SH}"`
];

export const createReplaceStatementForJamulusStartupSh = ({
  jamulusBandServer,
  jamulusMixingServer,
}: JamulusInstancesProps) => flow(
  addReplaceStatementIfInstanceAvailable(IP_TYPES.BAND_PRIVATE_IP, jamulusBandServer),
  addReplaceStatementIfInstanceAvailable(IP_TYPES.MIXER_PRIVATE_IP, jamulusMixingServer),
);

export const createJamulusStartupServerSh = (targetFolder: string, channels: string[], serverIniFolderName: string, ardourFolderName: string) => {
  const jamulusStartup = [
    '/usr/bin/jackd -ddummy -r48000 -p1024',
    ...channels.map(flow(
      createMixerChannelName,
      makeJamulusStartupCommand.linux(IP_TYPES.BAND_PRIVATE_IP, makePath(INSTANCE_TARGET_DIR)(serverIniFolderName)),
    )),
    makeJamulusStartupCommand.linux(IP_TYPES.MIXER_PRIVATE_IP, makePath(INSTANCE_TARGET_DIR)(serverIniFolderName))('MixToZoom').replace(' -M', ''),
    `ardour5 ${makePath(INSTANCE_TARGET_DIR)(ardourFolderName)}/mosaik-live.ardour`,
  ];
  
  emptyAndCreateFolder(false)(targetFolder);
  flow(
    join(' &\n'),
    toFile({ folderName: targetFolder, fileName: 'jamulus-startup.sh' }),
  )(jamulusStartup);
};

