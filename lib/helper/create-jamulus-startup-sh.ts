import { flow, join } from "lodash/fp";
import { makeFolders, makePath, toFile } from "../../utilities/file-handling";
import { IP_TYPES } from "../../utilities/utilities";
import { createMixerChannelName, INSTANCE_TARGET_DIR, S3_DIR } from "../audio-workstation/prepare-configuration-files";
import { JamulusInstancesProps } from "../digital-workstation-stack";
import { JamulusServer } from "../jamulus-server/jamulus-server-instance";

const JAMULUS_STARTUP_SH = `jamulus/jamulus-startup.sh`;

const makeJamulusServerStartupCommand = (ip: IP_TYPES, folderName?: string) => (clientName: string) => `jamulus -c %${IP_TYPES[ip]}% --clientname "${clientName}" -i "${folderName || '.'}/${clientName}.ini" -M`;

const jamulusStartupClients = [{
  client: "linux",
  makeCommand: (ip: string) => (clientName: string) => `jamulus -c ${ip || 'No IP defined'} --clientname "${clientName}" -i "${clientName}.ini"`,
  signature: 'sh',
},{
  client: "macOS",
  makeCommand: (ip: string) => (clientName: string) => `/Applications/Jamulus.app/Contents/MacOS/Jamulus -c ${ip || 'No IP defined'} --clientname "${clientName}" -i "${clientName}.ini"`,
  signature: 'sh',
},{
  client: "windows",
  makeCommand: (ip: string) => (clientName: string) => `start C:\"Program Files"\Jamulus\Jamulus.exe -c ${ip || 'No IP defined'} --clientname "${clientName}" -i "${clientName}.ini"`,
  signature: 'bat',
}];

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
      makeJamulusServerStartupCommand(IP_TYPES.BAND_PRIVATE_IP, makePath(INSTANCE_TARGET_DIR)(`jamulus/${serverIniFolderName}`)),
    )),
    makeJamulusServerStartupCommand(IP_TYPES.MIXER_PRIVATE_IP, makePath(INSTANCE_TARGET_DIR)(`jamulus/${serverIniFolderName}`))('MixToZoom').replace(' -M', ''),
    makeJamulusServerStartupCommand(IP_TYPES.MIXER_PRIVATE_IP, makePath(INSTANCE_TARGET_DIR)(`jamulus/${serverIniFolderName}`))('MonitorMix').replace( ' -M', ''),
    `ardour5 ${makePath(INSTANCE_TARGET_DIR)(ardourFolderName)}/mosaik-live.ardour`,
  ];
  
  makeFolders({folderNames: [targetFolder]});
  flow(
    join(' &\n'),
    toFile({ folderName: targetFolder, fileName: 'jamulus-startup.sh' }),
  )(jamulusStartup);
};

export const createJamulusStartupClientSh = (
  targetFolder: string,
  channel: string,
  jamulusBandServer: JamulusServer
) => jamulusStartupClients.forEach((client) => flow(
  client.makeCommand(jamulusBandServer.publicIp),
  toFile({
    folderName: targetFolder,
    fileName: `${client.client}-jamulus-startup.${client.signature}`,
  }),
)(channel));
