# aws-jamulus

Automatically sets up a Jamulus server and a Ardour mixing console on AWS using CDK. [Jamulus](https://jamulus.io) allows bands to do jam sessions in a remote environment. [Ardour](http://ardour.org) is a digital audio workstation which supports thousands of plugins to let your mix sound nice.

## Architecture

The basic architecture is shown in the image below. We setup a Jamulus Band Server in the AWS cloud which will be available through a defined IP address. In addition, it will set up another EC2 instance prepared for being a mixing console. A third EC2 instance will run the Jamulus Mixing Server which is used to present the mixing result to an audience.

Every musician opens one Jamulus instance per instrument or microphone and associates the signal to one instance. The Jamulus instances connect to the Jamulus server. The mixing console opens one Jamulus instance per instrument or microphone and directs the signal to separate input channels on Ardour.

Ardour mixes the different instrument to create a nice and pleasant sound. The master will then be routed to the Jamulus Mixing Server. A presenter will feed this signal into a video conferencing tool like Zoom, so that attendees can listen to the music.

![architecture](./diagrams/architecture.png)

## Getting Started (rough list of commands)

```bash
git clone https://github.com/cabcookie/aws-jamulus.git
cd aws-jamulus
# npm install -g aws-cdk # might request sudo
# npm install -g aws-sdk # might request sudo
npm install
# create PEM file with name JamulusKey in EC2 and download it
# aws configure
cdk bootstrap
cdk deploy
```

## TODOS for automating setup

1. Start script für alle Jamulus Instanzen schreiben
1. Ini-Dateien automatisch erstellen ()
1. Jack aliase rauskopieren
1. Testen, ob die Ardour Session, auch die Verbindungen wieder herstellt
1. Windows EC2 aufsetzen und an Arved schicken (carsten)
1. Windows einrichten, so dass sie sich mit Jamulus Mixing Instanz verbindet und mit Zoom (Arved)
1. Image von Windows Instanz erstellen
1. Password für ubuntu Mixing Instanz automatisch setzen
1. Sicherstellen, dass die ubuntu Mixing Instanz vollständig automatisch erstellt wird

## TODOS long term

1. Permanenter Jamulus Server für die Band
2. Landing page mit User/pwd für Production zum Starten des Sonntags; mit automatischer Selbsttörung nach einigen Stunden

## Jack connection names

```bash
system:capture_1
   dummy_pcm:dummy:out1
system:capture_2
   dummy_pcm:dummy:out2
system:playback_1
   dummy_pcm:dummy:in1
system:playback_2
   dummy_pcm:dummy:in2
Jamulus Egit:input left
Jamulus Voc1:input left
Jamulus Egit:input right
Jamulus Egit:output left
Jamulus Voc1:input right
Jamulus Egit:output right
Jamulus Drums:input left
Jamulus Voc1:output left
Jamulus Drums:input right
Jamulus Voc1:output right
Jamulus Drums:output left
Jamulus Keys:input left
Jamulus Drums:output right
Jamulus Keys:input right
Jamulus Keys:output left
Jamulus Git:input left
Jamulus Keys:output right
Jamulus Git:input right
Jamulus Git:output left
Jamulus Bass:input left
Jamulus Git:output right
Jamulus Bass:input right
Jamulus Bass:output left
Jamulus Voc2:input left
Jamulus Bass:output right
Jamulus Voc2:input right
Jamulus ToZoom:input left
Jamulus Voc2:output left
ardour:LTC-in
ardour:LTC-out
ardour:Click/audio_out 1
ardour:Click/audio_out 2
ardour:MIDI control in
ardour:MIDI control out
ardour:MMC in
ardour:MMC out
ardour:Scene in
ardour:Scene out
ardour:MTC in
ardour:MTC out
ardour:MIDI Clock in
ardour:MIDI Clock out
ardour:Master/audio_in 1
ardour:Master/audio_in 2
ardour:Master/audio_out 1
ardour:Master/audio_out 2
ardour:Keys/audio_in 1
ardour:Keys/audio_out 1
ardour:Vocal 1/audio_in 1
ardour:Vocal 1/audio_out 1
ardour:Keys/audio_out 2
Jamulus ToZoom:input right
Jamulus Voc2:output right
Jamulus ToZoom:output left
Jamulus ToZoom:output right
ardour:auditioner/audio_out 1
ardour:auditioner/audio_out 2
ardour:auditioner/midi_out 1
ardour:Vocal 1/audio_out 2
ardour:Vocal 2/audio_in 1
ardour:Vocal 2/audio_out 1
ardour:Vocal 2/audio_out 2
ardour:Accoustic/audio_in 1
ardour:Accoustic/audio_out 1
ardour:Accoustic/audio_out 2
ardour:Electric/audio_in 1
ardour:Electric/audio_out 1
ardour:Electric/audio_out 2
ardour:Bass/audio_in 1
ardour:Bass/audio_out 1
ardour:Bass/audio_out 2
ardour:Drums/audio_in 1
ardour:Drums/audio_out 1
ardour:Drums/audio_out 2
```

## TODOS to describe what is already there

- describe how to establish a Jamulus Server
- describe how to establish a Mixing Console
- create .sh files for connecting with the server and the mixing console
- describe pre-requisites
1. Create AWS account
1. Creating a key pair
1. Create two Elastic IPs so your Jamulus Server and your Mixing Console always have the same IP; copy the allocation ID
1. Install cdk and aws cli locally
1. Clone git repo
1. Configure aws environment

## Information on the CDK TypeScript project

The `cdk.json` file tells the CDK Toolkit how to execute your app.

### Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
