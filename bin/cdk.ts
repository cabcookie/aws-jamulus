#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DigitalWorkstation } from '../lib/digital-workstation-stack';

const app = new cdk.App();
new DigitalWorkstation(app, 'DigitalWorkstation', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-central-1' },
  keyName: 'JamulusKey',
  bandServerSettings: {
    ipId: 'eipalloc-4d0de976',
    settingsFileName: 'band-server-settings.sh',
    // imageId: 'ami-02d9699177c9c199f',
  },
  mixingResultServerSettings: {
    ipId: 'eipalloc-7680094d',
    settingsFileName: 'mixing-server-settings.sh',
    // imageId: 'ami-0d1c4eb27dc0762ce',
  },
  onlineMixerSettings: {
    ipId: 'eipalloc-3baa7e00',
    imageId: 'ami-0e8b5b21dc79eb5a4',
  },
  zoomServerSettings: {
    ipId: 'eipalloc-f1eba0ca',
    imageId: 'ami-02fe188c4a165536b',
    zoomMeeting: {
      meetingId: '123456789012',
    },
  },
});
