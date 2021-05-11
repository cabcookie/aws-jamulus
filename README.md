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
# npm install global cdk
# npm install global awscli
npm install
# create PEM file with name JamulusKey in EC2 and download it
# aws configure
cdk bootstrap
cdk deploy
```


## TODOS

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
