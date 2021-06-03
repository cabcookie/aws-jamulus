# aws-jamulus

Automatically sets up a Jamulus server and a Ardour mixing console on AWS using CDK. [Jamulus](https://jamulus.io) allows bands to do jam sessions in a remote environment. [Ardour](http://ardour.org) is a digital audio workstation which supports thousands of plugins to let your mix sound nice.

## Table of Content

- [Architecture](#architecture)
- [Getting Started - Prerequisites](#getting-started---prerequisites)
  - [Get the app and install dependencies](#get-the-app-and-install-dependencies)
  - [Prepare your AWS environment](#prepare-your-aws-environment)
  - [Setup your `config.json`](#setup-your-config.json)
- [Getting Started - Deploy your Jamulus environment](#getting-started---deploy-your-jamulus-environment)
  - [Destroy the environment](#destroy-the-environment)
- [Settings for your Jamulus environment](#settings-for-your-jamulus-environment)
- [Cost savings](#cost-savings)
- [Roadmap](#roadmap)

## Architecture

The basic architecture is shown in the image below. We setup a Jamulus Band Server in the AWS cloud which will be available through a defined IP address. In addition, it will set up another EC2 instance prepared for being a mixing console. A third EC2 instance will run the Jamulus Mixing Server which is used to present the mixing result to an audience. A forth server (Windows) runs a Jamulus client which connects to the Jamulus Mixing Server instance, and a Zoom client which connects to the Zoom meeting which the audience is listening to.

Every musician opens one Jamulus instance per instrument or microphone and associates the signal to one instance. The Jamulus instances connect to the Jamulus server. The mixing console opens one Jamulus instance per instrument or microphone and directs the signal to separate input channels on Ardour.

Ardour mixes the different instrument to create a nice and pleasant sound. The master will then be routed to the Jamulus Mixing Server. A presenter will feed this signal into a video conferencing tool like Zoom, so that attendees can listen to the music.

![architecture](./diagrams/architecture.png)

## Getting Started - Prerequisites 

### Get the app and install dependencies

Now, clone the git repository to your local machine (`my-aws-jamulus-folder` to
be the local folder where this repository will be copied into). These commands
require [nodeJs](https://nodejs.org/en/) to be installed:

```bash
git clone https://github.com/cabcookie/aws-jamulus.git my-aws-jamulus-folder
cd my-aws-jamulus-folder
# install all dependencies
npm install
```

### Prepare your AWS environment

If you haven't done already, setup [an AWS account](https://aws.amazon.com/de/premiumsupport/knowledge-center/create-and-activate-aws-account/),
protect it according to the [Security Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
and create an [Access Key for your CLI](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).

Let us first install the AWS command line tools and the Cloud Development Kit:

```bash
# this installs the packages global
sudo npm install -g aws-sdk
sudo npm install -g aws-cdk
```

In order to connect your machine with your AWS environment, run `aws configure`
in the command line and [follow the instructions in the documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html). This will setup the
account and the region you will use in this environment.

You should be able to access your AWS Account and run commands via the CLI. The
following command should show you all users you have created during the setup
process:

```bash
aws iam list-users
```

If this command runs into issues, please review all steps in this section again.

As a last step, we need to create a PEM file to be able to securly access our
EC2 instances via a secure shell (SSH) or a remote desktop connection (RDP).
Create and download your key pair with the following command:

```bash
aws ec2 create-key-pair --key-name my-key-pair --query "KeyMaterial" --output text > my-key-pair.pem
```

This will create a key pair in the region you defined before. Your will find
your key pair in your AWS EC2 Console in the section Key Pairs:

![EC2 Key Pairs](./utilities/images/key-pairs.png)

When replacing `[region]` with the region you configured before
(e.g., eu-west-1), you will find your key pairs here:

`https://[region].console.aws.amazon.com/ec2/v2/home?region=[region]#KeyPairs:`

### Setup your `config.json`

As a last preparation step you need to create your config.json, according to the
example in `./bin/example-config.json`. So, copy the file to a file named
`./bin/config.json` and adjust the settings to your needs. Find more information
on these setting in the section [Settings for your Jamulus environment](#settings-for-your-jamulus-environment).

## Getting Started - Deploy your Jamulus environment

Now, that you have cloned the repository, installed all tools and dependencies,
set up your AWS environment, and have your key pair ready, you can deploy your
Jamulus environment.

As you do this the first time, you need to bootstrap your assets:

```bash
cdk bootstrap
```

You do not need to run this command later again.
Now, to deploy your environment, you just run:

```bash
cdk deploy
```

This will take a couple of minutes and it will let you know when its finished
by giving you the IP addresses for the 4 servers created by the CDK:

```bash
 ✅  DigitalWorkstation

Outputs:
DigitalWorkstation.JamulusBandServerPublicIp = 1.2.3.4
DigitalWorkstation.JamulusMixingServerPublicIp = 1.2.3.5
DigitalWorkstation.JamulusZoomServerPublicIp = 1.2.3.6
DigitalWorkstation.OnlineMixerMixingConsoleIpABCD = 1.2.3.7
```

When you have provided Elastic IPs (see below in [Settings for your Jamulus environment](#settings-for-your-jamulus-environment)),
these IP addresses will always be the same. Otherwise, those IP addresses will
change whenever you destroy one of the EC2 instances and create them again. This
happens whenever you [destroy the environment](#destroy-the-environment) or
whenever you change something in the settings or in the startup script and you
run `cdk deploy` again to implement the changes.

### Test your environment

If you change any code or settings in your
[`config.json`](#Settings-for-your-Digital-Workstation-environment) and you want
to test those before you create the resources in the AWS Cloud, run the
following command:

```bash
cdk synth
```

This will create the CloudFormation template based on your settings and it will
tell you if it runs into any issues down the line.

### Destroy the environment

When you do not need the environment again, you just run this command:

```bash
cdk destroy
```

This will destroy all servers and other resources created. 

## Settings for your Digital Workstation environment

The Digital Workstation can be as small as just a Jamulus server for the band
or as big as a full virtual concert hall setup with a live console (or digital
audio workstation or live mixer) and an audience following the performance on
Zoom. You decide by setting the parameters for your environment.

To configure your environment you provide a file with the name `config.json` and
you put it in the folder `bin` of the project. If you cloned the project from
GitHub the file `.gitignore` ensures you never push the file back to GitHub as
it can include some sensible information. The `example-config.json` shows you
an example structure of the file.

The settings are described in the following sections.

### Settings in `config.json`

**`configBucketName`**

- **Type**: `string`
- **Required**: No
- **Default**: `jamulus-config-bucket`
- **Description**: The name for the bucket where the configuration and
installation files for the EC2 instances should be hosted. This name
must be unique in the region and across all AWS Accounts. If no name is
provided it will create a bucket with the name `jamulus-config-bucket`.

**`keyName`**

- **Type**: `string`
- **Required**: No, if you do not setup a `ZoomServer`.
- **Default**: -
- **Description**: Provide a keyname so you can access created servers 
via a secure shell (i.e., SSH) or (in case of the Windows Server) to 
retrieve the password of the Windows machine. You first have to create a 
PEM key manually and store the key file locally (see details here: 
https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html).
You then provide the name of this key file through this parameter.

**`bandServerSettings`**

- **Type**: [`JamulusServerSettings`](#JamulusServerSettings)
- **Required**: Yes
- **Default**: -
- **Description**: The settings for the Jamulus server the band members 
connect to.

**`audioWorkstationSettings`**

- **Type**: [`AudioWorkstationSettings`](#AudioWorkstationSettings)
- **Required**: No
- **Default**: -
- **Description**: The settings for the audio workstation which is 
routing the signals of every band member into separate channels in a 
Digital Workstation (i.e., Ardour), so it can be mixed live. The mixed 
signal is routed to the Zoom server through the Jamulus mixing server. 

**`mixingServerSettings`**

- **Type**: [`JamulusServerSettings`](#JamulusServerSettings)
- **Required**: No
- **Default**: -
- **Description**: The settings for the Jamulus mixing server where the 
mixed signal will be routed to. The Zoom server will take the signal 
from there to feed it into the Zoom meeting.

**`zoomServerSettings`**

- **Type**: [`ZoomServerSettings`](#ZoomServerSettings)
- **Required**: No
- **Default**: -
- **Description**: The settings for the Windows server where Zoom will 
be running. Zoom will connect to the Zoom meeting and will feed the 
mixed signal to it.

**`timezone`**

- **Type**: `string`
- **Required**: No
- **Default**: `UTC`
- **Description**: Set the timezone for your servers.

**`channels`**

- **Type**: `string[]` (an Array of strings)
- **Required**: No
- **Default**: -
- **Description**: The channels that should be created in the Ardour 
session (i.e., the Digital Audio Workstation). This setting also creates 
the `ini` files for the Jamulus instances and adds the launch of one 
Jamulus instance per channel to only route the signal of such particular 
band member into its dedicated channel in Ardour.

*Example*:

```json
channels: [
  "Vocal Jane",
  "Vocal Jon",
  "Acoustic",
  "Drums"
]
```

## Details on the types mentioned in [Settings for your Digital Workstation environment](#settings-for-your-digital-workstation-environment)

### `AudioWorkstationSettings`

*extends [`StandardServerSettings`](#StandardServerSettings)*

**`ubuntuPassword`**

- **Type**: `string`
- **Required**: Yes
- **Default**: -
- **Description**: The password for the user `ubuntu` to be used for the 
RDP authentication.

### `DetailedServerMetrics`

**`detailedServerMetrics`**

- **Type**: `boolean`
- **Required**: No
- **Default**: false
- **Description**: Provide `true` if you want to have detailed metrics about 
the state of your servers (i.e., memory usage, disk space etc.). The CloudWatch 
Agent will be installed on the server to retrieve those detailed metrics.

### `JamulusServerSettings`

*extends [`StandardServerSettings`](#StandardServerSettings)*

**`settingsFileName`**

- **Type**: `string`
- **Required**: No
- **Default**: -
- **Description**: If no image is provided a server settings file name should 
be provided. This file should be available on an S3 bucket as the user data 
will try to copy the file from there. The user data file will include a line 
comparable to the below example. So, you need to ensure the mentioned file name 
exists on the represented bucket.

```bash
aws s3 cp s3://jamulus-config-bucket/%%SERVER-SETTINGS-FILE-NAME%% jamulus.service
```

### `StandardServerSettings`

*extends [`DetailedServerMetrics`](#DetailedServerMetrics)*

**`elasticIpAllocation`**

- **Type**: `string`
- **Required**: No
- **Default**: -
- **Description**: Provides an allocation ID for an Elastic IP so that this 
server will always be available under the same public IP address. If you do not
provide an Elastic IP the server will always have a new IP address. However, as
the packages for the clients (the band members) are generated automatically
each time you change settings, these client packages will always connect to
the correct IP Address. Learn how to [setup your Elastic IP](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
and provide the Allocation ID in this parameter.

**`imageId`**

- **Type**: `string`
- **Required**: No
- **Default**: A standard image for the instace type.
- **Description**: Provide an AMI ID if you have created an image with a 
running server already. This image will then be used instead of running a 
launch script (i.e., user data) to install and configure the server instance.
If you run your rehearsals or performance always with the same team or band, you
can save setup time of the whole system by creating a snapshot/image after the
initialization of all servers. When you finished your session and you destroy
your environment, you save costs as your not having any running servers or
assigned disks and still have a fast setup time. However, the snapshot/image
comes with costs and you can also only use an image if you are also using
Elastic IPs to ensure your servers always have the same IP address. See
[details on creating an image](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/tkv-create-ami-from-instance.html) 
and then provide the AMI ID in this parameter.

### `ZoomMeetingProps`

**`meetingId`**

- **Type**: `string`
- **Required**: Yes
- **Default**: -
- **Description**: The Zoom meeting ID.

**`password`**

- **Type**: `string`
- **Required**: No
- **Default**: -
- **Description**: The Zoom meeting password.

### `ZoomServerSettings`

*extends [`StandardServerSettings`](#StandardServerSettings)*

**`zoomMeeting`**

- **Type**: [`ZoomMeetingProps`](#ZoomMeetingProps)
- **Required**: Yes
- **Default**: -
- **Description**: The Zoom meeting properties this instance should connect and 
send the mixed signal to.

## Cost savings

TODO: to be documented as described in issue [#11](https://github.com/cabcookie/aws-jamulus/issues/11).

## Roadmap

Check out the roadmap of [the project on GitHub](https://github.com/cabcookie/aws-jamulus/projects/1).