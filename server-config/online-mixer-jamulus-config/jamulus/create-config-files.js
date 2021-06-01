const { readFileSync, writeFileSync, mkdirSync, rmSync, renameSync } = require("fs");
var fs = require('fs');
var path = require('path');

const copyFileSync = (source, target) => {
  var targetFile = target;
  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

const copyFolderRecursiveSync = (source, target) => {
  var files = [];
  // Check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }
  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
};

const stdFader = [
  "  <storedfadertag%%ID%%_base64>%%CLIENT_NAME%%</storedfadertag%%ID%%_base64>",
  "  <storedfaderlevel%%ID%%>100</storedfaderlevel%%ID%%>",
  "  <storedpanvalue%%ID%%>50</storedpanvalue%%ID%%>",
  "  <storedfaderissolo%%ID%%>0</storedfaderissolo%%ID%%>",
  "  <storedfaderismute%%ID%%>%%IS_MUTE%%</storedfaderismute%%ID%%>",
  "  <storedgroupid%%ID%%>-1</storedgroupid%%ID%%>",
].join('\n');

const createEncodedName = (clientName) => Buffer.from(clientName, 'utf-8').toString('base64');
  
const createJamulusStandardStartLine = (startJamulusLine, ip, channelName, folderName) => startJamulusLine.replace(
  /%%BAND_IP%%/,
  ip
).replace(
  /%%CLIENT_NAME%%/g,
  channelName
).replace(
  /%%FOLDER%%/,
  folderName
);

const pushAChannel = (channelName, isMuted, settings, fader) => settings.push(fader.replace(
  /%%CLIENT_NAME%%/,
  createEncodedName(channelName)
).replace(
  /%%IS_MUTE%%/,
  isMuted ? 1 : 0
));

const pushAnEmptyChannel = (channels, index, settings, fader) => index >= channels.length * 2
  ? settings.push(fader.replace(/%%CLIENT_NAME%%/, '').replace(/%%IS_MUTE%%/, 0))
  : null;

const createMixerChannelName = (channel) => `Mix${channel}`;

const pushAMixerChannel = (channels, index, settings, fader) => index >= channels.length && index < channels.length * 2
  ? pushAChannel(createMixerChannelName(channels[index]), true, settings, fader)
  : null;

const pushAPeerChannel = (channels, index, isMuted, settings, fader) => index < channels.length
  ? pushAChannel(channels[index], isMuted, settings, fader)
  : null;

const startJamulusLinux = `jamulus -c %%BAND_IP%% --clientname "%%CLIENT_NAME%%" -i "%%FOLDER%%/%%CLIENT_NAME%%.ini" -M`;
const startJamulusClientMac = `/Applications/Jamulus.app/Contents/MacOS/Jamulus -c %%BAND_IP%% --clientname "%%CLIENT_NAME%%" -i "%%CLIENT_NAME%%.ini"`;

const createIniFile = (clientNameFn, isMutedFn, writeFilesFn) => (channels, channel, defaultIni) => {
  const faderSettings = [];
  const iniFile = defaultIni.replace(/%%CLIENT_NAME%%/g, createEncodedName(clientNameFn(channel)));
  for (let index = 0; index < 250; index++) {
    let fader = stdFader.replace(/%%ID%%/g, index);
    pushAnEmptyChannel(channels, index, faderSettings, fader);
    pushAMixerChannel(channels, index, faderSettings, fader);
    pushAPeerChannel(channels, index, isMutedFn(channels, channel, index), faderSettings, fader);
  }
  writeFilesFn(faderSettings, iniFile, clientNameFn(channel));
};

const createServerIniFile = (folder) => createIniFile(
  createMixerChannelName,
  (channels, channel, index) => channels[index] !== channel,
  (faderSettings, iniFile, clientName) => {
    writeFileSync(`${folder}/jamulus-inis/${clientName}.ini`, iniFile.replace(/%%STORED_FADERS%%/, faderSettings.join('\n')));
  },
);

const createClientIniFile = (folder, bandPublicIp) => createIniFile(
  (ch) => ch,
  () => 0,
  (faderSettings, iniFile, clientName) => {
    const clientFolder = `${folder}/jamulus-clients/${clientName}`;
    mkdirSync(clientFolder);
    writeFileSync(`${clientFolder}/${clientName}.ini`, iniFile.replace(/%%STORED_FADERS%%/, faderSettings.join('\n')));
    writeFileSync(`${clientFolder}/jamulus-linux.sh`, createJamulusStandardStartLine(startJamulusLinux, bandPublicIp, clientName, ".").replace(" -M &", ""));
    writeFileSync(`${clientFolder}/jamulus-macOS.sh`, createJamulusStandardStartLine(startJamulusClientMac, bandPublicIp, clientName, "."));
  },
);

const stringComparator = (a, b) => {
  if (a>b) return 1;
  if (a<b) return -1;
  return 0;
};
const lowerCaseStringComparator = (a,b) => stringComparator(a.toLowerCase(), b.toLowerCase());

const getConnectionName = (ch) => `<Connection other="${ch}/audio_out`;
const renameAConnection = (text, prevChannelName, newChannelName) => text.replace(
  new RegExp(getConnectionName(prevChannelName), 'g'),
  getConnectionName(newChannelName),
);
const make2Digit = (num) => (num < 10 ? '0' : '') + num;
const getChannelNameByIndex = (index) => `Channel ${make2Digit(index+1)}`;
const findAndRenameChannel = (prevArdour, currChannel, index) => renameAConnection(prevArdour, getChannelNameByIndex(index), currChannel);
const removeUnusedChannelsInMasterConnection = (maxChannels) => (prevArdour, curr, index) => index >= maxChannels ?
  prevArdour.replace(new RegExp(`${getConnectionName(getChannelNameByIndex(index))} ."/>`, 'g'), '') :
  prevArdour;
const searchArr = (index) => [
  `<Connection other="Jamulus Mix${getChannelNameByIndex(index)}:output left"/>`,
  `<IO name="${getChannelNameByIndex(index)}" id="`,
  `<Port type="audio" name="${getChannelNameByIndex(index)}/audio_.*">`,
  `<Processor id="[0-9]*" name="${getChannelNameByIndex(index)}" .*output="${getChannelNameByIndex(index)}".*>`,
  `<Route id=".*" name="${getChannelNameByIndex(index)}" default-type="audio"`,
  `<Diskstream flags="Recordable" playlist="${getChannelNameByIndex(index)}" name="${getChannelNameByIndex(index)}" id="`,
];
const checkLineforRenaming = (newChannelName, index) => (line) => searchArr(index).filter(
  (val) => line.match(new RegExp(val))
).length > 0 ?
  line.replace(
    new RegExp(getChannelNameByIndex(index), 'g'),
    newChannelName
  ) :
  line;
const renameAChannel = (prevArdourArr, newChannelName, index) => prevArdourArr.map(checkLineforRenaming(newChannelName, index));

const fillTemplateWithChannelNames = (ardourSession, channels) => {
  const renamedMasterConnections = [...channels, "Reverb"]
    .sort(stringComparator)
    .reduce(
      findAndRenameChannel,
      renameAConnection(ardourSession, 'Reverb', 'Channel 11')
    );

  const cleanMasterConnections = [...Array(11)].reduce(removeUnusedChannelsInMasterConnection(channels.length+1), renamedMasterConnections);

  const sortedChannels = channels.sort(lowerCaseStringComparator);
  const renamedChannels = sortedChannels.reduce(renameAChannel, cleanMasterConnections.split('\n'));
  const restructurePlaylist = renamedChannels.filter(
    (line) => line.match(new RegExp('<Playlist id=".*" name="Channel [01][0-9]" type="audio" .*/>'))
  ).reduce(
    (prev, currLine, index) => `${prev}${index < sortedChannels.length ?
      currLine.replace(new RegExp(getChannelNameByIndex(index)), sortedChannels[index]) + '\n' :
      ''}`,
    ''
  );

  return renamedChannels.reduce(
    ({ skipLines, result }, currLine) => {
      if (skipLines) {
        if (currLine.match(new RegExp('</Playlists>'))) return { skipLines: false, result: `${result}${currLine}\n` }
        if (currLine.match(new RegExp('</Route>'))) return { skipLines: false, result }
        return { skipLines, result };
      }
      if (currLine.match(new RegExp('<Playlists>'))) return { skipLines: true, result: `${result}${currLine}\n${restructurePlaylist}` }
      if (currLine.match(new RegExp('<Route id="[0-9]*" name="Channel [01][0-9]" .*>'))) return { skipLines: true, result }
      if (currLine.replace(/ /g, '').length == 0) return { skipLines, result }
      return { skipLines, result: `${result}${currLine}\n` };
    },
    { skipLines: false, result: '' }
  ).result;
};

const createInisClientsAndArdourSession = (folder, bandPrivateIp, bandPublicIp, appFolder, channels, defaultIni) => {
  const serverIniFolder = `${appFolder}/jamulus-inis`;
  const ardourSessionFileName = `${appFolder}/mosaik-live/mosaik-live.ardour`;
  const ardourSession = readFileSync(ardourSessionFileName, 'utf-8');
  const jamulusStartup = ['/usr/bin/jackd -ddummy -r48000 -p1024'];
  mkdirSync(`${folder}/jamulus-inis`);
  mkdirSync(`${folder}/jamulus-clients`);

  channels.forEach((channel, index) => {
    // for each channel we will create two ini-files
    // one ini-file for the server
    createServerIniFile(folder)(channels, channel, defaultIni);
    // one ini-file for the user
    createClientIniFile(folder, bandPublicIp)(channels, channel, defaultIni);

    // Add one line to the startup script to launch a Jamulus instance for a particular instrument
    jamulusStartup.push(createJamulusStandardStartLine(startJamulusLinux, bandPrivateIp, createMixerChannelName(channel), serverIniFolder));

  });

  // Adjust names of the channels and the connections in Ardour session
  writeFileSync(ardourSessionFileName, fillTemplateWithChannelNames(ardourSession, channels));
  
  jamulusStartup.push(`ardour5 ${appFolder}/mosaik-live/mosaik-live.ardour`);
  writeFileSync(`${folder}/jamulus-startup.sh`, jamulusStartup.join(' &\n'));  
};

// start scripts for TEST and PROD
const runTestScript = () => {
  const testFolder = './temp/test-script';
  const appFolder = `${testFolder}/app-folder`;
  rmSync(testFolder, { recursive: true, force: true });
  mkdirSync(`${appFolder}`, { recursive: true });
  copyFolderRecursiveSync('./server-config/ardour/', `${appFolder}/`);
  renameSync(`${appFolder}/ardour`, `${appFolder}/mosaik-live`);
  
  createInisClientsAndArdourSession(
    testFolder,
    '3.66.182.113',
    '3.66.182.113',
    appFolder,
    ['Vocal Jane', 'Vocal Jon', 'Acoustic', 'Electric', 'Drums'],
    readFileSync('./server-config/online-mixer-jamulus-config/jamulus/default.ini', 'utf-8'),
 );
};

const runProdScript = () => createInisClientsAndArdourSession(
  process.argv[2],
  process.argv[3],
  process.argv[4],
  '/home/ubuntu/Documents',
  JSON.parse(readFileSync(`${folder}/channels.json`, 'utf-8')).channels,
  readFileSync(`${folder}/default.ini`, 'utf-8'),
);

// runTestScript();
// runProdScript();
