const { readFileSync, writeFileSync, mkdirSync } = require("fs");

const folder = process.argv[2];
const bandPrivateIp = process.argv[3];
const bandPublicIp = process.argv[4];
const defIni = readFileSync(`${folder}/default.ini`, 'utf-8');
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

const pushAChannel = (channelName, isMuted, settings, fader) => settings.push(fader.replace(/%%CLIENT_NAME%%/, createEncodedName(channelName)).replace(/%%IS_MUTE%%/, isMuted ? 1 : 0));

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

const { channels } = JSON.parse(readFileSync(`${folder}/channels.json`, 'utf-8'));
const startJamulusLinux = `jamulus -c %%BAND_IP%% --clientname "%%CLIENT_NAME%%" -i "%%FOLDER%%/%%CLIENT_NAME%%.ini" -M`;
const startJamulusClientMac = `/Applications/Jamulus.app/Contents/MacOS/Jamulus -c %%BAND_IP%% --clientname "%%CLIENT_NAME%%" -i "%%CLIENT_NAME%%.ini"`;
const serverIniFolder = '/home/ubuntu/Documents/jamulus-inis';
const jamulusStartup = ['/usr/bin/jackd -ddummy -r48000 -p1024'];

channels.forEach(channel => {
  // for each channel we will create two ini-files

  // one ini-file for the server
  const serverFaderSettings = [];
  const serverIniFile = defIni.replace(/%%CLIENT_NAME%%/g, createEncodedName(createMixerChannelName(channel)));
  for (let index = 0; index < 250; index++) {
    let fader = stdFader.replace(/%%ID%%/g, index);
    pushAnEmptyChannel(channels, index, serverFaderSettings, fader);
    pushAMixerChannel(channels, index, serverFaderSettings, fader);
    pushAPeerChannel(channels, index, channels[index] !== channel, serverFaderSettings, fader);
  }
  writeFileSync(`${folder}/jamulus-inis/${createMixerChannelName(channel)}.ini`, serverIniFile.replace(/%%STORED_FADERS%%/, serverFaderSettings.join('\n')));
  jamulusStartup.push(createJamulusStandardStartLine(startJamulusLinux, bandPrivateIp, createMixerChannelName(channel), serverIniFolder));

  // one ini-file for the user
  const clientFaderSettings = [];
  const clientIniFile = defIni.replace(/%%CLIENT_NAME%%/g, createEncodedName(channel));
  for (let index = 0; index < 250; index++) {
    let fader = stdFader.replace(/%%ID%%/g, index);
    pushAnEmptyChannel(channels, index, clientFaderSettings, fader);
    pushAMixerChannel(channels, index, clientFaderSettings, fader);
    pushAPeerChannel(channels, index, 0, clientFaderSettings, fader);
  }
  const clientFolder = `${folder}/jamulus-clients/${channel}`;
  mkdirSync(clientFolder);
  writeFileSync(`${clientFolder}/${channel}.ini`, clientIniFile.replace(/%%STORED_FADERS%%/, clientFaderSettings.join('\n')));
  writeFileSync(`${clientFolder}/jamulus-linux.sh`, createJamulusStandardStartLine(startJamulusLinux, bandPublicIp, channel, ".").replace(" -M &", ""));
  writeFileSync(`${clientFolder}/jamulus-macOS.sh`, createJamulusStandardStartLine(startJamulusClientMac, bandPublicIp, channel, "."));
});

jamulusStartup.push('ardour5');
writeFileSync(`${folder}/jamulus-startup.sh`, jamulusStartup.join(' &\n'));
