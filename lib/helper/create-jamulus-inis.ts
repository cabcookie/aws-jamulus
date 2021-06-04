import { flow, join, replace } from "lodash/fp";
import { makeFolders, toFile } from "../../utilities/file-handling";
import { createMixerChannelName } from "../audio-workstation/prepare-configuration-files";

export const DEFAULTINI_PATH = './lib/audio-workstation/assets/default.ini';
const STANDARD_FADER = [
  "  <storedfadertag%%ID%%_base64>%%CLIENT_NAME%%</storedfadertag%%ID%%_base64>",
  "  <storedfaderlevel%%ID%%>100</storedfaderlevel%%ID%%>",
  "  <storedpanvalue%%ID%%>50</storedpanvalue%%ID%%>",
  "  <storedfaderissolo%%ID%%>0</storedfaderissolo%%ID%%>",
  "  <storedfaderismute%%ID%%>%%IS_MUTE%%</storedfaderismute%%ID%%>",
  "  <storedgroupid%%ID%%>-1</storedgroupid%%ID%%>",
].join('\n');

const encodeName = (name: string) => Buffer.from(name, 'utf8').toString('base64');

interface CreateIniFileProps {
  defaultIni: string;
  channelName: string;
  channels: string[];
  shouldBeMutedFn: (index: number) => boolean;
};

interface CreateChannelProps {
  channels: string[];
  length: number;
  offset: number;
  shouldBeMutedFn: (index: number) => boolean;
  makeChannelNameFn: (name: string) => string;
};

const createChannel = ({
  channels,
  length,
  makeChannelNameFn,
  offset,
  shouldBeMutedFn,
}: CreateChannelProps) => (faders: string[]) => [
  ...faders,
  ...[...Array(length)].map((item, index) =>flow(
    replace(/%%ID%%/g, `${index+offset}`),
    replace(/%%CLIENT_NAME%%/, makeChannelNameFn(channels[index])),
    replace(/%%IS_MUTE%%/, shouldBeMutedFn(index) ? '1' : '0'),
  )(STANDARD_FADER)),
];

const createIniFile = ({
  channels,
  defaultIni,
  channelName,
  shouldBeMutedFn,
}: CreateIniFileProps) => (channel: string) => flow(
  replace(/%%CLIENT_NAME%%/g, encodeName(channelName)),
  replace(/%%STORED_FADERS%%/, flow(
    // Create the peer channels
    createChannel({
      channels,
      length: channels.length,
      offset: 0,
      makeChannelNameFn: encodeName,
      shouldBeMutedFn,
    }),
    // Create the mixing channels
    createChannel({
      channels,
      length: channels.length,
      offset: channels.length,
      makeChannelNameFn: flow(
        createMixerChannelName,
        encodeName,
      ),
      shouldBeMutedFn: () => true,
    }),
    // Create the remaining (empty) channels
    createChannel({
      channels,
      length: 250-2*channels.length,
      offset: 2*channels.length,
      makeChannelNameFn: () => '',
      shouldBeMutedFn: () => true,
    }),
    join('\n'),
  )([])),
)(defaultIni);

export const createJamulusServerInis = (targetFolder: string, channels: string[], defaultIni: string) => {
  makeFolders({ folderNames: [targetFolder] });
  channels.forEach((channel) => flow(
    createIniFile({
      defaultIni,
      channelName: createMixerChannelName(channel),
      channels,
      shouldBeMutedFn: (index) => channels[index] !== channel
    }),
    toFile({
      folderName: targetFolder,
      fileName: `${createMixerChannelName(channel)}.ini`,
    }),
  )(channel));
};

export const createJamulusClientIni = (targetFolder: string, channels: string[], defaultIni: string, channel: string) => flow(
  createIniFile({
    channelName: channel,
    channels,
    defaultIni,
    shouldBeMutedFn: (index) => index >= channels.length,
  }),
  toFile({
    folderName: targetFolder,
    fileName: `${channel}.ini`,
  }),
)(channel)
