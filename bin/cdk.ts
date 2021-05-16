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
    imageId: 'ami-0ed221cd21a330912',
  },
  mixingResultServerSettings: {
    ipId: 'eipalloc-7680094d',
    settingsFileName: 'mixing-server-settings.sh',
    imageId: 'ami-0afd1c88bcb335aba',
  },
  onlineMixerSettings: {
    ipId: 'eipalloc-3baa7e00',
    imageId: 'ami-0a2f5a22e18c134ed',
  },
  zoomServerSettings: {
    ipId: 'eipalloc-f1eba0ca',
    imageId: 'ami-0b51ce9c72dc98095',
    zoomMeeting: {
      meetingId: '123456789012',
    },
  },
});
