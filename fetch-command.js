const config = require('./bin/config.json');

const targetMapping = {
  band: "bandServerSettings",
  daw: "audioWorkstationSettings",
  mixer: "mixingServerSettings",
}
const target = process.argv[3];
const ip = config[targetMapping[target]].publicIp;

const statementMapping = {
  ssh: `ssh -i JamulusKey.pem ubuntu@${ip}`,
  logs: `scp -i JamulusKey.pem ubuntu@${ip}:/var/log/cloud-init-output.log logs/${target}-init.log`,
  ardour: `scp -i JamulusKey.pem -r ubuntu@${config.audioWorkstationSettings.publicIp}:/home/ubuntu/Documents/mosaik-live/ temp/`,
};
const statement = statementMapping[process.argv[2]];

console.log(statement);
