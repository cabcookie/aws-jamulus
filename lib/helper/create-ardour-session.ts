import { flow, get, isEmpty, join, reject } from "lodash/fp";
import { makeFolders, toFile } from "../../utilities/file-handling";
import { filter, lowerCaseStringComparator, make2Digit, pushItem, reduce, sortStrArr, stringComparator, map } from "../../utilities/utilities";

export const ARDOUR_SESSION_PATH = './lib/audio-workstation/assets/mosaik-live.ardour';

const getConnectionName = (channel: string) => `<Connection other="${channel}/audio_out`;

const renameAConnection = (text: string, prevChannel: string, newChannel: string) => text.replace(
  new RegExp(getConnectionName(prevChannel), 'g'),
  getConnectionName(newChannel),
);

const getChannelNameByIndex = (index: number) => `Channel ${make2Digit(index+1)}`;

const findAndRenameChannel = (prevArdour: string, currChannel: string, index: number) => renameAConnection(prevArdour, getChannelNameByIndex(index), currChannel);

const renameMasterConnections = (channels: string[]) => (ardourSession: string) => flow(
  pushItem('Reverb'),
  sortStrArr(stringComparator),
  reduce(
    findAndRenameChannel,
    renameAConnection(ardourSession, 'Reverb', 'Channel 11'),
  ),
)(channels);

const removeAnUnusedMasterConnection = (maxChannels: number) => (prevArdour: string, curr: string, index: number) => index < maxChannels ? prevArdour : prevArdour.replace(new RegExp(`${flow(
  getChannelNameByIndex,
  getConnectionName,
)(index)} ."/>`, 'g'), '');

const removeUnusedChannelsInMasterConnection = (channels: string[]) => (ardourSession: string) => reduce(
  removeAnUnusedMasterConnection(channels.length + 1),
  ardourSession
)([...Array(11)]);

const searchArr = (index: number) => [
  `<Connection other="Jamulus Mix${getChannelNameByIndex(index)}:output left"/>`,
  `<IO name="${getChannelNameByIndex(index)}" id="`,
  `<Port type="audio" name="${getChannelNameByIndex(index)}/audio_.*">`,
  `<Processor id="[0-9]*" name="${getChannelNameByIndex(index)}" .*output="${getChannelNameByIndex(index)}".*>`,
  `<Route id=".*" name="${getChannelNameByIndex(index)}" default-type="audio"`,
  `<Diskstream flags="Recordable" playlist="${getChannelNameByIndex(index)}" name="${getChannelNameByIndex(index)}" id="`,
];

const changeNameWhenFound = (line: string, index: number, newChannelName: string) => (arr: string[]) => arr.length == 0 ? line : line.replace(
  new RegExp(getChannelNameByIndex(index), 'g'),
  newChannelName,
);

const checkLineforRenaming = (newChannelName: string, index: number) => (line: string) => flow(
  searchArr,
  filter((val) => (line.match(new RegExp(val)) || '').length > 0),
  changeNameWhenFound(line, index, newChannelName),
)(index);

const renameAChannel = (prevArdourArr: string[], newChannelName: string, index: number) => prevArdourArr.map(
  checkLineforRenaming(newChannelName, index)
);

const sortChannelsIgnoreCase = sortStrArr(lowerCaseStringComparator);

const renameChannels = (channels: string[]) => (ardourSession: string) => flow(
  sortChannelsIgnoreCase,
  reduce(
    renameAChannel,
    ardourSession.split('\n')
  ),
)(channels);

const playlistLine = '<Playlist id=".*" name="Channel [01][0-9]" type="audio" .*/>';

interface CleanUpProps {
  skipLines: boolean;
  result: string;
};

const isPlaylistsStart = (line: string) => line.match(new RegExp('<Playlists>'));
const isPlaylistsEnd = (line: string) => line.match(new RegExp('</Playlists>'));
const isRouteStart = (line: string) => line.match(new RegExp('<Route id="[0-9]*" name="Channel [01][0-9]" .*>'));
const isRouteEnd = (line: string) => line.match(new RegExp('</Route>'));
const isEmptyLine = (line: string) => line.replace(/ /g, '').length == 0;

const cleanUpArdourSession = (ardourSessionArr: string[]) => (playlist: string) => flow(
  reduce(
    ({ skipLines, result }: CleanUpProps, line: string) => {
      if (skipLines) {
        if (isPlaylistsEnd(line)) return { skipLines: false, result: `${result}\n${line}\n` };
        if (isRouteEnd(line)) return { skipLines: false, result };
        return { skipLines, result };
      }
      if (isPlaylistsStart(line)) return { skipLines: true, result: `${result}${line}\n${playlist}` };
      if (isRouteStart(line)) return { skipLines: true, result };
      if (isEmptyLine(line)) return { skipLines, result };
      return { skipLines, result: `${result}${line}\n` };
    },
    { skipLines: false, result: '' }
  ),
  get('result'),
)(ardourSessionArr);

const renameChannelInPlaylist = (channels: string[]) => (line: string, index: number) => index >= channels.length ? '' : line.replace(
  new RegExp(getChannelNameByIndex(index)),
  sortChannelsIgnoreCase(channels)[index]
);

const restructurePlaylist = (channels: string[]) => (ardourSessionArr: string[]) => flow(
  filter((line: string) => (line.match(new RegExp(playlistLine)) || '').length > 0),
  map(renameChannelInPlaylist(channels)),
  reject(isEmpty),
  join('\n'),
  cleanUpArdourSession(ardourSessionArr),
)(ardourSessionArr);

export const createArdourSession = (targetFolder: string, channels: string[], ardourSession: string) => {
  makeFolders({ folderNames: [targetFolder] });
  flow(
    renameMasterConnections(channels),
    removeUnusedChannelsInMasterConnection(channels),
    renameChannels(channels),
    restructurePlaylist(channels),

    toFile({
      folderName: targetFolder,
      fileName: 'mosaik-live.ardour',
    })
  )(ardourSession);
};

