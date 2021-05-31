const { readFileSync, writeFileSync } = require("fs");

const folder = process.argv[2];
const bandIp = process.argv[3];
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

const pushAChannel = (channelName, isMuted, settings, fader) => settings.push(fader.replace(/%%CLIENT_NAME%%/, createEncodedName(channelName)).replace(/%%IS_MUTE%%/, isMuted ? 1 : 0));

const pushAnEmptyChannel = (channels, index, settings, fader) => index >= channels.length * 2
  ? settings.push(fader.replace(/%%CLIENT_NAME%%/, '').replace(/%%IS_MUTE%%/, 0))
  : null;

const createMixerChannelName = (channel) => `Mix${channel}`;

const pushAMixerChannel = (channels, index, settings, fader) => index >= channels.length && index < channels.length * 2
  ? pushAChannel(createMixerChannelName(channels[index]), true, settings, fader)
  : null;

const pushAPeerChannel = (channels, index, channel, settings, fader) => index < channels.length
  ? pushAChannel(channels[index], channels[index] !== channel, settings, fader)
  : null;

const { channels } = JSON.parse(readFileSync(`${folder}/channels.json`, 'utf-8'));
const startJamulusLine = `jamulus -c ${bandIp} --clientname "%%CLIENT_NAME%%" -i "~/Documents/jamulus-inis/%%CLIENT_NAME%%.ini" -M &`;
const jamulusStartup = [];

channels.forEach(channel => {
  // for each channel we will create two ini-files

  // one ini-file for the server
  const faderSettings = [];
  const serverIniFile = defIni.replace(/%%CLIENT_NAME%%/g, createEncodedName(createMixerChannelName(channel)))
  for (let index = 0; index < 250; index++) {
    let fader = stdFader.replace(/%%ID%%/g, index);
    pushAnEmptyChannel(channels, index, faderSettings, fader);
    pushAMixerChannel(channels, index, faderSettings, fader);
    pushAPeerChannel(channels, index, channel, faderSettings, fader);
  }
  writeFileSync(`${folder}jamulus-inis/${createMixerChannelName(channel)}.ini`, serverIniFile.replace(/%%STORED_FADERS%%/, faderSettings.join('\n')));
  jamulusStartup.push(startJamulusLine.replace(/%%CLIENT_NAME%%/g, createMixerChannelName(channel)));

  // one ini-file for the user

});
jamulusStartup.push('echo "Starting all Jamulus instances..."');
writeFileSync(`${folder}jamulus-startup.sh`, jamulusStartup.join('\n'));
